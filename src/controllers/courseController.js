import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

export const getPlaylists = async (req, res) => {
  console.log("API_KEY", API_KEY);
  console.log("CHANNEL_ID", CHANNEL_ID);

  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=${CHANNEL_ID}&key=${API_KEY}`
    );

    res.json({
      success: true,
      message: "All playlists",
      data: response.data.items,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch playlists", error });
  }
};

export const getVideos = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${id}&key=${API_KEY}`
    );

    res.json({
      success: true,
      message: "All playlist videos",
      data: response.data.items,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch playlist videos" });
  }
};