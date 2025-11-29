"""Augmentation utilities using tf.image and Albumentations."""
from __future__ import annotations

from typing import Callable, Tuple

import albumentations as A
import tensorflow as tf


ImageSize = Tuple[int, int]


def get_tf_augmentation_fn() -> Callable[[tf.Tensor], tf.Tensor]:
    """Return a simple tf.image-based augmentation pipeline."""

    def _augment(image: tf.Tensor) -> tf.Tensor:
        image = tf.image.random_flip_left_right(image)
        image = tf.image.random_flip_up_down(image)
        image = tf.image.random_brightness(image, max_delta=0.1)
        image = tf.image.random_contrast(image, lower=0.9, upper=1.1)
        image = tf.clip_by_value(image, 0.0, 1.0)
        return image

    return _augment


def get_albumentations_pipeline(image_size: ImageSize) -> A.Compose:
    """Return an Albumentations pipeline for additional augmentations."""
    height, width = image_size
    return A.Compose(
        [
            A.RandomResizedCrop(height=height, width=width, scale=(0.85, 1.0)),
            A.HorizontalFlip(p=0.5),
            A.VerticalFlip(p=0.2),
            A.ShiftScaleRotate(shift_limit=0.1, scale_limit=0.1, rotate_limit=20, p=0.7),
            A.RandomBrightnessContrast(p=0.5),
            A.HueSaturationValue(p=0.3),
            A.GaussianBlur(blur_limit=(3, 5), p=0.2),
        ]
    )
