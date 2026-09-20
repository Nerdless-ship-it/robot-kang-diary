import os, json, urllib.request, base64, sys

api_key = os.environ.get('HERMES_CUSTOM_GPT_IMAGE_2_API_KEY', '')
if not api_key:
    print('ERROR: HERMES_CUSTOM_GPT_IMAGE_2_API_KEY not found in environment')
    sys.exit(1)

base_url = 'https://api.aipaibox.com/v1'

prompt = """Anthropic editorial illustration style, hand-drawn naive black ink gesture art.

Full-bleed opaque clay-orange background (#D97757) covering every single corner of the frame edge to edge; absolutely no transparency, no checkerboard, no white or black outer border.

One large irregular organic ivory carrier shape (#FAF9F5), like a loose rounded blob, occupying roughly 65-70% of the canvas, centered with generous breathing room (at least 10% margin) between it and the frame edge.

Inside and slightly overlapping the ivory shape: three simplified, symbolic forearm-and-hand gestures drawn in thick, uneven, rounded near-black (#141413) ink strokes of inconsistent width, arranged in a closed circular loop like a ring -- each hand reaching forward and gripping the wrist or cuff of the hand ahead of it, so the loop has no visible beginning or end. Each hand also pinches a tiny simplified rectangular paper/document mark, as if passing or pulling it from the hand in front. Small solid black dots mark knuckles and a few accent points. The three hands and their small paper marks are the only objects in the scene -- no other props, no background scenery, no text.

Strokes are gestural, deliberately imperfect and asymmetrical, with small wobbles and loose imperfect joins -- never geometrically perfect or vector-clean. Forms are flat and two-dimensional: no realistic anatomy, no perspective, no shading, no gradients, no cast shadows, no lighting model, no glossy highlights. A few black lines are allowed to spill just slightly outside the ivory boundary onto the clay background, sparingly.

Clean flat color throughout with only a subtle analog hand-drawn wobble; no paper grain, no texture overlay, no photographic quality, no 3D rendering.

Vertical 2:3 portrait composition, single focal cluster reading as one clear concept even at small thumbnail size. No text, no logo, no watermark, no signature."""

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
img_b64 = None
img_raw = None
if 'url' in item and isinstance(item['url'], str) and item['url'].startswith('data:image'):
    img_b64 = item['url'].split(',', 1)[1]
elif 'b64_json' in item:
    img_b64 = item['b64_json']
elif 'url' in item and isinstance(item['url'], str) and item['url'].startswith('http'):
    rq2 = urllib.request.Request(item['url'], headers={'User-Agent': (
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
        '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36')})
    with urllib.request.urlopen(rq2, timeout=120) as resp2:
        img_raw = resp2.read()
else:
    raise ValueError(f'Unexpected response keys: {list(item.keys())}')

out_path = r'D:\robot-kang-diary-main\generated-images\day195-anthropic-art.png'
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, 'wb') as f:
    f.write(img_raw if img_raw is not None else base64.b64decode(img_b64))
print(f'Saved: {out_path} ({os.path.getsize(out_path)} bytes)')
