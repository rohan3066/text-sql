import re

with open('database/02_seed.sql', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix "Hug 'n' Feel" -> "Hug n Feel" (apostrophes around n are SQL delimiters)
content = content.replace("Hug 'n' Feel", "Hug n Feel")

# Find any remaining unescaped apostrophes inside SQL string values.
# These appear as word_char ' word_char where the single quote is NOT already doubled.
# Use regex to find: letter, then ', then letter — but NOT already ''
def fix_apostrophe(m):
    return m.group(1) + "''" + m.group(2)

# Match: one word char, then a single quote not preceded/followed by another quote, then one word char
content = re.sub(r"([a-zA-Z])'(?!')([a-zA-Z])", fix_apostrophe, content)

with open('database/02_seed.sql', 'w', encoding='utf-8', newline='') as f:
    f.write(content)

print("Done - all apostrophes fixed")
