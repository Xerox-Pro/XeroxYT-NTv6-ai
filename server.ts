import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Innertube } from 'youtubei.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  let yt: Innertube | null = null;
  
  async function getYT() {
    if (!yt) {
      yt = await Innertube.create({
        lang: 'ja',
        location: 'JP'
      });
    }
    return yt;
  }

  // API Route: Search with Filters
  app.get("/api/search", async (req, res) => {
    try {
      let query = req.query.q as string || "急上昇 日本";
      const sortBy = req.query.sort as string || "relevance";
      const duration = req.query.duration as string;
      const uploadDate = req.query.date as string;

      if (query === 'all') query = "日本 人気";
      if (query === 'trending') query = "急上昇 日本";
      
      const yt = await getYT();

      const results = await yt.search(query, { type: 'video' });
      
      const vids = results.videos.filter((v: any) => v.type === 'Video').map((v: any) => ({
        id: v.id,
        title: v.title.toString(),
        thumbnail: v.thumbnails?.[0]?.url || v.thumbnail?.[0]?.url || "",
        channelName: v.author?.name || "Unknown",
        channelAvatar: v.author?.thumbnails?.[0]?.url || "https://ui-avatars.com/api/?name=YT",
        views: v.short_view_count?.toString() || v.views?.toString() || "Unknown",
        postedAt: v.published?.toString() || "Recently",
        duration: v.duration?.toString() || "0:00",
        description: v.description?.toString() || "",
        isVerified: v.author?.is_verified || false
      }));

      const shorts = (results?.videos || []).filter((v: any) => v.duration?.seconds < 60 || v.is_short).map((v: any) => ({
        id: v.id,
        title: v.title?.toString() || "",
        thumbnail: v.thumbnails?.[0]?.url || v.thumbnail?.[0]?.url || "",
        channelName: v.author?.name || "Unknown",
        views: v.short_view_count?.toString() || v.views?.toString() || "Unknown"
      }));

      res.json({
        videos: vids,
        shorts: shorts,
        continuation: (results as any).continuation_token || null
      });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Failed to fetch search results" });
    }
  });

  // API Route: Recommendations based on history keywords
  app.get("/api/recommendations", async (req, res) => {
    try {
      const keywords = req.query.keywords as string || "";
      const yt = await getYT();
      
      // Simple strategy: search using the combined keywords
      const results = await yt.search(keywords || "日本 トレンド");
      
      const vids = results.videos.filter((v: any) => v.type === 'Video').map((v: any) => ({
        id: v.id,
        title: v.title.toString(),
        thumbnail: v.thumbnails?.[0]?.url || v.thumbnail?.[0]?.url || "",
        channelName: v.author?.name || "Unknown",
        channelAvatar: v.author?.thumbnails?.[0]?.url || "https://ui-avatars.com/api/?name=YT",
        views: v.short_view_count?.toString() || v.views?.toString() || "Unknown",
        postedAt: v.published?.toString() || "Recently",
        duration: v.duration?.toString() || "0:00",
        description: v.description?.toString() || "",
        isVerified: v.author?.is_verified || false
      }));

      res.json(vids);
    } catch (error) {
      console.error("Recommendations error:", error);
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });

  // API Route: Load More
  app.get("/api/search/more", async (req, res) => {
    try {
      const token = req.query.token as string;
      if (!token) return res.status(400).json({ error: "Missing token" });
      
      const yt = await getYT();
      const results = await (yt as any).getContinuation(token);
      
      const vids = results.videos.filter((v: any) => v.type === 'Video').map((v: any) => ({
        id: v.id,
        title: v.title.toString(),
        thumbnail: v.thumbnails?.[0]?.url || v.thumbnail?.[0]?.url || "",
        channelName: v.author?.name || "Unknown",
        channelAvatar: v.author?.thumbnails?.[0]?.url || "https://ui-avatars.com/api/?name=YT",
        views: v.short_view_count?.toString() || v.views?.toString() || "Unknown",
        postedAt: v.published?.toString() || "Recently",
        duration: v.duration?.toString() || "0:00",
        description: v.description?.toString() || "",
        isVerified: v.author?.is_verified || false
      }));

      const shorts = (results?.videos || []).filter((v: any) => v.duration?.seconds < 60 || v.is_short).map((v: any) => ({
        id: v.id,
        title: v.title?.toString() || "",
        thumbnail: v.thumbnails?.[0]?.url || v.thumbnail?.[0]?.url || "",
        channelName: v.author?.name || "Unknown",
        views: v.short_view_count?.toString() || v.views?.toString() || "Unknown"
      }));

      res.json({
        videos: vids,
        shorts: shorts,
        continuation: (results as any).continuation_token || null
      });
    } catch (error) {
      console.error("Load more error:", error);
      res.status(500).json({ error: "Failed to load more videos" });
    }
  });

  // API Route: Video Details
  app.get("/api/video/:id", async (req, res) => {
    try {
      const yt = await getYT();
      const info = await yt.getInfo(req.params.id);
      
      const video = {
        id: info.basic_info.id,
        title: info.basic_info.title,
        thumbnail: info.basic_info.thumbnail?.[0]?.url,
        channelName: info.basic_info.author,
        channelAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(info.basic_info.author || "YT")}`, 
        views: info.basic_info.view_count?.toString() || "Unknown",
        postedAt: "Recently",
        duration: info.basic_info.duration?.toString() || "0:00",
        description: info.basic_info.short_description || "",
        likes: (info as any).primary_info?.video_actions?.entries?.[0]?.video_actions?.entries?.[0]?.default_text || "12K",
        subscribers: (info as any).secondary_info?.owner?.subscriber_count?.toString() || "2.4M",
      };

      res.json(video);
    } catch (error) {
      console.error("Video error:", error);
      res.status(500).json({ error: "Failed to fetch video details" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
