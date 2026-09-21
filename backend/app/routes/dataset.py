import os
from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["Dataset"])

DATASETS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "datasets"))

@router.get("/dataset")
def get_dataset_info():
    """
    GET /api/dataset
    Scans datasets directory for images, split folders (train, val, test), and class distributions.
    Returns configured status and sample metadata for all classes.
    """
    if not os.path.exists(DATASETS_DIR):
        return {
            "configured": False,
            "message": "Dataset not configured.",
            "total_images": 0,
            "splits": {"train": 0, "val": 0, "test": 0},
            "classes": [],
            "samples": []
        }

    samples = []
    split_counts = {"train": 0, "val": 0, "test": 0}
    class_set = set()

    for split in ["train", "val", "test"]:
        split_img_dir = os.path.join(DATASETS_DIR, split, "images")
        if os.path.exists(split_img_dir):
            for fname in os.listdir(split_img_dir):
                if fname.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                    split_counts[split] += 1
                    sample_cls = fname.split('_')[0].capitalize() if '_' in fname else "General"
                    class_set.add(sample_cls)
                    samples.append({
                        "filename": fname,
                        "class": sample_cls,
                        "split": split.upper(),
                        "annotation_status": "ANNOTATED",
                        "image_url": f"/datasets/{split}/images/{fname}"
                    })

    total_images = sum(split_counts.values())

    if total_images == 0:
        return {
            "configured": False,
            "message": "Dataset not configured.",
            "total_images": 0,
            "splits": split_counts,
            "classes": [],
            "samples": []
        }

    return {
        "configured": True,
        "message": "Custom dataset configured.",
        "total_images": total_images,
        "splits": split_counts,
        "classes": sorted(list(class_set)),
        "samples": samples
    }
