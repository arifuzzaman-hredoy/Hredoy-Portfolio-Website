from __future__ import annotations

import csv
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
HTML_PATH = ROOT / "template-source" / "index-7-dark.html"
OUTPUT_PATH = ROOT / "docs" / "phase-01-homepage-reference-inventory.tsv"


class ReferenceParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.references: list[tuple[str, str, str]] = []

    def handle_starttag(self, tag: str, attributes: list[tuple[str, str | None]]) -> None:
        attrs = {key.lower(): value or "" for key, value in attributes}
        tag = tag.lower()

        if tag == "link" and any(
            rel in {"stylesheet", "icon", "apple-touch-icon"}
            for rel in attrs.get("rel", "").lower().split()
        ):
            self.references.append(("html-link", attrs.get("href", ""), "index-7-dark.html"))
        elif tag == "script":
            self.references.append(("html-script", attrs.get("src", ""), "index-7-dark.html"))
        elif tag in {"img", "source"}:
            for attribute in ("src", "poster"):
                if attrs.get(attribute):
                    self.references.append((f"html-{attribute}", attrs[attribute], "index-7-dark.html"))
            for item in attrs.get("srcset", "").split(","):
                reference = item.strip().split()
                if reference:
                    self.references.append(("html-srcset", reference[0], "index-7-dark.html"))

        if attrs.get("style"):
            self.references.extend(
                ("inline-style-url", value, "index-7-dark.html")
                for value in re.findall(
                    r"url\(\s*['\"]?([^'\"\)]+)", attrs["style"], re.IGNORECASE
                )
            )

    def handle_startendtag(self, tag: str, attributes: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attributes)


def classify(reference: str, source: str) -> tuple[str, str]:
    reference = reference.strip()
    parts = urlsplit(reference)
    if reference.lower().startswith("data:"):
        return "inline", ""
    if not reference or unquote(parts.path).startswith("#"):
        return "inline", ""
    if reference.startswith("#") or parts.scheme or parts.netloc:
        return "external", ""

    source_path = ROOT / "template-source" / source
    base = source_path.parent if source_path.suffix.lower() == ".css" else ROOT / "template-source"
    target = (base / unquote(parts.path)).resolve()
    source_root = (ROOT / "template-source").resolve()
    if not target.is_relative_to(source_root):
        return "outside-package", ""
    relative = target.relative_to(source_root).as_posix()
    return ("present" if target.is_file() else "missing", relative)


parser = ReferenceParser()
parser.feed(HTML_PATH.read_text(encoding="utf-8", errors="replace"))
references = list(parser.references)

css_paths = {
    resolved
    for kind, reference, source in references
    if kind == "html-link"
    for status, resolved in [classify(reference, source)]
    if status == "present" and resolved.lower().endswith(".css")
}
for css_path in sorted(css_paths):
    contents = (ROOT / "template-source" / Path(css_path)).read_text(
        encoding="utf-8", errors="replace"
    )
    references.extend(
        ("css-url", value.strip(), css_path)
        for value in re.findall(
            r"url\(\s*['\"]?([^'\"\)]+)", contents, re.IGNORECASE
        )
    )

rows = []
seen = set()
for kind, reference, source in references:
    if not reference.strip():
        continue
    status, resolved = classify(reference, source)
    row = (kind, reference, source, status, resolved)
    if row not in seen:
        seen.add(row)
        rows.append(row)

rows.sort(key=lambda row: (row[0], row[2], row[1]))
with OUTPUT_PATH.open("w", encoding="utf-8", newline="") as output:
    writer = csv.writer(output, delimiter="\t", lineterminator="\n")
    writer.writerow(("kind", "reference", "source", "status", "resolved_path"))
    writer.writerows(rows)

missing = sum(status == "missing" for _, _, _, status, _ in rows)
print(f"Wrote {len(rows)} unique references; {missing} local references are missing.")
