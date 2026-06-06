"""
Demo Video Recording Script for MedVision AI
Records a complete walkthrough video for README documentation
"""
import asyncio
import os
from pathlib import Path
from playwright.async_api import async_playwright

# Configuration
FRONTEND_URL = "http://localhost:5173"
BACKEND_URL = "http://localhost:8000"
OUTPUT_DIR = Path("demo_assets/videos")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Demo credentials
DEMO_EMAIL = "demo@medvision.ai"
DEMO_PASSWORD = "DemoPassword123!"

class DemoVideoRecorder:
    def __init__(self):
        self.browser = None
        self.context = None
        self.page = None
        
    async def setup(self):
        """Initialize browser with video recording"""
        playwright = await async_playwright().start()
        
        self.browser = await playwright.chromium.launch(
            headless=False,
            slow_mo=500  # Slow down actions for better video visibility
        )
        
        self.context = await self.browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            record_video_dir=str(OUTPUT_DIR),
            record_video_size={'width': 1920, 'height': 1080}
        )
        
        self.page = await self.context.new_page()
        print("✅ Browser initialized with video recording")
        
    async def record_complete_workflow(self):
        """Record a complete user workflow"""
        
        print("\n🎬 Recording: Complete Application Walkthrough")
        print("=" * 60)
        
        # Scene 1: Login
        print("Scene 1: User Login")
        await self.page.goto(f"{FRONTEND_URL}/login")
        await self.page.wait_for_timeout(2000)
        
        await self.page.fill('input[type="email"]', DEMO_EMAIL, delay=100)
        await self.page.wait_for_timeout(500)
        await self.page.fill('input[type="password"]', DEMO_PASSWORD, delay=100)
        await self.page.wait_for_timeout(500)
        
        await self.page.click('button[type="submit"]')
        await self.page.wait_for_timeout(3000)
        
        # Scene 2: Dashboard Overview
        print("Scene 2: Dashboard Overview")
        await self.page.goto(f"{FRONTEND_URL}/dashboard")
        await self.page.wait_for_timeout(3000)
        
        # Scroll to show different sections
        await self.page.evaluate("window.scrollTo(0, document.body.scrollHeight/3)")
        await self.page.wait_for_timeout(2000)
        await self.page.evaluate("window.scrollTo(0, document.body.scrollHeight/2)")
        await self.page.wait_for_timeout(2000)
        await self.page.evaluate("window.scrollTo(0, 0)")
        await self.page.wait_for_timeout(1000)
        
        # Scene 3: Chatbot Workspace
        print("Scene 3: Chatbot Workspace")
        await self.page.goto(f"{FRONTEND_URL}/chatbot")
        await self.page.wait_for_timeout(2000)
        
        # Interact with chatbot
        try:
            await self.page.fill('textarea', "Hello, I need help analyzing a foot ulcer", delay=50)
            await self.page.wait_for_timeout(1000)
            await self.page.press('textarea', 'Enter')
            await self.page.wait_for_timeout(3000)
        except:
            print("⚠️ Chatbot interaction skipped")
        
        # Scene 4: Foot Scan Analysis
        print("Scene 4: Foot Scan Analysis")
        await self.page.goto(f"{FRONTEND_URL}/scan")
        await self.page.wait_for_timeout(3000)
        
        # Note: File upload needs manual intervention or pre-configured file
        print("ℹ️ File upload section displayed")
        await self.page.wait_for_timeout(3000)
        
        # Scene 5: History Page
        print("Scene 5: Patient History")
        await self.page.goto(f"{FRONTEND_URL}/history")
        await self.page.wait_for_timeout(3000)
        
        # Interact with filters
        try:
            await self.page.click('select')  # Risk level filter
            await self.page.wait_for_timeout(1000)
        except:
            print("⚠️ Filter interaction skipped")
        
        # Scroll through history
        await self.page.evaluate("window.scrollTo(0, document.body.scrollHeight/2)")
        await self.page.wait_for_timeout(2000)
        await self.page.evaluate("window.scrollTo(0, 0)")
        await self.page.wait_for_timeout(1000)
        
        # Scene 6: Account Settings
        print("Scene 6: Account Settings")
        await self.page.goto(f"{FRONTEND_URL}/account-settings")
        await self.page.wait_for_timeout(2000)
        
        # Scene 7: API Documentation
        print("Scene 7: API Documentation")
        await self.page.goto(f"{BACKEND_URL}/docs")
        await self.page.wait_for_timeout(3000)
        
        # Expand some API endpoints
        try:
            endpoints = await self.page.query_selector_all('.opblock-summary')
            if endpoints:
                await endpoints[0].click()
                await self.page.wait_for_timeout(1500)
                await endpoints[1].click()
                await self.page.wait_for_timeout(1500)
        except:
            print("⚠️ API endpoint expansion skipped")
        
        await self.page.wait_for_timeout(2000)
        
        print("\n✅ Recording complete!")
        
    async def record_quick_demo(self):
        """Record a quick 30-second demo"""
        
        print("\n🎬 Recording: Quick Demo (30 seconds)")
        print("=" * 60)
        
        # Quick login
        await self.page.goto(f"{FRONTEND_URL}/login")
        await self.page.wait_for_timeout(1000)
        await self.page.fill('input[type="email"]', DEMO_EMAIL, delay=50)
        await self.page.fill('input[type="password"]', DEMO_PASSWORD, delay=50)
        await self.page.click('button[type="submit"]')
        await self.page.wait_for_timeout(2000)
        
        # Show dashboard
        await self.page.goto(f"{FRONTEND_URL}/dashboard")
        await self.page.wait_for_timeout(3000)
        
        # Show scan page
        await self.page.goto(f"{FRONTEND_URL}/scan")
        await self.page.wait_for_timeout(3000)
        
        # Show history
        await self.page.goto(f"{FRONTEND_URL}/history")
        await self.page.wait_for_timeout(3000)
        
        print("✅ Quick demo recorded!")
        
    async def save_video(self):
        """Save the recorded video"""
        await self.context.close()
        
        # Find the video file
        video_files = list(OUTPUT_DIR.glob("*.webm"))
        if video_files:
            latest_video = max(video_files, key=os.path.getctime)
            new_name = OUTPUT_DIR / "medvision_ai_demo.webm"
            latest_video.rename(new_name)
            print(f"\n✅ Video saved: {new_name}")
            print(f"📁 Size: {new_name.stat().st_size / (1024*1024):.2f} MB")
        else:
            print("⚠️ No video file found")
            
    async def cleanup(self):
        """Close browser"""
        if self.browser:
            await self.browser.close()
        print("✅ Browser closed")

