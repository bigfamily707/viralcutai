import express from 'express';
import cors from 'cors';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const OUTPUT_DIR = path.join(__dirname, 'public', 'generated');

// Ensure directories exist
[UPLOAD_DIR, OUTPUT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/generated', express.static(OUTPUT_DIR));

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${uuidv4()}-${file.originalname}`)
});
const upload = multer({ storage });

/**
 * 1. Upload Route
 */
app.post('/api/upload', upload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({
    message: 'File uploaded successfully',
    filename: req.file.filename,
    path: req.file.path,
    type: 'local'
  });
});

/**
 * 2. Import URL Route
 */
app.post('/api/import-url', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    if (ytdl.validateURL(url)) {
      const info = await ytdl.getBasicInfo(url);
      res.json({ 
        filename: url, 
        path: url, 
        type: 'youtube',
        metadata: { title: info.videoDetails.title }
      });
    } else {
      res.json({ filename: url, path: url, type: 'url' });
    }
  } catch (err) {
    console.error("Import Error:", err);
    res.status(500).json({ error: 'Failed to access video URL' });
  }
});

/**
 * 3. Process Clips Route - Optimized for Speed
 */
app.post('/api/process-clips', async (req, res) => {
  const { sourceFilename, clips, aspectRatio } = req.body;
  
  const isUrl = sourceFilename.startsWith('http');
  const sourcePath = isUrl ? sourceFilename : path.join(UPLOAD_DIR, sourceFilename);

  if (!isUrl && !fs.existsSync(sourcePath)) {
    return res.status(404).json({ error: 'Source file not found' });
  }

  const processedClips = [];
  let completed = 0;
  let hasError = false;

  console.log(`Processing ${clips.length} clips via ${isUrl ? 'STREAMING' : 'LOCAL FILE'}`);

  // Resolve Stream URL
  let ffmpegInput = sourcePath;
  if (isUrl && ytdl.validateURL(sourcePath)) {
      try {
          const info = await ytdl.getInfo(sourcePath);
          // Try to get 360p (itag 18) for speed, fallback to any audio/video combo
          let format;
          try {
            format = ytdl.chooseFormat(info.formats, { quality: '18' });
          } catch (e) {
            format = ytdl.filterFormats(info.formats, 'audioandvideo')[0];
          }
          
          if (format && format.url) {
              ffmpegInput = format.url;
              console.log("Resolved direct stream URL.");
          }
      } catch (e) {
          console.error("Stream resolution failed, falling back to direct URL:", e.message);
      }
  }

  clips.forEach((clip) => {
    const outputFilename = `clip-${clip.id}-${Date.now()}.mp4`;
    const outputPath = path.join(OUTPUT_DIR, outputFilename);
    const duration = clip.endTime - clip.startTime;

    let command = ffmpeg();

    // INPUT OPTIONS
    const inputOptions = [
        '-ss', String(clip.startTime), // Fast Seek
    ];

    // For streams, reduce probe time to start instantly
    if (isUrl) {
        inputOptions.push('-analyzeduration', '0');
        inputOptions.push('-probesize', '32');
    }

    command
      .input(ffmpegInput)
      .inputOptions(inputOptions);

    // OUTPUT OPTIONS
    // Removed '-movflags +faststart' because it requires a second pass (slow!)
    command
      .outputOptions([
        '-t', String(duration),
        '-preset', 'ultrafast', // Maximum encoding speed
        '-crf', '30',           // Lower quality for fast previews
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-b:a', '96k',          // Lower audio bitrate
        '-ac', '1',             // Mono audio is faster
        '-pix_fmt', 'yuv420p'
      ]);

    // Apply Crop
    if (aspectRatio === '9:16') {
        command.videoFilters('crop=ih*(9/16):ih:(iw-ow)/2:0');
    } else if (aspectRatio === '1:1') {
        command.videoFilters('crop=ih:ih:(iw-ow)/2:0');
    }

    command
      .output(outputPath)
      .on('end', () => {
        if (hasError) return;
        
        console.log(`Clip ${clip.id} generated.`);
        processedClips.push({
          ...clip,
          videoUrl: `http://localhost:3001/generated/${outputFilename}`,
          thumbnailUrl: `https://picsum.photos/300/533?random=${clip.id}` 
        });

        completed++;
        if (completed === clips.length) {
          const sorted = processedClips.sort((a,b) => parseInt(a.id) - parseInt(b.id));
          res.json({ clips: sorted });
        }
      })
      .on('error', (err) => {
        console.error(`Clip ${clip.id} error:`, err.message);
        if (!hasError) {
          hasError = true;
          res.status(500).json({ error: 'Processing failed' });
        }
      })
      .run();
  });
});

app.listen(PORT, () => {
  console.log(`ViralCut Backend running on http://localhost:${PORT}`);
});