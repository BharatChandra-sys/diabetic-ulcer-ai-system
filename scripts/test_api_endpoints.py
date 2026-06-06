"""
API Endpoint Testing Script for Documentation
Tests all endpoints and generates sample responses for README
"""
import requests
import json
from pathlib import Path
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
OUTPUT_DIR = Path("demo_assets/api_responses")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Demo credentials
DEMO_EMAIL = "demo@medvision.ai"
DEMO_PASSWORD = "DemoPassword123!"

class APITester:
    def __init__(self):
        self.token = None
        self.results = []
        
    def test_endpoint(self, method, endpoint, data=None, headers=None, description=""):
        """Test a single endpoint and record response"""
        url = f"{BASE_URL}{endpoint}"
        
        print(f"\n{'='*60}")
        print(f"Testing: {method} {endpoint}")
        print(f"Description: {description}")
        print(f"{'='*60}")
        
        try:
            if method == "GET":
                response = requests.get(url, headers=headers, timeout=10)
            elif method == "POST":
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == "PUT":
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == "DELETE":
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                print(f"❌ Unsupported method: {method}")
                return
            
            # Record result
            result = {
                "method": method,
                "endpoint": endpoint,
                "description": description,
                "status_code": response.status_code,
                "status": "✅ Success" if response.status_code < 400 else "❌ Failed",
                "response": response.json() if response.headers.get('content-type') == 'application/json' else response.text,
                "timestamp": datetime.now().isoformat()
            }
            
            self.results.append(result)
            
            # Print response
            print(f"Status: {response.status_code}")
            print(f"Response: {json.dumps(result['response'], indent=2)}")
            
            return response
            
        except Exception as e:
            print(f"❌ Error: {e}")
            self.results.append({
                "method": method,
                "endpoint": endpoint,
                "description": description,
                "status": "❌ Error",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            })
            return None
    
    def authenticate(self):
        """Login and get JWT token"""
        print("\n🔐 Authenticating...")
        
        response = self.test_endpoint(
            "POST",
            "/auth/login",
            data={"email": DEMO_EMAIL, "password": DEMO_PASSWORD},
            description="User authentication"
        )
        
        if response and response.status_code == 200:
            data = response.json()
            self.token = data.get("access_token")
            print(f"✅ Token obtained: {self.token[:20]}...")
            return True
        else:
            print("❌ Authentication failed")
            return False
    
    def get_auth_headers(self):
        """Get authorization headers"""
        if self.token:
            return {"Authorization": f"Bearer {self.token}"}
        return {}
    
    def test_all_endpoints(self):
        """Test all major endpoints"""
        
        # 1. Health Checks
        print("\n" + "="*60)
        print("HEALTH CHECK ENDPOINTS")
        print("="*60)
        
        self.test_endpoint("GET", "/health", description="Main health check")
        self.test_endpoint("GET", "/health/ping", description="Simple ping")
        self.test_endpoint("GET", "/health/ready", description="Readiness probe")
        self.test_endpoint("GET", "/health/live", description="Liveness probe")
        self.test_endpoint("GET", "/health/status", description="System metrics")
        
        # 2. Authentication
        print("\n" + "="*60)
        print("AUTHENTICATION ENDPOINTS")
        print("="*60)
        
        # Login (already done in authenticate())
        # Register
        self.test_endpoint(
            "POST",
            "/auth/register",
            data={
                "email": f"test_{datetime.now().timestamp()}@test.com",
                "password": "TestPass123!",
                "full_name": "Test User"
            },
            description="User registration"
        )
        
        # 3. Patient Management
        print("\n" + "="*60)
        print("PATIENT MANAGEMENT ENDPOINTS")
        print("="*60)
        
        headers = self.get_auth_headers()
        
        # List patients
        self.test_endpoint(
            "GET",
            "/patients/",
            headers=headers,
            description="List all patients"
        )
        
        # Create patient
        patient_response = self.test_endpoint(
            "POST",
            "/patients/",
            data={
                "name": "John Doe",
                "age": 65,
                "bmi": 28.5,
                "diabetes_duration": 15,
                "medical_history": "Type 2 diabetes, hypertension"
            },
            headers=headers,
            description="Create new patient"
        )
        
        # Get patient ID
        patient_id = None
        if patient_response and patient_response.status_code in [200, 201]:
            patient_id = patient_response.json().get("id")
        
        if patient_id:
            # Get patient details
            self.test_endpoint(
                "GET",
                f"/patients/{patient_id}",
                headers=headers,
                description="Get patient details"
            )
        
        # 4. Upload Endpoint
        print("\n" + "="*60)
        print("UPLOAD ENDPOINT")
        print("="*60)
        
        # Note: File upload requires multipart/form-data
        print("ℹ️ File upload requires actual image file - skipping in automated test")
        
        # 5. Prediction Endpoint
        print("\n" + "="*60)
        print("PREDICTION ENDPOINT")
        print("="*60)
        
        print("ℹ️ Prediction requires uploaded image URL - skipping in automated test")
        
        # 6. Reports
        print("\n" + "="*60)
        print("REPORTS ENDPOINT")
        print("="*60)
        
        self.test_endpoint(
            "GET",
            "/reports/",
            headers=headers,
            description="Get user's prediction reports"
        )
        
        # 7. Statistics
        print("\n" + "="*60)
        print("STATISTICS ENDPOINT")
        print("="*60)
        
        self.test_endpoint(
            "GET",
            "/statistics",
            headers=headers,
            description="Get system statistics"
        )
        
        # 8. Diagnostics
        print("\n" + "="*60)
        print("DIAGNOSTICS ENDPOINT")
        print("="*60)
        
        self.test_endpoint(
            "GET",
            "/diagnostics",
            headers=headers,
            description="System diagnostics"
        )
    
    def save_results(self):
        """Save test results to JSON file"""
        output_file = OUTPUT_DIR / f"api_test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        with open(output_file, 'w') as f:
            json.dump({
                "test_date": datetime.now().isoformat(),
                "base_url": BASE_URL,
                "total_tests": len(self.results),
                "passed": sum(1 for r in self.results if r.get("status_code", 0) < 400),
                "failed": sum(1 for r in self.results if r.get("status_code", 0) >= 400),
                "results": self.results
            }, f, indent=2)
        
        print(f"\n✅ Results saved to: {output_file}")
        return output_file
    
    def generate_markdown_report(self):
        """Generate markdown documentation for API endpoints"""
        markdown = []
        markdown.append("# API Endpoints Documentation\n")
        markdown.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        markdown.append(f"Base URL: `{BASE_URL}`\n\n")
        
        # Group by category
        categories = {}
        for result in self.results:
            endpoint = result['endpoint']
            category = endpoint.split('/')[1] if len(endpoint.split('/')) > 1 else 'root'
            
            if category not in categories:
                categories[category] = []
            categories[category].append(result)
        
        # Generate sections
        for category, endpoints in categories.items():
            markdown.append(f"## {category.upper()}\n\n")
            
            for endpoint in endpoints:
                status_emoji = "✅" if endpoint.get("status_code", 0) < 400 else "❌"
                
                markdown.append(f"### {status_emoji} `{endpoint['method']} {endpoint['endpoint']}`\n\n")
                markdown.append(f"**Description:** {endpoint['description']}\n\n")
                markdown.append(f"**Status Code:** `{endpoint.get('status_code', 'N/A')}`\n\n")
                
                if 'response' in endpoint:
                    markdown.append("**Response:**\n```json\n")
                    markdown.append(json.dumps(endpoint['response'], indent=2))
                    markdown.append("\n```\n\n")
                
                markdown.append("---\n\n")
        
        # Save markdown
        markdown_file = OUTPUT_DIR / "API_DOCUMENTATION.md"
        with open(markdown_file, 'w') as f:
            f.write('\n'.join(markdown))
        
        print(f"✅ Markdown report saved to: {markdown_file}")
        return markdown_file

def main():
    """Main execution function"""
    print("🧪 MedVision AI API Testing Script")
    print("=" * 60)
    print(f"Base URL: {BASE_URL}")
    print(f"Output: {OUTPUT_DIR}")
    print("=" * 60)
    
    tester = APITester()
    
    # Check if backend is running
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        print(f"✅ Backend is running (Status: {response.status_code})")
    except:
        print("❌ Backend not running! Start with: cd backend && uvicorn app.main:app")
        return
    
    # Authenticate
    if not tester.authenticate():
        print("\n⚠️ Authentication failed - some tests will be skipped")
        print("💡 Create a demo user first or update credentials in script")
    
    # Test all endpoints
    tester.test_all_endpoints()
    
    # Save results
    json_file = tester.save_results()
    markdown_file = tester.generate_markdown_report()
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print(f"Total tests: {len(tester.results)}")
    print(f"Passed: {sum(1 for r in tester.results if r.get('status_code', 0) < 400)}")
    print(f"Failed: {sum(1 for r in tester.results if r.get('status_code', 0) >= 400)}")
    print(f"\n📁 JSON Report: {json_file}")
    print(f"📄 Markdown Doc: {markdown_file}")
    print("=" * 60)

if __name__ == "__main__":
    main()
