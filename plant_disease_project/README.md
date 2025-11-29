# Plant Disease Detection with Severity Estimation

A TensorFlow 2.x based multi-task learning project that classifies plant leaf diseases across multiple crops and simultaneously estimates severity levels (0 = healthy, 1 = mild, 2 = moderate, 3 = severe). The codebase provides a modular structure for preprocessing, training, evaluation, and deployment.

## Project Structure
```
plant_disease_project/
  data/
    raw/            # Original datasets (images + CSV annotations)
    processed/      # Preprocessed/augmented or tfrecords
  models/
    model_builder.py
    train.py
    evaluate.py
    grad_cam.py
    tflite_export.py
  utils/
    data_loading.py
    augmentation.py
    metrics.py
  notebooks/
    exploration.ipynb
  scripts/
    preprocess_data.py
```

## Quickstart
1. Create and activate a Python 3.10+ environment.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Prepare the dataset: place raw PlantVillage-style image folders under `data/raw` and provide CSV annotations with columns `filename`, `disease_id`, `severity_level`, and optional `crop` info. Run the preprocessing script to generate train/val CSV splits:
   ```bash
   python scripts/preprocess_data.py \
     --annotations data/raw/annotations.csv \
     --image-dir data/raw/images \
     --output-dir data/processed
   ```
4. Train the multi-task model:
   ```bash
   python models/train.py
   ```
5. Evaluate, run Grad-CAM visualizations, or export to TFLite using the scripts under `models/`.

## Configuration
`models/train.py` contains a simple `TRAINING_CONFIG` dictionary with the key paths and hyperparameters. Adjust the paths to match the dataset location or integrate a YAML/JSON config loader.

## Notes
- The disease head predicts one of *N* disease classes (including healthy per crop).
- The severity head predicts the categorical severity level.
- Augmentations leverage both TensorFlow ops and Albumentations when available.
- The repo intentionally separates shared utilities (data loading, augmentations, metrics) to encourage reproducible experiments.
