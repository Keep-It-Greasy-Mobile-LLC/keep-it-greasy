import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GALLERY_DIR = path.join(__dirname, '../public/assets/images/gallery');
const INDEX_FILE = path.join(__dirname, '../src/gallery-images.json');

// Configuration from environment variables
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const ALBUM_ID = process.env.GOOGLE_ALBUM_ID;

async function getAccessToken() {
  console.log('Refreshing access token...');
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

async function fetchAlbumPhotos(accessToken) {
  console.log('Fetching media items from album...');
  let photos = [];
  let nextPageToken = '';

  do {
    const response = await fetch('https://photoslibrary.googleapis.com/v1/mediaItems:search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        albumId: ALBUM_ID,
        pageSize: 50,
        pageToken: nextPageToken || undefined,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to search media items: ${response.statusText} - ${errText}`);
    }

    const data = await response.json();
    if (data.mediaItems) {
      photos = photos.concat(data.mediaItems);
    }
    nextPageToken = data.nextPageToken;
  } while (nextPageToken);

  // Filter only images
  return photos.filter(item => item.mimeType && item.mimeType.startsWith('image/'));
}

async function downloadImage(url, destPath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.promises.writeFile(destPath, buffer);
}

async function sync() {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !ALBUM_ID) {
    console.error('Error: Missing required environment variables GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, or GOOGLE_ALBUM_ID');
    process.exit(1);
  }

  try {
    // Ensure gallery directory exists
    if (!fs.existsSync(GALLERY_DIR)) {
      fs.mkdirSync(GALLERY_DIR, { recursive: true });
    }

    const accessToken = await getAccessToken();
    const photos = await fetchAlbumPhotos(accessToken);
    console.log(`Found ${photos.length} images in Google Photos album.`);

    const localImages = [];

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const ext = photo.mimeType === 'image/png' ? 'png' : 'jpg';
      const filename = `photo-${photo.id.substring(0, 10)}-${i}.${ext}`;
      const destPath = path.join(GALLERY_DIR, filename);
      const relativePath = `/assets/images/gallery/${filename}`;

      console.log(`Downloading [${i + 1}/${photos.length}] to ${filename}...`);
      // Google Photos baseUrls need "=w2048-h2048" appended to request size
      const downloadUrl = `${photo.baseUrl}=w2048-h2048`;
      
      try {
        await downloadImage(downloadUrl, destPath);
        localImages.push({
          src: relativePath,
          alt: photo.filename || `Gallery image ${i + 1}`
        });
      } catch (err) {
        console.error(`Failed to download ${photo.id}:`, err.message);
      }
    }

    // Clean up old files in gallery directory that are not in the new sync
    const currentFiles = fs.readdirSync(GALLERY_DIR);
    const downloadedFilenames = localImages.map(img => path.basename(img.src));
    for (const file of currentFiles) {
      if (!downloadedFilenames.includes(file)) {
        console.log(`Removing old file: ${file}`);
        fs.unlinkSync(path.join(GALLERY_DIR, file));
      }
    }

    // Write index file
    fs.writeFileSync(INDEX_FILE, JSON.stringify(localImages, null, 2));
    console.log(`Sync complete! Wrote ${localImages.length} images to ${INDEX_FILE}`);
  } catch (error) {
    console.error('Sync failed:', error);
    process.exit(1);
  }
}

sync();
