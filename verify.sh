#!/bin/bash

# 🔍 סקריפט בדיקה מהירה - Premium Sales Coach v3.0
# בודק שכל הקבצים החשובים קיימים ותקינים

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 בודק Premium Sales Coach v3.0..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

errors=0

# Check 1: Verify critical files exist
echo "📁 בודק קבצים..."
files=(
  "extension/manifest.json"
  "extension/content/premium-sales-coach.js"
  "extension/components/floating-coach-assistant.js"
  "extension/services/web-speech-recognition.js"
  "extension/services/speaker-diarization.js"
  "extension/services/advanced-audio-capture.js"
  "extension/services/openai-streaming.js"
  "extension/background/service-worker.js"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo -e "  ${GREEN}✅${NC} $file"
  else
    echo -e "  ${RED}❌${NC} $file - חסר!"
    ((errors++))
  fi
done
echo ""

# Check 2: Verify manifest points to correct content script
echo "📋 בודק manifest.json..."
if grep -q '"content/premium-sales-coach.js"' extension/manifest.json; then
  echo -e "  ${GREEN}✅${NC} Content script: premium-sales-coach.js"
else
  echo -e "  ${RED}❌${NC} Content script לא נכון!"
  ((errors++))
fi

version=$(cat extension/manifest.json | grep '"version"' | head -1 | cut -d'"' -f4)
echo -e "  ${GREEN}ℹ️${NC}  Version: $version"
echo ""

# Check 3: Verify imports
echo "🔗 בודק imports..."
if grep -q 'FloatingCoachAssistant' extension/content/premium-sales-coach.js; then
  echo -e "  ${GREEN}✅${NC} FloatingCoachAssistant imported"
else
  echo -e "  ${RED}❌${NC} FloatingCoachAssistant לא מיובא!"
  ((errors++))
fi

if grep -q 'WebSpeechRecognitionService' extension/content/premium-sales-coach.js; then
  echo -e "  ${GREEN}✅${NC} WebSpeechRecognitionService imported"
else
  echo -e "  ${RED}❌${NC} WebSpeechRecognitionService לא מיובא!"
  ((errors++))
fi
echo ""

# Check 4: Verify service worker
echo "⚙️  בודק service-worker..."
if grep -q 'premium-sales-coach.js' extension/background/service-worker.js; then
  echo -e "  ${GREEN}✅${NC} Service worker מצביע לקובץ הנכון"
else
  echo -e "  ${YELLOW}⚠️${NC}  Service worker אולי לא מצביע לקובץ הנכון"
fi
echo ""

# Check 5: File sizes (sanity check)
echo "📊 בודק גדלי קבצים..."
floating_size=$(wc -c < extension/components/floating-coach-assistant.js)
if [ "$floating_size" -gt 20000 ]; then
  echo -e "  ${GREEN}✅${NC} floating-coach-assistant.js: $(($floating_size / 1024))KB"
else
  echo -e "  ${RED}❌${NC} floating-coach-assistant.js קטן מדי: $(($floating_size / 1024))KB"
  ((errors++))
fi

premium_size=$(wc -c < extension/content/premium-sales-coach.js)
if [ "$premium_size" -gt 15000 ]; then
  echo -e "  ${GREEN}✅${NC} premium-sales-coach.js: $(($premium_size / 1024))KB"
else
  echo -e "  ${RED}❌${NC} premium-sales-coach.js קטן מדי: $(($premium_size / 1024))KB"
  ((errors++))
fi
echo ""

# Check 6: Git status
echo "🔄 בודק Git..."
if git rev-parse --git-dir > /dev/null 2>&1; then
  current_branch=$(git branch --show-current)
  echo -e "  ${GREEN}ℹ️${NC}  Branch: $current_branch"

  if git diff-index --quiet HEAD --; then
    echo -e "  ${GREEN}✅${NC} אין שינויים לא-committed"
  else
    echo -e "  ${YELLOW}⚠️${NC}  יש שינויים לא-committed"
  fi

  latest_commit=$(git log -1 --oneline)
  echo -e "  ${GREEN}ℹ️${NC}  Latest commit: $latest_commit"
else
  echo -e "  ${RED}❌${NC} לא תיקיית Git!"
  ((errors++))
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $errors -eq 0 ]; then
  echo -e "${GREEN}✅ הכל תקין! המערכת מוכנה לשימוש${NC}"
  echo ""
  echo "📋 צעדים הבאים:"
  echo "  1. chrome://extensions/"
  echo "  2. Remove + Load unpacked"
  echo "  3. רענן דף פגישה"
  echo "  4. אמור לראות כפתור סגול 💜"
else
  echo -e "${RED}❌ נמצאו $errors שגיאות!${NC}"
  echo ""
  echo "💡 פתרון:"
  echo "  1. git pull origin main"
  echo "  2. הרץ את הסקריפט שוב"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
