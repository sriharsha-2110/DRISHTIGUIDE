import os
import random
from PIL import Image, ImageDraw

DATASET_ROOT = os.path.dirname(os.path.abspath(__file__))

CLASSES = [
    "bottle", "cup", "mobile", "book", "chair", "laptop", "pen", "keys",
    "backpack", "glass", "plate", "spoon", "shoes", "clock", "remote",
    "keyboard", "mouse", "sunglasses", "umbrella", "helmet",
    "person", "car", "stairs", "door", "pothole"
]

CLASS_COLORS = {
    "bottle": (50, 100, 220),
    "cup": (220, 180, 50),
    "mobile": (30, 30, 30),
    "book": (200, 60, 40),
    "chair": (40, 90, 140),
    "laptop": (80, 80, 80),
    "pen": (50, 50, 200),
    "keys": (255, 215, 50),
    "backpack": (160, 40, 100),
    "glass": (230, 230, 230),
    "plate": (240, 240, 240),
    "spoon": (190, 190, 190),
    "shoes": (120, 40, 40),
    "clock": (255, 255, 255),
    "remote": (60, 60, 60),
    "keyboard": (20, 20, 20),
    "mouse": (70, 70, 70),
    "sunglasses": (10, 10, 10),
    "umbrella": (180, 50, 180),
    "helmet": (255, 140, 0),
    "person": (70, 130, 180),
    "car": (220, 50, 50),
    "stairs": (120, 120, 120),
    "door": (30, 50, 80),
    "pothole": (40, 40, 40)
}

def create_synthetic_image(cls_name: str, index: int, width=640, height=480):
    rng = random.Random(f"{cls_name}_{index}")
    bg_r = rng.randint(180, 240)
    bg_g = rng.randint(180, 240)
    bg_b = rng.randint(180, 240)
    
    img = Image.new("RGB", (width, height), color=(bg_r, bg_g, bg_b))
    draw = ImageDraw.Draw(img)

    w_obj = int(width * rng.uniform(0.3, 0.5))
    h_obj = int(height * rng.uniform(0.35, 0.6))
    x1 = int((width - w_obj) / 2 + rng.uniform(-30, 30))
    y1 = int((height - h_obj) / 2 + rng.uniform(-30, 30))
    x2 = x1 + w_obj
    y2 = y1 + h_obj

    color = CLASS_COLORS.get(cls_name, (100, 100, 100))
    draw.rectangle([x1, y1, x2, y2], fill=color, outline=(0, 0, 0), width=4)

    text = f"{cls_name.upper()} #{index:02d}"
    draw.text((x1 + 15, y1 + int(h_obj / 2) - 10), text, fill=(255, 255, 255))

    cls_id = CLASSES.index(cls_name)
    x_center = round(((x1 + x2) / 2.0) / width, 6)
    y_center = round(((y1 + y2) / 2.0) / height, 6)
    norm_w = round((x2 - x1) / float(width), 6)
    norm_h = round((y2 - y1) / float(height), 6)
    yolo_annotation = f"{cls_id} {x_center} {y_center} {norm_w} {norm_h}\n"

    return img, yolo_annotation

def generate_dataset():
    splits = {
        "train": 10,
        "val": 2,
        "test": 2
    }

    total_created = 0
    for split, count in splits.items():
        img_dir = os.path.join(DATASET_ROOT, split, "images")
        lbl_dir = os.path.join(DATASET_ROOT, split, "labels")
        os.makedirs(img_dir, exist_ok=True)
        os.makedirs(lbl_dir, exist_ok=True)

        for cls_name in CLASSES:
            for i in range(1, count + 1):
                fname = f"{cls_name}_{i:02d}"
                img_path = os.path.join(img_dir, f"{fname}.jpg")
                lbl_path = os.path.join(lbl_dir, f"{fname}.txt")

                img, anno = create_synthetic_image(cls_name, i)
                img.save(img_path, "JPEG", quality=90)
                with open(lbl_path, "w", encoding="utf-8") as f:
                    f.write(anno)

                total_created += 1

    print(f"[SUCCESS] Generated dataset: {total_created} images and label files across 25 classes.")

if __name__ == "__main__":
    generate_dataset()
