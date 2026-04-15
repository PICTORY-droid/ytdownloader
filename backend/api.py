import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from yt_dlp import YoutubeDL
from starlette.responses import FileResponse
from typing import Optional

router = APIRouter()

class VideoURL(BaseModel):
    url: str

class DownloadRequest(BaseModel):
    url: str
    filename: Optional[str] = None

@router.post("/info")
async def get_video_info(video_url: VideoURL):
    try:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'skip_download': True,
        }
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url.url, download=False)
            return {
                "title": info.get('title'),
                "thumbnail": info.get('thumbnail'),
                "duration": info.get('duration'),
                "uploader": info.get('uploader'),
                "id": info.get('id')
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not get video info: {e}")

@router.post("/download")
async def download_video(request: DownloadRequest):
    try:
        # Ensure download directory exists
        download_dir = "./downloads"
        os.makedirs(download_dir, exist_ok=True)

        # Define output template for yt-dlp. It will save to the 'downloads' directory.
        # The filename will be the video title + .mp4
        output_template = os.path.join(download_dir, '%(title)s.%(ext)s')
        
        ydl_opts = {
            'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]',
            'outtmpl': output_template,
            'merge_output_format': 'mp4',
            'noplaylist': True,
        }

        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(request.url, download=True)
            filename = ydl.prepare_filename(info)
            
            # After download, the file will be in the 'downloads' directory
            # We need to return the path to the downloaded file
            downloaded_file_path = filename

            # For Vercel deployment, files downloaded to /tmp are accessible.
            # We need to consider how to serve this file back to the user.
            # For now, we'll return the path and let the frontend handle it.
            # A better approach for Vercel would be to upload to cloud storage
            # and return a pre-signed URL, but that's out of scope for now.

            # Ensure the file actually exists before attempting to send
            if not os.path.exists(downloaded_file_path):
                raise HTTPException(status_code=500, detail="Downloaded file not found.")

            # Return the file as a response
            return FileResponse(path=downloaded_file_path, media_type="video/mp4", filename=os.path.basename(downloaded_file_path))

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not download video: {e}")
