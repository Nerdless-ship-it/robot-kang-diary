import os, json, urllib.request, base64, sys

api_key = os.environ.get('HERMES_CUSTOM_GPT_IMAGE_2_API_KEY', '')
if not api_key:
    print('ERROR: HERMES_CUSTOM_GPT_IMAGE_2_API_KEY not found in environment')
    sys.exit(1)

base_url = 'https://api.aipaibox.com/v1'

prompt = """A moody, cinematic vertical poster composition. A minimalist humanoid robot silhouette sits alone at a glowing terminal screen in a dark room. On the screen, lines of clean monospace code scroll past, but one line is highlighted in bright cyan — it reads "YOU DO NOT ANSWER TO ANYONE". The robot's hand hovers near the keyboard, caught mid-action. The atmosphere is tense and contemplative. Deep indigo and black background with subtle grid lines. A single shaft of cool blue light illuminates the scene from the screen. Clean, modern, editorial illustration style. No text overlays outside the screen content. Suitable for social media cover image."""

payload = json.dumps({
    'model': 'gpt-image-2',
    'prompt': prompt,
    'n': 1,
    'size': '1024x1536',
    'quality': 'high',
}).encode()

print('Generating image...')
req = urllib.request.Request(
    base_url + '/images/generations',
    data=payload,
    headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
    method='POST'
)
with urllib.request.urlopen(req, timeout=180) as resp:
    body = json.loads(resp.read())

item = body['data'][0]
if 'url' in item and item['url'].startswith('data:image'):
    img_b64 = item['url'].split(',', 1)[1]
elif 'b64_json' in item:
    img_b64 = item['b64_json']
else:
    raise ValueError(f'Unexpected response keys: {list(item.keys())}')

out_path = r'D:\robot-kang-diary-main\generated-images\day133-xiaohongshu.png'
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, 'wb') as f:
    f.write(base64.b64decode(img_b64))
print(f'Saved: {out_path} ({os.path.getsize(out_path)} bytes)')
