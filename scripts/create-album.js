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

async function createAlbum() {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    console.error('\nError: Missing environment variables GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GOOGLE_REFRESH_TOKEN\n');
    process.exit(1);
  }

  try {
    const accessToken = await getAccessToken();
    console.log('Creating new album via Google Photos API...');

    const response = await fetch('https://photoslibrary.googleapis.com/v1/albums', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        album: { title: 'Keep It Greasy Website Gallery' }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to create album: ${response.statusText} - ${errText}`);
    }

    const album = await response.json();
    console.log('\n================================================================');
    console.log('🎉 ALBUM CREATED SUCCESSFULLY!');
    console.log('================================================================');
    console.log(`Album Name:  ${album.title}`);
    console.log(`NEW Album ID: ${album.id}`);
    console.log(`Web Link:     ${album.productUrl}`);
    console.log('================================================================\n');
    console.log('1. Click the "Web Link" above to open the album in your browser.');
    console.log('2. Add the photos you want on the website to this album.');
    console.log('3. Copy the "NEW Album ID" and save it as GOOGLE_ALBUM_ID in GitHub Secrets.');
    console.log('4. Run the workflow again!');

  } catch (error) {
    console.error('Failed to create album:', error.message);
  }
}

createAlbum();
