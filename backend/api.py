import os
import re
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from yt_dlp import YoutubeDL
from starlette.responses import FileResponse
from typing import Optional

router = APIRouter()

PIPED_API = "https://pipedapi.kavin.rocks"

class VideoURL(BaseModel):
    url: str

class DownloadRequest(BaseModel):
    url: str
    filename: Optional[str] = None

def extract_video_id(url: str) -> str:
    patterns = [
        r'(?:v=|\/)([0-9A-Za-z_-]{11})',
        r'youtu\.be\/([0-9A-Za-z_-]{11})',
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
            response = await client.get(f"{PIPED_API}/streams/{video_id}")
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="영상 정보를 가져올 수 없습니다.")
            data = response.json()
            return {
                "title": data.get("title"),
                "thumbnail": data.get("thumbnailUrl"),
                "duration": data.get("duration"),
                "uploader": data.get("uploader"),
                "id": video_id
            }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
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
