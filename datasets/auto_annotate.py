import os
from PIL import Image

DATASET_ROOT = os.path.dirname(os.path.abspath(__file__))

CLASSES = [
    "bottle", "cup", "mobile", "book", "chair", "laptop", "pen", "keys",
    "backpack", "glass", "plate", "spoon", "shoes", "clock", "remote",
    "keyboard", "mouse", "sunglasses", "umbrella", "helmet",
    "person", "car", "stairs", "door", "pothole"
]

def auto_annotate():
    """
    Scans image directories (train, val, test) and creates default center YOLO label files
    for any unannotated custom image files added manually by the user.
    """
    annotated_count = 0
    for split in ["train", "val", "test"]:
        img_dir = os.path.join(DATASET_ROOT, split, "images")
        lbl_dir = os.path.join(DATASET_ROOT, split, "labels")

        if not os.path.exists(img_dir):
            continue
        os.makedirs(lbl_dir, exist_ok=True)

        for fname in os.listdir(img_dir):
            if not fname.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                continue

            base_name = os.path.splitext(fname)[0]
            txt_path = os.path.join(lbl_dir, f"{base_name}.txt")

            if not os.path.exists(txt_path):
                # Infer class from filename prefix
                prefix = base_name.split('_')[0].lower()
                cls_id = 0
                for idx, cname in enumerate(CLASSES):
                    if cname in prefix:
                        cls_id = idx
                        break

                img_path = os.path.join(img_dir, fname)
                try:
                    with Image.open(img_path) as img:
                        w, h = img.size
                        # Default center bounding box (cover 60% of image area)
                        x_center, y_center = 0.5, 0.5
                        box_w, box_h = 0.6, 0.6

                        with open(txt_path, "w", encoding="utf-8") as f:
                            f.write(f"{cls_id} {x_center} {y_center} {box_w} {box_h}\n")
                        annotated_count += 1
                except Exception:
                    pass

    print(f"[SUCCESS] Auto-annotated {annotated_count} new images.")

if __name__ == "__main__":
    auto_annotate()
