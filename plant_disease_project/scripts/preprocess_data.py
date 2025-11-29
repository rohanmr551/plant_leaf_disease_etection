"""Split annotations into train/validation CSV files."""
from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd
from sklearn.model_selection import train_test_split


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Prepare train/val CSV splits")
    parser.add_argument("--annotations", type=Path, required=True, help="Input CSV with filename,disease_id,severity_level")
    parser.add_argument("--image-dir", type=Path, required=True, help="Directory containing image files")
    parser.add_argument("--output-dir", type=Path, required=True, help="Directory to store processed CSV files")
    parser.add_argument("--val-ratio", type=float, default=0.2)
    parser.add_argument("--random-state", type=int, default=42)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    df = pd.read_csv(args.annotations)
    if "filename" not in df.columns:
        raise ValueError("Annotations CSV must include a 'filename' column")

    df["filepath"] = df["filename"].astype(str)
    df["image_dir"] = str(args.image_dir)

    stratify_col = df["disease_id"].astype(str) + "_" + df["severity_level"].astype(str)
    train_df, val_df = train_test_split(
        df,
        test_size=args.val_ratio,
        random_state=args.random_state,
        stratify=stratify_col,
    )

    args.output_dir.mkdir(parents=True, exist_ok=True)
    train_path = args.output_dir / "train.csv"
    val_path = args.output_dir / "val.csv"
    train_df.to_csv(train_path, index=False)
    val_df.to_csv(val_path, index=False)
    print(f"Saved {len(train_df)} training samples to {train_path}")
    print(f"Saved {len(val_df)} validation samples to {val_path}")


if __name__ == "__main__":
    main()
