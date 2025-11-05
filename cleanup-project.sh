#!/bin/bash

# ==========================================
# PCN System v2.0 - Project Cleanup Script
# ==========================================
# This script organizes documentation and removes temporary files

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          PCN System v2.0 - Project Cleanup                        ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 This script will:${NC}"
echo "   1. Create organized documentation structure"
echo "   2. Archive redundant documentation files"
echo "   3. Move one-time migration scripts to archive"
echo "   4. Remove temporary files and build artifacts"
echo "   5. Clean up .DS_Store files"
echo ""
echo -e "${YELLOW}⚠️  Warning: Files will be moved, not deleted${NC}"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cleanup cancelled."
    exit 0
fi

echo ""
echo -e "${GREEN}🚀 Starting cleanup...${NC}"
echo ""

# Step 1: Create documentation structure
echo -e "${BLUE}📁 Step 1: Creating documentation structure...${NC}"
mkdir -p docs/archive/implementations
mkdir -p docs/archive/fixes
mkdir -p docs/archive/git-commits
mkdir -p docs/archive/migrations
mkdir -p docs/guides
mkdir -p docs/deployment
mkdir -p docs/features
echo -e "${GREEN}   ✓ Created docs/ directory structure${NC}"

# Step 2: Move implementation docs to archive
echo ""
echo -e "${BLUE}📦 Step 2: Archiving completed implementation docs...${NC}"

# Implementation documents (completed features)
IMPLEMENTATION_DOCS=(
    "360_VIEW_IMPLEMENTATION.md"
    "AGENT_FIELDS_COMPLETE_SOLUTION.md"
    "AGENT_TYPE_IMPLEMENTATION_SUMMARY.md"
    "PCN_ADVANCE_AMOUNT_IMPLEMENTATION.md"
    "PRINT_DOCUMENT_IMPLEMENTATION.md"
    "SEARCH_IMPLEMENTATION.md"
    "AGENT_TYPE_UPDATE_COMPLETE.md"
    "DEPLOYMENT_COMPLETE.md"
    "FILTERS_ACTIVATION_COMPLETE.md"
    "NOTIFICATION_SYSTEM_COMPLETE.md"
    "PCN_ADVANCE_AMOUNT_COMPLETE.md"
    "PRINT_DOCUMENT_COMPLETE.md"
    "SALES_TRANSACTION_VIEW_DETAIL_COMPLETE.md"
    "SELL_VEHICLE_BUG_FIX_COMPLETE.md"
    "NOTIFICATION_FIX_COMPLETE.md"
)

for doc in "${IMPLEMENTATION_DOCS[@]}"; do
    if [ -f "$doc" ]; then
        mv "$doc" "docs/archive/implementations/"
        echo -e "${GREEN}   ✓ Moved $doc${NC}"
    fi
done

# Step 3: Move fix/bug documents to archive
echo ""
echo -e "${BLUE}🔧 Step 3: Archiving bug fix documentation...${NC}"

FIX_DOCS=(
    "AGENT_FIELDS_FIX_SUMMARY.md"
    "CAROUSEL_FIX_SUMMARY.md"
    "FINANCE_SELLER_LEASING_COMPANY_FIX.md"
    "FIX_COMPLETE_SUMMARY.md"
    "PRICE_CATEGORY_FIX.md"
    "S3_DELETE_BUG_FIX.md"
    "SEARCH_BUG_FIX_REPORT.md"
    "SELLER_BUG_FIX_SUMMARY.md"
    "VEHICLE_CARD_CAROUSEL_FIX.md"
    "VEHICLE_SHOWROOM_AGENT_FIX.md"
)

for doc in "${FIX_DOCS[@]}"; do
    if [ -f "$doc" ]; then
        mv "$doc" "docs/archive/fixes/"
        echo -e "${GREEN}   ✓ Moved $doc${NC}"
    fi
done

# Step 4: Move git commit templates to archive
echo ""
echo -e "${BLUE}📝 Step 4: Archiving git commit documentation...${NC}"

GIT_DOCS=(
    "AGENT_FIELDS_GIT_COMMIT.md"
    "AGENT_TYPE_GIT_COMMIT_TEMPLATE.md"
    "GIT_COMMIT_LOG_NOV_2025.md"
    "GIT_COMMIT_SUMMARY.md"
)

for doc in "${GIT_DOCS[@]}"; do
    if [ -f "$doc" ]; then
        mv "$doc" "docs/archive/git-commits/"
        echo -e "${GREEN}   ✓ Moved $doc${NC}"
    fi
done

# Step 5: Move summary and update docs to archive
echo ""
echo -e "${BLUE}📋 Step 5: Archiving summary documents...${NC}"

