import os
import re
import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

YOUTUBE_API_KEY = os.environ.get("YOUTUBE_API_KEY")
RAPIDAPI_KEY = os.environ.get("RAPIDAPI_KEY")

class VideoURL(BaseModel):
    url: str

class DownloadRequest(BaseModel):
    url: str
    format: Optional[str] = "720"

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

def parse_duration(iso_duration: str) -> int:
    match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', iso_duration)
    if not match:
        return 0
    hours = int(match.group(1) or 0)
    minutes = int(match.group(2) or 0)
    seconds = int(match.group(3) or 0)
    return hours * 3600 + minutes * 60 + seconds

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
            duration_seconds = parse_duration(duration_iso)
            return {
                "title": snippet.get("title"),
                "thumbnail": snippet["thumbnails"].get("high", {}).get("url"),
                "duration": duration_seconds,
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
        video_id = extract_video_id(request.url)
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.get(
                "https://youtube-mp41.p.rapidapi.com/api/v1/download",
                params={
                    "id": video_id,
                    "format": request.format,
                    "audioQuality": "128",
                    "addInfo": "false"
                },
                headers={
                    "Content-Type": "application/json",
                    "x-rapidapi-host": "youtube-mp41.p.rapidapi.com",
                    "x-rapidapi-key": RAPIDAPI_KEY
                }
            )
            data = response.json()
            download_url = data.get("url") or data.get("downloadUrl") or data.get("link")
            if not download_url:
                raise HTTPException(status_code=500, detail=f"다운로드 링크를 가져올 수 없습니다: {data}")
            return RedirectResponse(url=download_url)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"다운로드 실패: {e}")
