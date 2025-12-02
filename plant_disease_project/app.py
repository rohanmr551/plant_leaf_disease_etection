"""Streamlit app for plant disease + severity diagnosis."""
from __future__ import annotations

from pathlib import Path
from typing import Dict, Tuple

import numpy as np
import pandas as pd
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


st.set_page_config(page_title="Plant Doctor", page_icon="🌿", layout="wide")
st.markdown(
    """
    <style>
    .hero-card {
        background: linear-gradient(120deg, #1b5e20, #43a047);
        color: white;
        padding: 1.5rem;
        border-radius: 16px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.15);
    }
    .info-pill {
        padding: 0.35rem 0.8rem;
        border-radius: 999px;
        background: rgba(255,255,255,0.15);
        display: inline-block;
        margin-right: 0.4rem;
        font-size: 0.85rem;
    }
    .alt-list li {
        margin-bottom: 0.2rem;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

st.title("🌿 Plant Disease & Severity Assistant")
st.caption(
    "A guided cockpit for agronomists and growers to triage plant health with confidence, explanations, and next actions."
)

with st.container():
    hero_cols = st.columns([1.2, 1])
    with hero_cols[0]:
        st.markdown(
            "<div class='hero-card'>"
            "<h3>Diagnose faster with trust</h3>"
            "<p>Upload a single-leaf photo, focus on a crop, and let the multitask model surface disease type, severity, and recommended actions.</p>"
            "<div>"
            "<span class='info-pill'>Multitask TF</span>"
            "<span class='info-pill'>Grad-CAM</span>"
            "<span class='info-pill'>Uncertainty-aware</span>"
            "</div>"
            "</div>",
            unsafe_allow_html=True,
        )
    with hero_cols[1]:
        st.success(
            "🪴 Pro tip: natural daylight + a single clean leaf gives the most confident results."
        )

with st.sidebar:
    st.header("Diagnosis Controls")
    st.caption("Select a crop, upload a leaf close-up, and hit **Diagnose**.")
    selected_crop = st.selectbox("Crop focus", CROP_OPTIONS)
    uploaded_file = st.file_uploader(
        "Leaf image", type=["jpg", "jpeg", "png"], help="Sharp daylight photos work best."
    )
    diag_triggered = st.button("Diagnose", use_container_width=True)
    st.markdown(
        "💡 **Capture Tips**\n"
        "- Avoid glare or soil in the frame\n"
        "- Capture a single leaf front-on\n"
        "- Re-run if uncertainty stays high"
    )
    st.markdown("---")
    st.caption("Need a refresher?")
    with st.expander("Model & workflow", expanded=False):
        st.write(
            "The TensorFlow multitask head predicts disease class + severity simultaneously, "
            "then Grad-CAM highlights the focus regions. Uncertainty comes from MC dropout runs."
        )

st.markdown("---")
st.subheader("Workflow at a glance")
info_cols = st.columns(3)
info_cols[0].markdown("### 1️⃣ Prep\nClean single-leaf photo in daylight.")
info_cols[1].markdown("### 2️⃣ Diagnose\nModel filters diseases for your selected crop.")
info_cols[2].markdown("### 3️⃣ Act\nUse uncertainty + guidance to plan the field response.")

if diag_triggered and uploaded_file is None:
    st.error("Please upload a leaf image before running diagnosis.")

if diag_triggered and uploaded_file is not None:
    with st.spinner("Running inference and preparing insights..."):
        model = load_model()
        orig_image, batch = preprocess_image(uploaded_file)
        predictions = predict_with_uncertainty(model, batch)
        disease_probs = predictions["disease_probs"].copy()
        valid_ids = CROP_TO_CLASS_IDS[selected_crop]
        mask = np.zeros_like(disease_probs)
        mask[valid_ids] = 1
        masked = disease_probs * mask
        use_masked = masked.sum() > 0
        if use_masked:
            disease_idx = int(np.argmax(masked))
        else:
            disease_idx = predictions["predicted_disease"]
        severity_idx = predictions["predicted_severity"]
        disease_name = DISEASE_LABELS[disease_idx][1]
        severity_label = SEVERITY_LABELS[severity_idx]
        confidence = predictions["confidence"]
        uncertainty = predictions["uncertainty_score"]
        candidate_pool = valid_ids if use_masked else list(range(len(DISEASE_LABELS)))
        if not candidate_pool:
            candidate_pool = [disease_idx]
        sorted_candidates = sorted(
            candidate_pool, key=lambda idx: disease_probs[idx], reverse=True
        )
        top_alternatives = [
            (DISEASE_LABELS[idx][1], disease_probs[idx]) for idx in sorted_candidates[:3]
        ]
        probability_df = pd.DataFrame(
            {
                "Disease": [DISEASE_LABELS[idx][1] for idx in candidate_pool],
                "Probability": [disease_probs[idx] for idx in candidate_pool],
            }
        ).sort_values("Probability", ascending=False)
        summary_report = (
            f"Crop focus: {selected_crop}\n"
            f"Disease: {disease_name}\n"
            f"Severity: {severity_label}\n"
            f"Confidence: {confidence*100:.1f}%\n"
            f"Uncertainty: {uncertainty:.2f}\n"
        )

    overview_tab, gradcam_tab, prob_tab, guidance_tab = st.tabs(
        ["Overview", "Visual Proof", "Probability Insights", "Field Guidance"]
    )

    with overview_tab:
        colored_prediction_box(f"Disease: {disease_name}", severity_idx)
        st.write(f"**Severity level:** {severity_label}")
        metric_cols = st.columns(2)
        metric_cols[0].metric("Confidence", f"{confidence * 100:.1f} %")
        metric_cols[1].metric("Uncertainty", f"{uncertainty:.2f}")
        progress_value = max(severity_idx / 3, 0.01)
        st.progress(progress_value, text="Severity scale")
        st.markdown("**Top alternatives for this crop**")
        alt_lines = "\n".join(
            f"- {name} ({prob*100:.1f} %)" for name, prob in top_alternatives
        )
        st.markdown(alt_lines)
        st.download_button(
            "Download snapshot",
            data=summary_report,
            file_name="plant_doctor_report.txt",
            mime="text/plain",
        )
        if uncertainty > UNCERTAINTY_ALERT:
            st.warning(
                "High uncertainty detected — retake the photo under even lighting or consult an agronomist."
            )

    with gradcam_tab:
        heatmap = generate_grad_cam(model, batch, disease_idx, TARGET_LAYER)
        overlay = overlay_heatmap_on_image(orig_image, heatmap)
        img_cols = st.columns(2)
        img_cols[0].image(orig_image, caption="Uploaded leaf", use_column_width=True)
        img_cols[1].image(overlay, caption="Grad-CAM overlay", use_column_width=True)

    with prob_tab:
        st.caption("Probabilities filtered to the selected crop focus.")
        st.bar_chart(probability_df.set_index("Disease"))

    with guidance_tab:
        recommendation = get_recommendation(disease_name, severity_idx, uncertainty)
        st.info(recommendation)
        st.markdown(
            "- ✅ Follow up with scouting after treatment\n"
            "- 📷 Keep a photo log for agronomists\n"
            "- 🌱 Combine insights with on-field observations"
        )

if not diag_triggered:
    st.info(
        "Use the controls on the left to run a diagnosis. You'll get confidence, Grad-CAM, "
        "probability visuals, and tailored field guidance."
    )
