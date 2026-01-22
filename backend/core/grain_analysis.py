# core/grain_analysis.py
import logging
from pathlib import Path

import matplotlib
import numpy as np
import segmenteverygrain as seg
from keras.saving import load_model
from keras.utils import load_img
from matplotlib import pyplot as plt
from segment_anything import SamPredictor, sam_model_registry

from core import interactions as si

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
        matplotlib.use("Agg")

        # make sure output directory exists
        output_prefix = Path(output_prefix)
        output_prefix.parent.mkdir(parents=True, exist_ok=True)

        image = np.array(load_img(image_path))

        all_grains, _, _ = seg.predict_large_image(
            image_path,
            self.unet,
            self.sam,
            min_area=400.0,
            patch_size=2000,
            overlap=200,
        )

        grains = si.polygons_to_grains(all_grains, image=image)
        for g in grains:
            g.measure()

        # Visualization (non-GUI)
        fig, ax = plt.subplots(figsize=(12, 8))
        seg.plot_image_w_colorful_grains(
            image, all_grains, ax, cmap="tab20b", plot_image=True, im_alpha=1.0
        )

        fig.savefig(
            output_prefix.parent / f"{output_prefix.name}_grains.jpg",
            dpi=150,
            bbox_inches="tight",
        )
        plt.close(fig)

        px_per_m = 1856.6
        summary = si.get_summary(grains, px_per_m)

        # Save grains geojson
        si.save_grains(
            output_prefix.parent / f"{output_prefix.name}_grains.geojson",
            grains,
        )

        # Save summary CSV
        si.save_summary(
            output_prefix.parent / f"{output_prefix.name}_summary.csv",
            grains,
            px_per_m,
        )

        # Save summary histogram
        si.save_histogram(
            output_prefix.parent / f"{output_prefix.name}_summary.jpg",
            summary=summary,
        )

        # Save mask
        si.save_mask(
            output_prefix.parent / f"{output_prefix.name}_mask.png",
            grains,
            image,
            scale=False,
        )

        si.save_mask(
            output_prefix.parent / f"{output_prefix.name}_mask2.jpg",
            grains,
            image,
            scale=True,
        )


def get_grain_analyzer():
    global _analyzer
    if _analyzer is None:
        _analyzer = GrainAnalyzer()
    return _analyzer
