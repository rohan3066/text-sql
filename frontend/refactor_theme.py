import os
import re

directories = ['e:/Project/frontend/src/pages', 'e:/Project/frontend/src/components']

replacements = {
    # Backgrounds
    r'\bbg-slate-900\b': 'bg-slate-50 dark:bg-slate-900',
    r'\bbg-slate-850\b': 'bg-white dark:bg-slate-850', # Might need to add slate-850 to tailwind.config if it doesn't exist, wait, it's used.
    r'\bbg-slate-800\b': 'bg-white dark:bg-slate-800',
    r'\bbg-slate-750\b': 'bg-slate-100 dark:bg-slate-750',
    r'\bbg-slate-700\b': 'bg-slate-200 dark:bg-slate-700',
    
    # Text
    r'\btext-slate-100\b': 'text-slate-800 dark:text-slate-100',
    r'\btext-slate-200\b': 'text-slate-900 dark:text-slate-200',
    r'\btext-slate-300\b': 'text-slate-700 dark:text-slate-300',
    r'\btext-slate-400\b': 'text-slate-600 dark:text-slate-400',
    
    # Borders
    r'\bborder-slate-800\b': 'border-slate-200 dark:border-slate-800',
    r'\bborder-slate-700\b': 'border-slate-200 dark:border-slate-700',
    r'\bborder-slate-600\b': 'border-slate-300 dark:border-slate-600',
    
    # Dividers
    r'\bdivide-slate-800\b': 'divide-slate-200 dark:divide-slate-800',
    r'\bdivide-slate-700\b': 'divide-slate-200 dark:divide-slate-700',
}

# Fix double applying issues (e.g. if we run it and it matches something that already has dark:)
# So we only replace if not preceded by `dark:` or `bg-white dark:`
def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    for pattern, replacement in replacements.items():
        # Lookbehind to ensure we don't double replace
        # We replace only if it's not preceded by "dark:"
        regex = re.compile(r'(?<!dark:)(?<!-)' + pattern)
        content = regex.sub(replacement, content)
        
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for d in directories:
    if os.path.exists(d):
        for root, _, files in os.walk(d):
            for file in files:
                if file.endswith('.jsx'):
                    # Skip App.jsx and Navbar.jsx since we already modified them manually
                    if file in ['App.jsx', 'Navbar.jsx']:
                        continue
                    filepath = os.path.join(root, file)
                    replace_in_file(filepath)
