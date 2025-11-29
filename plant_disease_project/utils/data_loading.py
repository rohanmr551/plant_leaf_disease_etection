"""tf.data input pipelines for the plant disease + severity dataset."""
from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Dict, Iterable, List, Optional, Tuple

import albumentations as A
import numpy as np
import pandas as pd
import tensorflow as tf

from .augmentation import get_tf_augmentation_fn

IMAGE_SIZE = (256, 256)
SEVERITY_CLASSES = 4


@dataclass
class DatasetInfo:
    """Metadata describing the encoded dataset."""

    disease_to_index: Dict[str, int]
    index_to_disease: List[str]
    num_samples: int


def load_dataframe_with_labels(csv_path: str) -> pd.DataFrame:
    """Load annotations CSV and validate expected columns."""
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"CSV file not found: {csv_path}")

    df = pd.read_csv(csv_path)
    required_columns = {"disease_id", "severity_level"}
    missing = required_columns - set(df.columns)
    if missing:
        raise ValueError(f"Missing required columns in CSV: {missing}")

    path_columns = ["filepath", "image_path", "path", "filename"]
    path_col = next((col for col in path_columns if col in df.columns), None)
    if path_col is None:
        raise ValueError(
            "CSV must contain one of the path columns: "
            + ", ".join(path_columns)
        )

    df["relative_path"] = df[path_col].astype(str)
    return df


def _resolve_paths(
    df: pd.DataFrame, image_dir: str, path_column: str = "relative_path"
) -> List[str]:
    paths: List[str] = []
    for rel_path in df[path_column]:
        if os.path.isabs(rel_path):
            paths.append(rel_path)
        else:
            paths.append(os.path.join(image_dir, rel_path))
    return paths


def _apply_albumentations(
    image: tf.Tensor, pipeline: A.Compose, image_size: Tuple[int, int]
) -> tf.Tensor:
    def _augment(image_np: np.ndarray) -> np.ndarray:
        image_uint8 = np.clip(image_np * 255.0, 0, 255).astype(np.uint8)
        augmented = pipeline(image=image_uint8)
        return augmented["image"].astype(np.float32) / 255.0

    augmented = tf.py_function(func=_augment, inp=[image], Tout=tf.float32)
    augmented.set_shape((*image_size, 3))
    return augmented


def create_dataset(
    csv_path: str,
    image_dir: str,
    image_size: Tuple[int, int] = IMAGE_SIZE,
    batch_size: int = 32,
    shuffle: bool = True,
    augment: bool = True,
    augmentations: Optional[Iterable] = None,
    cache: bool = False,
    disease_to_index: Optional[Dict[str, int]] = None,
) -> Tuple[tf.data.Dataset, DatasetInfo]:
    """Create a tf.data pipeline for multitask training."""
    df = load_dataframe_with_labels(csv_path)
    image_paths = _resolve_paths(df, image_dir)

    dna = df["disease_id"].astype(str)
    if disease_to_index is None:
        diseases = sorted(dna.unique())
        disease_to_index = {name: idx for idx, name in enumerate(diseases)}
    else:
        diseases = sorted(disease_to_index, key=disease_to_index.get)
    df["disease_index"] = dna.map(disease_to_index)
    if df["disease_index"].isna().any():
        unknown = df[df["disease_index"].isna()]["disease_id"].unique()
        raise ValueError(f"Found diseases not present in provided mapping: {unknown}")
    df["severity_level"] = df["severity_level"].clip(0, SEVERITY_CLASSES - 1).astype(int)

    num_diseases = len(disease_to_index)
    dataset_info = DatasetInfo(
        disease_to_index=disease_to_index,
        index_to_disease=diseases,
        num_samples=len(df),
    )

    image_tensor = tf.constant(image_paths)
    disease_tensor = tf.constant(df["disease_index"].to_numpy(), dtype=tf.int32)
    severity_tensor = tf.constant(df["severity_level"].to_numpy(), dtype=tf.int32)

    if augment and augmentations is None:
        augmentations = get_tf_augmentation_fn()

    use_albumentations = isinstance(augmentations, A.Compose)

    def _process(
        path: tf.Tensor, disease_label: tf.Tensor, severity_label: tf.Tensor
    ):
        image_bytes = tf.io.read_file(path)
        image = tf.io.decode_image(image_bytes, channels=3, expand_animations=False)
        image = tf.image.convert_image_dtype(image, tf.float32)
        image = tf.image.resize(image, image_size)

        if augment:
            if use_albumentations:
                image_np_ready = image
                image = _apply_albumentations(image_np_ready, augmentations, image_size)
            else:
                # assume callable augmentation fn
                image = augmentations(image)

        disease_one_hot = tf.one_hot(disease_label, depth=num_diseases, dtype=tf.float32)
        severity_one_hot = tf.one_hot(
            severity_label, depth=SEVERITY_CLASSES, dtype=tf.float32
        )
        targets = {
            "disease_output": disease_one_hot,
            "severity_output": severity_one_hot,
        }
        return image, targets

    dataset = tf.data.Dataset.from_tensor_slices(
        (image_tensor, disease_tensor, severity_tensor)
    )
    if shuffle:
        dataset = dataset.shuffle(buffer_size=len(df), reshuffle_each_iteration=True)

    dataset = dataset.map(_process, num_parallel_calls=tf.data.AUTOTUNE)
    if cache:
        dataset = dataset.cache()
    dataset = dataset.batch(batch_size).prefetch(tf.data.AUTOTUNE)
    return dataset, dataset_info
