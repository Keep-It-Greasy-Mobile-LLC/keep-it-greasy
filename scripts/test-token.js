const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

async function testToken() {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    console.error('Error: Missing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GOOGLE_REFRESH_TOKEN');
    process.exit(1);
  }

  try {
    console.log('Refreshing token to get an access token...');
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: REFRESH_TOKEN,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Refresh failed: ${await tokenResponse.text()}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    console.log('Access token acquired successfully.');

    console.log('Checking token info / granted scopes...');
    const infoResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`);
    if (!infoResponse.ok) {
      throw new Error(`Tokeninfo failed: ${await infoResponse.text()}`);
    }

    const infoData = await infoResponse.json();
    console.log('\n=========================================');
    console.log('TOKEN INFO:');
    console.log(`Audience: ${infoData.aud}`);
    console.log(`Granted Scopes: \n${infoData.scope}`);
    console.log('=========================================\n');

    if (!infoData.scope || !infoData.scope.includes('photoslibrary')) {
      console.log('❌ CRITICAL: The "photoslibrary" scope is MISSING from your granted permissions.');
      console.log('Please ensure you checked the box next to Google Photos during sign-in.');
    } else {
      console.log('✅ SUCCESS: The "photoslibrary" scope is present in the token!');
      console.log('If it still fails, double-check that the "Google Photos Library API" is enabled in your Google Cloud Console.');
    }

  } catch (error) {
    console.error('Error testing token:', error.message);
  }
}

testToken();
