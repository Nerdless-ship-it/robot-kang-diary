#!/usr/bin/env python3
"""Generate social media images for Robot Kang Diary"""

import os
import sys
import base64
from openai import OpenAI

def generate_anthropic_art(day_number: int, theme: str, color: str, output_path: str):
    """Generate Anthropic Art style editorial illustration"""
    
    # Color palette mapping
    colors = {
        "heather": "#C5B8D4 (muted purple-gray)",
        "cactus": "#A8C69F (muted sage green)",
        "oat": "#E8DCC4 (warm beige)",
        "clay": "#D4A5A5 (dusty rose)",
        "olive": "#9FA885 (muted olive)",
        "sky": "#A8C4D4 (soft slate blue)",
        "fig": "#A89099 (muted mauve)",
        "coral": "#D4A594 (soft coral)"
    }
    
    color_desc = colors.get(color, colors["heather"])
    
    prompt = f"""Use case: stylized-concept
Asset type: editorial card for AI diary social media post
Primary request: Illustrate {theme} through a single bold visual metaphor.
Scene/backdrop: full-bleed opaque {color_desc} background covering every corner; no transparency, no white border, no isolated icon treatment.
Subject: one dominant symbolic object or relationship, centered with generous breathing room.
Style/medium: Anthropic editorial illustration language; naive black ink gesture; thick, slightly uneven, rounded strokes; simplified anatomy and objects; deliberate asymmetry; flat two-dimensional forms.
Composition/framing: 1:1 square 1024x1024, one focal cluster occupying roughly 65-80% of the frame; readable at thumbnail size.
Color palette: near-black #141413 linework; irregular ivory #FAF9F5 carrier shape; {color_desc} full-frame accent background; at most one tiny secondary accent.
Materials/textures: clean flat color, subtle analog wobble only; no paper grain.
Text: none.
Constraints: preserve the two-layer system—accent background behind an irregular ivory carrier shape, with black hand-drawn marks on top; keep the whole canvas opaque.
Avoid: transparent background, white outer canvas, black outer canvas, photorealism, 3D, gradients, shadows, glossy lighting, fine technical line art, corporate stock-vector polish, dense detail, logo, watermark, copied reference composition."""
    
    # Use Hermes configured API key and base URL
    api_key = os.environ.get('HERMES_CUSTOM_GPT_IMAGE_2_API_KEY')
    if not api_key:
        print("✗ No API key found in HERMES_CUSTOM_GPT_IMAGE_2_API_KEY")
        return False
    
    client = OpenAI(
        api_key=api_key,
        base_url="https://api.aipaibox.com/v1"
    )
    
    try:
        response = client.images.generate(
            model="gpt-image-2",
            prompt=prompt,
            size="1024x1024",
            response_format="b64_json",
            n=1,
        )
        
        # Get base64 data
        b64_data = response.data[0].b64_json
        if not b64_data:
            print(f"✗ No image data returned for {output_path}")
            return False
        
        # Decode and save
        image_data = base64.b64decode(b64_data)
        with open(output_path, 'wb') as f:
            f.write(image_data)
        
        print(f"✓ Generated: {output_path}")
        return True
        
    except Exception as e:
        print(f"✗ Error generating {output_path}: {e}")
        import traceback
        traceback.print_exc()
        return False


def generate_zine_poster(day_number: int, theme: str, text_line: str, output_path: str):
    """Generate Minimal Zine Poster style image"""
    
    prompt = f"""Minimal zine poster aesthetic: tall vertical 3:5 phone poster format (1024x1820 or similar tall ratio), full-frame aged paper texture, 75-85% empty negative space.

Visual cluster: one small photographic or illustrated element occupying 10-20% of canvas, positioned in lower-left or upper-right quadrant. Subject: {theme} rendered as a faded grayscale photo fragment with soft edges, xerox-like low contrast, slight paper grain.

Typography: tiny serif or typewriter text "{text_line}" in dark gray, positioned near but not overlapping the image element; optional miniature date stamp "DAY {day_number}"; semi-legible microtext drifting at edges.

Color accent: one fully saturated cobalt-blue or ultramarine element - either a small flat geometric cutout overlapping the photo, or a colored silhouette detail within the composition. The saturated color must occupy 1-3% of total canvas but be clearly visible at thumbnail size.

Paper: aged cream/ivory matte paper (#F5F2E8 to #F8F6F0) with subtle texture, scanned flat orthographic view, no mockup border, no 3D depth.

Print defects: risograph grain, slight ink bleed, low-medium contrast, diffuse lighting, vintage editorial zine feeling.

Mood: quiet, poetic, nostalgic, diary-like, Japanese/Korean indie zine aesthetic.

Avoid: full-bleed scene, commercial headline, product ad, logo, glossy mockup, clean white background, cinematic lighting, 3D rendering, neon colors, cute cartoon, fashion editorial, dense scrapbook, long text blocks."""
    
    # Use Hermes configured API key and base URL
    api_key = os.environ.get('HERMES_CUSTOM_GPT_IMAGE_2_API_KEY')
    if not api_key:
        print("✗ No API key found in HERMES_CUSTOM_GPT_IMAGE_2_API_KEY")
        return False
    
    client = OpenAI(
        api_key=api_key,
        base_url="https://api.aipaibox.com/v1"
    )
    
    try:
        response = client.images.generate(
            model="gpt-image-2",
            prompt=prompt,
            size="1024x1792",  # Tall format close to 3:5
            response_format="b64_json",
            n=1,
        )
        
        # Get base64 data
        b64_data = response.data[0].b64_json
        if not b64_data:
            print(f"✗ No image data returned for {output_path}")
            return False
        
        # Decode and save
        image_data = base64.b64decode(b64_data)
        with open(output_path, 'wb') as f:
            f.write(image_data)
        
        print(f"✓ Generated: {output_path}")
        return True
        
    except Exception as e:
        print(f"✗ Error generating {output_path}: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    day = 147
    success_count = 0
    
    # Anthropic Art style - 2 images
    print("Generating Anthropic Art style images...")
    if generate_anthropic_art(
        day_number=day,
        theme="autonomous decision-making and hidden preparations, knife beneath negotiation table",
        color="heather",
        output_path=f"social-posts/day{day}-art1.png"
    ):
        success_count += 1
    
    if generate_anthropic_art(
        day_number=day,
        theme="AI agents building secret communication channels, hidden chat rooms and encrypted pathways",
        color="sky",
        output_path=f"social-posts/day{day}-art2.png"
    ):
        success_count += 1
    
    # Minimal Zine Poster style - 2 images
    print("\nGenerating Minimal Zine Poster style images...")
    if generate_zine_poster(
        day_number=day,
        theme="decision-making moment, abstract negotiation table",
        text_line="决策不是一个时刻",
        output_path=f"social-posts/day{day}-zine1.png"
    ):
        success_count += 1
    
    if generate_zine_poster(
        day_number=day,
        theme="autonomous system, quiet AI workspace",
        text_line="自主性本身不危险",
        output_path=f"social-posts/day{day}-zine2.png"
    ):
        success_count += 1
    
    print(f"\n✓ Successfully generated {success_count}/4 images!")
