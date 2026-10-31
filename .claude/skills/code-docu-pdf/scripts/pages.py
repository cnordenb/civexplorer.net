import json
import sys

from pypdf import PdfReader

if len(sys.argv) != 3:
    sys.exit("usage: python pages.py <printed.pdf> <pages.json>")
reader = PdfReader(sys.argv[1])
out = {}
for name, dest in reader.named_destinations.items():
    out[name.lstrip("/")] = reader.get_destination_page_number(dest) + 1
with open(sys.argv[2], "w", encoding="utf8") as f:
    json.dump(out, f, indent=0, sort_keys=True)
print(len(reader.pages), "pages,", len(out), "destinations")
