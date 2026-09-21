import os

DATASET_ROOT = os.path.dirname(os.path.abspath(__file__))

CLASSES_20 = [
    "bottle", "cup", "mobile_phone", "book", "chair", "laptop", "pen", "keys",
    "backpack", "water_glass", "plate", "spoon", "shoes", "clock", "remote",
    "keyboard", "mouse", "sunglasses", "umbrella", "helmet"
]

def clean_labels():
    cleaned_count = 0
    removed_count = 0
    for split in ["train", "val", "test"]:
        img_dir = os.path.join(DATASET_ROOT, split, "images")
        lbl_dir = os.path.join(DATASET_ROOT, split, "labels")

        if not os.path.exists(lbl_dir):
            continue

        for fname in os.listdir(lbl_dir):
            if not fname.endswith(".txt"):
                continue

            lbl_path = os.path.join(lbl_dir, fname)
            img_path = os.path.join(img_dir, fname.replace(".txt", ".jpg"))

            # Check if filename corresponds to class outside 20 classes (e.g. person, car, stairs, door, pothole)
            prefix = fname.split('_')[0].lower()
            if prefix in ["person", "car", "stairs", "door", "pothole"]:
                if os.path.exists(lbl_path):
                    os.remove(lbl_path)
                if os.path.exists(img_path):
                    os.remove(img_path)
                removed_count += 1
                continue

            # Check lines inside label file
            valid_lines = []
            with open(lbl_path, "r", encoding="utf-8") as f:
                lines = f.readlines()

            for line in lines:
                parts = line.strip().split()
                if parts:
                    cls_id = int(parts[0])
                    if cls_id < 20:
                        valid_lines.append(line)

            if len(valid_lines) != len(lines):
                with open(lbl_path, "w", encoding="utf-8") as f:
                    f.writelines(valid_lines)
                cleaned_count += 1

    print(f"[SUCCESS] Cleaned {cleaned_count} label files and removed {removed_count} out-of-bounds files.")

if __name__ == "__main__":
    clean_labels()
