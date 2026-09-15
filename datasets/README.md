# DRISHTIGUIDE AI — Dataset Structure & Setup Guide

This directory holds the custom training, validation, and testing images for DRISHTIGUIDE AI.

## Directory Layout
```
datasets/
├── dataset.yaml
├── train/
│   ├── images/
│   └── labels/
├── val/
│   ├── images/
│   └── labels/
└── test/
    ├── images/
    └── labels/
```

## Supported Classes (23 Classes)
- **High Risk Moving Hazards**: `car`, `bus`, `truck`, `motorcycle`, `bicycle`
- **Fall & Structural Hazards**: `stairs`, `pothole`, `open_drain`, `curb`, `barrier`
- **Landmarks & Obstacles**: `door`, `chair`, `table`, `pole`, `bench`, `trash_bin`, `wall`, `bag`, `animal`
- **Traffic & Signals**: `traffic_light`, `traffic_sign`, `pedestrian_crossing`
- **Pedestrians**: `person`

## Dataset Splitting Guidelines
- Recommended Split: 70% Train, 20% Validation, 10% Test.
- Format: Standard YOLO Darknet annotation format (`.txt` files with `class_id center_x center_y width height` normalized 0-1).
