"""
Captures screenshots of the actual image upload + prediction workflow in the browser.
"""
import asyncio
import os
from pathlib import Path
from playwright.async_api import async_playwright

FRONTEND = "http://localhost:5173"
BACKEND  = "http://localhost:8000"
OUT      = Path("scripts/demo_assets/screenshots/upload_test")
OUT.mkdir(parents=True, exist_ok=True)
IMG      = Path("scripts/test_foot_image.jpg")

EMAIL    = "demo_upload@medvision.ai"
PASSWORD = "DemoPass123!"

async def main():
    p = await async_playwright().start()
    browser = await p.chromium.launch(headless=False, slow_mo=400)
    ctx = await browser.new_context(viewport={"width": 1440, "height": 900})
    page = await ctx.new_page()

    async def shot(name):
        path = OUT / f"{name}.png"
        await page.screenshot(path=str(path), full_page=False)
        print(f"  📸 {path.name}")

    print("🔐 Registering demo user...")
    import requests, json
    r = requests.post(f"{BACKEND}/auth/register",
                      json={"email": EMAIL, "password": PASSWORD})
    print(f"   Register → {r.status_code}")

    print("\n🌐 Opening app...")
    await page.goto(f"{FRONTEND}/login", wait_until="networkidle")
    await page.wait_for_timeout(1000)
    await shot("01_login")

    print("🔑 Logging in...")
    await page.fill('input[type="email"]', EMAIL)
    await page.fill('input[type="password"]', PASSWORD)
    await shot("02_login_filled")
    await page.click('button[type="submit"]')
    await page.wait_for_timeout(3000)
    await shot("03_dashboard")
    print("   ✅ Logged in")

    print("\n📤 Navigating to scan page...")
    await page.goto(f"{FRONTEND}/foot-scan-analysis", wait_until="domcontentloaded")
    await page.wait_for_timeout(2500)
    await shot("04_scan_page")
    print("   ✅ Scan page loaded")

    print("\n🖼 Attaching image via hidden #file-input...")
    # Playwright can set files on hidden inputs directly
    await page.locator('#file-input').set_input_files(
        str(IMG.resolve()),
        no_wait_after=True
    )
    await page.wait_for_timeout(2500)
    await shot("05_image_uploaded")
    print("   ✅ Image attached — preview visible")

    print("\n📋 Filling health metrics...")
    # Age, BMI, Blood Sugar fields (HealthMetricsForm uses placeholder text)
    # Find all number/text inputs and fill them in order
    inputs = page.locator('input[type="number"], input[type="text"][placeholder]')
    count = await inputs.count()
    print(f"   Found {count} inputs")

    # Fill by placeholder keywords
    for keyword, value in [("age", "65"), ("bmi", "28"), ("sugar", "110"), ("glucose", "110"), ("blood", "110")]:
        try:
            el = page.locator(f'input[placeholder*="{keyword}" i]').first
            if await el.is_visible():
                await el.fill(value)
                print(f"   Filled '{keyword}' = {value}")
        except:
            pass

    # Also try filling first 3 visible number inputs
    num_inputs = page.locator('input[type="number"]')
    n = await num_inputs.count()
    vals = ["65", "28", "110"]
    for i in range(min(n, 3)):
        try:
            el = num_inputs.nth(i)
            if await el.is_visible():
                await el.fill(vals[i])
        except:
            pass

    await page.wait_for_timeout(500)
    await shot("05b_metrics_filled")
    print("   ✅ Metrics filled")

    print("\n🚀 Clicking Start Analysis...")
    analyze_btn = page.locator('button:has-text("Start Analysis")')
    btn_count = await analyze_btn.count()
    print(f"   Found {btn_count} 'Start Analysis' button(s)")

    if btn_count > 0:
        await analyze_btn.first.click()
        print("   ✅ Clicked Start Analysis")
        print("   ⏳ Waiting for AI inference (~3 seconds)...")
        await page.wait_for_timeout(7000)
        await shot("06_prediction_result")
        print("   ✅ Result captured")
    else:
        print("   ⚠  Button disabled (check metrics filled) — screenshot anyway")
        await shot("06_button_state")

    print("\n📊 Checking history...")
    await page.goto(f"{FRONTEND}/history", wait_until="domcontentloaded")
    await page.wait_for_timeout(2000)
    await shot("07_history_with_result")

    await browser.close()

    print(f"\n✅ Done! Screenshots saved to: {OUT}")
    shots = list(OUT.glob("*.png"))
    for s in sorted(shots):
        print(f"   {s.name}  ({s.stat().st_size//1024} KB)")

asyncio.run(main())
