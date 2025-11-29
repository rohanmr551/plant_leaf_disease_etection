"""Evaluation metrics for disease and severity predictions."""
from __future__ import annotations

from typing import Sequence

import numpy as np
from sklearn.metrics import cohen_kappa_score, f1_score


def _to_numpy(array_like: Sequence) -> np.ndarray:
    if hasattr(array_like, "numpy"):
        return array_like.numpy()
    return np.asarray(array_like)


def severity_cohen_kappa(y_true: Sequence, y_pred: Sequence) -> float:
    """Compute Cohen's kappa on severity predictions (argmax expected)."""
    true = _to_numpy(y_true)
    pred = _to_numpy(y_pred)
    return float(cohen_kappa_score(true, pred, weights="quadratic"))


def macro_f1(y_true: Sequence, y_pred: Sequence) -> float:
    """Macro F1 helper for either diseases or severity labels."""
    true = _to_numpy(y_true)
    pred = _to_numpy(y_pred)
    return float(f1_score(true, pred, average="macro"))
