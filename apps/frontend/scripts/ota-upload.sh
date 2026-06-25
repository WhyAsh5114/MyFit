#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# OTA Bundle Upload Script
#
# Zips the production build, computes a SHA-256 checksum, and uploads it
# to the MyFit API's OTA endpoint.
#
# Prerequisites:
#   1. Run `pnpm build` first to produce the `build/` directory
#   2. Set OTA_API_URL and OTA_UPLOAD_KEY environment variables
#
# Usage:
#   OTA_API_URL=https://api.myfit.fit OTA_UPLOAD_KEY=secret pnpm ota:upload
#   OTA_API_URL=http://localhost:3000 OTA_UPLOAD_KEY=dev-key pnpm ota:upload
# ---------------------------------------------------------------------------
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="$PROJECT_DIR/build"
ZIP_FILE="$PROJECT_DIR/ota-bundle.zip"

# --- Validate ---------------------------------------------------------------
: "${OTA_API_URL:?OTA_API_URL must be set (e.g. https://api.myfit.fit)}"
: "${OTA_UPLOAD_KEY:?OTA_UPLOAD_KEY must be set}"

if [ ! -d "$BUILD_DIR" ]; then
  echo "ERROR: Build directory not found at $BUILD_DIR"
  echo "Run 'pnpm build' first."
  exit 1
fi

# --- Create zip -------------------------------------------------------------
echo "→ Zipping build directory..."
rm -f "$ZIP_FILE"
cd "$BUILD_DIR"
zip -r "$ZIP_FILE" . -x '.DS_Store' > /dev/null
cd "$PROJECT_DIR"

ZIP_SIZE=$(du -h "$ZIP_FILE" | cut -f1)
CHECKSUM=$(shasum -a 256 "$ZIP_FILE" | awk '{print $1}')
echo "  Bundle: $ZIP_SIZE  SHA-256: $CHECKSUM"

# --- Upload -----------------------------------------------------------------
echo "→ Uploading to $OTA_API_URL/api/ota/upload ..."

HTTP_CODE=$(curl -s -o /dev/stderr -w "%{http_code}" \
  -X POST \
  -H "Authorization: Bearer ${OTA_UPLOAD_KEY}" \
  -F "file=@${ZIP_FILE}" \
  "${OTA_API_URL}/api/ota/upload")

# Clean up
rm -f "$ZIP_FILE"

if [ "$HTTP_CODE" -eq 201 ]; then
  echo ""
  echo "✅ OTA bundle uploaded successfully!"
else
  echo ""
  echo "❌ Upload failed with HTTP $HTTP_CODE"
  exit 1
fi
