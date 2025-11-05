# PCN System v2.0 - Project Structure

## 📁 Repository Structure

```
PCN System v2.0/
│
├── 📄 Root Files (Essential Documentation)
│   ├── README.md                      # Main project documentation (2,114 lines)
│   ├── SETUP.md                       # Installation and setup guide
│   ├── QUICK_START.md                 # Quick start for developers
│   ├── LOGIN_INFO.md                  # Authentication credentials
│   ├── URGENT_FIX_SELL_VEHICLE.md    # Current issues (⚠️ review)
│   ├── package.json                   # Monorepo configuration
│   ├── .gitignore                     # Git ignore rules
│   └── cleanup-project.sh             # Project cleanup script
│
├── 📚 docs/ (Organized Documentation - 75 files, 680KB)
│   │
│   ├── README.md                      # Documentation index
│   │
│   ├── 🗄️ archive/                    # Historical Documentation
│   │   ├── implementations/           # 25 completed features
│   │   │   ├── 360_VIEW_IMPLEMENTATION.md
│   │   │   ├── AGENT_FIELDS_COMPLETE_SOLUTION.md
│   │   │   ├── AGENT_TYPE_IMPLEMENTATION_SUMMARY.md
│   │   │   ├── PCN_ADVANCE_AMOUNT_IMPLEMENTATION.md
│   │   │   ├── PRINT_DOCUMENT_IMPLEMENTATION.md
│   │   │   ├── SEARCH_IMPLEMENTATION.md
│   │   │   ├── NOTIFICATION_SYSTEM_COMPLETE.md
│   │   │   └── ... (18 more files)
│   │   │
│   │   ├── fixes/                     # 10 bug fixes
│   │   │   ├── AGENT_FIELDS_FIX_SUMMARY.md
│   │   │   ├── CAROUSEL_FIX_SUMMARY.md
│   │   │   ├── FINANCE_SELLER_LEASING_COMPANY_FIX.md
│   │   │   ├── S3_DELETE_BUG_FIX.md
│   │   │   ├── SEARCH_BUG_FIX_REPORT.md
│   │   │   └── ... (5 more files)
│   │   │
│   │   ├── git-commits/               # 4 git history files
│   │   │   ├── AGENT_FIELDS_GIT_COMMIT.md
│   │   │   ├── AGENT_TYPE_GIT_COMMIT_TEMPLATE.md
│   │   │   ├── GIT_COMMIT_LOG_NOV_2025.md
│   │   │   └── GIT_COMMIT_SUMMARY.md
│   │   │
│   │   └── migrations/                # 5 one-time scripts
│   │       ├── apply-complete-pending-sales-migration.sh
│   │       ├── apply-leasing-company-migration.sh
│   │       ├── apply-pcn-advance-migration.sh
│   │       ├── apply-seller-title-migrations.sh
│   │       └── fix-sell-vehicle-error.sh
│   │
│   ├── 📖 guides/                     # 21 user guides
│   │   ├── Quick References (8 files)
│   │   │   ├── 360_VIEW_QUICK_GUIDE.md
│   │   │   ├── AGENT_FIELDS_QUICK_REFERENCE.md
│   │   │   ├── AGENT_TYPE_QUICK_GUIDE.md
│   │   │   ├── PCN_ADVANCE_AMOUNT_QUICK_GUIDE.md
│   │   │   ├── PRINT_DOCUMENT_QUICK_REFERENCE.md
│   │   │   ├── NOTIFICATION_QUICK_REFERENCE.md
│   │   │   ├── SEARCH_QUICK_GUIDE.md
│   │   │   └── QUICK_FIX_GUIDE.md
│   │   │
│   │   └── Visual Guides (13 files)
│   │       ├── AGENT_FIELDS_VERIFICATION_GUIDE.md
│   │       ├── AGENT_TYPE_VISUAL_GUIDE.md
│   │       ├── FILTERS_VISUAL_GUIDE.md
│   │       ├── NOTIFICATION_FLOW_VISUAL.md
│   │       ├── NOTIFICATION_VISUAL_GUIDE.md
│   │       ├── PRINT_DOCUMENT_VISUAL_GUIDE.md
│   │       └── ... (7 more files)
│   │
│   ├── 🚀 deployment/                 # 8 deployment files
│   │   ├── DEPLOYMENT_CHECKLIST_AGENT_TYPE.md
│   │   ├── FILTERS_FINAL_CHECKLIST.md
│   │   ├── SEARCH_FINAL_CHECKLIST.md
│   │   ├── TESTING_GUIDE.md
│   │   ├── PRINT_DOCUMENT_TESTING_GUIDE.md
│   │   ├── SEARCH_TESTING_GUIDE.md
│   │   ├── TESTING_S3_DELETE.md
│   │   └── RUN_MIGRATION_NOW.md
│   │
│   └── ✨ features/                   # 6 feature docs
│       ├── AGENT_FIELDS_BEFORE_AFTER.md
│       ├── AGENT_TYPE_FEATURE_README.md
│       ├── NOTIFICATIONS_GUIDE.md
│       ├── PRINT_FEATURE_STEP_BY_STEP.md
│       ├── PRINT_STATUS_NOW.md
│       └── README_FILTERS_COMPLETE.md
│
├── 🎨 web/ (Public Website)
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── README.md
│   └── .next/                         # Build cache (ignored)
│
├── 🏢 dashboard/ (Admin Dashboard)
│   ├── src/
│   ├── public/
│   ├── migrations/                    # Database migrations
│   ├── supabase/
│   ├── package.json
│   ├── README.md
│   └── .next/                         # Build cache (ignored)
│
├── 🔌 api/ (Backend API)
│   ├── src/
│   ├── package.json
│   ├── README.md
│   └── dist/                          # Build output (ignored)
│
├── 📦 shared/ (Shared Code)
│   └── types/
│
└── 🔧 node_modules/ (505MB - ignored)
```