SUMMARY_DOCS=(
    "CLEANUP_SUMMARY.md"
    "FILTERS_COMPLETE_SUMMARY.md"
    "SALES_TRANSACTION_TABLE_UPDATE.md"
    "SALES_TRANSACTION_VIEW_DETAIL_UPDATE.md"
    "SELLER_TITLE_UPDATE.md"
    "SELL_VEHICLE_STEP2_UPDATES.md"
    "STEP7_UPDATES_SUMMARY.md"
    "TRANSMISSION_UPDATE_SUMMARY.md"
    "WEB_FOOTER_UPDATE.md"
    "WEB_SEPARATOR_INSTALLATION.md"
)

for doc in "${SUMMARY_DOCS[@]}"; do
    if [ -f "$doc" ]; then
        mv "$doc" "docs/archive/implementations/"
        echo -e "${GREEN}   ✓ Moved $doc${NC}"
    fi
done

# Step 6: Move visual guides to guides directory
echo ""
echo -e "${BLUE}🎨 Step 6: Organizing visual guides...${NC}"

VISUAL_GUIDES=(
    "AGENT_FIELDS_VERIFICATION_GUIDE.md"
    "AGENT_TYPE_VISUAL_GUIDE.md"
    "FILTERS_VISUAL_GUIDE.md"
    "NOTIFICATION_FLOW_VISUAL.md"
    "NOTIFICATION_VISUAL_GUIDE.md"
    "PRINT_DOCUMENT_VISUAL_GUIDE.md"
    "SALES_TRANSACTION_VIEW_DETAIL_VISUAL.md"
    "SEARCH_VISUAL_SUMMARY.md"
    "SELLER_TITLE_VISUAL_GUIDE.md"
    "SELL_VEHICLE_STEP2_VISUAL_GUIDE.md"
    "STEP7_VISUAL_GUIDE.md"
    "VEHICLE_CARD_SLIDER_GUIDE.md"
    "VEHICLE_SHOWROOM_AGENT_VISUAL_GUIDE.md"
)

for doc in "${VISUAL_GUIDES[@]}"; do
    if [ -f "$doc" ]; then
        mv "$doc" "docs/guides/"
        echo -e "${GREEN}   ✓ Moved $doc${NC}"
    fi
done

# Step 7: Move quick guides and references to guides
echo ""
echo -e "${BLUE}📖 Step 7: Organizing quick guides...${NC}"

QUICK_GUIDES=(
    "360_VIEW_QUICK_GUIDE.md"
    "AGENT_FIELDS_QUICK_REFERENCE.md"
    "AGENT_TYPE_QUICK_GUIDE.md"
    "PCN_ADVANCE_AMOUNT_QUICK_GUIDE.md"
    "PRINT_DOCUMENT_QUICK_REFERENCE.md"
    "NOTIFICATION_QUICK_REFERENCE.md"
    "SEARCH_QUICK_GUIDE.md"
    "QUICK_FIX_GUIDE.md"
)

for doc in "${QUICK_GUIDES[@]}"; do
    if [ -f "$doc" ]; then
        mv "$doc" "docs/guides/"
        echo -e "${GREEN}   ✓ Moved $doc${NC}"
    fi
done

# Step 8: Move deployment and testing docs
echo ""
echo -e "${BLUE}🚀 Step 8: Organizing deployment documentation...${NC}"

DEPLOYMENT_DOCS=(
    "DEPLOYMENT_CHECKLIST_AGENT_TYPE.md"
    "FILTERS_FINAL_CHECKLIST.md"
    "SEARCH_FINAL_CHECKLIST.md"
    "TESTING_GUIDE.md"
    "PRINT_DOCUMENT_TESTING_GUIDE.md"
    "SEARCH_TESTING_GUIDE.md"
    "TESTING_S3_DELETE.md"
    "RUN_MIGRATION_NOW.md"
)

for doc in "${DEPLOYMENT_DOCS[@]}"; do
    if [ -f "$doc" ]; then
        mv "$doc" "docs/deployment/"
        echo -e "${GREEN}   ✓ Moved $doc${NC}"
    fi
done

# Step 9: Move feature-specific docs
echo ""
echo -e "${BLUE}✨ Step 9: Organizing feature documentation...${NC}"

FEATURE_DOCS=(
    "AGENT_FIELDS_BEFORE_AFTER.md"
    "AGENT_TYPE_FEATURE_README.md"
    "NOTIFICATIONS_GUIDE.md"
    "PRINT_FEATURE_STEP_BY_STEP.md"
    "PRINT_STATUS_NOW.md"
    "README_FILTERS_COMPLETE.md"
)

for doc in "${FEATURE_DOCS[@]}"; do
    if [ -f "$doc" ]; then
        mv "$doc" "docs/features/"
        echo -e "${GREEN}   ✓ Moved $doc${NC}"
    fi
