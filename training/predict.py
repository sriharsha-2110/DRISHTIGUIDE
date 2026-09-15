"""
DRISHTIGUIDE AI — Prediction Test Script
Runs inference on test images or videos and displays/saves visual output.
"""

import sys
import argparse
from ultralytics import YOLO

def predict_source(model_path: str, source: str, conf: float = 0.45):
    print(f"Loading model '{model_path}' to infer on '{source}'...")
    model = YOLO(model_path)
    results = model.predict(source=source, conf=conf, save=True)
    print(f"Prediction complete. Output saved to {results[0].save_dir}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", type=str, default="yolov8n.pt")
    parser.add_argument("--source", type=str, required=True, help="Image path, video path, or directory")
    parser.add_argument("--conf", type=float, default=0.45)
    args = parser.parse_args()
    predict_source(args.model, args.source, args.conf)