## 📊 Project Statistics

### Documentation Organization
| Category | Files | Description |
|----------|-------|-------------|
| **Root** | 5 MD + 1 SH | Essential documentation only |
| **Archive** | 44 files | Historical implementations, fixes, migrations |
| **Guides** | 21 files | Quick references and visual guides |
| **Deployment** | 8 files | Deployment checklists and testing |
| **Features** | 6 files | Feature-specific documentation |
| **Total Organized** | **75 files** | 680KB of organized documentation |

### Workspace Structure
| Component | Technology | Status |
|-----------|-----------|--------|
| **Web** | Next.js 14 | ✅ Production Ready |
| **Dashboard** | Next.js 14 | ✅ Production Ready |
| **API** | Node.js/Express | ✅ Production Ready |
| **Database** | Supabase (PostgreSQL) | ✅ Production Ready |
| **Storage** | AWS S3 | ✅ Production Ready |
| **Authentication** | Supabase Auth | ✅ Production Ready |

### Build Artifacts (Preserved but Ignored)
- `web/.next/` - Next.js build cache
- `dashboard/.next/` - Next.js build cache
- `api/dist/` - API build output
- `node_modules/` - Dependencies (505MB)

## 🎯 Key Features

### Core Functionality
- ✅ Vehicle Management System
- ✅ Sales Transaction Processing
- ✅ Document Generation & Printing
- ✅ Notification System
- ✅ Search & Filter System
- ✅ Image Management (S3)
- ✅ Agent Type Classification
- ✅ PCN Advance Amount Tracking
- ✅ Leasing Company Integration
- ✅ 360° Vehicle View

### Recent Enhancements (Nov 2025)
- ✅ Agent Fields Display Fix
- ✅ Sales Agent Type Classification
- ✅ S3 Image Auto-Deletion on Sold Out
- ✅ Enhanced Modal Layouts
- ✅ UUID-to-Name Resolution

## 📝 Documentation Quick Links

### For Developers
- [Main README](../README.md) - Project overview and features
- [Setup Guide](../SETUP.md) - Installation instructions
- [Quick Start](../QUICK_START.md) - Get started quickly
- [Documentation Index](docs/README.md) - Navigate all docs

### For Deployment
- [Deployment Checklists](docs/deployment/)
- [Testing Guides](docs/deployment/)
- [Migration Scripts](docs/archive/migrations/)

### For Features
- [Feature Documentation](docs/features/)
- [Quick Guides](docs/guides/)
- [Visual Guides](docs/guides/)

### For History
- [Implementations](docs/archive/implementations/)
- [Bug Fixes](docs/archive/fixes/)
- [Git Commits](docs/archive/git-commits/)

## 🔍 Finding Documentation

### By Purpose
- **Setup & Installation** → Root level (`SETUP.md`, `QUICK_START.md`)
- **Feature Usage** → `docs/guides/` or `docs/features/`
- **Deployment** → `docs/deployment/`
- **Historical Context** → `docs/archive/`

### By Type
- **Quick References** → `docs/guides/*_QUICK_*.md`
- **Visual Guides** → `docs/guides/*_VISUAL_*.md`
- **Implementations** → `docs/archive/implementations/`
- **Bug Fixes** → `docs/archive/fixes/`

## 🚀 Getting Started

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd "PCN System . 2.0"
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment**
   - Follow [SETUP.md](../SETUP.md)
   - Review [LOGIN_INFO.md](../LOGIN_INFO.md)

4. **Start Development**
   ```bash
   npm run dev
   ```

5. **Read Documentation**
   - Start with [README.md](../README.md)
   - Browse [docs/](docs/)

## ✨ Maintenance

### Adding New Documentation
- **Features** → Add to `docs/features/`
- **Guides** → Add to `docs/guides/`
- **Deployment** → Add to `docs/deployment/`
- **Completed Work** → Move to `docs/archive/`

### Keeping Clean
- Keep only essential files in root
- Archive completed implementations
- Update `docs/README.md` index
- Follow established structure

---

**Last Updated:** November 4, 2025  
**Project Version:** v2.0.9  
**Status:** ✅ Production Ready & Well-Organized