async def main():
    """Main execution function"""
    print("🎬 MedVision AI Demo Video Recording")
    print("=" * 60)
    print(f"Frontend: {FRONTEND_URL}")
    print(f"Backend: {BACKEND_URL}")
    print(f"Output: {OUTPUT_DIR}")
    print("=" * 60)
    
    recorder = DemoVideoRecorder()
    
    try:
        await recorder.setup()
        
        # Check if servers are running
        try:
            await recorder.page.goto(FRONTEND_URL, timeout=5000)
        except:
            print("❌ Frontend not running! Start with: cd frontend && npm run dev")
            return
        
        try:
            await recorder.page.goto(f"{BACKEND_URL}/health", timeout=5000)
        except:
            print("❌ Backend not running! Start with: cd backend && uvicorn app.main:app")
            return
        
        print("\n✅ Both servers are running!")
        
        # Choose recording type
        print("\n📹 Choose recording type:")
        print("1. Complete walkthrough (2-3 minutes)")
        print("2. Quick demo (30 seconds)")
        
        choice = input("\nEnter choice (1 or 2) [default: 1]: ").strip() or "1"
        
        if choice == "2":
            await recorder.record_quick_demo()
        else:
            await recorder.record_complete_workflow()
        
        # Save video
        await recorder.save_video()
        
        print("\n" + "=" * 60)
        print(f"✅ Video saved to: {OUTPUT_DIR}")
        print("\n💡 Convert to MP4 with:")
        print(f"   ffmpeg -i {OUTPUT_DIR}/medvision_ai_demo.webm \\")
        print(f"          -c:v libx264 -crf 23 -preset medium \\")
        print(f"          {OUTPUT_DIR}/medvision_ai_demo.mp4")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        
    finally:
        await recorder.cleanup()

if __name__ == "__main__":
    # Install dependencies first:
    # pip install playwright
    # playwright install chromium
    asyncio.run(main())
