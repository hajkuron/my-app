require('dotenv').config(); // Add this line at the top of the file

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Add this check
if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or key is missing. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchAndSaveData() {
  try {
    // Fetch data from Supabase with date filter
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .gte('date', '2024-09-10')
      .not('calendar_name', 'eq', 'jonkuhar11@gmail.com')  // Filter out jonkuhar11@gmail.com calendar
      .not('summary', 'eq', 'hanc');  // Filter out events with summary 'hanc'

    if (error) {
      throw error;
    }

    // Convert data to JSON string
    const jsonData = JSON.stringify(data, null, 2);

    // Save data to JSON file
    const filePath = path.join(process.cwd(), 'data', 'calendarEvents.json');
    await fs.writeFile(filePath, jsonData, 'utf-8');

    console.log(`Data fetched and saved successfully (filtered events from 28.10.2024)`);
  } catch (error) {
    console.error('Error fetching or saving data:', error);
  }
}

// Run the function
fetchAndSaveData();
