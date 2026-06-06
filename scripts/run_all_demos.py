"""
Master Script - Run All Demo Generation Scripts
Executes code audit, API testing, screenshots, and video recording
"""
import asyncio
import subprocess
import sys
from pathlib import Path
from datetime import datetime

class DemoMaster:
    def __init__(self):
        self.scripts_dir = Path(__file__).parent
        self.results = []
        
    def run_script(self, script_name, description):
        """Run a Python script and record results"""
        print("\n" + "="*70)
        print(f"🚀 Running: {description}")
        print(f"📄 Script: {script_name}")
        print("="*70 + "\n")
        
        start_time = datetime.now()
        
        try:
            result = subprocess.run(
                [sys.executable, str(self.scripts_dir / script_name)],
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )
            
            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()
            
            success = result.returncode == 0
            
            if success:
                print(f"✅ {description} completed successfully ({duration:.1f}s)")
            else:
                print(f"❌ {description} failed")
                print(f"Error: {result.stderr}")
            
            self.results.append({
                "script": script_name,
                "description": description,
                "success": success,
                "duration": duration,
                "timestamp": start_time.isoformat()
            })
            
            return success
            
        except subprocess.TimeoutExpired:
            print(f"⏰ {description} timed out after 5 minutes")
            self.results.append({
                "script": script_name,
                "description": description,
                "success": False,
                "error": "Timeout",
                "timestamp": start_time.isoformat()
            })
            return False
            
        except Exception as e:
            print(f"❌ Error running {description}: {e}")
            self.results.append({
                "script": script_name,
                "description": description,
                "success": False,
                "error": str(e),
                "timestamp": start_time.isoformat()
            })
            return False
    
    def check_prerequisites(self):
        """Check if required packages are installed"""
        print("🔍 Checking prerequisites...")
        
        packages = {
            "playwright": "playwright",
            "requests": "requests",
            "PIL": "Pillow"
        }
        
        missing = []
        
        for module, package in packages.items():
            try:
                __import__(module)
                print(f"  ✅ {package}")
            except ImportError:
                print(f"  ❌ {package} (missing)")
                missing.append(package)
        
        if missing:
            print("\n⚠️ Missing packages. Install with:")
            print(f"  pip install {' '.join(missing)}")
            print("  playwright install chromium")
            return False
        
        print("✅ All prerequisites installed\n")
        return True
    
    def print_summary(self):
        """Print execution summary"""
        print("\n" + "="*70)
        print("📊 EXECUTION SUMMARY")
        print("="*70)
        
        total = len(self.results)
        successful = sum(1 for r in self.results if r["success"])
        failed = total - successful
        
        print(f"\nTotal Scripts: {total}")
        print(f"Successful: {successful}")
        print(f"Failed: {failed}")
        
        print("\nDetails:")
        for result in self.results:
            status = "✅" if result["success"] else "❌"
            duration = result.get("duration", 0)
            print(f"  {status} {result['description']} ({duration:.1f}s)")
        
        print("\n" + "="*70)
        
        if failed == 0:
            print("🎉 All demo scripts completed successfully!")
        else:
            print(f"⚠️ {failed} script(s) failed. Check output above for details.")
        
        print("="*70)

def main():
    """Main execution function"""
    print("🎬 MedVision AI - Demo Generation Master Script")
    print("="*70)
    print("This script will run all demo generation scripts:")
    print("  1. Code Audit")
    print("  2. API Testing")
    print("  3. Screenshot Capture")
    print("  4. Video Recording")
    print("="*70)
    
    master = DemoMaster()
    
    # Check prerequisites
    if not master.check_prerequisites():
        print("\n❌ Please install missing packages first")
        return
    
    # Confirm execution
    print("\n⚠️ This will take 5-10 minutes to complete.")
    print("⚠️ Make sure both servers are running:")
    print("     - Backend: http://localhost:8000")
    print("     - Frontend: http://localhost:5173")
    
    response = input("\nContinue? (y/n) [y]: ").strip().lower() or 'y'
    
    if response != 'y':
        print("Cancelled.")
        return
    
    print("\n🚀 Starting demo generation...\n")
    
    # Run scripts in order
    scripts = [
        ("comprehensive_code_audit.py", "Code Audit"),
        ("test_api_endpoints.py", "API Testing"),
    ]
    
    for script, description in scripts:
        master.run_script(script, description)
    
    # Interactive scripts (require browser)
    print("\n" + "="*70)
    print("📸 Screenshot and Video Capture")
    print("="*70)
    print("\nThe next scripts will open a browser window.")
    print("You can watch the automation in action!")
    
    response = input("\nRun screenshot capture? (y/n) [y]: ").strip().lower() or 'y'
    if response == 'y':
        master.run_script("capture_demo_screenshots.py", "Screenshot Capture")
    
    response = input("\nRun video recording? (y/n) [y]: ").strip().lower() or 'y'
    if response == 'y':
        master.run_script("record_demo_video.py", "Video Recording")
    
    # Print summary
    master.print_summary()
    
    # Show output location
    print("\n📁 Output Location:")
    print("   demo_assets/")
    print("   ├── screenshots/")
    print("   ├── videos/")
    print("   ├── api_responses/")
    print("   └── audit/")
    
    print("\n💡 Next Steps:")
    print("   1. Review generated assets in demo_assets/")
    print("   2. Convert video: ffmpeg -i *.webm -c:v libx264 output.mp4")
    print("   3. Upload assets to your preferred hosting")
    print("   4. Update README.md with asset links")
    
    print("\n✅ Demo generation complete!")

if __name__ == "__main__":
    main()
