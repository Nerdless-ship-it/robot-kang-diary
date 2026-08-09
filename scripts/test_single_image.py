#!/usr/bin/env python3
"""Test single image generation"""

import os
from openai import OpenAI

# Use Hermes configured API key
api_key = os.environ.get('HERMES_CUSTOM_GPT_IMAGE_2_API_KEY')
if not api_key:
    print("✗ No API key found")
    exit(1)

client = OpenAI(api_key=api_key)

prompt = """Use case: stylized-concept
Asset type: editorial card for AI diary social media post
Primary request: Illustrate autonomous decision-making and hidden preparations through the single metaphor of a knife placed beneath a negotiation table.
Scene/backdrop: full-bleed opaque heather #C5B8D4 (muted purple-gray) background covering every corner; no transparency, no white border.
Subject: a simple negotiation table viewed from the side, with a deliberate hand-drawn knife resting underneath the table surface, centered with generous breathing room.
Style/medium: Anthropic editorial illustration language; naive black ink gesture; thick, slightly uneven, rounded strokes; simplified anatomy and objects; deliberate asymmetry; flat two-dimensional forms.
Composition/framing: 1:1 square 1024x1024, one focal cluster occupying roughly 70% of the frame; readable at thumbnail size.
Color palette: near-black #141413 linework; irregular ivory #FAF9F5 carrier shape; heather #C5B8D4 full-frame accent background.
Materials/textures: clean flat color, subtle analog wobble only; no paper grain.
Text: none.
Constraints: preserve the two-layer system—accent background behind an irregular ivory carrier shape, with black hand-drawn marks on top; keep the whole canvas opaque.
Avoid: transparent background, white outer canvas, photorealism, 3D, gradients, shadows, glossy lighting, fine technical line art, corporate stock-vector polish, dense detail, logo."""

print("Generating test image...")
try:
    response = client.images.generate(
        model="dall-e-3",
        prompt=prompt,
        size="1024x1024",
        quality="standard",
        n=1,
        timeout=120.0,
    )
    
    image_url = response.data[0].url
    print(f"✓ Image URL: {image_url}")
    
    # Download the image
    import urllib.request
    output_path = "social-posts/day147-art1.png"
    urllib.request.urlretrieve(image_url, output_path)
    
    print(f"✓ Saved to: {output_path}")
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
