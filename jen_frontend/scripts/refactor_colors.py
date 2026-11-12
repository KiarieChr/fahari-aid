import os
import re

# Base directory for the portal components
base_dir = r"c:\My Web Sites\JEN App\src"

# Color mappings
replacements = {
    r"'#120D20'": "'var(--bg-color)'",
    r"'#1A1625'": "'var(--surface-1)'",
    r"'#2a2438'": "'var(--surface-2)'",
    r"'#94a3b8'": "'var(--text-muted)'",
    r"'#f8fafc'": "'var(--text-color)'",
    r"rgba\(255,255,255,0\.05\)": "var(--border-color)",
    r"rgba\(255, 255, 255, 0\.05\)": "var(--border-color)",
    r"rgba\(255,255,255,0\.1\)": "var(--border-color)",
    r"rgba\(255, 255, 255, 0\.1\)": "var(--border-color)",
    r"'#22c1e6'": "'var(--primary)'",
    r"'#a855f7'": "'var(--secondary)'"
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    
    # Process each replacement
    for pattern, replacement in replacements.items():
        # Case insensitive replacement for hex codes
        content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")
        return True
    return False

def main():
    updated_count = 0
    
    # Walk through the Portal directory
    for root, dirs, files in os.walk(base_dir):
        # Only process Portal side, omit website side for now unless needed
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
