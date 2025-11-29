"""Export trained Keras model to TensorFlow Lite."""
from __future__ import annotations

import argparse
from pathlib import Path

import tensorflow as tf

DEFAULT_MODEL = Path("models/best_multitask_model.h5")
DEFAULT_OUTPUT = Path("models/multitask_model.tflite")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Convert Keras model to TFLite")
    parser.add_argument("--model", type=Path, default=DEFAULT_MODEL)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--quantize", action="store_true", help="Apply dynamic range quantization")
    return parser.parse_args()


def convert_to_tflite(model_path: Path, output_path: Path, quantize: bool = False) -> None:
    model = tf.keras.models.load_model(str(model_path))
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    if quantize:
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
    tflite_model = converter.convert()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_bytes(tflite_model)
    print(f"Saved TFLite model to {output_path}")


def main() -> None:
    args = parse_args()
    convert_to_tflite(args.model, args.output, args.quantize)


if __name__ == "__main__":
    main()
