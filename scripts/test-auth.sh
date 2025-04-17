#!/bin/bash
COOKIE="eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..Lzx4Zeuu7eYzLWT7.FTq-zUNV9yL6PZr7RYUi82bx8aMO_wdwrvisvmPMRnFFiOnctUNbrbfYIDcG17gbQDclSAWMUFPZM6G50InSCQRVGbgcyDC9XypbsN_Mawjm6YF4mIjYAr0Oyuip9VOVHA6uqMruyPik8pEEMCYPf0obgfL77vLECByUDBGQZB3QbkJk2LDqxdNAqF21_zHAPcIphnuEUxCmUcmtVMr_8WTg5ivR-CVu09akjhKMaCyQC-Jyc9PpZZ-kI7GvwcrX27ulkp0jGmiI9fdz.Cqw6xxD4PU4XCtPQs7Q9CA"
BASE_URL="http://localhost:3333"

# --- URLs and Expected Data --- #
PROFILE_HANDLE="7cbe1e"
PROFILE_URL="${BASE_URL}/${PROFILE_HANDLE}"

POST_ID="85cb6156-cb8f-477d-906e-b580de35db16"
POST_URL="${BASE_URL}/post/${POST_ID}"
# Image URL expected on the POST_URL page
POST_EXPECTED_IMAGE_URL="https://hexjniblpmwvwsmocyfo.supabase.co/storage/v1/object/public/post_images/posts/post-0x9cf6c7eba6546998afa1c1d8a9b124193a7cbe1e-1744881374120.png"

# --- Test Execution --- #
OVERALL_PASS=true

# Add a small delay initially
echo "(Waiting 1s for potential db consistency...)"
sleep 1

# === Test 1: Profile Page ===
echo ""
echo "=== Testing Profile Page: ${PROFILE_URL} ==="

echo -n "1.1 Fetching content... "
PROFILE_CONTENT=$(curl -s -H "Cookie: next-auth.session-token=$COOKIE" "$PROFILE_URL")
if [ -z "$PROFILE_CONTENT" ]; then
  echo "❌ Failed (No content received)."
  OVERALL_PASS=false
else
  echo "✅ Done."

  echo -n "1.2 Checking for main content column... "
  # Profile page uses the max-w-[600px] structure
  PROFILE_MAIN_CONTENT_PATTERN='class="min-h-screen w-full max-w-\[600px\]'
  if echo "$PROFILE_CONTENT" | grep -q -E "$PROFILE_MAIN_CONTENT_PATTERN"; then
    echo "✅ Found."
  else
    echo "❌ Not found."
    OVERALL_PASS=false
  fi

  echo -n "1.3 Checking for desktop left sidebar... "
  PROFILE_LEFT_SIDEBAR_PATTERN='class="sticky top-0 h-screen w-\[275px\] shrink-0"'
  if echo "$PROFILE_CONTENT" | grep -q -E "$PROFILE_LEFT_SIDEBAR_PATTERN"; then
    echo "✅ Found."
  else
    echo "❌ Not found."
    OVERALL_PASS=false
  fi

  echo -n "1.4 Checking for desktop right sidebar... "
  PROFILE_RIGHT_SIDEBAR_PATTERN='class="sticky top-0 hidden h-screen w-\[350px\]'
  if echo "$PROFILE_CONTENT" | grep -q -E "$PROFILE_RIGHT_SIDEBAR_PATTERN"; then
    echo "✅ Found."
  else
    echo "❌ Not found."
    OVERALL_PASS=false
  fi
  
  # NOTE: Skipping image check for profile page due to SSR limitations
fi

# === Test 2: Post Detail Page ===
# Only proceed if previous checks passed
if $OVERALL_PASS; then
  echo ""
  echo "=== Testing Post Detail Page: ${POST_URL} ==="

  echo -n "2.1 Fetching content... "
  POST_CONTENT=$(curl -s -H "Cookie: next-auth.session-token=$COOKIE" "$POST_URL")
  if [ -z "$POST_CONTENT" ]; then
    echo "❌ Failed (No content received)."
    OVERALL_PASS=false
  else
    echo "✅ Done."

    echo -n "2.2 Checking for main post container structure... "
    # Post detail page uses PostComponent structure
    POST_MAIN_CONTENT_PATTERN='class="group cursor-pointer border-b' # Class from PostComponent
    if echo "$POST_CONTENT" | grep -q -E "$POST_MAIN_CONTENT_PATTERN"; then
      echo "✅ Found."
    else
      echo "❌ Not found."
      OVERALL_PASS=false
    fi

    echo -n "2.3 Checking for specific test image rendering (URL presence)... "
    if echo "$POST_CONTENT" | grep -Fq "$POST_EXPECTED_IMAGE_URL"; then
      echo "✅ Found."
    else
      echo "❌ Not found."
      OVERALL_PASS=false
      # echo "--- Post Page HTML Snippet --- "
      # echo "$POST_CONTENT" | head -n 60
      # echo "--- End Snippet --- "
    fi
  fi
fi

# === Final Result ===
echo ""
echo "====================================="
if $OVERALL_PASS; then
  echo "✅ Overall Test Result: PASSED"
  exit 0
else
  echo "❌ Overall Test Result: FAILED"
  exit 1
fi 