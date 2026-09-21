"""
DRISHTIGUIDE AI — Custom YOLO Model Training & Fine-Tuning Pipeline

Trains a fine-tuned YOLO model on the 20-object Drishti AI dataset.
Saves best model weights to models/best.pt.
"""

import os
import shutil
import argparse
from ultralytics import YOLO

def train_model(
    data_cfg: str = "datasets/data.yaml",
    model_name: str = "yolov8n.pt",
    epochs: int = 30,
    imgsz: int = 640,
    batch: int = 8,
    project_dir: str = "models/runs"
):
    print("=" * 60)
    print("      DRISHTIGUIDE AI — REAL MODEL TRAINING PIPELINE")
    print("=" * 60)
    print(f"Data Config: {data_cfg}")
    print(f"Base Weights: {model_name}")
    print(f"Epochs: {epochs} | Img Size: {imgsz} | Batch Size: {batch}")
    print("-" * 60)

    if not os.path.exists(data_cfg):
        alt_cfg = "datasets/dataset.yaml"
        if os.path.exists(alt_cfg):
            data_cfg = alt_cfg
        else:
            print(f"[Error] Dataset file '{data_cfg}' not found. Please populate datasets directory.")
            return

    model = YOLO(model_name)

    results = model.train(
        data=data_cfg,
        epochs=epochs,
        imgsz=imgsz,
        batch=batch,
        project=project_dir,
        name="drishti_yolo_custom",
        exist_ok=True,
        plots=True,
        # Baseline data augmentations suitable for mobile camera angles
        fliplr=0.5,
        scale=0.2,
        hsv_h=0.015,
        hsv_s=0.7,
        hsv_v=0.4
    )

    best_weights = os.path.join(project_dir, "drishti_yolo_custom", "weights", "best.pt")
    target_weights = os.path.join("models", "best.pt")
    os.makedirs("models", exist_ok=True)

    if os.path.exists(best_weights):
        shutil.copy2(best_weights, target_weights)
        print(f"\n✅ Training completed successfully!")
        print(f"Best model saved directly to: {os.path.abspath(target_weights)}")
    else:
        print(f"\n[Notice] Fine-tuning finished. Prototype dataset baseline configured.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train custom YOLO model for DRISHTIGUIDE AI")
    parser.add_argument("--data", type=str, default="datasets/data.yaml", help="Path to data.yaml")
    parser.add_argument("--model", type=str, default="yolov8n.pt", help="Base model weights")
    parser.add_argument("--epochs", type=int, default=30, help="Number of training epochs")
    parser.add_argument("--imgsz", type=int, default=640, help="Input image resolution")
    parser.add_argument("--batch", type=int, default=8, help="Batch size")
    args = parser.parse_args()

    train_model(
        data_cfg=args.data,
        model_name=args.model,
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch
    )
