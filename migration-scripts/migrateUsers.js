// migrateUsers.js - Script to migrate user profile data to Supabase

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// --- Configuration ---
// Replace with your actual Supabase URL and Service Role Key
// The Service Role Key is required for bypassing RLS and writing directly to auth.users or profiles table
const SUPABASE_URL = process.env.SUPABASE_URL; // e.g., 'https://your-project-ref.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Keep this secure!

// --- Old Data Source Configuration ---
// TODO: Replace with actual connection details for your old user data source
// This is a placeholder and needs to be implemented based on your old system
async function fetchOldUserData() {
  console.log("Fetching data from old user data source...");
  // Example: Fetch from a dummy array or another database
  const oldUsers = [
    { id: 'old-user-1', username: 'userone', email: 'userone@example.com', old_field: 'value1' },
    { id: 'old-user-2', username: 'usertwo', email: 'usertwo@example.com', old_field: 'value2' },
    // Add more old user data here
  ];
  console.log(`Fetched ${oldUsers.length} users from old source.`);
  return oldUsers;
}

// Initialize Supabase client with Service Role Key
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Migrates user profile data from the old system to the Supabase 'profiles' table.
 * Assumes a 'profiles' table exists with at least 'id' (UUID, linked to auth.users)
 * and 'username' and 'email' columns.
 * TODO: Adapt data mapping based on your old data structure and new Supabase schema.
 */
async function migrateUsers() {
  console.log('Starting user migration...');

  // Fetch data from the old system
  const oldUsers = await fetchOldUserData();

  if (oldUsers.length === 0) {
    console.log('No users found in the old data source. Nothing to migrate.');
    return;
  }

  // Prepare data for insertion into Supabase
  // We'll assume a 'profiles' table for user profile data, linked to auth.users
  // The 'id' in the profiles table should ideally correspond to the user's UUID in auth.users.
  // For a simple profile migration, we might insert based on email and then link later,
  // or if we are also migrating authentication, we would get the Supabase Auth user ID.
  // This example assumes we are migrating profile data and will need to link it
  // to Supabase Auth users separately or that the old system has unique identifiers
  // that can be used. A common approach is to migrate authentication first,
  // then use the new Supabase Auth user IDs for the profile table.
  // For simplicity in this script, we'll assume we are inserting into a 'profiles' table
  // and will need to handle the linking to auth.users as a separate step or via triggers.
  // A more robust migration would involve using the Supabase Admin client to create users
  // directly in auth.users with their old passwords (if securely hashed and compatible)
  // or marking them for password reset. This script focuses on profile data.

  const usersToMigrate = oldUsers.map(oldUser => {
    // TODO: Map old user fields to your new 'profiles' table schema
    return {
      // id: oldUser.id, // If you have a strategy to map old IDs to new Supabase Auth IDs
      username: oldUser.username,
      email: oldUser.email,
      // Add other profile fields here based on your schema
      // e.g., old_system_id: oldUser.id, // Store old ID for reference
      // e.g., created_at: new Date(oldUser.created_timestamp).toISOString(),
    };
  });

  console.log(`Prepared ${usersToMigrate.length} users for migration.`);

  // Insert data into the Supabase 'profiles' table
  // Using insert with upsert: true can help prevent duplicates if rerunning the script,
  // assuming you have a unique constraint on a field like 'email' or 'old_system_id'.
  // However, upserting into auth.users is not directly supported this way.
  // This script focuses on the 'profiles' table.
  try {
    const { data, error } = await supabaseClient
      .from('profiles') // TODO: Replace with your actual profile table name
      .insert(usersToMigrate, {
        // upsert: true, // Uncomment if you have a unique constraint and want upsert behavior
        // onConflict: 'email', // Specify the conflict target for upsert
      })
      .select(); // Select the inserted data to get new IDs if needed

    if (error) {
      console.error('Error inserting users into Supabase:', error);
      // TODO: Implement more sophisticated error handling, e.g., logging failed records
      return { successful: 0, failed: usersToMigrate.length, details: error };
    }

    console.log(`Successfully migrated ${data?.length || 0} user profiles.`);
    // TODO: Log details of successful/failed migrations if not using upsert

    return { successful: data?.length || 0, failed: usersToMigrate.length - (data?.length || 0), details: data };

  } catch (error) {
    console.error('Error during Supabase insertion:', error);
    return { successful: 0, failed: usersToMigrate.length, details: error };
  }
}

// Execute the migration
migrateUsers()
  .then(results => {
    console.log('\n--- User Migration Summary ---');
    console.log(`Total users processed: ${results.successful + results.failed}`);
    console.log(`Successfully migrated: ${results.successful}`);
    console.log(`Failed to migrate: ${results.failed}`);
    if (results.failed > 0) {
      console.error('Migration failed for some users. Check logs for details.');
      // console.error('Error details:', results.details); // Log detailed error if needed
    }
    console.log('User migration script finished.');
    process.exit(results.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('An unexpected error occurred during user migration:', error);
    process.exit(1);
  });