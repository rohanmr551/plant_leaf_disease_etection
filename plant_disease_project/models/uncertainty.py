"""Uncertainty-aware inference helpers."""
from __future__ import annotations

from typing import Dict, Tuple

import numpy as np
import tensorflow as tf


def predictive_entropy(probabilities: np.ndarray) -> float:
    probs = np.clip(probabilities, 1e-8, 1.0)
    entropy = -np.sum(probs * np.log(probs))
    max_entropy = np.log(probabilities.shape[-1])
    return float(entropy / max_entropy)


def predict_with_uncertainty(
    model: tf.keras.Model,
    img_array: np.ndarray,
    monte_carlo_samples: int = 8,
) -> Dict[str, object]:
    """Run multiple stochastic forward passes to estimate uncertainty."""
    if img_array.ndim != 4:
        raise ValueError("img_array must have shape (1, H, W, 3)")

    disease_preds = []
    severity_preds = []
    for _ in range(monte_carlo_samples):
        outputs = model(img_array, training=True)
        disease_prob = outputs["disease_output"].numpy()
        severity_prob = outputs["severity_output"].numpy()
        disease_preds.append(disease_prob)
        severity_preds.append(severity_prob)

    disease_probs = np.mean(np.stack(disease_preds, axis=0), axis=0)[0]
    severity_probs = np.mean(np.stack(severity_preds, axis=0), axis=0)[0]
    disease_index = int(np.argmax(disease_probs))
    severity_index = int(np.argmax(severity_probs))

    disease_uncertainty = predictive_entropy(disease_probs)
    severity_uncertainty = predictive_entropy(severity_probs)
    overall_uncertainty = float((disease_uncertainty + severity_uncertainty) / 2.0)

    return {
        "disease_probs": disease_probs,
        "severity_probs": severity_probs,
        "predicted_disease": disease_index,
        "predicted_severity": severity_index,
        "confidence": float(np.max(disease_probs)),
        "uncertainty_score": overall_uncertainty,
    }
