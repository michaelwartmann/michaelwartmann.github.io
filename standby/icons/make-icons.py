"""Makes the PNG icons from icons/icon.svg:  pip install cairosvg pillow && python3 icons/make-icons.py"""
import io, pathlib, cairosvg
from PIL import Image
D = pathlib.Path(__file__).parent
svg = (D / "icon.svg").read_bytes()
def png(size):
    return Image.open(io.BytesIO(cairosvg.svg2png(bytestring=svg, output_width=size, output_height=size))).convert("RGBA")
for name, size in [("icon-192", 192), ("icon-512", 512), ("favicon-64", 64)]:
    png(size).save(D / f"{name}.png")
# maskable: the icon shrunk into the safe zone on a full-bleed background
bg = Image.new("RGBA", (512, 512), "#15181d"); bg.alpha_composite(png(380), (66, 66)); bg.save(D / "icon-maskable-512.png")
# iPhone fills transparent corners with black, so give it a full square
bg = Image.new("RGBA", (180, 180), "#15181d"); bg.alpha_composite(png(180)); bg.convert("RGB").save(D / "apple-touch-icon.png")
