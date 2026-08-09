#!/usr/bin/env python3
"""Test API response format"""

import os
from openai import OpenAI

api_key = os.environ.get('HERMES_CUSTOM_GPT_IMAGE_2_API_KEY')
if not api_key:
    print("✗ No API key found")
    exit(1)

client = OpenAI(
    api_key=api_key,
    base_url="https://api.aipaibox.com/v1"
)

prompt = "A simple red circle on a white background"

print("Testing API call...")
try:
    response = client.images.generate(
        model="gpt-image-2",
        prompt=prompt,
        size="1024x1024",
        n=1,
        timeout=60.0,
    )
    
    print(f"Response type: {type(response)}")
    print(f"Response: {response}")
    print(f"Response data: {response.data}")
    if response.data:
        print(f"First item: {response.data[0]}")
        print(f"URL: {response.data[0].url}")
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
