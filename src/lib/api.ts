import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const MAX_RETRIES = 10;
const RETRY_DELAY = 6000; // 6초마다 재시도

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getVideoInfo = async (
  url: string,
  onWaiting?: (seconds: number) => void
) => {
  let waited = 0;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const response = await axios.post(`${API_URL}/info`, { url }, { timeout: 10000 });
      return response.data;
    } catch (error: any) {
      const isServerDown =
        error.code === 'ECONNABORTED' ||
        error.code === 'ERR_NETWORK' ||
        error?.response?.status === 502 ||
        error?.response?.status === 503 ||
        !error.response;

      if (isServerDown && i < MAX_RETRIES - 1) {
        waited += RETRY_DELAY / 1000;
        if (onWaiting) onWaiting(waited);
        await sleep(RETRY_DELAY);
        continue;
      }
      throw new Error(error.response?.data?.detail || error.message);
    }
  }
  throw new Error('서버가 응답하지 않습니다. 잠시 후 다시 시도해주세요.');
};

export const downloadVideo = async (url: string) => {
  try {
    const response = await axios.post(
      `${API_URL}/download`,
      { url },
      { timeout: 300000 }
    );
    return response.data.download_url;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || error.message);
  }
};
