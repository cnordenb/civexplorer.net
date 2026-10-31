import sys

import pypdfium2 as pdfium

if len(sys.argv) < 3:
    sys.exit("usage: python shot.py <file.pdf> <out-prefix> [pages, e.g. 1,3,5] [scale]")
pdf = pdfium.PdfDocument(sys.argv[1])
prefix = sys.argv[2]
numbers = [int(p) for p in sys.argv[3].split(",")] if len(sys.argv) > 3 else range(1, len(pdf) + 1)
scale = float(sys.argv[4]) if len(sys.argv) > 4 else 1.4
for n in numbers:
    pdf[n - 1].render(scale=scale).to_pil().save(f"{prefix}-{n}.png")
    print(f"{prefix}-{n}.png")
