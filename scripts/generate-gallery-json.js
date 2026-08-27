import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GALLERY_DIR = path.join(__dirname, '../public/assets/images/gallery');
const INDEX_FILE = path.join(__dirname, '../src/gallery-images.json');

// Ensure gallery directory exists
if (!fs.existsSync(GALLERY_DIR)) {
  fs.mkdirSync(GALLERY_DIR, { recursive: true });
}

// Read all image files in GALLERY_DIR
const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'];
const files = fs.readdirSync(GALLERY_DIR)
  .filter(file => validExtensions.includes(path.extname(file).toLowerCase()))
  .sort();

let galleryData = [];

if (files.length > 0) {
  galleryData = files.map((file, idx) => ({
    src: `/assets/images/gallery/${file}`,
    alt: `Keep It Greasy Work Sample ${idx + 1}`
  }));
} else {
  // Fallback to starter images if no synced photos yet
  galleryData = [
    { src: '/assets/images/work-1.jpg', alt: 'Work Sample 1' },
    { src: '/assets/images/work-2.jpg', alt: 'Work Sample 2' },
    { src: '/assets/images/work-3.png', alt: 'Work Sample 3' },
    { src: '/assets/images/work-4.jpg', alt: 'Work Sample 4' },
    { src: '/assets/images/work-5.jpg', alt: 'Work Sample 5' }
  ];
}

fs.writeFileSync(INDEX_FILE, JSON.stringify(galleryData, null, 2));
console.log(`Updated gallery index: ${galleryData.length} images written to ${INDEX_FILE}`);
