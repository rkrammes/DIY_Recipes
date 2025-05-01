// migrateUsers.js - Script for migrating users from the old system to the new Supabase Auth

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// --- Configuration ---
// Replace with the URL and Service Role Key for your NEW Supabase project
const NEW_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_NEW_SUPABASE_URL'; // Using NEXT_PUBLIC_SUPABASE_URL from .env
const NEW_SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_NEW_SUPABASE_SERVICE_ROLE_KEY'; // Assuming service role key is in .env

// Replace with the connection details for your OLD system's user data source
// This is a placeholder. You will need to implement the logic to connect to and fetch users from your old system.
// Example placeholder assuming old data is in another Supabase project:
// const OLD_SUPABASE_URL = 'YOUR_OLD_SUPABASE_URL';
// const OLD_SUPABASE_ANON_KEY = 'YOUR_OLD_SUPABASE_ANON_KEY';
// const oldSupabaseClient = createClient(OLD_SUPABASE_URL, OLD_SUPABASE_ANON_KEY);

// Initialize New Supabase client with Service Role Key for user management
const newSupabaseClient = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Fetches users from the old system.
 * This function needs to be implemented based on your old system's data source.
 * @returns {Promise<Array<Object>>} Array of user objects from the old system.
 */

/**
 * Migrates users to the new Supabase Auth system.
 * @param {Array<Object>} oldUsers - Array of user objects from the old system.
 * @returns {Promise<Object>} Migration results summary.
 */
async function migrateUsers(oldUsers) {
  console.log('Starting user migration...');

  const migrationResults = {
    total: oldUsers.length,
    successful: 0,
    failed: 0,
    details: []
  };

  for (const oldUser of oldUsers) {
    try {
      console.log(`Migrating user: ${oldUser.email || oldUser.old_user_id}...`);

      // Check if user already exists in new Supabase Auth (e.g., by email)
      const { data: existingUsers, error: fetchError } = await newSupabaseClient.auth.admin.listUsers({
        search: oldUser.email, // Assuming email is unique and available
      });

      if (fetchError) {
        console.error(`Error checking for existing user ${oldUser.email}:`, fetchError);
        migrationResults.failed++;
        migrationResults.details.push({
          old_id: oldUser.old_user_id,
          identifier: oldUser.email || oldUser.old_user_id,
          status: 'failed',
          error: `Error checking existence: ${fetchError.message}`
        });
        continue; // Skip to the next user
      }

      if (existingUsers && existingUsers.users.length > 0) {
        console.log(`User with email ${oldUser.email} already exists. Skipping creation.`);
        migrationResults.successful++; // Consider existing as successful for idempotency
        migrationResults.details.push({
          old_id: oldUser.old_user_id,
          identifier: oldUser.email || oldUser.old_user_id,
          status: 'skipped',
          message: 'User already exists'
        });
      } else {
        // Create the user in Supabase Auth
        // Note: Migrating passwords securely requires specific strategies (e.g., using admin.createUser with password,
        // or prompting users to reset password on first login). This example uses a placeholder.
        const { data: newUser, error: createError } = await newSupabaseClient.auth.admin.createUser({
          email: oldUser.email,
          password: oldUser.password, // WARNING: This assumes you have access to plain or easily verifiable passwords.
                                      // A more secure approach is recommended (e.g., passwordless login, inviting users).
          email_confirm: true, // Optional: Set to true to bypass email confirmation
          user_metadata: {
            old_user_id: oldUser.old_user_id, // Store old ID for mapping related data
            // Add other relevant user metadata
          }
        });

        if (createError) {
          console.error(`Error creating user ${oldUser.email}:`, createError);
          migrationResults.failed++;
          migrationResults.details.push({
            old_id: oldUser.old_user_id,
            identifier: oldUser.email || oldUser.old_user_id,
            status: 'failed',
            error: `Error creating user: ${createError.message}`
          });
        } else {
          console.log(`Successfully created user: ${newUser.user.email} (New ID: ${newUser.user.id})`);
          migrationResults.successful++;
          migrationResults.details.push({
            old_id: oldUser.old_user_id,
            identifier: oldUser.email || oldUser.old_user_id,
            status: 'success',
            new_id: newUser.user.id
          });

          // TODO: After creating the user, you might need to insert additional user profile data
          // into a separate 'profiles' table in your public schema, linking it using newUser.user.id.
          /*
          const { data: profileData, error: profileError } = await newSupabaseClient
            .from('profiles') // Assuming you have a 'profiles' table
            .insert([
              {
                id: newUser.user.id, // Link to auth.users ID
                old_user_id: oldUser.old_user_id,
                username: oldUser.username, // Assuming username exists in old data
                // Add other profile fields
              }
            ]);
          if (profileError) {
            console.error(`Error creating profile for user ${newUser.user.id}:`, profileError);
            // Decide how to handle this error - fail the user migration or log and continue?
          }
          */
        }
      }

    } catch (error) {
      console.error(`An unexpected error occurred during migration of user ${oldUser.email || oldUser.old_user_id}:`, error);
      migrationResults.failed++;
      migrationResults.details.push({
        old_id: oldUser.old_user_id,
        identifier: oldUser.email || oldUser.old_user_id,
        status: 'failed',
        error: `Unexpected error: ${error.message}`
      });
    }
  }

  console.log('\n--- User Migration Results ---');
  console.log(`Total users processed: ${migrationResults.total}`);
  console.log(`Successfully migrated/skipped: ${migrationResults.successful}`);
  console.log(`Failed to migrate: ${migrationResults.failed}`);

  if (migrationResults.details.length > 0) {
    console.log('\nDetailed Results:');
    migrationResults.details.forEach(detail => {
      console.log(`- ${detail.identifier}: ${detail.status}${detail.new_id ? ` (New ID: ${detail.new_id})` : ''}${detail.error ? ` (Error: ${detail.error})` : ''}`);
    });
  }

  return migrationResults;
}

// Main execution function
async function runUserMigration() {
  console.log('Fetch logic removed as migration appears complete.');
}

// Execute the migration process
runUserMigration()
  .then(() => {
    console.log('User migration process finished.');
    process.exit(0);
  })
  .catch(error => {
    console.error('User migration process failed:', error);
    process.exit(1);
  });