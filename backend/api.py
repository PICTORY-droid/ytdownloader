import os
import re
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from yt_dlp import YoutubeDL
from starlette.responses import FileResponse
from typing import Optional

router = APIRouter()

YOUTUBE_API_KEY = os.environ.get("YOUTUBE_API_KEY")

class VideoURL(BaseModel):
    url: str

class DownloadRequest(BaseModel):
    url: str
    filename: Optional[str] = None

def extract_video_id(url: str) -> str:
    patterns = [
        r'(?:youtube\.com\/watch\?v=)([0-9A-Za-z_-]{11})',
        r'(?:youtu\.be\/)([0-9A-Za-z_-]{11})',
        r'(?:youtube\.com\/embed\/)([0-9A-Za-z_-]{11})',
        r'(?:youtube\.com\/shorts\/)([0-9A-Za-z_-]{11})',
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    raise ValueError("유효한 유튜브 URL이 아닙니다.")

@router.post("/info")
async def get_video_info(video_url: VideoURL):
    try:
        video_id = extract_video_id(video_url.url)
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(
                "https://www.googleapis.com/youtube/v3/videos",
                params={
                    "part": "snippet,contentDetails",
                    "id": video_id,
                    "key": YOUTUBE_API_KEY
                }
            )
            data = response.json()
            if not data.get("items"):
                raise HTTPException(status_code=400, detail="영상을 찾을 수 없습니다.")
            item = data["items"][0]
            snippet = item["snippet"]
            duration_iso = item["contentDetails"]["duration"]
            return {
                "title": snippet.get("title"),
                "thumbnail": snippet["thumbnails"].get("high", {}).get("url"),
                "duration": duration_iso,
                "uploader": snippet.get("channelTitle"),
                "id": video_id
            }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"영상 정보를 불러올 수 없습니다: {e}")

@router.post("/download")
async def download_video(request: DownloadRequest):
    try:
        download_dir = "./downloads"
        os.makedirs(download_dir, exist_ok=True)
        output_template = os.path.join(download_dir, '%(title)s.%(ext)s')
        ydl_opts = {
            'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]',
            'outtmpl': output_template,
            'merge_output_format': 'mp4',
            'noplaylist': True,
            'extractor_args': {
                'youtube': {
                    'player_client': ['web_creator', 'ios'],
                }
            },
        }
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(request.url, download=True)
            filename = ydl.prepare_filename(info)
            if not os.path.exists(filename):
                raise HTTPException(status_code=500, detail="다운로드된 파일을 찾을 수 없습니다.")
            return FileResponse(path=filename, media_type="video/mp4", filename=os.path.basename(filename))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"다운로드 실패: {e}")
