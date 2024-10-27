import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchAndSaveData() {
  try {
    // Fetch data from Supabase
    const { data, error } = await supabase
      .from('task_distribution')
      .select('*');

    if (error) {
      throw error;
    }

    // Convert data to JSON string
    const jsonData = JSON.stringify(data, null, 2);

    // Save data to JSON file
    const filePath = path.join(process.cwd(), 'data', 'taskDistribution.json');
    await fs.writeFile(filePath, jsonData, 'utf-8');

    console.log('Data fetched and saved successfully');
  } catch (error) {
    console.error('Error fetching or saving data:', error);
  }
}

// Run the function
fetchAndSaveData();
