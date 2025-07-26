import json
import pandas as pd
import re

# === FILES ===
DICT_FILE = "eng-fra.dict"
FLELEX_FILE = "FLELex_TreeTagger_Beacco.txt"
LEXIQUE_FILE = "lexique.xlsb"
OUTPUT_JSON = "Fr_simple.json"

# === Load FLELex nouns and levels ===
flelex_nouns = set()
level_dict = {}
with open(FLELEX_FILE, encoding="utf-8") as f:
    for line in f:
        parts = line.strip().split('\t')
        if len(parts) >= 9 and parts[1] == 'NOM':
            word = parts[0]
            level = parts[-1]
            flelex_nouns.add(word)
            level_dict[word] = level
print(f"✅ Loaded {len(flelex_nouns)} French nouns and levels from FLELex.")

# === Load Lexique genders from xlsb ===
df = pd.read_excel(LEXIQUE_FILE, sheet_name=0, engine="pyxlsb", header=None)
df.columns = ['word', 'gender']
lexique_genders = {row['word']: row['gender'].upper() for _, row in df.iterrows()}
print(f"✅ Loaded genders for {len(lexique_genders)} words from Lexique xlsb.")

# === Parse eng-fra.dict ===
entries = []
i = 0
with open(DICT_FILE, encoding="utf-8") as f:
    lines = f.readlines()

while i < len(lines):
    line = lines[i].strip()
    if not line:
        i += 1
        continue

    # Detect English word: has IPA part like " /....../"
    if re.search(r'/[^/]+/', line):
        en_word = re.sub(r'\s*/[^/]+/', '', line).strip()
        i += 1

        fr_words = []
        while i < len(lines):
            next_line = lines[i].strip()
            if not next_line:
                i += 1
                continue
            # next English word starts (has IPA)
            if re.search(r'/[^/]+/', next_line):
                break
            # remove numbering like "1. " or "2. "
            next_line = re.sub(r'^\d+\.\s*', '', next_line)
            fr_words.append(next_line)
            i += 1

        # add entries
        for fr_word in fr_words:
            entries.append({
                "Noun": fr_word,
                "translation": en_word
            })
    else:
        # skip lines which do not match English entry
        i += 1

print(f"✅ Parsed {len(entries)} entries from eng-fra.dict.")

# === Process entries ===
sections = {
    "Has level, translation and gender": [],
    "Has level and translation": [],
    "Has translation and gender": [],
    "Has level and gender": [],
    "Has only level": [],
    "Has only translation": [],
    "Has only gender": []
}

for entry in entries:
    noun = entry['Noun'].split(',')[0].strip()  # keep first if comma-separated
    translation = entry['translation']

    level = level_dict.get(noun, "")
    gender = lexique_genders.get(noun, "")

    final_entry = {"Noun": noun, "translation": translation}
    final_entry["level"] = level
    if gender: final_entry["gender"] = gender

    has_level = bool(level)
    has_translation = bool(translation)
    has_gender = bool(gender)

    # Categorize
    if has_level and has_translation and has_gender:
        sections["Has level, translation and gender"].append(final_entry)
    elif has_level and has_translation:
        sections["Has level and translation"].append(final_entry)
    elif has_translation and has_gender:
        sections["Has translation and gender"].append(final_entry)
    elif has_level and has_gender:
        sections["Has level and gender"].append(final_entry)
    elif has_level:
        sections["Has only level"].append(final_entry)
    elif has_translation:
        sections["Has only translation"].append(final_entry)
    elif has_gender:
        sections["Has only gender"].append(final_entry)

# === Print counts ===
for key in sections:
    print(f"{key}: {len(sections[key])}")

total_entries = sum(len(v) for v in sections.values())
print(f"✅ Done! Total entries written: {total_entries}")

# === Write final JSON ===
with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
    for key, items in sections.items():
        f.write(f'// {"="*20} {key} {"="*20}\n')
        json.dump(items, f, ensure_ascii=False, indent=2)
        f.write("\n\n")

print(f"✅ JSON saved to: {OUTPUT_JSON}")