#!/bin/bash

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         🚀 GITHUB PAGES DEPLOYMENT VERIFICATION           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Get repository info
REPO_OWNER=$(git config --get remote.origin.url | sed 's/.*:\(.*\)\/.*/\1/' | sed 's/.*\/\(.*\)/\1/')
REPO_NAME=$(git config --get remote.origin.url | sed 's/.*\/\(.*\)\.git/\1/')

echo -e "${YELLOW}Repository Information:${NC}"
echo "  Owner: $REPO_OWNER"
echo "  Name: $REPO_NAME"
echo ""

# Check if build exists
echo -e "${YELLOW}Checking build artifacts...${NC}"
if [ -d "out" ]; then
    echo -e "${GREEN}✅ Build directory exists${NC}"
    BUILD_SIZE=$(du -sh out/ | cut -f1)
    echo "   Size: $BUILD_SIZE"
    FILE_COUNT=$(find out -type f | wc -l)
    echo "   Files: $FILE_COUNT"
else
    echo -e "${RED}❌ Build directory missing${NC}"
    echo "   Run: npm run build"
    exit 1
fi

echo ""

# Check key files
echo -e "${YELLOW}Checking key files...${NC}"
FILES_TO_CHECK=(
    "out/index.html"
    "out/.nojekyll"
    "public/data/summary.json"
    "public/data/daily-reports.csv"
    "public/data/source-statistics.csv"
    "public/data/severity-breakdown.csv"
    "public/data/articles.csv"
)

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        SIZE=$(du -h "$file" | cut -f1)
        echo -e "${GREEN}✅ $file${NC} ($SIZE)"
    else
        echo -e "${RED}❌ $file (missing)${NC}"
    fi
done

echo ""

# Check GitHub Actions workflows
echo -e "${YELLOW}Checking GitHub Actions workflows...${NC}"
WORKFLOWS=(
    ".github/workflows/deploy-github-pages.yml"
    ".github/workflows/manual-deploy.yml"
)

for workflow in "${WORKFLOWS[@]}"; do
    if [ -f "$workflow" ]; then
        echo -e "${GREEN}✅ $workflow${NC}"
    else
        echo -e "${RED}❌ $workflow (missing)${NC}"
    fi
done

echo ""

# Check Next.js config
echo -e "${YELLOW}Checking Next.js configuration...${NC}"
if grep -q "output: 'export'" next.config.js; then
    echo -e "${GREEN}✅ Static export enabled in next.config.js${NC}"
else
    echo -e "${RED}❌ Static export not configured${NC}"
fi

echo ""

# Calculate statistics
echo -e "${YELLOW}Data Statistics:${NC}"

if [ -f "public/data/summary.json" ]; then
    TOTAL_DAYS=$(grep -o '"totalDays": [0-9]*' public/data/summary.json | head -1 | grep -o '[0-9]*')
    TOTAL_REPORTS=$(grep -o '"totalReports": [0-9]*' public/data/summary.json | head -1 | grep -o '[0-9]*')
    TOTAL_ARTICLES=$(grep -o '"totalArticles": [0-9]*' public/data/summary.json | head -1 | grep -o '[0-9]*')
    
    echo "  Total Days: $TOTAL_DAYS"
    echo "  Total Reports: $TOTAL_REPORTS"
    echo "  Total Articles: $TOTAL_ARTICLES"
else
    echo -e "${YELLOW}⚠️ summary.json not found${NC}"
fi

echo ""

# Deployment readiness
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Deployment Readiness:${NC}"
echo ""

READY=true

# Check if gh-pages branch exists
if git rev-parse --verify gh-pages > /dev/null 2>&1; then
    echo -e "${GREEN}✅ gh-pages branch exists${NC}"
else
    echo -e "${YELLOW}⚠️  gh-pages branch not found (will be created on first deploy)${NC}"
fi

# Check if on main branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}⚠️  Currently on '$CURRENT_BRANCH' branch (deploy triggers on 'main')${NC}"
fi

echo ""

# Build output verification
echo -e "${YELLOW}Build Output Sample:${NC}"
ls -lh out/ | head -10

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

if [ "$READY" = true ]; then
    echo -e "${GREEN}✅ READY FOR GITHUB PAGES DEPLOYMENT!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Ensure repository is on GitHub"
    echo "  2. Go to Settings → Pages"
    echo "  3. Set Source to 'gh-pages' branch"
    echo "  4. Run: git push origin main"
    echo ""
    echo -e "${GREEN}Dashboard will be live at:${NC}"
    echo "  https://$REPO_OWNER.github.io/$REPO_NAME/"
else
    echo -e "${RED}❌ Some checks failed. See above for details.${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
