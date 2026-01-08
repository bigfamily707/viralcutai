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
app.use('/generated', express.static(OUTPUT_DIR)); // Serve generated clips

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${uuidv4()}-${file.originalname}`)
});
const upload = multer({ storage });

/**
 * 1. Upload Route - Handles local file uploads
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
 * 2. Import URL Route - Handles YouTube/Direct URLs
 */
app.post('/api/import-url', async (req, res) => {
  const { url } = req.body;
  
  if (!url) return res.status(400).json({ error: 'URL is required' });

  const filename = `${uuidv4()}.mp4`;
  const filePath = path.join(UPLOAD_DIR, filename);

  try {
    if (ytdl.validateURL(url)) {
      // Handle YouTube
      console.log(`Downloading YouTube video: ${url}`);
      // OPTIMIZATION: Use '18' (360p MP4) or 'lowest' audioandvideo to avoid expensive merging
      // This is much faster for a "Viral Short" tool where 1080p isn't always strictly required for the source if speed is key
      ytdl(url, { 
        quality: '18', 
        filter: 'audioandvideo' 
      }) 
        .pipe(fs.createWriteStream(filePath))
        .on('finish', () => {
          res.json({ filename, path: filePath, type: 'youtube' });
        })
        .on('error', (err) => {
          console.error("YTDL Error:", err);
          // Fallback if specific format fails
          ytdl(url, { quality: 'lowest' })
            .pipe(fs.createWriteStream(filePath))
            .on('finish', () => res.json({ filename, path: filePath, type: 'youtube' }))
            .on('error', (e) => res.status(500).json({ error: 'Failed to download YouTube video' }));
        });
    } else {
      // Handle Direct URL (using FFmpeg to download/convert)
      console.log(`Downloading Direct URL: ${url}`);
      ffmpeg(url)
        .inputOptions(['-re']) // Read at native framerate (sometimes helps with streams)
        .outputOptions(['-c copy']) // Try to copy stream first for speed
        .output(filePath)
        .on('end', () => {
          res.json({ filename, path: filePath, type: 'url' });
        })
        .on('error', (err) => {
          console.error("Direct Download Error, retrying with re-encode:", err);
          // Retry without copy if codec is incompatible
          ffmpeg(url)
            .outputOptions(['-preset ultrafast'])
            .output(filePath)
            .on('end', () => res.json({ filename, path: filePath, type: 'url' }))
            .on('error', (e) => res.status(500).json({ error: 'Failed to download direct video' }))
            .run();
        })
        .run();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 3. Process Clips Route - Trims and crops video
 */
app.post('/api/process-clips', async (req, res) => {
  const { sourceFilename, clips, aspectRatio } = req.body;
  const sourcePath = path.join(UPLOAD_DIR, sourceFilename);

  if (!fs.existsSync(sourcePath)) {
    return res.status(404).json({ error: 'Source file not found' });
  }

  const processedClips = [];
  let completed = 0;
  let hasError = false;

  console.log(`Processing ${clips.length} clips from ${sourceFilename}`);

  // Limit concurrency to prevent CPU choking, though for 3 clips it's usually fine.
  // We process them all at once for speed.
  clips.forEach((clip) => {
    const outputFilename = `clip-${clip.id}-${Date.now()}.mp4`;
    const outputPath = path.join(OUTPUT_DIR, outputFilename);

    // Build FFmpeg command
    let command = ffmpeg(sourcePath)
      .setStartTime(clip.startTime)
      .setDuration(clip.endTime - clip.startTime)
      .output(outputPath)
      // SPEED OPTIMIZATIONS
      .outputOptions([
        '-preset ultrafast', // Trade compression efficiency for max speed
        '-crf 28',           // Slightly lower quality is fine for viral shorts/previews
        '-tune zerolatency', // Optimize for fast streaming/encoding
        '-movflags +faststart'
      ]);

    // Apply Crop for 9:16 (Vertical) if requested
    // Logic: Keep height, calculate width = height * (9/16), center horizontally
    if (aspectRatio === '9:16') {
        command.videoFilters('crop=ih*(9/16):ih:(iw-ow)/2:0');
    } else if (aspectRatio === '1:1') {
        command.videoFilters('crop=ih:ih:(iw-ow)/2:0');
    }

    command
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
          res.json({ clips: processedClips });
        }
      })
      .on('error', (err) => {
        console.error(`Error processing clip ${clip.id}:`, err);
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