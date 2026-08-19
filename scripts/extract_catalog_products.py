#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import re
import unicodedata
from pathlib import Path

import fitz

ITEM_PATTERN = re.compile(r"(?<!\S)(\d{1,2})\s*[\.)]\s*([^\n]+?)(?=(?<!\S)\d{1,2}\s*[\.)]|$)")
NON_WORD = re.compile(r"[^a-z0-9]+")
TRAILING_DIGITS = re.compile(r"(?:\s+\d+)+\s*$")


def slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    value = value.lower().strip()
    value = NON_WORD.sub("-", value).strip("-")
    return value or "item"


def clean_item_name(name: str) -> str:
    cleaned = " ".join(name.split())
    cleaned = TRAILING_DIGITS.sub("", cleaned)
    cleaned = re.sub(r"\s+([,.;:])", r"\1", cleaned)
    cleaned = cleaned.strip(" -")

    # Drop repeated trailing catalogue headings that leak into OCR text.
    heading_markers = [
        " product range",
        " products",
        " for men",
        " hair care",
        " oil range",
        " lotion",
        " cream",
    ]
    lowered = cleaned.lower()
    for marker in heading_markers:
        idx = lowered.find(marker)
        if idx > 0 and ")" in cleaned[:idx]:
            cleaned = cleaned[:idx].strip(" -")
            lowered = cleaned.lower()

    return cleaned


def looks_like_valid_product_name(name: str) -> bool:
    # Reject artefacts made of numbering tokens from catalogue overlays.
    letters = sum(ch.isalpha() for ch in name)
    if letters < 3:
        return False
    if re.fullmatch(r"[\d\s().,+\-/]+", name):
        return False
    return True


def extract_page_images(doc: fitz.Document, page: fitz.Page, page_no: int, out_dir: Path) -> list[str]:
    out_dir.mkdir(parents=True, exist_ok=True)

    infos = page.get_image_info(xrefs=True)
    seen_xrefs: set[int] = set()
    saved: list[tuple[float, float, str]] = []

    for info in infos:
        xref = int(info.get("xref") or 0)
        if xref <= 0 or xref in seen_xrefs:
            continue

        width = int(info.get("width") or 0)
        height = int(info.get("height") or 0)
        if min(width, height) < 90 or (width * height) < 12000:
            continue

        seen_xrefs.add(xref)
        extracted = doc.extract_image(xref)
        image_bytes = extracted.get("image")
        if not image_bytes:
            continue

        ext = extracted.get("ext", "png")
        digest = hashlib.sha1(image_bytes).hexdigest()[:12]
        file_name = f"page-{page_no:02d}-{digest}.{ext}"
        file_path = out_dir / file_name
        if not file_path.exists():
            file_path.write_bytes(image_bytes)

        # Use bbox to keep visual order (top-to-bottom, then left-to-right).
        bbox = info.get("bbox") or (0, 0, 0, 0)
        x0 = float(bbox[0]) if len(bbox) > 0 else 0.0
        y0 = float(bbox[1]) if len(bbox) > 1 else 0.0
        saved.append((y0, x0, file_name))

    saved.sort(key=lambda row: (row[0], row[1]))
    return [name for _, _, name in saved]


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract products from a catalogue PDF")
    parser.add_argument("--pdf", required=True, help="Absolute path to the PDF file")
    parser.add_argument(
        "--output",
        default="data/imports/beauty-catalog-2026-products.json",
        help="Output JSON path relative to project root",
    )
    parser.add_argument(
        "--images-dir",
        default="public/catalog-imports/beauty-2026",
        help="Directory to store extracted images",
    )
    args = parser.parse_args()

    project_root = Path(__file__).resolve().parents[1]
    output_path = (project_root / args.output).resolve()
    images_dir = (project_root / args.images_dir).resolve()

    doc = fitz.open(args.pdf)
    products: list[dict] = []
    seen_names: set[str] = set()
    used_slugs: set[str] = set()

    # Skip title/footer pages (first and last).
    for page_idx in range(1, max(1, doc.page_count - 1)):
        page = doc.load_page(page_idx)
        page_no = page_idx + 1
        text = " ".join(page.get_text("text").split())
        if not text:
            continue

        matches = list(ITEM_PATTERN.finditer(text))
        if not matches:
            continue

        page_images = extract_page_images(doc, page, page_no, images_dir)

        for idx, match in enumerate(matches):
            raw_name = match.group(2)
            name = clean_item_name(raw_name)
            if len(name) < 3:
                continue
            if not looks_like_valid_product_name(name):
                continue

            lowered = name.lower()
            if lowered in seen_names:
                continue
            seen_names.add(lowered)

            base_slug = slugify(name)
            slug = base_slug
            suffix = 2
            while slug in used_slugs:
                slug = f"{base_slug}-{suffix}"
                suffix += 1
            used_slugs.add(slug)

            image_url = None
            all_image_urls: list[str] = []
            if page_images:
                image_name = page_images[min(idx, len(page_images) - 1)]
                image_url = f"/catalog-imports/beauty-2026/{image_name}"
                all_image_urls = [f"/catalog-imports/beauty-2026/{n}" for n in page_images]

            keywords = sorted({token for token in slug.split("-") if len(token) > 2})

            products.append(
                {
                    "id": slug,
                    "name": name,
                    "slug": slug,
                    "status": "active",
                    "tags": ["catalog-2026", "beauty-cosmetics"],
                    "searchKeywords": keywords,
                    "isFeatured": False,
                    "isNewArrival": False,
                    "isBestSeller": False,
                    "customerRequestEnabled": True,
                    "beautyConcerns": [],
                    "pricingMethod": "supplier_confirmation_required",
                    "currency": "GHS",
                    "isCrueltyFree": False,
                    "isVegan": False,
                    "isOrganic": False,
                    "isDermatologicallyTested": False,
                    "isSuitableForSensitiveSkin": False,
                    "primaryImageURL": image_url,
                    "stats": {
                        "assignedSupplierCount": 0,
                        "requestCount": 0,
                        "completedOrderCount": 0,
                    },
                    "isDeleted": False,
                    "createdBy": "catalog-import-2026",
                    "imageCandidates": all_image_urls,
                    "source": {
                        "pdf": os.path.basename(args.pdf),
                        "page": page_no,
                    },
                }
            )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(products, indent=2), encoding="utf-8")

    print(f"Extracted {len(products)} products")
    print(f"JSON: {output_path}")
    print(f"Images: {images_dir}")


if __name__ == "__main__":
    main()
