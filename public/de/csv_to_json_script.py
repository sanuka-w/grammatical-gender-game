import csv
import json

def to_camel_case(s):
    parts = s.split('_')
    return parts[0] + ''.join(word.capitalize() for word in parts[1:])

input_file = 'vocabeo.csv'
output_file = 'words.json'

with open(input_file, encoding='latin-1') as csvfile:
    reader = csv.DictReader(csvfile)
    data = []
    for row in reader:
        # rename keys to camelCase
        new_row = {to_camel_case(k): v for k, v in row.items()}
        data.append(new_row)

with open(output_file, 'w', encoding='utf-8') as jsonfile:
    json.dump(data, jsonfile, ensure_ascii=False, indent=2)

print(f"Done! Saved to {output_file}")
