# Documentation Organization Plan for modern-diy-recipes

## Current State: 114 Markdown Files

This plan organizes the existing markdown documentation into a clear, maintainable structure.

## Proposed Directory Structure

```
modern-diy-recipes/
├── README.md (main project README)
├── docs/
│   ├── setup/
│   │   ├── README.md (setup overview)
│   │   ├── supabase-setup.md
│   │   ├── environment-configuration.md
│   │   ├── server-management.md
│   │   └── local-development.md
│   ├── architecture/
│   │   ├── README.md (architecture overview)
│   │   ├── module-registry-system.md
│   │   ├── mcp-integration.md
│   │   ├── document-centric-interface.md
│   │   └── terminal-ui-implementation.md
│   ├── features/
│   │   ├── README.md (features overview)
│   │   ├── authentication.md
│   │   ├── theming-system.md
│   │   ├── recipe-iterations.md
│   │   ├── settings-module.md
│   │   └── feature-toggles.md
│   ├── api/
│   │   ├── README.md (API documentation)
│   │   └── supabase-integration.md
│   ├── testing/
│   │   ├── README.md (testing guide)
│   │   ├── automated-testing.md
│   │   └── test-reports/
│   └── maintenance/
│       ├── troubleshooting.md
│       ├── migration-guides.md
│       └── security.md
├── archive/
│   ├── implementation-logs/
│   │   └── [status updates and fix summaries]
│   ├── historical/
│   │   └── [old implementation notes]
│   └── test-artifacts/
│       └── [test reports and artifacts]
└── scripts/
    └── README.md (scripts documentation)
```

## File Categorization

### 1. Essential Documentation (Keep in docs/)
- **Setup Guides**:
  - SUPABASE_SETUP_GUIDE.md → docs/setup/supabase-setup.md
  - ENVIRONMENT_CONFIGURATION_GUIDE.md → docs/setup/environment-configuration.md
  - SERVER_MANAGEMENT.md → docs/setup/server-management.md
  - LOCAL_SERVER_INSTRUCTIONS.md → docs/setup/local-development.md
  - DEV_AUTH_README.md → docs/setup/authentication-setup.md

- **Architecture Documentation**:
  - MODULE_REGISTRY_SYSTEM.md → docs/architecture/module-registry-system.md
  - CONTEXT7_MCP_INTEGRATION.md → docs/architecture/mcp-integration.md
  - DOCUMENT_CENTRIC_INTERFACE.md → docs/architecture/document-centric-interface.md
  - TERMINAL_UI_IMPLEMENTATION.md → docs/architecture/terminal-ui-implementation.md
  - mcp-architecture.md → docs/architecture/mcp-architecture.md

- **Feature Documentation**:
  - SETTINGS_MODULE_IMPLEMENTATION.md → docs/features/settings-module.md
  - README-FEATURE-TOGGLE.md → docs/features/feature-toggles.md
  - RECIPE_ITERATIONS_SOLUTION.md → docs/features/recipe-iterations.md
  - README-ITERATIONS.md → docs/features/iterations-system.md
  - THEME_ICONS_IMPLEMENTATION.md → docs/features/theming-system.md

- **API Documentation**:
  - supabase-integration.md → docs/api/supabase-integration.md
  - SUPABASE_MCP_INTEGRATION.md → docs/api/supabase-mcp-integration.md

### 2. Status Updates and Logs (Archive)
- **Implementation Summaries**:
  - IMPLEMENTATION_SUMMARY.md
  - DATABASE_FIX_SUMMARY.md
  - LAYOUT_FIX_SUMMARY.md
  - ITERATIONS_IMPLEMENTATION_SUMMARY.md
  - SECURITY_IMPLEMENTATION_SUMMARY.md
  - TERMINAL_UI_IMPLEMENTATION_SUMMARY.md
  - DOCUMENT_CENTRIC_IMPLEMENTATION_SUMMARY.md
  - FEATURE_TOGGLE_TEST_SUMMARY.md
  - PRINT_FUNCTIONALITY_SUMMARY.md
  - CLEANUP_SUMMARY.md

- **Fix Reports**:
  - FIXES_IMPLEMENTED.md
  - DATABASE_FIX_GUIDE.md
  - RECIPE_INGREDIENTS_FIX.md
  - ITERATION_SYSTEM_FIXES.md
  - SERVER_STABILITY_FIXES.md
  - TERMINAL_COLOR_FIX.md
  - FIXED_CIRCULAR_DEPS.md
  - STABILITY_FIX.md

- **Status Documents**:
  - DOCUMENT_CENTRIC_STATUS.md
  - CURRENT_STATE_BACKUP.md
  - SUCCESS.md
  - TESTING_RESULTS.md

