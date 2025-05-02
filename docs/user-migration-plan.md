# User Migration Plan for DIY Recipes

This document outlines the plan for migrating existing user data from the old system to the new Supabase backend for the DIY Recipes project.

## 1. Goals

*   Migrate all existing user profile data to the Supabase `profiles` table.
*   Minimize downtime for existing users during the migration process.
*   Ensure data integrity and consistency in the new Supabase database.
*   Provide a clear rollback strategy in case of issues.

## 2. Assumptions

*   A Supabase project is set up and configured for the DIY Recipes application.
*   A `profiles` table exists in the Supabase database, linked to the `auth.users` table, with appropriate columns (e.g., `id` (UUID), `username`, `email`, and any other relevant user profile fields).
*   The structure and location of the old user data source are known and accessible for the migration script.
*   A strategy for migrating user authentication (passwords) is in place or will be handled separately (e.g., requiring users to reset passwords after migration). This plan focuses primarily on migrating user profile data.

## 3. Migration Strategy

The migration will follow a phased approach:

### 3.1. Pre-Migration Phase

*   **Data Analysis and Mapping:**
    *   Analyze the schema of the old user data source.
    *   Map the relevant fields from the old system to the columns in the Supabase `profiles` table.
    *   Identify any data transformations required (e.g., data type conversions, formatting).
*   **Supabase Setup:**
    *   Ensure the Supabase project is fully set up, including the `profiles` table with the correct schema and any necessary RLS policies.
    *   Configure environment variables for the migration script (Supabase URL, Service Role Key).
*   **Script Development and Testing:**
    *   Complete the `migrateUsers.js` script, implementing the data fetching and mapping logic based on the old data source.
    *   Thoroughly test the migration script in a staging environment with a representative sample of old user data.
    *   Verify that data is correctly inserted into the Supabase `profiles` table and that relationships (if any) are maintained.
    *   Test the script's error handling and logging.
*   **Backup:**
    *   Perform a full backup of the old user data source.
    *   Perform a backup of the Supabase database before starting the migration.

### 3.2. Migration Phase

*   **Communication:**
    *   Inform users about the planned migration and potential temporary downtime or required actions (e.g., password reset).
*   **Downtime Minimization Strategy:**
    *   Schedule the migration during a period of low user activity.
    *   Consider putting the application into a "maintenance mode" to prevent new data writes to the old system during the migration.
    *   If possible, implement a strategy for migrating users in batches to reduce the impact of potential failures.
*   **Execution:**
    *   Execute the `migrateUsers.js` script in the production environment.
    *   Monitor the script's progress and logs closely for any errors or warnings.

### 3.3. Post-Migration Phase

*   **Data Verification:**
    *   Verify the number of users migrated matches the expected count.
    *   Perform spot checks on migrated user profiles in the Supabase database to ensure data accuracy and integrity.
    *   Check Supabase logs for any errors during the insertion process.
*   **User Testing:**
    *   Conduct internal testing to ensure migrated users can access their profiles and related data in the new system.
    *   Address any issues reported by users.
*   **Rollback Plan:**
    *   Have a clear plan to roll back to the old system or restore the Supabase database from the backup if critical issues are discovered after the migration.
*   **Cleanup:**
    *   Once the migration is confirmed successful and stable, decommission the old user data source (after retaining backups for a defined period).

## 4. Utilizing the Supabase MCP

The Supabase MCP can be a valuable tool during this migration process:

*   **Executing SQL Queries:** If parts of the migration involve direct SQL operations (e.g., schema adjustments, data cleaning), the `execute_sql` tool provided by the Supabase MCP can be used to run these queries directly against the Supabase database.
*   **Verifying Data Integrity:** After the migration script runs, the `execute_sql` tool can be used to run verification queries (e.g., `SELECT COUNT(*) FROM profiles;`, `SELECT * FROM profiles WHERE email = '...' LIMIT 1;`) to check the migrated data within the Supabase database.
*   **Monitoring:** While the current Supabase MCP implementation might not directly monitor the Node.js script execution, a more advanced MCP setup or custom tools could potentially be developed to trigger the script and report its status. The `get_logs` tool could be useful for checking Supabase database logs for insertion errors.

## 5. Next Steps

*   Refine the `migrateUsers.js` script based on the actual old data source schema and location.
*   Determine the strategy for migrating user authentication/passwords.
*   Finalize the downtime minimization strategy and communication plan for users.
*   Establish monitoring and rollback procedures.
*   Perform migration testing in a staging environment.
*   Execute the migration in production during a scheduled maintenance window.