# 🎥 HOMAATRI — VIDEO TRANSCODING & HLS STREAMING PIPELINE SPECIFICATION

**Document Version:** 1.0  
**Target Surface:** Community Stories Reels & Homemaker Vlogs (`/order`, `/chef/studio`).  
**Primary Tech Stack:** FFmpeg Worker, GCP Cloud Storage Buckets, GCP Cloud CDN / Cloudflare.

---

## 1. Video Processing Workflow Architecture

```text
[ Homemaker Uploads Reel Video (Gallery MP4 / MOV) ]
                          │
                          ▼
        [ FastAPI POST /api/v1/reels/upload ]
                          │
                          ▼ (Asynchronous Background Worker / Celery)
        [ FFmpeg Video Processing Pipeline ]
        ├── Transcodes video to 720p H.264 MP4 (Fallback)
        ├── Generates HLS Adaptive Bitrate Playlist (.m3u8 + .ts segments)
        └── Extracts frame at 0.5s for HD JPEG Thumbnail (.jpg)
                          │
                          ▼
        [ Upload to GCP Cloud Storage Bucket (`homatri-media-prod`) ]
                          │
                          ▼
        [ Edge Caching via GCP Cloud CDN / Cloudflare ]
                          │
                          ▼
        [ Instant Zero-Buffering Mobile Video Playback ]
```

---

## 2. Media Specifications & FFmpeg Parameters

### A. Video Transcoding Targets:
- **Aspect Ratio**: 9:16 Vertical Video (Mobile First).
- **Max Upload Size**: 50 MB (Raw video input).
- **Duration Cap**: 15 to 60 seconds max.
- **Video Codec**: H.264 (AVC) Main Profile.
- **Audio Codec**: AAC-LC, 128 kbps stereo.
- **Video Bitrate**: 2.5 Mbps (Target 720p vertical resolution: 720x1280).

### B. FFmpeg Transcoding Command:

```bash
# Transcode MP4 to HLS Playlist (.m3u8 + 2-second .ts segments)
ffmpeg -i input_raw.mp4 \
  -vf "scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2" \
  -c:v libx264 -crf 23 -preset fast -g 60 -sc_threshold 0 \
  -c:a aac -b:a 128k -ac 2 \
  -hls_time 2 -hls_playlist_type vod \
  -hls_segment_filename "segment_%03d.ts" \
  index.m3u8

# Generate HD Thumbnail Image at 0.5s
ffmpeg -ss 00:00:00.500 -i input_raw.mp4 -vframes 1 -q:v 2 thumbnail.jpg
```

---

## 3. Storage Bucket Structure & CDN Caching Policy

### A. GCP Storage Bucket Paths:
- `gs://homatri-media-prod/reels/{chef_phone}/{reel_id}/index.m3u8`
- `gs://homatri-media-prod/reels/{chef_phone}/{reel_id}/segment_000.ts`
- `gs://homatri-media-prod/reels/{chef_phone}/{reel_id}/thumbnail.jpg`

### B. CDN Caching Headers:
- **Playlists (`.m3u8`)**: `Cache-Control: public, max-age=3600` (1 hour cache).
- **Video Segments (`.ts`)**: `Cache-Control: public, max-age=31536000, immutable` (1 year cache).
- **Thumbnails (`.jpg`)**: `Cache-Control: public, max-age=86400` (24 hours cache).
