import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

// Load environment variables
config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or key is missing. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchAndSaveActivityLogs() {
  try {
    // Fetch data from Supabase
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      throw error;
    }

    // Convert data to JSON string
    const jsonData = JSON.stringify(data, null, 2);

    // Save data to JSON file
    const filePath = path.join(process.cwd(), 'data', 'activityLogs.json');
    await fs.writeFile(filePath, jsonData, 'utf-8');

    console.log('Activity logs data fetched and saved successfully');
  } catch (error) {
    console.error('Error fetching or saving activity logs:', error);
  }
}

// Run the function
fetchAndSaveActivityLogs(); 