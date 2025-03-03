import { NextResponse } from 'next/server';

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

async function triggerGitHubAction(token: string, owner: string, repo: string, workflow_id: string) {
  console.log(`[GitHub Action] Attempting to trigger workflow ${workflow_id} for ${owner}/${repo}`);
  
  try {
    const response = await fetchWithTimeout(
      `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow_id}/dispatches`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: 'main'
        })
      },
      10000 // 10 second timeout
    );

    if (!response.ok) {
      console.error(`[GitHub Action] Failed with status: ${response.status} - ${response.statusText}`);
      throw new Error(`Failed to trigger GitHub action: ${response.statusText}`);
    }

    console.log('[GitHub Action] Successfully triggered workflow');
    return response;
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      console.error('[GitHub Action] Request timed out');
      throw new Error('GitHub Action request timed out after 10 seconds');
    }
    throw error;
  }
}

export async function POST() {
  console.log('[Refresh] Starting refresh operation...');
  console.log('[Refresh] Running in environment:', process.env.VERCEL_ENV || 'local');
  
  try {
    // Log environment variables presence (not their values for security)
    const envVars = {
      CUSTOM_API_URL: !!process.env.CUSTOM_API_URL,
      GITHUB_TOKEN: !!process.env.GITHUB_TOKEN,
      GITHUB_OWNER: !!process.env.GITHUB_OWNER,
      GITHUB_REPO: !!process.env.GITHUB_REPO,
      GITHUB_WORKFLOW_ID: !!process.env.GITHUB_WORKFLOW_ID,
    };
    
    console.log('[Refresh] Environment variables check:', envVars);
    
    // Check if any required env vars are missing
    const missingVars = Object.entries(envVars)
      .filter(([_, exists]) => !exists)
      .map(([name]) => name);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // 1. Call your custom URL first with POST method
    console.log('[Custom API] Attempting to call custom API...');
    try {
      const customUrlResponse = await fetchWithTimeout(
        process.env.CUSTOM_API_URL as string,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        },
        10000 // 10 second timeout
      );
      
      if (!customUrlResponse.ok) {
        console.error('[Custom API] Failed with status:', customUrlResponse.status);
        throw new Error(`Failed to fetch data from custom URL: ${customUrlResponse.statusText}`);
      }

      console.log('[Custom API] Successfully called custom API');
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        console.error('[Custom API] Request timed out');
        throw new Error('Custom API request timed out after 10 seconds');
      }
      throw error;
    }

    // 2. Trigger GitHub Action
    console.log('[GitHub Action] Starting GitHub Action trigger...');
    await triggerGitHubAction(
      process.env.GITHUB_TOKEN as string,
      process.env.GITHUB_OWNER as string,
      process.env.GITHUB_REPO as string,
      process.env.GITHUB_WORKFLOW_ID as string
    );

    console.log('[Refresh] All operations completed successfully');
    return NextResponse.json({ 
      success: true, 
      message: 'Refresh operations completed successfully' 
    });

  } catch (error) {
    console.error('[Refresh] Error in refresh operation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[Refresh] Detailed error message:', errorMessage);
    
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