### 3. Migration and Transition Guides (Archive)
- TERMINOLOGY_TRANSITION_PLAN.md
- SCRIPT_MIGRATION_GUIDE.md
- CODE_REFACTORING_PLAN.md
- FIX_IMPLEMENTATION_PLAN.md
- INTERFACE_REDESIGN.md
- INTERFACE_SIMPLIFICATION.md
- DOCUMENT_WINDOW_REDESIGN.md

### 4. Troubleshooting and Issues (Archive)
- FIXABLE_ISSUES.md
- NETWORK_CONNECTIVITY_ISSUE.md
- PORT_3000_SOLUTION.md
- port-3000-issue.md
- SERVER_PORT_3000_ISSUE.md
- SUPABASE_ISSUE_SOLVED.md
- SERVER_CONNECTIVITY_FIX.md

### 5. Test Artifacts (Archive)
- test-artifacts/app-document-view/document-view-test-report.md
- test-artifacts/db-check/db-recommendations-*.md
- test-artifacts/diagnostics/recommendations-*.md
- test-artifacts/document-iterations/iterations-test-report.md
- test-artifacts/recipe-experience/observations.md
- test-artifacts/recipe-iterations/*.md
- test-artifacts/simple-doc-test/simple-doc-test-report.md
- test-artifacts/test-report.md
- test-artifacts/theme-icons-test-report.md
- integration-test-artifacts/integration-test-report.md

### 6. Specialized READMEs (Consolidate)
- README-ENVIRONMENT-VALIDATOR.md
- README-FONT-SOLUTION.md
- README-LAYOUT-FIX.md
- README-MEMORY-INTEGRATION.md
- KRAFT_TERMINAL_NO_MOCK_DATA_README.md
- RETRO_TERMINAL_README.md
- SIMPLE_DEV_AUTH.md
- MINIMAL_TEST_README.md

### 7. Configuration and SQL (Keep as reference)
- supabase-sql-commands.md
- direct-db-access.md
- SUPABASE_CONFIGURATION_SUMMARY.md
- SUPABASE_CONFIGURATION_UPDATE.md
- FIX_SUPABASE_CONFIG.md

### 8. Component-Specific Documentation (Keep in src/)
- src/app/formula-database/README.md
- src/Settings/README.md
- src/docs/supabase-integration.md

### 9. Scripts Documentation
- SCRIPTS_README.md → scripts/README.md

### 10. Other Documentation
- CLAUDE.md (project instructions)
- FAMILY_GUIDE.md (user guide)
- diy-formulation-summary.md
- VISUAL_IMPLEMENTATION_DOCUMENTATION.md
- TYPESCRIPT_FIXES.md
- JS_FILE_CLEANUP_ANALYSIS.md

## Implementation Steps

1. **Create Directory Structure**:
   ```bash
   mkdir -p docs/{setup,architecture,features,api,testing,maintenance}
   mkdir -p archive/{implementation-logs,historical,test-artifacts}
   ```

2. **Move Essential Documentation**:
   - Move setup guides to `docs/setup/`
   - Move architecture docs to `docs/architecture/`
   - Move feature docs to `docs/features/`
   - Consolidate and update content where needed

3. **Archive Status Updates**:
   - Move all implementation summaries to `archive/implementation-logs/`
   - Move test artifacts to `archive/test-artifacts/`
   - Add timestamps to archived files

4. **Create Index Files**:
   - Create README.md in each docs/ subdirectory
   - Update main README.md with links to new structure

5. **Clean Up Root Directory**:
   - Keep only essential files in root:
     - README.md
     - CLAUDE.md
     - Package files
     - Configuration files
     - Scripts

## Benefits

1. **Clear Organization**: Documentation is logically grouped by purpose
2. **Easy Navigation**: Users can quickly find what they need
3. **Reduced Clutter**: Historical and status files are archived but accessible
4. **Maintainable**: New documentation has clear placement rules
5. **Professional**: Clean structure suitable for open-source or team projects

## Maintenance Guidelines

1. **New Features**: Document in `docs/features/`
2. **Bug Fixes**: Log in `archive/implementation-logs/` with date
3. **Test Reports**: Store in `archive/test-artifacts/`
4. **Setup Changes**: Update relevant files in `docs/setup/`
5. **Architecture Changes**: Update `docs/architecture/` and create migration guide if needed

## Next Steps

1. Review and approve this plan
2. Create backup of current state
3. Execute reorganization
4. Update all internal documentation links
5. Test that all references still work
6. Update CLAUDE.md with new structure reference