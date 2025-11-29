"""Grad-CAM visualization helpers for debugging model predictions."""
from __future__ import annotations

import argparse
from pathlib import Path
from typing import Tuple

import cv2
import numpy as np
import tensorflow as tf

from utils.data_loading import IMAGE_SIZE


def preprocess_image(image_path: Path, image_size: Tuple[int, int]) -> Tuple[np.ndarray, np.ndarray]:
    """Load an image, resize, and normalize it for the model."""
    image_bgr = cv2.imread(str(image_path))
    if image_bgr is None:
        raise FileNotFoundError(f"Unable to load image: {image_path}")
    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    resized = cv2.resize(image_rgb, image_size)
    normalized = resized.astype(np.float32) / 255.0
    return resized, normalized


def generate_grad_cam(
    model: tf.keras.Model,
    img_array: np.ndarray,
    class_index: int,
    layer_name: str,
) -> np.ndarray:
    """Generate Grad-CAM heatmap for the given class index."""
    if img_array.ndim != 4:
        raise ValueError("img_array must be rank-4 (1, H, W, 3)")

    conv_layer = model.get_layer(layer_name)
    disease_layer = model.get_layer("disease_output")
    grad_model = tf.keras.models.Model(
        [model.inputs], [conv_layer.output, disease_layer.input]
    )

    with tf.GradientTape() as tape:
        conv_outputs, logits = grad_model(img_array)
        loss = logits[:, class_index]
    grads = tape.gradient(loss, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    conv_outputs = conv_outputs[0]
    heatmap = tf.reduce_sum(conv_outputs * pooled_grads, axis=-1)
    heatmap = tf.nn.relu(heatmap)
    max_val = tf.reduce_max(heatmap)
    heatmap = tf.where(max_val > 0, heatmap / max_val, heatmap)
    return heatmap.numpy()


def overlay_heatmap_on_image(
    orig_image: np.ndarray,
    heatmap: np.ndarray,
    alpha: float = 0.4,
) -> np.ndarray:
    """Resize heatmap and overlay it on the original RGB image."""
    heatmap_resized = cv2.resize(heatmap, (orig_image.shape[1], orig_image.shape[0]))
    heatmap_uint8 = np.uint8(255 * np.clip(heatmap_resized, 0.0, 1.0))
    heatmap_color = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
    heatmap_color = cv2.cvtColor(heatmap_color, cv2.COLOR_BGR2RGB)
    overlay = cv2.addWeighted(heatmap_color, alpha, orig_image, 1 - alpha, 0)
    return overlay


def save_overlay(image_path: Path, overlay: np.ndarray) -> None:
    image_bgr = cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR)
    cv2.imwrite(str(image_path), image_bgr)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate Grad-CAM overlays")
    parser.add_argument("--image", type=Path, required=True)
    parser.add_argument("--model", type=Path, default=Path("models/best_multitask_model.h5"))
    parser.add_argument("--layer", type=str, default="top_conv")
    parser.add_argument("--output", type=Path, default=Path("grad_cam_overlay.png"))
    parser.add_argument("--image-size", type=int, nargs=2, default=IMAGE_SIZE)
    return parser.parse_args()


def demo(
    image_path: Path,
    model_path: Path,
    layer_name: str,
    output_path: Path,
    image_size: Tuple[int, int],
) -> None:
    model = tf.keras.models.load_model(str(model_path))
    orig, normalized = preprocess_image(image_path, image_size)
    batch = np.expand_dims(normalized, axis=0)
    predictions = model.predict(batch, verbose=0)
    if isinstance(predictions, dict):
        disease_probs = predictions["disease_output"][0]
    else:
        disease_probs = predictions[0][0]
    predicted_class = int(np.argmax(disease_probs))
    heatmap = generate_grad_cam(model, batch, predicted_class, layer_name)
    overlay = overlay_heatmap_on_image(orig, heatmap)
    save_overlay(output_path, overlay)
    print(f"Saved Grad-CAM overlay to {output_path}")


if __name__ == "__main__":
    args = parse_args()
    demo(args.image, args.model, args.layer, args.output, tuple(args.image_size))
