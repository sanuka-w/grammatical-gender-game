import json

def merge_nouns(genders_file, translations_file, output_file):
    with open(genders_file, encoding="utf-8") as f:
        genders = json.load(f)

    with open(translations_file, encoding="utf-8") as f:
        translations = json.load(f)

    # Create a quick lookup dictionary for translations
    translations_map = {}
    for entry in translations:
        noun = entry.get("Noun", "").strip().lower()
        if noun:
            translations_map[noun] = entry

    merged = []
    stats = {
        "total_checked": 0,
        "added": 0,
        "with_translation": 0,
        "with_level": 0,
        "with_both": 0
    }

    for item in genders:
        stats["total_checked"] += 1
        noun = item.get("noun", "").strip().lower()
        gender = item.get("gender", "").strip()

        # Skip if missing noun or gender
        if not noun or not gender:
            continue

        new_entry = {"noun": noun, "gender": gender}
        extra = translations_map.get(noun)
        has_translation = False
        has_level = False

        if extra:
            translation = extra.get("translation")
            level = extra.get("level")

            if translation:
                new_entry["translation"] = translation
                has_translation = True
            if level:
                new_entry["level"] = level
                has_level = True

        merged.append(new_entry)
        stats["added"] += 1

        if has_translation:
            stats["with_translation"] += 1
        if has_level:
            stats["with_level"] += 1
        if has_translation and has_level:
            stats["with_both"] += 1

    # Save merged result
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)

    # Print stats
    print(f"Total entries checked: {stats['total_checked']}")
    print(f"Entries kept (with noun & gender): {stats['added']}")
    print(f"Entries with translation: {stats['with_translation']}")
    print(f"Entries with level: {stats['with_level']}")
    print(f"Entries with both translation and level: {stats['with_both']}")

if __name__ == "__main__":
    merge_nouns(
        genders_file="genders.json",
        translations_file="freedict_updated.json",
        output_file="Ru_simplee.json"
    )
