import { NextResponse } from 'next/server';

export const maxDuration = 60; // Maximum duration for hobby plan

async function fetchWithTimeout(url: string, options: RequestInit, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function POST() {
  console.log('[Custom API] Starting custom refresh...');
  
  try {
    // Check if CUSTOM_API_URL is set
    if (!process.env.CUSTOM_API_URL) {
      throw new Error('CUSTOM_API_URL environment variable is not set');
    }

    // Make the custom API call
    console.log('[Custom API] Calling custom URL...');
    const customUrlResponse = await fetchWithTimeout(
      process.env.CUSTOM_API_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      },
      59000 // 50 second timeout (within 60s Vercel limit)
    );
    
    if (!customUrlResponse.ok) {
      console.error('[Custom API] Failed with status:', customUrlResponse.status);
      throw new Error(`Failed to fetch data from custom URL: ${customUrlResponse.statusText}`);
    }

    console.log('[Custom API] Successfully completed');
    return NextResponse.json({ 
      success: true, 
      message: 'Custom API refresh completed' 
    });

  } catch (error) {
    console.error('[Custom API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 