import { internalAction } from '../../_generated/server';

/**
 * Scheduled action to discover new casinos via AI
 * This is triggered by a cron job every 12 hours
 */
export const scheduledCasinoDiscoveryHandler = async () => {
  const startTime = Date.now();

  try {
    console.log('🔍 Starting scheduled casino discovery...');

    // Call the API route that handles casino discovery
    const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${apiUrl}/api/casinos/research`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const result = await response.json();
    const duration = Date.now() - startTime;

    if (result.ok) {
      console.log('✅ Casino discovery completed:', {
        saved: result.result.saved,
        skipped: result.result.skipped,
        duplicates: result.result.duplicates.length,
        duration: `${duration}ms`,
      });

      return {
        success: true,
        saved: result.result.saved,
        skipped: result.result.skipped,
        duplicates: result.result.duplicates.length,
        duration,
      };
    } else {
      console.error('❌ Casino discovery failed:', result.error);
      return {
        success: false,
        error: result.error,
        duration,
      };
    }
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('❌ Scheduled casino discovery error:', error);

    return {
      success: false,
      error: error.message || 'Unknown error',
      duration,
    };
  }
};

export const scheduledCasinoDiscoveryArgs = {};
