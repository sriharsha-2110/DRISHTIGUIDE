"""
DRISHTIGUIDE AI — Model Training Script
Trains a custom lightweight YOLO model on the assistive navigation dataset.
"""

import os
import argparse
from ultralytics import YOLO

def train_model(
    data_cfg: str = "../datasets/dataset.yaml",
    model_name: str = "yolov8n.pt",
    epochs: int = 100,
    imgsz: int = 640,
    batch: int = 16,
    project_dir: str = "../models/runs"
):
    print("=" * 60)
    print("      DRISHTIGUIDE AI — CUSTOM MODEL TRAINING PIPELINE")
    print("=" * 60)
    print(f"Data Config: {data_cfg}")
    print(f"Base Weights: {model_name}")
    print(f"Epochs: {epochs} | Img Size: {imgsz} | Batch Size: {batch}")
    print("-" * 60)

    if not os.path.exists(data_cfg):
        print(f"[Warning] Dataset file '{data_cfg}' not found. Please populate datasets directory.")

    # Initialize model
    model = YOLO(model_name)

    # Train model
    results = model.train(
        data=data_cfg,
        epochs=epochs,
        imgsz=imgsz,
        batch=batch,
        project=project_dir,
        name="drishtiguide_yolo_custom",
        exist_ok=True,
        plots=True
    )
    
    print("\nTraining Completed Successfully!")
    print(f"Best model weights saved to: {os.path.join(project_dir, 'drishtiguide_yolo_custom', 'weights', 'best.pt')}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train custom YOLO model for DRISHTIGUIDE AI")
    parser.add_argument("--data", type=str, default="../datasets/dataset.yaml", help="Path to dataset.yaml")
    parser.add_argument("--model", type=str, default="yolov8n.pt", help="Base model weights")
    parser.add_argument("--epochs", type=int, default=50, help="Number of training epochs")
    parser.add_argument("--imgsz", type=int, default=640, help="Input image resolution")
    parser.add_argument("--batch", type=int, default=16, help="Batch size")
    args = parser.parse_args()

    train_model(
        data_cfg=args.data,
        model_name=args.model,
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch
    )
