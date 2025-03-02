import { NextResponse } from 'next/server';

async function triggerGitHubAction(token: string, owner: string, repo: string, workflow_id: string) {
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
        ref: 'main' // or whatever branch you want to trigger the action on
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to trigger GitHub action: ${response.statusText}`);
  }

  return response;
}

export async function POST() {
  try {
    // 1. Call your custom URL first with POST method
    const customUrlResponse = await fetch(process.env.CUSTOM_API_URL as string, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!customUrlResponse.ok) {
      throw new Error('Failed to fetch data from custom URL');
    }

    // 2. Trigger GitHub Action
    await triggerGitHubAction(
      process.env.GITHUB_TOKEN as string,
      process.env.GITHUB_OWNER as string,
      process.env.GITHUB_REPO as string,
      process.env.GITHUB_WORKFLOW_ID as string
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Refresh operations completed successfully' 
    });

  } catch (error) {
    console.error('Error in refresh operation:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
} 