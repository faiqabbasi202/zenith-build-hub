from PIL import Image, ImageDraw
import numpy as np

# Load the original image
orig = Image.open("public/images/logo.jfif").convert("RGBA")
w, h = orig.size
print(f"Original dimensions: {w}x{h}")

# The AMARC emblem is located centrally in logo.jfif
# Let's crop tightly to the emblem
# In logo.jfif (2816 x 1536), center is at ~ (1408, 770)
# Let's find the circle bounds
center_x, center_y = 1408, 770
radius = 420  # diameter ~ 840

box = (center_x - radius, center_y - radius, center_x + radius, center_y + radius)
emblem = orig.crop(box)

# Now create a circular mask so everything outside the circular emblem is 100% transparent
size = emblem.size
mask = Image.new("L", size, 0)
draw = ImageDraw.Draw(mask)
# Draw anti-aliased circle
draw.ellipse((4, 4, size[0] - 4, size[1] - 4), fill=255)

# Create final image with transparent background
clean_emblem = Image.new("RGBA", size, (0, 0, 0, 0))
clean_emblem.paste(emblem, (0, 0), mask=mask)

# Trim any extra transparency
bbox = clean_emblem.getbbox()
if bbox:
    clean_emblem = clean_emblem.crop(bbox)

# Resize to standard high-res square 512x512
clean_emblem = clean_emblem.resize((512, 512), Image.Resampling.LANCZOS)

# Save as public/logo.png
clean_emblem.save("public/logo.png", "PNG")
print("Saved public/logo.png (512x512 with clean transparent background)")

# Generate favicon.png (64x64) and apple-touch-icon.png (180x180)
fav64 = clean_emblem.resize((64, 64), Image.Resampling.LANCZOS)
fav64.save("public/favicon.png", "PNG")

apple_icon = clean_emblem.resize((180, 180), Image.Resampling.LANCZOS)
apple_icon.save("public/apple-touch-icon.png", "PNG")

# Generate favicon.ico with multiple resolutions
clean_emblem.save("public/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
print("Generated all favicon and logo assets successfully.")
