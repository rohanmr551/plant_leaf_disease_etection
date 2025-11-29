"""Training script for the multi-task plant disease model."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Dict

import pandas as pd
import tensorflow as tf
from tensorflow.keras import layers

from models.model_builder import build_multitask_model
from utils.data_loading import create_dataset

PROJECT_ROOT = Path(__file__).resolve().parents[1]
BEST_MODEL_PATH = PROJECT_ROOT / "models" / "best_multitask_model.h5"
HISTORY_PATH = PROJECT_ROOT / "models" / "training_history.csv"

TRAINING_CONFIG: Dict[str, object] = {
    "train_csv": PROJECT_ROOT / "data" / "processed" / "train.csv",
    "val_csv": PROJECT_ROOT / "data" / "processed" / "val.csv",
    "image_dir": PROJECT_ROOT / "data" / "raw" / "images",
    "image_size": (256, 256),
    "batch_size": 32,
    "learning_rate": 1e-4,
    "epochs": 60,
    "patience": 8,
    "heavy_aug_crop_pad": 32,
}


def build_heavy_augmentation_fn(image_size: tuple[int, int], crop_pad: int):
    """Return an augmentation callable with aggressive field-style transforms."""
    aug_layers = tf.keras.Sequential(
        [
            layers.RandomFlip("horizontal_and_vertical"),
            layers.RandomRotation(0.2),
            layers.RandomZoom(0.15),
            layers.RandomTranslation(0.1, 0.1),
            layers.RandomContrast(0.25),
        ],
        name="heavy_aug",
    )

    def _augment(image: tf.Tensor) -> tf.Tensor:
        h, w = image_size
        padded = tf.image.resize_with_crop_or_pad(
            image, h + crop_pad, w + crop_pad
        )
        image = tf.image.random_crop(padded, size=(h, w, 3))
        image = aug_layers(tf.expand_dims(image, axis=0), training=True)[0]
        image = tf.image.random_brightness(image, max_delta=0.2)
        image = tf.image.random_saturation(image, lower=0.8, upper=1.2)
        image = tf.image.random_hue(image, max_delta=0.05)
        image = tf.image.random_contrast(image, lower=0.8, upper=1.2)
        image = tf.clip_by_value(image, 0.0, 1.0)
        return image

    return _augment


def compute_disease_class_weights(
    csv_path: Path, disease_to_index: Dict[str, int]
) -> Dict[int, float]:
    """Compute inverse-frequency class weights for disease labels."""
    df = pd.read_csv(csv_path)
    distribution = df["disease_id"].astype(str).value_counts()
    total = distribution.sum()
    n_classes = len(disease_to_index)
    weights: Dict[int, float] = {}
    for disease, idx in disease_to_index.items():
        class_count = distribution.get(disease, 1)
        weights[idx] = float(total / (n_classes * class_count))
    return weights


def main() -> None:
    config = TRAINING_CONFIG
    print(
        "Using configuration:\n"
        + json.dumps({k: str(v) for k, v in config.items()}, indent=2)
    )

    heavy_aug = build_heavy_augmentation_fn(
        image_size=config["image_size"],
        crop_pad=config["heavy_aug_crop_pad"],
    )
    train_dataset, train_info = create_dataset(
        csv_path=str(config["train_csv"]),
        image_dir=str(config["image_dir"]),
        image_size=config["image_size"],
        batch_size=config["batch_size"],
        shuffle=True,
        augment=True,
        augmentations=heavy_aug,
    )

    val_dataset, _ = create_dataset(
        csv_path=str(config["val_csv"]),
        image_dir=str(config["image_dir"]),
        image_size=config["image_size"],
        batch_size=config["batch_size"],
        shuffle=False,
        augment=False,
        disease_to_index=train_info.disease_to_index,
    )

    model = build_multitask_model(
        num_diseases=len(train_info.disease_to_index),
        input_shape=(config["image_size"][0], config["image_size"][1], 3),
        dropout_rate=0.4,
        train_backbone=False,
    )

    optimizer = tf.keras.optimizers.Adam(learning_rate=config["learning_rate"])
    model.compile(
        optimizer=optimizer,
        loss={
            "disease_output": "categorical_crossentropy",
            "severity_output": "categorical_crossentropy",
        },
        loss_weights={"disease_output": 1.0, "severity_output": 0.5},
        metrics={
            "disease_output": ["accuracy"],
            "severity_output": ["accuracy"],
        },
    )

    disease_class_weights = compute_disease_class_weights(
        Path(config["train_csv"]), train_info.disease_to_index
    )

    BEST_MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    callbacks = [
        tf.keras.callbacks.ModelCheckpoint(
            filepath=str(BEST_MODEL_PATH),
            monitor="val_disease_output_accuracy",
            save_best_only=True,
            save_weights_only=False,
            verbose=1,
        ),
        tf.keras.callbacks.EarlyStopping(
            monitor="val_disease_output_accuracy",
            patience=config["patience"],
            restore_best_weights=True,
            verbose=1,
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_disease_output_accuracy",
            factor=0.3,
            patience=4,
            min_lr=1e-6,
            verbose=1,
        ),
    ]

    history = model.fit(
        train_dataset,
        validation_data=val_dataset,
        epochs=config["epochs"],
        callbacks=callbacks,
        class_weight={"disease_output": disease_class_weights},
    )
    print("Training completed. History keys:", history.history.keys())
    HISTORY_PATH.parent.mkdir(parents=True, exist_ok=True)
    history_df = pd.DataFrame(history.history)
    history_df.to_csv(HISTORY_PATH, index=False)
    print(f"Saved training history to {HISTORY_PATH}")


if __name__ == "__main__":
    main()
