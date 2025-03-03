import { NextResponse } from 'next/server';

export const maxDuration = 60; // Maximum duration for hobby plan

async function triggerGitHubAction(token: string, owner: string, repo: string, workflow_id: string) {
  console.log(`[GitHub Action] Attempting to trigger workflow ${workflow_id} for ${owner}/${repo}`);
  
  const response = await fetch(
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
    }
  );

  if (!response.ok) {
    console.error(`[GitHub Action] Failed with status: ${response.status} - ${response.statusText}`);
    throw new Error(`Failed to trigger GitHub action: ${response.statusText}`);
  }

  console.log('[GitHub Action] Successfully triggered workflow');
  return response;
}

export async function POST() {
  console.log('[GitHub] Starting GitHub Action trigger...');
  
  try {
    // Check if required environment variables are present
    const requiredVars = {
      GITHUB_TOKEN: process.env.GITHUB_TOKEN,
      GITHUB_OWNER: process.env.GITHUB_OWNER,
      GITHUB_REPO: process.env.GITHUB_REPO,
      GITHUB_WORKFLOW_ID: process.env.GITHUB_WORKFLOW_ID,
    };

    // Check for missing variables
    const missingVars = Object.entries(requiredVars)
      .filter(([_, value]) => !value)
      .map(([name]) => name);

    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Trigger the GitHub Action
    await triggerGitHubAction(
      process.env.GITHUB_TOKEN as string,
      process.env.GITHUB_OWNER as string,
      process.env.GITHUB_REPO as string,
      process.env.GITHUB_WORKFLOW_ID as string
    );

    console.log('[GitHub] Successfully triggered GitHub Action');
    return NextResponse.json({ 
      success: true, 
      message: 'GitHub Action triggered successfully' 
    });

  } catch (error) {
    console.error('[GitHub] Error:', error);
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