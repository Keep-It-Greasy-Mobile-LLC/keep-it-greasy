# Image Upload Strategy: Google Photos Sync

The goal is to allow the user's brother to upload photos to the website easily, preferably using a **Google Photos Album**. Since the website is hosted on **GitHub Pages** (a static site), we cannot connect directly to Google Photos in real-time without exposing API keys or dealing with complex authentication.

**The Solution: "Nightly Sync" via GitHub Actions**

We can automate the process using a GitHub Action that runs on a schedule (e.g., every night) or can be triggered manually.

## The Workflow
1.  **Brother:** Takes a photo and adds it to a specific album (e.g., "Keep It Greasy Website") in his Google Photos app.
2.  **GitHub Action:** Wakes up (e.g., at 3 AM or when a button is clicked).
3.  **Script:**
    *   Authenticates with Google using a secure **Refresh Token** (stored in GitHub Secrets).
    *   Checks the album for new photos.
    *   **Downloads** the new photos to the website's `assets/images/gallery` folder.
    *   **Commits** the changes to the repository.
4.  **Deployment:** The commit triggers the existing "Deploy" workflow, updating the live site.

## Pros & Cons
*   **Pros:**
    *   **Zero friction for the user:** He just uses the Google Photos app he already knows.
    *   **Free & Static:** No database or paid hosting required. Images are served fast from GitHub.
    *   **Backup:** Photos are backed up in the repo.
*   **Cons:**
    *   **Not Instant:** Updates happen on schedule (or require a manual "Run Workflow" click).
    *   **Setup:** Requires creating a Google Cloud Project to get the API credentials (one-time setup).

## Implementation Steps

### 1. Google Cloud Setup (You/User)
*   Create a project in Google Cloud Console.
*   Enable **Google Photos Library API**.
*   Create OAuth Credentials.
*   Get a **Refresh Token** (I can provide a script to help generate this).

### 2. GitHub Secrets (You/User)
*   Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REFRESH_TOKEN` to GitHub Repository Secrets.

### 3. The Sync Script (Me)
*   Write a Node.js script (`scripts/sync-photos.js`) to:
    *   Fetch album media items.
    *   Download high-res images.
    *   Resize/Optimize them (optional but recommended).

### 4. The Workflow (Me)
*   Create `.github/workflows/sync-photos.yml` to run the script and commit changes.

## Alternative: Cloudinary Widget
If Google Cloud setup sounds too heavy, we can use **Cloudinary**.
*   **Workflow:** He visits `keep-it-greasy.com/upload` (password protected), drags photos in.
*   **Pros:** Instant.
*   **Cons:** Separate "admin" page to visit, not as native as Google Photos app.

**Recommendation:** Stick with **Google Photos Sync** if he wants the absolute easiest day-to-day experience.
