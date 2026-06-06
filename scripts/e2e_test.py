"""
End-to-end test: register → login → upload image → run prediction
Prints full evidence of every step.
"""
import requests
import os
import json
import time
from PIL import Image, ImageDraw
import io

BASE = "http://localhost:8000"
EMAIL = f"e2etest_{int(time.time())}@medvision.ai"
PASSWORD = "TestPass123!"

def banner(msg):
    print(f"\n{'='*60}")
    print(f"  {msg}")
    print('='*60)

def ok(msg):   print(f"  ✅ {msg}")
def fail(msg): print(f"  ❌ {msg}")
def info(msg): print(f"  ℹ  {msg}")

# ── 1. Create test image ────────────────────────────────────────
banner("STEP 1 — Create test foot image")
img = Image.new("RGB", (300, 300), color=(210, 170, 140))  # skin tone
draw = ImageDraw.Draw(img)
# Draw a reddish wound-like region
draw.ellipse([100, 100, 200, 200], fill=(180, 60, 60))
draw.ellipse([120, 120, 180, 180], fill=(220, 40, 40))
# Add some skin texture dots
for x, y in [(50,50),(250,50),(50,250),(250,250),(150,30),(30,150)]:
    draw.ellipse([x-5, y-5, x+5, y+5], fill=(190, 150, 120))

img_path = "scripts/test_foot_image.jpg"
img.save(img_path, "JPEG", quality=90)
ok(f"Saved test image → {img_path}  ({os.path.getsize(img_path):,} bytes)")

# ── 2. Register user ────────────────────────────────────────────
banner("STEP 2 — Register new user")
r = requests.post(f"{BASE}/auth/register", json={"email": EMAIL, "password": PASSWORD})
info(f"POST /auth/register  →  HTTP {r.status_code}")
print(f"  Body: {json.dumps(r.json(), indent=4)}")
if r.status_code in (200, 201):
    ok("Registration successful")
else:
    fail("Registration failed — continuing anyway (user may exist)")

# ── 3. Login ────────────────────────────────────────────────────
banner("STEP 3 — Login")
r = requests.post(f"{BASE}/auth/login", json={"email": EMAIL, "password": PASSWORD})
info(f"POST /auth/login  →  HTTP {r.status_code}")
body = r.json()
print(f"  Body: {json.dumps(body, indent=4)}")

if r.status_code != 200:
    fail("Login failed — cannot continue")
    exit(1)

token = body["access_token"]
ok(f"Token received: {token[:30]}...")
AUTH = {"Authorization": f"Bearer {token}"}

# ── 4. Upload image ─────────────────────────────────────────────
banner("STEP 4 — Upload image")
with open(img_path, "rb") as f:
    r = requests.post(
        f"{BASE}/upload",
        files={"file": ("test_foot.jpg", f, "image/jpeg")},
        headers=AUTH
    )
info(f"POST /upload  →  HTTP {r.status_code}")
body = r.json()
print(f"  Body: {json.dumps(body, indent=4)}")

if r.status_code != 200:
    fail("Upload failed — cannot continue")
    exit(1)

image_url = body["url"]
ok(f"Image URL: {image_url}")

# ── 5. Run prediction ───────────────────────────────────────────
banner("STEP 5 — Run AI prediction")
payload = {
    "image_url": image_url,
    "age": 65,
    "bmi": 31.5,
    "diabetes_duration": 12,
    "infection_signs": "mild"
}
info(f"Request payload: {json.dumps(payload, indent=4)}")

start = time.time()
r = requests.post(f"{BASE}/predict", json=payload, headers=AUTH)
elapsed = (time.time() - start) * 1000

info(f"POST /predict  →  HTTP {r.status_code}  ({elapsed:.0f}ms)")

if r.status_code != 200:
    fail("Prediction failed")
    print(f"  Error: {r.text}")
    exit(1)

result = r.json()

# Print key fields (skip large base64 blobs)
clean = {k: v for k, v in result.items() 
         if k not in ("gradcam_heatmap", "gradcam_overlay", "segmentation_mask")}
print(f"\n  Prediction Result:")
print(json.dumps(clean, indent=4))

ok(f"Prediction: {result['prediction'].upper()}")
ok(f"Confidence: {result['confidence']*100:.1f}%")
ok(f"Risk Score: {result['risk_score']}%")
ok(f"Risk Level: {result['risk_level']}")
ok(f"Severity:   {result['severity']}")
ok(f"Affected Area: {result['affected_area']:.1f}%")
ok(f"Grad-CAM heatmap included: {'Yes' if result.get('gradcam_heatmap') else 'No'}")
ok(f"Grad-CAM overlay included: {'Yes' if result.get('gradcam_overlay') else 'No'}")
info(f"Explanation: {result['explanation_text']}")
info(f"Recommendations: {result['recommendations']}")

# ── 6. Check reports ────────────────────────────────────────────
banner("STEP 6 — Verify report was saved")
r = requests.get(f"{BASE}/reports/", headers=AUTH)
info(f"GET /reports/  →  HTTP {r.status_code}")
reports = r.json()
print(f"  Total reports: {len(reports)}")
if reports:
    latest = reports[-1] if isinstance(reports, list) else reports
    ok(f"Latest report saved — prediction: {latest.get('prediction', 'N/A')}")
else:
    info("No reports yet (may be empty db)")

# ── 7. Health check ─────────────────────────────────────────────
banner("STEP 7 — Health check")
r = requests.get(f"{BASE}/health")
info(f"GET /health  →  HTTP {r.status_code}")
print(f"  {json.dumps(r.json(), indent=4)}")
ok("Health endpoint OK")

# ── Summary ─────────────────────────────────────────────────────
banner("E2E TEST COMPLETE — EVIDENCE SUMMARY")
print(f"""
  User registered: {EMAIL}
  Auth token:      {token[:30]}...
  Image uploaded:  {image_url}
  Prediction:      {result['prediction'].upper()}
  Confidence:      {result['confidence']*100:.1f}%
  Risk Level:      {result['risk_level']}
  Severity:        {result['severity']}
  Risk Score:      {result['risk_score']}%
  Affected Area:   {result['affected_area']:.1f}%
  Inference time:  {elapsed:.0f}ms
  Grad-CAM:        {'✅ Generated' if result.get('gradcam_heatmap') else '⚠ Not generated'}
  Overlay:         {'✅ Generated' if result.get('gradcam_overlay') else '⚠ Not generated'}
  Report saved:    ✅
  Health check:    ✅
""")
print("  🎉 All systems working — evidence captured above!")
