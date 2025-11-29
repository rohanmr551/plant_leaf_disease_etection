# Running the Plant Disease Project

## 1. Python environment & dependencies
1. Use Python 3.10+ and create a virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## 2. Data preparation
1. Place raw images under `data/raw/images` and create an annotations CSV with columns `filename`, `disease_id`, and `severity_level`.
2. Split into training/validation CSVs:
   ```bash
   python scripts/preprocess_data.py \
       --annotations data/raw/annotations.csv \
       --image-dir data/raw/images \
       --output-dir data/processed
   ```

## 3. Training the TensorFlow model
1. Edit the paths inside `models/train.py` if your dataset lives elsewhere.
2. Launch training:
   ```bash
   python models/train.py
   ```
3. After training, the best checkpoint and CSV history are stored under `models/best_multitask_model.h5` and `models/training_history.csv`.

## 4. Streamlit diagnosis dashboard
1. Ensure `best_multitask_model.h5` exists.
2. Start the app from the project root:
   ```bash
   streamlit run app.py
   ```
3. Open the displayed URL, pick a crop, upload a leaf image, and press **Diagnose** to see multitask predictions, uncertainty, Grad-CAM overlay, and recommendations.

## 5. Android app
1. Copy the quantized TFLite model to `android_app/app/src/main/ml/plant_disease_multitask_int8.tflite`.
2. Open `android_app/` in Android Studio (File → Open → select the folder).
3. Let Gradle sync. The module already includes Compose, TensorFlow Lite, and multilingual resources.
4. Build & run on a device (Android 8.0+/API 26). The Compose UI lets farmers pick language, crop, photo, and see offline inference plus recommendations.

## 6. TensorFlow Lite export (optional)
To regenerate a TFLite model from a new Keras checkpoint:
```bash
python models/tflite_export.py --model models/best_multitask_model.h5 --output models/plant_disease_multitask_int8.tflite --quantize
```

## 7. Troubleshooting
- If training crashes due to missing GPU memory, lower the batch size inside `models/train.py`.
- Streamlit depends on OpenCV; install `opencv-python-headless` if running on a server without display libraries.
- For Android builds, ensure you have the latest Android Studio + SDK 34 and accept all licenses.
