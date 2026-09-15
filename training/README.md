# DRISHTIGUIDE AI — Training & Evaluation Pipeline Guide

This directory contains executable scripts for training, validating, testing, and exporting custom YOLO models for DRISHTIGUIDE AI.

## Workflow Instructions

### 1. Data Collection & Annotation
1. Capture or collect images of common navigation scenes (stairs, doorways, potholes, crosswalks, traffic, pedestrians).
2. Annotate bounding boxes using tools like Roboflow or LabelImg.
3. Export annotations in **YOLO PyTorch** format.
4. Place files in `datasets/train/`, `datasets/val/`, and `datasets/test/`.

### 2. Custom Model Training
Run the training script:
```bash
python training/train.py --data datasets/dataset.yaml --epochs 100 --batch 16
```
The trained weights will be saved to `models/runs/drishtiguide_yolo_custom/weights/best.pt`.

### 3. Model Validation & Metric Generation
Evaluate model performance (Precision, Recall, mAP@50, mAP@50-95, FPS, Confusion Matrix):
```bash
python training/validate.py --model models/runs/drishtiguide_yolo_custom/weights/best.pt
```
This updates `models/metrics.json`, which automatically feeds live metrics into the Laptop Dashboard.

### 4. Inference Test
Test predictions on a sample image or video stream:
```bash
python training/predict.py --model yolov8n.pt --source path/to/sample.jpg
```

### 5. Model Export (Edge / Cloud / Mobile)
Export the trained model to ONNX or OpenVINO for high-speed edge deployment:
```bash
python training/export.py --model yolov8n.pt --format onnx
```
