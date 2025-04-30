# DIY Recipes: Documentation and Migration Plan

This document outlines the plan for creating comprehensive documentation and managing user/data migration for the new DIY Recipes system.

## Phase 1: Information Gathering & Context Definition

*   **Goal:** Understand the scope of Phase 2 changes, the nature of the old system, the target user base, and the current state of the new system's database schema to inform documentation and migration needs.
*   **Actions:**
    1.  **Review Existing High-Level Docs:** Examine files like `architecture.md`, `comprehensive-architectural-vision.md`, `mcp-supabase-setup.md`, `implementation-roadmap.md`, and `progress.md` to reconstruct the Phase 2 scope and overall system design.
    2.  **Analyze Codebase Structure:** Use `list_files` and potentially `read_file` on key configuration files (e.g., `package.json`, `next.config.js`, `supabase` related files) within `DIY_Recipes/modern-diy-recipes/` to understand the tech stack and dependencies.
    3.  **Inspect Supabase Schema:** Use the `supabase-community/supabase-mcp` tool (`list_tables`) to directly query the connected Supabase project and list existing tables and their schemas. This requires knowing the `project_id`. If unknown, use `list_projects` first.
    4.  **Identify Migration Clues:** Search for files related to the old system or previous migration attempts (e.g., `migrateIngredients.js`, `migrate.html`).
    5.  **Define Assumptions:** Based on the gathered info (or lack thereof), clearly state assumptions about the old system (e.g., "Assuming data is in JSON files"), new system features, and user profiles (e.g., "Assuming users are internal food scientists").

## Phase 2: Documentation Strategy

*   **Goal:** Define the types, structure, content, and maintenance process for the system documentation.
*   **Actions:**
    1.  **Define Audience & Doc Types:**
        *   **User Guide:** For end-users (assumed internal scientists). Focus on *how* to use the features.
        *   **Developer Guide:** For developers maintaining or extending the system. Focus on codebase structure, setup, key components, and development practices.
        *   **Architecture Overview:** (Optional, might be covered by existing docs) High-level system design, data flow, and integration points.
        *   **(If Applicable) API Documentation:** If any APIs are discovered or planned.
    2.  **Outline Content:** Create a table of contents for each document type.
        *   *User Guide:* Getting Started, Core Features (Recipe Creation, Editing, Iteration, Analysis), Settings, Troubleshooting.
        *   *Developer Guide:* Project Setup, Tech Stack Overview, Folder Structure, Key Modules/Components (e.g., Auth, Supabase Client, UI Components), State Management, Testing Strategy, Deployment.
    3.  **Establish Process:**
        *   **Creation:** Assign initial drafting responsibilities (e.g., could be done by Code mode based on analysis).
        *   **Review:** Define a review process (e.g., peer review, lead review).
        *   **Maintenance:** Plan for keeping docs updated as the system evolves (e.g., updates tied to feature releases or pull requests).
        *   **Location:** Confirm `DIY_Recipes/docs/` as the central location.

## Phase 3: User & Data Migration Strategy

*   **Goal:** Plan a smooth transition for users and their data from the old system to the new one.
*   **Actions:**
    1.  **Refine System Understanding:** Solidify understanding of old system data structure and new Supabase schema based on Phase 1 findings.
    2.  **Choose Migration Approach:**
        *   Recommend a **Phased Migration** (e.g., migrate users/data in batches) to minimize risk and disruption. Outline potential phases.
        *   Alternatively, consider a **Big Bang** (all at once) or **Parallel Run** (both systems active temporarily), outlining pros and cons.
    3.  **Data Mapping:** Detail the process for mapping fields from the old data format to the new Supabase tables. This will likely require creating a specific mapping document.
    4.  **Develop Migration Scripts/Tools:** Plan the creation or adaptation of scripts (like potentially `migrateIngredients.js`) to automate the data transfer. Specify language/tools (e.g., Node.js script using Supabase JS client).
    5.  **Testing Plan:**
        *   **Unit Tests:** For migration scripts.
        *   **Integration Tests:** Verify data integrity in the new Supabase instance after migration runs.
        *   **User Acceptance Testing (UAT):** Have a subset of users test the migrated system with their data.
    6.  **Rollback Plan:** Define steps to revert the migration if critical issues are found (e.g., restoring DB from backup, disabling new system access).
    7.  **Communication Plan:** Outline communication to users regarding the migration timeline, potential downtime, required actions (if any), and support channels.

## Phase 4: Plan Review & Finalization

*   **Goal:** Get approval on the plan and prepare for execution.
*   **Actions:**
    1.  **Present Plan:** Share this detailed plan (potentially visualized with a Mermaid diagram).
    2.  **Gather Feedback:** Incorporate any adjustments or clarifications.
    3.  **Formalize:** Offer to write the finalized plan to a markdown file (e.g., `DIY_Recipes/docs/documentation-and-migration-plan.md`).

## Phase 5: Execution Handoff

*   **Goal:** Transition to the appropriate mode(s) to begin executing the plan.
*   **Actions:**
    1.  **Recommend Mode Switch:** Suggest switching to `code` mode to perform the codebase analysis and potentially start developing migration scripts, or `orchestrator` mode to manage the execution across different steps and modes.

## Plan Overview (Mermaid Diagram)

```mermaid
graph TD
    A[Phase 1: Info Gathering] --> B(Review Docs);
    A --> C(Analyze Code);
    A --> NEW(Inspect Supabase Schema);
    A --> D(Find Migration Clues);
    A --> E(Define Assumptions);

    E --> F[Phase 2: Documentation Strategy];
    F --> G(Define Audience/Types);
    F --> H(Outline Content);
    F --> I(Establish Process);

    E --> J[Phase 3: Migration Strategy];
    J --> K(Refine System Understanding);
    J --> L(Choose Approach);
    J --> M(Data Mapping);
    J --> N(Develop Scripts);
    J --> O(Testing Plan);
    J --> P(Rollback Plan);
    J --> Q(Communication Plan);

    I --> R[Phase 4: Plan Review];
    Q --> R;
    R --> S(Gather Feedback);
    R --> T(Formalize in MD);

    T --> U[Phase 5: Execution Handoff];
    U --> V(Switch Mode - Code/Orchestrator);

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style F fill:#ccf,stroke:#333,stroke-width:2px
    style J fill:#cfc,stroke:#333,stroke-width:2px
    style R fill:#ffc,stroke:#333,stroke-width:2px
    style U fill:#fcc,stroke:#333,stroke-width:2px