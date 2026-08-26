const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

async function getAccessToken() {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to refresh access token: ${response.statusText} - ${errText}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function listAlbums() {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    console.error('\nError: Missing environment variables GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GOOGLE_REFRESH_TOKEN');
    console.log('Please make sure these are set in your environment or passed to the script.\n');
    process.exit(1);
  }

  try {
    const accessToken = await getAccessToken();
    console.log('Fetching Google Photos albums...');

    const response = await fetch('https://photoslibrary.googleapis.com/v1/albums?pageSize=50', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to list albums: ${response.statusText} - ${errText}`);
    }

    const data = await response.json();
    if (!data.albums || data.albums.length === 0) {
      console.log('\nNo albums found in this Google Photos account.');
      return;
    }

    console.log('\n================================================================');
    console.log('GOOGLE PHOTOS ALBUMS:');
    console.log('================================================================');
    data.albums.forEach(album => {
      console.log(`Album Name: ${album.title}`);
      console.log(`Album ID:   ${album.id}`);
      console.log('----------------------------------------------------------------');
    });
  } catch (error) {
    console.error('Failed to list albums:', error.message);
  }
}

listAlbums();
