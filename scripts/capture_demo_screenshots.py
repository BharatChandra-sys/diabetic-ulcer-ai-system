"""
Demo Screenshot Capture Script for MedVision AI
Captures screenshots of all major pages for README documentation
"""
import asyncio
import os
from pathlib import Path
from playwright.async_api import async_playwright

# Configuration
FRONTEND_URL = "http://localhost:5173"
BACKEND_URL = "http://localhost:8000"
OUTPUT_DIR = Path("demo_assets/screenshots")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Demo user credentials
DEMO_EMAIL = "demo@medvision.ai"
DEMO_PASSWORD = "DemoPassword123!"

class DemoScreenshotCapture:
    def __init__(self):
        self.browser = None
        self.page = None
        self.context = None
        
    async def setup(self):
        """Initialize browser and page"""
        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(headless=False)
        self.context = await self.browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        )
        self.page = await self.context.new_page()
        print("✅ Browser initialized")
        
    async def capture_screenshot(self, name, url=None, wait_time=2000):
        """Capture screenshot with optional navigation"""
        if url:
            await self.page.goto(url, wait_until="networkidle")
        
        await self.page.wait_for_timeout(wait_time)
        
        screenshot_path = OUTPUT_DIR / f"{name}.png"
        await self.page.screenshot(path=str(screenshot_path), full_page=True)
        print(f"📸 Captured: {screenshot_path}")
        return screenshot_path
        
    async def login(self):
        """Login to the application"""
        await self.page.goto(f"{FRONTEND_URL}/login")
        await self.page.wait_for_selector('input[type="email"]')
        
        # Fill login form
        await self.page.fill('input[type="email"]', DEMO_EMAIL)
        await self.page.fill('input[type="password"]', DEMO_PASSWORD)
        
        # Take screenshot of login page
        await self.capture_screenshot("01_login_page")
        
        # Submit login
        await self.page.click('button[type="submit"]')
        await self.page.wait_for_timeout(2000)
        print("✅ Logged in successfully")
        
    async def capture_all_pages(self):
        """Capture screenshots of all major pages"""
        
        # 1. Landing/Login Page (already captured in login())
        
        # 2. Dashboard
        await self.page.goto(f"{FRONTEND_URL}/dashboard")
        await self.page.wait_for_timeout(2000)
        await self.capture_screenshot("02_dashboard")
        
        # 3. Chatbot Workspace
        await self.page.goto(f"{FRONTEND_URL}/chatbot")
        await self.page.wait_for_timeout(2000)
        await self.capture_screenshot("03_chatbot_workspace")
        
        # 4. Foot Scan Analysis
        await self.page.goto(f"{FRONTEND_URL}/scan")
        await self.page.wait_for_timeout(2000)
        await self.capture_screenshot("04_foot_scan_analysis")
        
        # 5. History Page
        await self.page.goto(f"{FRONTEND_URL}/history")
        await self.page.wait_for_timeout(2000)
        await self.capture_screenshot("05_history_page")
        
        # 6. Account Settings
        await self.page.goto(f"{FRONTEND_URL}/account-settings")
        await self.page.wait_for_timeout(2000)
        await self.capture_screenshot("06_account_settings")
        
        # 7. API Documentation
        await self.page.goto(f"{BACKEND_URL}/docs")
        await self.page.wait_for_timeout(3000)
        await self.capture_screenshot("07_api_documentation")
        
        # 8. Health Metrics (if available)
        try:
            await self.page.goto(f"{FRONTEND_URL}/health-metrics")
            await self.page.wait_for_timeout(2000)
            await self.capture_screenshot("08_health_metrics")
        except:
            print("⚠️ Health metrics page not available")
        
    async def capture_workflow_sequence(self):
        """Capture a complete workflow sequence"""
        print("\n📋 Capturing workflow sequence...")
        
        # Workflow 1: Upload and analyze
        await self.page.goto(f"{FRONTEND_URL}/scan")
        await self.page.wait_for_timeout(2000)
        await self.capture_screenshot("workflow_01_upload_page")
        
        # Simulate file upload (you'll need to replace with actual file path)
        # Note: This requires a real image file for demo
        print("ℹ️ Manual step: Upload a sample foot image")
        await self.page.wait_for_timeout(5000)  # Wait for manual upload
        
        # Capture after upload
        await self.capture_screenshot("workflow_02_analysis_progress")
        
        # Wait for results
        await self.page.wait_for_timeout(3000)
        await self.capture_screenshot("workflow_03_results_page")
        
    async def cleanup(self):
        """Close browser"""
        if self.browser:
            await self.browser.close()
        print("✅ Browser closed")
        
async def main():
    """Main execution function"""
    print("🎬 MedVision AI Demo Screenshot Capture")
    print("=" * 50)
    print(f"Frontend: {FRONTEND_URL}")
    print(f"Backend: {BACKEND_URL}")
    print(f"Output: {OUTPUT_DIR}")
    print("=" * 50)
    
    capture = DemoScreenshotCapture()
    
    try:
        await capture.setup()
        
        # Check if servers are running
        try:
            await capture.page.goto(FRONTEND_URL, timeout=5000)
        except:
            print("❌ Frontend not running! Start with: cd frontend && npm run dev")
            return
        
        try:
            await capture.page.goto(f"{BACKEND_URL}/health", timeout=5000)
        except:
            print("❌ Backend not running! Start with: cd backend && uvicorn app.main:app")
            return
        
        print("\n✅ Both servers are running!")
        print("\n📸 Starting screenshot capture...")
        
        # Login first
        await capture.login()
        
        # Capture all pages
        await capture.capture_all_pages()
        
        # Capture workflow
        # await capture.capture_workflow_sequence()  # Uncomment for workflow capture
        
        print("\n" + "=" * 50)
        print(f"✅ All screenshots saved to: {OUTPUT_DIR}")
        print("=" * 50)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        
    finally:
        await capture.cleanup()

if __name__ == "__main__":
    # Install dependencies first:
    # pip install playwright
    # playwright install chromium
    asyncio.run(main())