done

# Step 10: Archive one-time migration scripts
echo ""
echo -e "${BLUE}🗄️  Step 10: Archiving migration scripts...${NC}"

MIGRATION_SCRIPTS=(
    "apply-complete-pending-sales-migration.sh"
    "apply-leasing-company-migration.sh"
    "apply-pcn-advance-migration.sh"
    "apply-seller-title-migrations.sh"
    "fix-sell-vehicle-error.sh"
)

for script in "${MIGRATION_SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        mv "$script" "docs/archive/migrations/"
        echo -e "${GREEN}   ✓ Moved $script${NC}"
    fi
done

# Step 11: Clean temporary files
echo ""
echo -e "${BLUE}🧹 Step 11: Cleaning temporary files...${NC}"

# Remove .DS_Store files
find . -name ".DS_Store" -type f -delete 2>/dev/null && echo -e "${GREEN}   ✓ Removed .DS_Store files${NC}" || echo -e "${YELLOW}   ⚠ No .DS_Store files found${NC}"

# Note about build directories (not removing, just reporting)
if [ -d "web/.next" ] || [ -d "dashboard/.next" ] || [ -d "api/dist" ]; then
    echo -e "${YELLOW}   ℹ Build directories detected (preserved):${NC}"
    [ -d "web/.next" ] && echo "     - web/.next"
    [ -d "dashboard/.next" ] && echo "     - dashboard/.next"
    [ -d "api/dist" ] && echo "     - api/dist"
    echo -e "${YELLOW}   💡 Run 'npm run clean' to remove build artifacts if needed${NC}"
fi

# Step 12: Create index files
echo ""
echo -e "${BLUE}📑 Step 12: Creating documentation index...${NC}"

cat > docs/README.md << 'EOF'
# PCN System v2.0 - Documentation

## 📚 Documentation Structure

This directory contains all project documentation organized by category.

### 🗂️ Directory Structure

```
docs/
├── archive/              # Historical documentation
│   ├── implementations/  # Completed feature implementations
│   ├── fixes/           # Bug fixes and patches
│   ├── git-commits/     # Git commit logs and templates
│   └── migrations/      # One-time migration scripts
├── guides/              # User and developer guides
├── deployment/          # Deployment and testing guides
└── features/            # Feature-specific documentation
```

### 📖 Active Documentation

For current project documentation, see:
- [README.md](../README.md) - Main project documentation
- [SETUP.md](../SETUP.md) - Setup instructions
- [QUICK_START.md](../QUICK_START.md) - Quick start guide
- [LOGIN_INFO.md](../LOGIN_INFO.md) - Authentication details

### 🗄️ Archive

Historical documentation has been moved to the `archive/` directory:
- **implementations/** - Completed feature implementations and updates
- **fixes/** - Bug fixes and problem resolutions
- **git-commits/** - Git commit history and templates
- **migrations/** - One-time database migration scripts

### 📋 Guides

User and developer guides in the `guides/` directory:
- Visual guides for features
- Quick reference guides
- Step-by-step tutorials

### 🚀 Deployment

Deployment-related documentation in the `deployment/` directory:
- Deployment checklists
- Testing guides
- Migration instructions

### ✨ Features

Feature-specific documentation in the `features/` directory:
- Feature README files
- Before/after comparisons
- Feature status tracking

---

**Last Updated:** November 4, 2025
**System Version:** v2.0.9
EOF

echo -e "${GREEN}   ✓ Created docs/README.md${NC}"

# Step 13: Summary
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    Cleanup Complete! ✅                            ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 Summary:${NC}"
echo "   • Created organized docs/ directory structure"
echo "   • Archived implementation documentation"
echo "   • Archived bug fix documentation"
echo "   • Archived git commit logs"
echo "   • Organized guides and visual documentation"
echo "   • Moved deployment and testing docs"
echo "   • Archived one-time migration scripts"
echo "   • Cleaned temporary files"
echo "   • Created documentation index"
echo ""
echo -e "${YELLOW}📝 Remaining in root:${NC}"
echo "   • README.md - Main project documentation"
echo "   • SETUP.md - Setup instructions"
echo "   • QUICK_START.md - Quick start guide"
echo "   • LOGIN_INFO.md - Login credentials"
echo "   • URGENT_FIX_SELL_VEHICLE.md - Current issues"
echo "   • package.json - Project configuration"
echo ""
echo -e "${BLUE}💡 Next Steps:${NC}"
echo "   1. Review docs/README.md for documentation index"
echo "   2. Commit changes: git add . && git commit -m 'docs: organize documentation'"
echo "   3. Consider removing URGENT_FIX_SELL_VEHICLE.md if resolved"
echo ""
echo -e "${GREEN}✨ Project is now clean and organized!${NC}"
echo ""
