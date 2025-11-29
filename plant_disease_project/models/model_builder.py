"""Model builder for multi-task disease + severity classification."""
from __future__ import annotations

from typing import Tuple

import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import EfficientNetB0

SEVERITY_CLASSES = 4


def build_multitask_model(
    num_diseases: int,
    input_shape: Tuple[int, int, int] = (256, 256, 3),
    dropout_rate: float = 0.3,
    train_backbone: bool = False,
) -> tf.keras.Model:
    """Build a multi-task CNN using EfficientNetB0 as the shared backbone."""
    if num_diseases <= 0:
        raise ValueError("num_diseases must be > 0")

    backbone = EfficientNetB0(
        include_top=False,
        weights="imagenet",
        input_shape=input_shape,
        drop_connect_rate=0.2,
    )
    backbone.trainable = train_backbone

    inputs = layers.Input(shape=input_shape, name="image_input")
    x = backbone(inputs, training=False if not train_backbone else None)
    x = layers.GlobalAveragePooling2D(name="gap")(x)
    x = layers.Dropout(dropout_rate, name="dropout")(x)

    disease_output = layers.Dense(
        num_diseases, activation="softmax", name="disease_output"
    )(x)
    severity_output = layers.Dense(
        SEVERITY_CLASSES, activation="softmax", name="severity_output"
    )(x)

    model = models.Model(
        inputs=inputs,
        outputs={
            "disease_output": disease_output,
            "severity_output": severity_output,
        },
        name="efficientnet_multitask",
    )
    return model
