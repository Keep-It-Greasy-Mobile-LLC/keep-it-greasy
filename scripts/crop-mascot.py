import os
from PIL import Image

src_path = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "img_res", "552467997_122103453405021812_5621404526153512135_n.jpg"))
dst_path = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "public", "assets", "images", "logo-mascot.png"))

if not os.path.exists(src_path):
    src_path = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "public", "assets", "images", "business-card.png"))

img = Image.open(src_path)
width, height = img.size
print(f"Original image size: {width}x{height}")

# Crop the top graphic (mascot + turbos + pistons + crossed wrenches)
# The graphic is centered horizontally and occupies the top ~50%
crop_box = (
    int(width * 0.12),   # left
    int(height * 0.01),  # top
    int(width * 0.88),   # right
    int(height * 0.49)   # bottom (just above 'KEEP IT GREASY')
)

cropped = img.crop(crop_box)
cropped.save(dst_path, "PNG")
print(f"Mascot cropped and saved cleanly to {dst_path} (size: {cropped.size})")
