"""Streamlit app for plant disease + severity diagnosis."""
from __future__ import annotations

from pathlib import Path
from typing import Dict, Tuple

import numpy as np
import streamlit as st
import tensorflow as tf
from PIL import Image

from models.grad_cam import generate_grad_cam, overlay_heatmap_on_image
from models.uncertainty import predict_with_uncertainty

MODEL_PATH = Path("models/best_multitask_model.h5")
TARGET_LAYER = "top_conv"
IMAGE_SIZE = (256, 256)
UNCERTAINTY_ALERT = 0.25

# Five representative crops with sample diseases + healthy classes
DISEASE_LABELS = [
    ("Tomato", "Healthy"),
    ("Tomato", "Bacterial Spot"),
    ("Tomato", "Early Blight"),
    ("Tomato", "Late Blight"),
    ("Potato", "Healthy"),
    ("Potato", "Early Blight"),
    ("Potato", "Late Blight"),
    ("Maize", "Healthy"),
    ("Maize", "Leaf Blight"),
    ("Maize", "Common Rust"),
    ("Grape", "Healthy"),
    ("Grape", "Black Rot"),
    ("Grape", "Leaf Blight"),
    ("Apple", "Healthy"),
    ("Apple", "Scab"),
    ("Apple", "Cedar Rust"),
]
SEVERITY_LABELS = {
    0: "0 - Healthy",
    1: "1 - Mild",
    2: "2 - Moderate",
    3: "3 - Severe",
}

CROP_OPTIONS = sorted({crop for crop, _ in DISEASE_LABELS})
CROP_TO_CLASS_IDS: Dict[str, list[int]] = {
    crop: [idx for idx, (c, _) in enumerate(DISEASE_LABELS) if c == crop]
    for crop in CROP_OPTIONS
}


@st.cache_resource(show_spinner=False)
def load_model() -> tf.keras.Model:
    model = tf.keras.models.load_model(str(MODEL_PATH))
    return model


def preprocess_image(uploaded_file) -> Tuple[np.ndarray, np.ndarray]:
    image = Image.open(uploaded_file).convert("RGB")
    orig = np.array(image)
    resized = image.resize(IMAGE_SIZE)
    normalized = np.asarray(resized).astype("float32") / 255.0
    batch = np.expand_dims(normalized, axis=0)
    return orig, batch


def get_recommendation(disease: str, severity_idx: int, uncertainty: float) -> str:
    base = {
        0: "Leaf looks healthy. Continue routine scouting.",
        1: "Remove the affected leaves and monitor for spread.",
        2: "Apply targeted treatment and increase scouting frequency.",
        3: "Isolate the crop section, apply fungicide, and consult an expert.",
    }[severity_idx]
    if uncertainty > UNCERTAINTY_ALERT:
        base += " Uncertainty is high—consider retaking the photo or getting expert advice."
    return base


def colored_prediction_box(text: str, severity_idx: int) -> None:
    colors = {
        0: "#1B5E20",
        1: "#F9A825",
        2: "#FB8C00",
        3: "#C62828",
    }
    st.markdown(
        f"<div style='padding:12px;border-radius:8px;color:white;"
        f"background:{colors.get(severity_idx, '#424242')};text-align:center;font-size:18px;'>"
        f"{text}</div>",
        unsafe_allow_html=True,
    )


st.set_page_config(page_title="Plant Doctor", layout="centered")
st.title("🌿 Plant Disease & Severity Assistant")
st.caption("Upload a leaf photo to diagnose disease type, severity, and confidence.")

selected_crop = st.selectbox("Select crop", CROP_OPTIONS)
uploaded_file = st.file_uploader("Upload leaf image", type=["jpg", "jpeg", "png"])

diag_triggered = st.button("Diagnose")

if diag_triggered:
    if uploaded_file is None:
        st.error("Please upload an image before running diagnosis.")
    else:
        with st.spinner("Running inference..."):
            model = load_model()
            orig_image, batch = preprocess_image(uploaded_file)
            predictions = predict_with_uncertainty(model, batch)
            disease_probs = predictions["disease_probs"].copy()
            valid_ids = CROP_TO_CLASS_IDS[selected_crop]
            mask = np.zeros_like(disease_probs)
            mask[valid_ids] = 1
            masked = disease_probs * mask
            if masked.sum() > 0:
                disease_idx = int(np.argmax(masked))
            else:
                disease_idx = predictions["predicted_disease"]
            severity_idx = predictions["predicted_severity"]
            disease_name = DISEASE_LABELS[disease_idx][1]
            severity_label = SEVERITY_LABELS[severity_idx]
            confidence = predictions["confidence"]
            uncertainty = predictions["uncertainty_score"]

            colored_prediction_box(f"Disease: {disease_name}", severity_idx)
            st.write(f"**Severity:** {severity_label}")
            st.write(f"**Confidence:** {confidence * 100:.1f}%")
            st.write(f"**Uncertainty:** {uncertainty:.2f}")
            if uncertainty > UNCERTAINTY_ALERT:
                st.warning(
                    "High uncertainty detected. Please retake the photo in good lighting or consult an agronomist."
                )

            heatmap = generate_grad_cam(model, batch, disease_idx, TARGET_LAYER)
            overlay = overlay_heatmap_on_image(orig_image, heatmap)
            st.image(overlay, caption="Grad-CAM overlay", use_column_width=True)

            recommendation = get_recommendation(disease_name, severity_idx, uncertainty)
            st.info(recommendation)
else:
    st.info("Upload an image and click Diagnose to begin.")
