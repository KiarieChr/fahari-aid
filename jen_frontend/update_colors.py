import os
import re

def process_directory(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.jsx', '.js', '.tsx', '.ts')):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()

                    new_content = re.sub(r"color:\s*'white'", "color: 'var(--text-color)'", content)
                    new_content = re.sub(r"color:\s*'#fff'", "color: 'var(--text-color)'", new_content)
                    new_content = re.sub(r"color:\s*'#ffffff'", "color: 'var(--text-color)'", new_content)
                    new_content = re.sub(r'color:\s*"white"', 'color: "var(--text-color)"', new_content)
                    new_content = re.sub(r'color:\s*"#fff"', 'color: "var(--text-color)"', new_content)
                    new_content = re.sub(r'color:\s*"#ffffff"', 'color: "var(--text-color)"', new_content)

                    if new_content != content:
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f'Updated {filepath}')
                except Exception as e:
                    print(f'Error processing {filepath}: {e}')

process_directory(r'c:\My Web Sites\JEN App\src\Portal')
print('Finished text color replacements.')
