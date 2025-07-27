import json

# === Filenames ===
FREEDICT_FILE = "freedict_with_levels.json"
M_FILE = "m.txt"
F_FILE = "f.txt"
N_FILE = "n.txt"
OUTPUT_JSON = "freedict_with_gender.json"

# === Load freedict entries ===
with open(FREEDICT_FILE, encoding="utf-8") as f:
    entries = json.load(f)

print(f"✅ Loaded {len(entries)} entries from {FREEDICT_FILE}")

# === Load gender lists ===
def load_words(filename):
    with open(filename, encoding="utf-8") as f:
        return set(line.strip() for line in f if line.strip())

m_words = load_words(M_FILE)
f_words = load_words(F_FILE)
n_words = load_words(N_FILE)

print(f"✅ Loaded: {len(m_words)} masculine, {len(f_words)} feminine, {len(n_words)} neuter words")

# === Add gender ===
with_gender = {"M": [], "F": [], "N": []}
without_gender = []

for entry in entries:
    noun = entry['Noun'].strip()
    gender = None
    if noun in m_words:
        gender = "M"
    elif noun in f_words:
        gender = "F"
    elif noun in n_words:
        gender = "N"
    
    if gender:
        entry['gender'] = gender
        with_gender[gender].append(entry)
    else:
        entry['gender'] = ""  # optional: leave empty
        without_gender.append(entry)

# === Print stats ===
total_with_gender = sum(len(lst) for lst in with_gender.values())
print(f"✅ Added gender to: {total_with_gender} entries")
print(f"  Masculine: {len(with_gender['M'])}")
print(f"  Feminine:  {len(with_gender['F'])}")
print(f"  Neuter:    {len(with_gender['N'])}")
print(f"❗ Without gender: {len(without_gender)}")

# === Write to output JSON ===
with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
    # Write each section separately, with comments
    for g, lst in with_gender.items():
        f.write(f'// {"="*10} Entries with gender={g} ({len(lst)}) {"="*10}\n')
        json.dump(lst, f, ensure_ascii=False, indent=2)
        f.write("\n\n")
    f.write(f'// {"="*10} Entries without gender ({len(without_gender)}) {"="*10}\n')
    json.dump(without_gender, f, ensure_ascii=False, indent=2)
    f.write("\n")

print(f"✅ Done! Total entries written: {total_with_gender + len(without_gender)}")
print(f"✅ JSON saved to: {OUTPUT_JSON}")