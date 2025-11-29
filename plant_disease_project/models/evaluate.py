"""Evaluation utilities for the multi-task model."""
from __future__ import annotations

import argparse
from pathlib import Path

import tensorflow as tf

from utils.data_loading import create_dataset

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MODEL = PROJECT_ROOT / "models" / "best_multitask_model.h5"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Evaluate the multi-task disease model")
    parser.add_argument("--csv", type=Path, default=PROJECT_ROOT / "data" / "processed" / "val.csv")
    parser.add_argument("--image-dir", type=Path, default=PROJECT_ROOT / "data" / "raw" / "images")
    parser.add_argument("--model", type=Path, default=DEFAULT_MODEL, help="Path to the trained model (.h5)")
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--image-size", type=int, nargs=2, default=(256, 256))
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    dataset, _ = create_dataset(
        csv_path=str(args.csv),
        image_dir=str(args.image_dir),
        image_size=tuple(args.image_size),
        batch_size=args.batch_size,
        shuffle=False,
        augment=False,
    )

    model = tf.keras.models.load_model(str(args.model))
    results = model.evaluate(dataset, verbose=1, return_dict=True)
    print("Evaluation results:")
    for key, value in results.items():
        print(f"  {key}: {value:.4f}")


if __name__ == "__main__":
    main()
