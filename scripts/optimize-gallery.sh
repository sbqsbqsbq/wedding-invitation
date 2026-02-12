#!/usr/bin/env bash
set -euo pipefail

GALLERY_DIR="public/images/gallery"
BACKUP_DIR="${GALLERY_DIR}/originals"
MAX_WIDTH=1600
QUALITY=78

if ! command -v cwebp >/dev/null 2>&1; then
  echo "cwebp not found. Install with: apt install -y webp" >&2
  exit 1
fi

mkdir -p "${BACKUP_DIR}"

find "${GALLERY_DIR}" -maxdepth 1 -type f \\( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \\) -print0 | \
while IFS= read -r -d '' file; do
  base="$(basename "${file}")"
  name="${base%.*}"
  out="${GALLERY_DIR}/${name}.webp"

  echo "Converting ${base} -> ${name}.webp"
  cwebp -q "${QUALITY}" -resize "${MAX_WIDTH}" 0 "${file}" -o "${out}"

  mv "${file}" "${BACKUP_DIR}/"
done

echo "Done. Originals moved to ${BACKUP_DIR}"
