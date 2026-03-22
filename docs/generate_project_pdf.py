from pathlib import Path
import re
import textwrap


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "John-Belvedere-Project-Summary.md"
OUTPUT = ROOT / "John-Belvedere-Project-Summary.pdf"


def normalize_lines(text: str):
    raw_lines = text.splitlines()
    lines = []
    for raw in raw_lines:
      line = raw.rstrip()
      if line.startswith("### "):
          line = line[4:].upper()
      elif line.startswith("## "):
          line = line[3:].upper()
      elif line.startswith("# "):
          line = line[2:].upper()
      line = re.sub(r"^\-\s+", "• ", line)
      line = re.sub(r"^\d+\.\s+", lambda match: match.group(0), line)
      lines.append(line)
    return lines


def wrap_lines(lines, width=92):
    wrapped = []
    for line in lines:
        if not line.strip():
            wrapped.append("")
            continue
        if line.startswith("• ") or re.match(r"^\d+\.\s+", line):
            indent = "   "
            initial = line
            wrapped.extend(textwrap.wrap(initial, width=width, subsequent_indent=indent))
        else:
            wrapped.extend(textwrap.wrap(line, width=width))
    return wrapped


def pdf_escape(value: str) -> str:
    return (
        value.replace("\\", "\\\\")
        .replace("(", "\\(")
        .replace(")", "\\)")
    )


def build_pages(lines, lines_per_page=44):
    pages = []
    for index in range(0, len(lines), lines_per_page):
        pages.append(lines[index:index + lines_per_page])
    return pages


def build_content_stream(page_lines):
    content = ["BT", "/F1 10 Tf", "50 790 Td", "12 TL"]
    first = True
    for line in page_lines:
        text = pdf_escape(line)
        if first:
            content.append(f"({text}) Tj")
            first = False
        else:
            content.append("T*")
            content.append(f"({text}) Tj")
    content.append("ET")
    stream = "\n".join(content).encode("latin-1", errors="replace")
    return stream


def generate_pdf():
    text = SOURCE.read_text(encoding="utf-8")
    lines = wrap_lines(normalize_lines(text))
    pages = build_pages(lines)

    objects = []
    objects.append(b"<< /Type /Catalog /Pages 2 0 R >>")

    kids = []
    next_obj_num = 3
    page_object_numbers = []
    content_object_numbers = []

    for _ in pages:
        page_object_numbers.append(next_obj_num)
        kids.append(f"{next_obj_num} 0 R")
        next_obj_num += 1
        content_object_numbers.append(next_obj_num)
        next_obj_num += 1

    pages_object = f"<< /Type /Pages /Kids [{' '.join(kids)}] /Count {len(pages)} >>".encode("latin-1")
    objects.append(pages_object)

    for page_obj_num, content_obj_num, page_lines in zip(page_object_numbers, content_object_numbers, pages):
        page_obj = (
            f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] "
            f"/Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> "
            f"/Contents {content_obj_num} 0 R >>"
        ).encode("latin-1")
        objects.append(page_obj)

        stream = build_content_stream(page_lines)
        content_obj = (
            f"<< /Length {len(stream)} >>\nstream\n".encode("latin-1") + stream + b"\nendstream"
        )
        objects.append(content_obj)

    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for i, obj in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf.extend(f"{i} 0 obj\n".encode("latin-1"))
        pdf.extend(obj)
        pdf.extend(b"\nendobj\n")

    xref_pos = len(pdf)
    pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode("latin-1"))
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode("latin-1"))
    pdf.extend(
        f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_pos}\n%%EOF".encode("latin-1")
    )

    OUTPUT.write_bytes(pdf)


if __name__ == "__main__":
    generate_pdf()
