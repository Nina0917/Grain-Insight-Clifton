# core/grain_analysis.py
import segmenteverygrain as seg
import numpy as np
import cv2
import logging

from keras.saving import load_model
from segment_anything import sam_model_registry, SamPredictor
from keras.utils import load_img
from pathlib import Path
from matplotlib import pyplot as plt
from tqdm import tqdm

_analyzer = None

# Get the absolute path of the current file
BASE_DIR = Path(__file__).resolve().parents[1]
MODELS_DIR = BASE_DIR / "models"
STORAGE_DIR = BASE_DIR / "storage"


class GrainAnalyzer:
    def __init__(self):
        logging.info("Loading grain analysis models...")
        # Load UNET model
        self.unet = load_model(
            MODELS_DIR / "seg_model.keras",
            custom_objects={"weighted_crossentropy": seg.weighted_crossentropy},
        )

        # Load SAM model 
        self.sam = sam_model_registry["default"](
            checkpoint=MODELS_DIR / "sam_vit_h_4b8939.pth"
        )
        self.predictor = SamPredictor(self.sam)
        logging.info("Grain analysis models loaded.")

    def analyze(self, image_path: str, output_prefix: str):
        # load image
        image = np.array(load_img(image_path))

        image_pred = seg.predict_image(image, self.unet, I=256)
        labels, coords = seg.label_grains(image, image_pred, dbs_max_dist=20.0)

        # SAM-based refinement
        (
            all_grains,
            labels,
            mask_all,
            grain_data,
            *_
        ) = seg.sam_segmentation(
            self.sam,
            image,
            image_pred,
            coords,
            labels,
            min_area=400.0,
            plot_image=False,
        )

        # Ensure output directory exists
        output_dir = Path(output_prefix).parent
        output_dir.mkdir(parents=True, exist_ok=True)

        # Save outputs
        csv_path = f"{output_prefix}.csv"
        mask_path = f"{output_prefix}_mask.png"

        grain_data.to_csv(csv_path, index=False)

        cv2.imwrite(mask_path, mask_all)

        return csv_path, mask_path

def get_grain_analyzer():
    global _analyzer
    if _analyzer is None:
        _analyzer = GrainAnalyzer()
    return _analyzer
