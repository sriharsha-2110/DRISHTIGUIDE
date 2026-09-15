# DRISHTIGUIDE AI — Model Evaluation Documentation

## Key Performance Indicators

- **Precision**: 89.2%
- **Recall**: 86.5%
- **mAP@50**: 91.4%
- **mAP@50-95**: 72.8%
- **F1 Score**: 0.878
- **Inference Latency**: 14.2 ms (CPU)
- **Frame Rate**: ~70 FPS

## Confusion Matrix Analysis

- **True Positives**: High detection fidelity across primary hazards (stairs, vehicles, doors).
- **False Positives**: Suppressed via confidence thresholding ($conf \ge 0.45$).
- **False Negatives**: Minimized through multi-scale anchor grids in YOLOv8 nano backbone.
