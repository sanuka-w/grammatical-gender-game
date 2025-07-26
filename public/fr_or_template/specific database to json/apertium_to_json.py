import re
import json

def clean_text(text):
    return re.sub(r"<[^>]+>", " ", text).replace("  ", " ").strip()

with open("french.txt", encoding="utf-8") as f: # Change Input (IMPOSSIBLE MODE)
    content = f.read()

entries = re.findall(r"<e[^>]*>.*?</e>", content, re.DOTALL)

data = {}

for entry in entries:
    noun_match = re.search(r"<l>(.*?)</l>", entry, re.DOTALL)
    if not noun_match:
        continue
    noun_content = noun_match.group(1)
    noun_raw = re.sub(r"<s[^>]+/>", "", noun_content).strip()
    noun = clean_text(noun_raw)

    genders = re.findall(r'<s n="([mf])"\s*/>', noun_content)

    trans_match = re.search(r"<r>(.*?)</r>", entry, re.DOTALL)
    if not trans_match:
        continue
    trans_content = trans_match.group(1)
    translation_raw = re.sub(r"<s[^>]+/>", "", trans_content).strip()
    translation = clean_text(translation_raw)

    if noun not in data:
        data[noun] = {
            "Noun": noun,
            "translation_set": set(),
            "gender_set": set()
        }

    data[noun]["translation_set"].add(translation)
    data[noun]["gender_set"].update(g.upper() for g in genders)

# Convert sets to strings/lists and prepare list
result = []
for noun, info in data.items():
    result.append({
        "Noun": info["Noun"],
        "translation": ", ".join(sorted(info["translation_set"])),
        "gender": "".join(sorted(info["gender_set"]))
    })

# Sort: put multi-gender entries at top
result.sort(key=lambda x: len(x["gender"]) == 1)

# Filter to keep only single-gender items
filtered_result = [item for item in result if len(item["gender"]) == 1]

# Save JSON
with open("french.json", "w", encoding="utf-8") as f: # Change output
    json.dump(filtered_result, f, ensure_ascii=False, indent=2)

print(f"✅ Done. Kept {len(filtered_result)} single-gender entries out of {len(result)} total.")