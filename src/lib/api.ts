import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'; // Default to localhost if not set

export const getVideoInfo = async (url: string) => {
  try {
    const response = await axios.post(`${API_URL}/info`, { url });
    return response.data;
  } catch (error: any) {
    console.error("Error fetching video info:", error);
    throw new Error(error.response?.data?.detail || error.message);
  }
};

export const downloadVideo = async (url: string) => {
  try {
    // For Vercel, we might need to adjust how downloads are handled.
    // For now, we assume the backend returns a file response directly.
    const response = await axios.post(`${API_URL}/download`, { url }, {
      responseType: 'blob' // Important for handling file downloads
    });
    return response.data; // This will be a Blob object
  } catch (error: any) {
    console.error("Error downloading video:", error);
    throw new Error(error.response?.data?.detail || error.message);
  }
};
