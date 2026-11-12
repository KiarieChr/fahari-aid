import os
import re

base_dir = r"c:\My Web Sites\JEN App\src"

replacements = {
    r"'#eff3c1'": "'var(--text-color)'",     # Light yellowish text
    r"'#cbd5e1'": "'var(--text-color)'",     # Light slate text
    r"'#64748b'": "'var(--text-muted)'",     # Slate 500
    r"rgba\(0,0,0,0\.2\)": "var(--surface-2)", # Search bar bg / inputs
    r"rgba\(0, 0, 0, 0\.2\)": "var(--surface-2)",
    r"rgba\(255,255,255,0\.02\)": "var(--surface-2)", # Table headers
    r"rgba\(255, 255, 255, 0\.02\)": "var(--surface-2)",
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    
    for pattern, replacement in replacements.items():
        content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")
        return True
    return False

def main():
    updated_count = 0
    for root, dirs, files in os.walk(base_dir):
        if 'website' in root:
            continue
            
        for file in files:
            if file.endswith('.jsx') or file.endswith('.js'):
                filepath = os.path.join(root, file)
                if process_file(filepath):
                    updated_count += 1
                    
    print(f"\nTotal files updated: {updated_count}")

if __name__ == "__main__":
    main()
