# Test Fixtures

This directory contains test assets used by Playwright E2E tests.

## Required Files

### test-recipe-image.jpg

A small test image file (~30-50KB) is required for testing recipe image uploads.

**To create this file:**

1. Find any small JPEG image (or use an image generator)
2. Resize it to approximately 400x300 pixels
3. Optimize it to keep file size under 50KB
4. Save it as `test-recipe-image.jpg` in this directory

**Quick command to create a placeholder (requires ImageMagick):**
```bash
convert -size 400x300 xc:orange -pointsize 72 -fill white -gravity center \
  -annotate +0+0 "Test Recipe" test-recipe-image.jpg
```

**Alternative (without ImageMagick):**
- Download a free food image from Unsplash or Pexels
- Resize to 400x300
- Save as `test-recipe-image.jpg`

**Important:** Keep the file size small (<50KB) to avoid bloating the repository.

## Why a Real Image?

The E2E tests use a real image file (not mocked) to verify the entire file upload pipeline:
- Browser file input handling
- FormData multipart encoding
- Server-side file processing
- S3 upload flow (in staging/CI environments)

This catches real-world issues that mocking would miss.
