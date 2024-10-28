import os

def check_templates():
    template_dir = os.path.join(os.path.dirname(__file__), 'templates')
    required_templates = ['base.html', 'index.html', 'login.html', 'profile.html']
    
    print(f"Checking templates in: {template_dir}")
    
    if not os.path.exists(template_dir):
        print(f"ERROR: Template directory does not exist: {template_dir}")
        return
        
    for template in required_templates:
        template_path = os.path.join(template_dir, template)
        if os.path.exists(template_path):
            print(f"✓ Found {template}")
        else:
            print(f"✗ Missing {template}")

if __name__ == "__main__":
    check_templates()