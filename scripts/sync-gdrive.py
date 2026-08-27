import os
import sys
import gdown

folder_id = os.environ.get("GDRIVE_FOLDER_ID")
if not folder_id:
    print("Error: GDRIVE_FOLDER_ID environment variable is missing.")
    sys.exit(1)

# Extract folder ID cleanly if a full URL was passed
if "folders/" in folder_id:
    folder_id = folder_id.split("folders/")[1].split("?")[0]

folder_url = f"https://drive.google.com/drive/folders/{folder_id}"
output_dir = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "public", "assets", "images", "gallery"))
os.makedirs(output_dir, exist_ok=True)

print(f"Syncing Google Drive folder: {folder_id}")
print(f"Destination: {output_dir}")

try:
    gdown.download_folder(
        url=folder_url,
        output=output_dir,
        quiet=False,
        use_cookies=False,
        remaining_ok=True
    )
    print("Google Drive sync finished successfully.")
except Exception as e:
    print(f"Error downloading from Google Drive: {e}")
    sys.exit(1)
