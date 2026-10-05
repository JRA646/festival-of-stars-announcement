from pathlib import Path
from PIL import Image

SOURCE = Path("Festival of Stars Asset Mood Board(1).png")
OUT = Path("public/festival-assets")
OUT.mkdir(parents=True, exist_ok=True)

# Crops are based on the supplied Festival of Stars mood board.
ASSETS = {
    "singer": (8, 5, 238, 334),
    "female-worship": (247, 5, 487, 334),
    "smiling-youth": (490, 5, 728, 334),
    "guitarist": (736, 5, 870, 334),
    "worship-crowd": (878, 5, 1232, 334),
    "stage-star": (1240, 5, 1528, 334),
    "city-buildings": (8, 368, 288, 504),
    "youth-community": (297, 368, 679, 504),
    "torn-paper": (689, 368, 903, 504),
    "abstract-paint": (1190, 368, 1529, 504),
    "dark-grunge": (8, 668, 271, 803),
    "teal-grunge": (278, 668, 529, 803),
    "yellow-grunge": (538, 668, 782, 803),
    "red-grunge": (789, 668, 985, 803),
    "collage-texture": (991, 668, 1266, 803),
    "collage-texture-2": (1273, 668, 1528, 803),
    "building-front": (8, 835, 274, 993),
    "crowd-silhouette": (282, 835, 614, 993),
    "neon-star": (623, 835, 847, 993),
    "star-elements": (855, 835, 1092, 993),
    "paint-splatter": (1100, 835, 1320, 993),
    "paint-splatter-2": (1328, 835, 1528, 993),
}

if not SOURCE.exists():
    raise SystemExit(f"Missing source image: {SOURCE}")

image = Image.open(SOURCE).convert("RGB")

for name, box in ASSETS.items():
    crop = image.crop(box)
    crop.save(OUT / f"{name}.png", optimize=True)

print(f"Extracted {len(ASSETS)} Festival of Stars assets to {OUT}")
