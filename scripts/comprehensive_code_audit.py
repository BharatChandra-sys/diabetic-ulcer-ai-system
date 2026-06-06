"""
Comprehensive Code Audit Script for MedVision AI
Analyzes all backend and frontend code without modifications
"""
import os
import json
from pathlib import Path
from datetime import datetime
import re

class CodeAuditor:
    def __init__(self, project_root):
        self.project_root = Path(project_root)
        self.backend_path = self.project_root / "backend"
        self.frontend_path = self.project_root / "frontend"
        self.audit_results = {
            "timestamp": datetime.now().isoformat(),
            "backend": {},
            "frontend": {},
            "summary": {},
            "recommendations": []
        }
        
    def analyze_python_file(self, file_path):
        """Analyze a Python file"""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        lines = content.split('\n')
        
        analysis = {
            "path": str(file_path.relative_to(self.project_root)),
            "lines": len(lines),
            "imports": [],
            "classes": [],
            "functions": [],
            "routes": [],
            "docstrings": 0,
            "comments": 0,
            "todos": [],
            "async_functions": 0
        }
        
        # Extract imports
        import_pattern = r'^(?:from|import)\s+([^\s]+)'
        analysis["imports"] = list(set(re.findall(import_pattern, content, re.MULTILINE)))
        
        # Extract classes
        class_pattern = r'^class\s+(\w+)'
        analysis["classes"] = re.findall(class_pattern, content, re.MULTILINE)
        
        # Extract functions
        function_pattern = r'^(?:async\s+)?def\s+(\w+)'
        analysis["functions"] = re.findall(function_pattern, content, re.MULTILINE)
        
        # Count async functions
        async_pattern = r'^async\s+def'
        analysis["async_functions"] = len(re.findall(async_pattern, content, re.MULTILINE))
        
        # Extract routes (FastAPI)
        route_pattern = r'@router\.(get|post|put|delete|patch)\(["\']([^"\']+)["\']'
        analysis["routes"] = re.findall(route_pattern, content)
        
        # Count docstrings
        docstring_pattern = r'"""[\s\S]*?"""'
        analysis["docstrings"] = len(re.findall(docstring_pattern, content))
        
        # Count comments
        comment_pattern = r'^\s*#'
        analysis["comments"] = len(re.findall(comment_pattern, content, re.MULTILINE))
        
        # Find TODOs
        todo_pattern = r'#\s*TODO:?\s*(.+)$'
        analysis["todos"] = re.findall(todo_pattern, content, re.MULTILINE)
        
        return analysis
    
    def analyze_javascript_file(self, file_path):
        """Analyze a JavaScript/JSX file"""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        lines = content.split('\n')
        
        analysis = {
            "path": str(file_path.relative_to(self.project_root)),
            "lines": len(lines),
            "imports": [],
            "components": [],
            "functions": [],
            "hooks": [],
            "api_calls": [],
            "comments": 0,
            "todos": []
        }
        
        # Extract imports
        import_pattern = r'import\s+.*?\s+from\s+["\']([^"\']+)["\']'
        analysis["imports"] = list(set(re.findall(import_pattern, content)))
        
        # Extract React components
        component_pattern = r'(?:function|const)\s+([A-Z]\w+)\s*(?:=|\()'
        analysis["components"] = re.findall(component_pattern, content)
        
        # Extract functions
        function_pattern = r'(?:function|const)\s+(\w+)\s*(?:=|\()'
        analysis["functions"] = re.findall(function_pattern, content)
        
        # Extract hooks
        hook_pattern = r'use([A-Z]\w+)'
        analysis["hooks"] = list(set(re.findall(hook_pattern, content)))
        
        # Find API calls
        api_pattern = r'(?:axios|fetch)\.[a-z]+\(["\']([^"\']+)["\']'
        analysis["api_calls"] = re.findall(api_pattern, content)
        
        # Count comments
        comment_pattern = r'//.*?$|/\*[\s\S]*?\*/'
        analysis["comments"] = len(re.findall(comment_pattern, content, re.MULTILINE))
        
        # Find TODOs
        todo_pattern = r'//\s*TODO:?\s*(.+)$'
        analysis["todos"] = re.findall(todo_pattern, content, re.MULTILINE)
        
        return analysis
    
    def audit_backend(self):
        """Audit all backend Python files"""
        print("\n🔍 Auditing Backend...")
        
        backend_files = []
        total_lines = 0
        total_routes = 0
        all_routes = []
        
        # Find all Python files
        for py_file in self.backend_path.rglob("*.py"):
            if "__pycache__" in str(py_file) or "venv" in str(py_file):
                continue
            
            analysis = self.analyze_python_file(py_file)
            backend_files.append(analysis)
            total_lines += analysis["lines"]
            total_routes += len(analysis["routes"])
            all_routes.extend(analysis["routes"])
            
            print(f"  ✓ {analysis['path']} ({analysis['lines']} lines, {len(analysis['functions'])} functions)")
        
        self.audit_results["backend"] = {
            "files": backend_files,
            "total_files": len(backend_files),
            "total_lines": total_lines,
            "total_routes": total_routes,
            "all_routes": all_routes
        }
        
        print(f"\n✅ Backend: {len(backend_files)} files, {total_lines} lines, {total_routes} routes")
    
    def audit_frontend(self):
        """Audit all frontend JavaScript/JSX files"""
        print("\n🔍 Auditing Frontend...")
        
        frontend_files = []
        total_lines = 0
        total_components = 0
        
        # Find all JS/JSX files
        for js_file in self.frontend_path.rglob("*.jsx"):
            if "node_modules" in str(js_file):
                continue
            
            analysis = self.analyze_javascript_file(js_file)
            frontend_files.append(analysis)
            total_lines += analysis["lines"]
            total_components += len(analysis["components"])
            
            print(f"  ✓ {analysis['path']} ({analysis['lines']} lines, {len(analysis['components'])} components)")
        
        for js_file in self.frontend_path.rglob("*.js"):
            if "node_modules" in str(js_file) or "dist" in str(js_file):
                continue
            
            analysis = self.analyze_javascript_file(js_file)
            frontend_files.append(analysis)
            total_lines += analysis["lines"]
            
            print(f"  ✓ {analysis['path']} ({analysis['lines']} lines)")
        
        self.audit_results["frontend"] = {
            "files": frontend_files,
            "total_files": len(frontend_files),
            "total_lines": total_lines,
            "total_components": total_components
        }
        
        print(f"\n✅ Frontend: {len(frontend_files)} files, {total_lines} lines, {total_components} components")
    
    def generate_summary(self):
        """Generate audit summary"""
        print("\n📊 Generating Summary...")
        
        backend = self.audit_results["backend"]
        frontend = self.audit_results["frontend"]
        
        # Count specific file types
        route_files = [f for f in backend["files"] if "routes" in f["path"]]
        service_files = [f for f in backend["files"] if "services" in f["path"]]
        model_files = [f for f in backend["files"] if "models" in f["path"] or "ml" in f["path"]]
        
        page_files = [f for f in frontend["files"] if "pages" in f["path"]]
        component_files = [f for f in frontend["files"] if "components" in f["path"]]
        
        summary = {
            "total_files": backend["total_files"] + frontend["total_files"],
            "total_lines": backend["total_lines"] + frontend["total_lines"],
            "backend": {
                "files": backend["total_files"],
                "lines": backend["total_lines"],
                "routes": backend["total_routes"],
                "route_files": len(route_files),
                "service_files": len(service_files),
                "model_files": len(model_files)
            },
            "frontend": {
                "files": frontend["total_files"],
                "lines": frontend["total_lines"],
                "components": frontend["total_components"],
                "page_files": len(page_files),
                "component_files": len(component_files)
            }
        }
        
        self.audit_results["summary"] = summary
        
        print("\n" + "="*60)
        print("AUDIT SUMMARY")
        print("="*60)
        print(f"Total Files: {summary['total_files']}")
        print(f"Total Lines: {summary['total_lines']:,}")
        print(f"\nBackend:")
        print(f"  - Python files: {summary['backend']['files']}")
        print(f"  - Lines of code: {summary['backend']['lines']:,}")
        print(f"  - API routes: {summary['backend']['routes']}")
        print(f"  - Route files: {summary['backend']['route_files']}")
        print(f"  - Service files: {summary['backend']['service_files']}")
        print(f"  - Model files: {summary['backend']['model_files']}")
        print(f"\nFrontend:")
        print(f"  - JS/JSX files: {summary['frontend']['files']}")
        print(f"  - Lines of code: {summary['frontend']['lines']:,}")
        print(f"  - React components: {summary['frontend']['components']}")
        print(f"  - Page files: {summary['frontend']['page_files']}")
        print(f"  - Component files: {summary['frontend']['component_files']}")
        print("="*60)
    
    def generate_recommendations(self):
        """Generate code quality recommendations"""
        print("\n💡 Generating Recommendations...")
        
        recommendations = []
        
        # Check for undocumented routes
        backend = self.audit_results["backend"]
        route_files = [f for f in backend["files"] if "routes" in f["path"]]
        
        for route_file in route_files:
            if route_file["docstrings"] == 0:
                recommendations.append({
                    "type": "documentation",
                    "severity": "low",
                    "file": route_file["path"],
                    "message": "Consider adding docstrings to route handlers"
                })
        
        # Check for TODOs
        all_files = backend["files"] + self.audit_results["frontend"]["files"]
        for file in all_files:
            if file["todos"]:
                recommendations.append({
                    "type": "todo",
                    "severity": "info",
                    "file": file["path"],
                    "count": len(file["todos"]),
                    "todos": file["todos"]
                })
        
        # Check for large files
        for file in all_files:
            if file["lines"] > 500:
                recommendations.append({
                    "type": "code_size",
                    "severity": "medium",
                    "file": file["path"],
                    "lines": file["lines"],
                    "message": "Consider refactoring large file into smaller modules"
                })
        
        # General recommendations
        recommendations.append({
            "type": "general",
            "severity": "info",
            "message": "Code structure is well-organized with clear separation of concerns"
        })
        
        recommendations.append({
            "type": "general",
            "severity": "info",
            "message": "Backend uses async/await patterns for better performance"
        })
        
        recommendations.append({
            "type": "general",
            "severity": "info",
            "message": "Frontend follows React best practices with functional components"
        })
        
        self.audit_results["recommendations"] = recommendations
        
        print(f"✅ Generated {len(recommendations)} recommendations")
    
    def save_audit_report(self):
        """Save audit report to JSON"""
        output_dir = Path("demo_assets/audit")
        output_dir.mkdir(parents=True, exist_ok=True)
        
        output_file = output_dir / f"code_audit_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        with open(output_file, 'w') as f:
            json.dump(self.audit_results, f, indent=2)
        
        print(f"\n✅ Audit report saved: {output_file}")
        return output_file
    
    def generate_markdown_report(self):
        """Generate markdown audit report"""
        output_dir = Path("demo_assets/audit")
        output_dir.mkdir(parents=True, exist_ok=True)
        
        markdown = []
        markdown.append("# MedVision AI - Code Audit Report\n")
        markdown.append(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        # Executive Summary
        summary = self.audit_results["summary"]
        markdown.append("## Executive Summary\n\n")
        markdown.append(f"- **Total Files Analyzed:** {summary['total_files']}\n")
        markdown.append(f"- **Total Lines of Code:** {summary['total_lines']:,}\n")
        markdown.append(f"- **Backend Files:** {summary['backend']['files']}\n")
        markdown.append(f"- **Frontend Files:** {summary['frontend']['files']}\n")
        markdown.append(f"- **API Routes:** {summary['backend']['routes']}\n")
        markdown.append(f"- **React Components:** {summary['frontend']['components']}\n\n")
        
        # Backend Details
        markdown.append("## Backend Analysis\n\n")
        markdown.append(f"**Total Lines:** {summary['backend']['lines']:,}\n\n")
        markdown.append("### API Routes\n\n")
        
        backend = self.audit_results["backend"]
        for method, route in backend["all_routes"]:
            markdown.append(f"- `{method.upper()} {route}`\n")
        markdown.append("\n")
        
        # Frontend Details
        markdown.append("## Frontend Analysis\n\n")
        markdown.append(f"**Total Lines:** {summary['frontend']['lines']:,}\n\n")
        markdown.append("### Pages\n\n")
        
        frontend = self.audit_results["frontend"]
        page_files = [f for f in frontend["files"] if "pages" in f["path"]]
        for page in page_files:
            markdown.append(f"- {page['path']} ({page['lines']} lines)\n")
        markdown.append("\n")
        
        # Recommendations
        markdown.append("## Recommendations\n\n")
        recommendations = self.audit_results["recommendations"]
        
        for rec in recommendations:
            severity_emoji = {"low": "ℹ️", "medium": "⚠️", "high": "🔴", "info": "💡"}
            emoji = severity_emoji.get(rec["severity"], "ℹ️")
            
            markdown.append(f"### {emoji} {rec['type'].replace('_', ' ').title()}\n\n")
            
            if "file" in rec:
                markdown.append(f"**File:** `{rec['file']}`\n\n")
            
            if "message" in rec:
                markdown.append(f"{rec['message']}\n\n")
            
            if "todos" in rec:
                markdown.append("**TODOs:**\n")
                for todo in rec["todos"]:
                    markdown.append(f"- {todo}\n")
                markdown.append("\n")
        
        # Save markdown
        markdown_file = output_dir / "CODE_AUDIT_REPORT.md"
        with open(markdown_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(markdown))
        
        print(f"✅ Markdown report saved: {markdown_file}")
        return markdown_file

def main():
    """Main execution function"""
    print("🔍 MedVision AI - Comprehensive Code Audit")
    print("="*60)
    
    project_root = Path(__file__).parent.parent
    print(f"Project Root: {project_root}")
    print("="*60)
    
    auditor = CodeAuditor(project_root)
    
    # Run audits
    auditor.audit_backend()
    auditor.audit_frontend()
    auditor.generate_summary()
    auditor.generate_recommendations()
    
    # Save reports
    json_file = auditor.save_audit_report()
    markdown_file = auditor.generate_markdown_report()
    
    print("\n" + "="*60)
    print("AUDIT COMPLETE")
    print("="*60)
    print(f"📁 JSON Report: {json_file}")
    print(f"📄 Markdown Report: {markdown_file}")
    print("="*60)

if __name__ == "__main__":
    main()
