import cv2
import sys
import numpy as np

def get_dominant_color(image_path):
    img = cv2.imread(image_path)
    if img is None:
        return "Not found"
    # reshape to list of pixels
    pixels = img.reshape(-1, 3)
    # get most frequent color
    colors, counts = np.unique(pixels, axis=0, return_counts=True)
    dominant = colors[np.argmax(counts)]
    # convert BGR to Hex
    return "#{:02x}{:02x}{:02x}".format(dominant[2], dominant[1], dominant[0])

print("Image 1:", get_dominant_color("image.png")) # wait, I don't have the path.
