import xml.etree.ElementTree as ET
import json
import re

TEI_FILE = "rus-eng.xml"   # Your input XML filename
OUTPUT_JSON = "freedict.json"

NS = {
    'tei': 'http://www.tei-c.org/ns/1.0',
    'xml': 'http://www.w3.org/XML/1998/namespace'
}

def remove_tags(text):
    return re.sub(r'<[^>]+>', '', text)

def main():
    tree = ET.parse(TEI_FILE)
    root = tree.getroot()

    entries = []

    for entry in root.findall(".//tei:entry", NS):
        pos = entry.findtext("./tei:gramGrp/tei:pos", namespaces=NS)
        if pos != "n":
            continue  # Skip non-nouns

        orth_el = entry.find("./tei:form/tei:orth", NS)
        if orth_el is None or not orth_el.text:
            continue

        noun = remove_tags(orth_el.text.strip())

        # Skip proper nouns (starting uppercase)
        if noun and noun[0].isupper():
            continue

        cit = entry.find(".//tei:cit[@type='trans'][@xml:lang='en']", NS)
        if cit is None:
            continue

        quote_el = cit.find("./tei:quote", NS)
        if quote_el is None or not quote_el.text:
            continue

        translation = remove_tags(quote_el.text.strip())

        entries.append({
            "Noun": noun,
            "translation": translation
        })

    print(f"✅ Parsed {len(entries)} noun entries.")

    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)

    print(f"✅ JSON saved to: {OUTPUT_JSON}")

if __name__ == "__main__":
    main()