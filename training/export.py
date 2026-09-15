"""
DRISHTIGUIDE AI — Model Export Pipeline
Exports PyTorch YOLO model to ONNX, OpenVINO, TFLite, or TensorRT formats.
"""

import argparse
from ultralytics import YOLO

def export_model(model_path: str = "yolov8n.pt", export_format: str = "onnx"):
    print(f"Exporting model '{model_path}' to format '{export_format}'...")
    model = YOLO(model_path)
    exported_path = model.export(format=export_format)
    print(f"Model successfully exported to: {exported_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", type=str, default="yolov8n.pt")
    parser.add_argument("--format", type=str, default="onnx", choices=["onnx", "openvino", "tflite", "torchscript"])
    args = parser.parse_args()
    export_model(args.model, args.format)
