import express from "express";
import { getPlaylists, getVideos } from "../controllers/courseController.js";

const router = express.Router();

router.get("/playlists", getPlaylists);
router.get("/videos/:id", getVideos);

export default router;