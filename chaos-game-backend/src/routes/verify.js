const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffprobeInstaller = require('@ffprobe-installer/ffprobe');
const { verifyImage, generateJudgment } = require('../services/hfService');

// Configure ffmpeg to use static binaries
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only images (jpg, png, webp) and videos (mp4, mov, webm) are allowed'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Helper to extract multiple frames from video
const extractFrames = (videoPath, timestamps) => {
  return Promise.all(timestamps.map((ts, index) => {
    return new Promise((resolve, reject) => {
      const outputPath = `${videoPath}-frame-${index}.png`;
      ffmpeg(videoPath)
        .screenshots({
          timestamps: [ts],
          filename: path.basename(outputPath),
          folder: path.dirname(outputPath),
        })
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(err));
    });
  }));
};

router.post('/', upload.single('image'), async (req, res) => {
  const filePath = req.file ? req.file.path : null;
  let tempFramePaths = [];

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { taskLabel, taskText } = req.body;
    const isVideo = req.file.mimetype.startsWith('video/');
    
    console.log(`[Verify] Processing ${isVideo ? 'video' : 'photo'} for task: ${taskLabel}`);

    let pathsToVerify = [];

    if (isVideo) {
      // Get duration to pick timestamps
      const metadata = await new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, meta) => err ? reject(err) : resolve(meta));
      });
      const duration = metadata.format.duration || 1;
      const timestamps = [duration * 0.2, duration * 0.5, duration * 0.8];
      
      console.log(`[Verify] Extracting ${timestamps.length} frames at ${timestamps.map(t => t.toFixed(1)).join(', ')}s...`);
      tempFramePaths = await extractFrames(filePath, timestamps);
      pathsToVerify = tempFramePaths;
    } else {
      pathsToVerify = [filePath];
    }

    // AI Verification for all frames
    const results = await Promise.all(pathsToVerify.map(path => verifyImage(path, taskLabel)));
    
    // Majority Vote Logic
    const passedCount = results.filter(r => r.passed).length;
    const isApproved = isVideo ? (passedCount >= 2) : (passedCount >= 1);
    
    // Pick the most confident result for logging
    const bestResult = results.sort((a, b) => b.confidence - a.confidence)[0];

    // AI Judgment
    const judgment = await generateJudgment(taskText, isApproved);

    console.log(`[Verify] Results: ${passedCount}/${results.length} frames passed.`);
    console.log(`[Verify] Final Verdict: "${isApproved ? 'PASSED' : 'FAILED'}"`);
    console.log(`[Verify] Max Confidence: ${bestResult.confidence.toFixed(2)} | Label: ${bestResult.topLabel}`);

    res.json({
      passed: isApproved,
      topLabel: bestResult.topLabel,
      confidence: bestResult.confidence,
      mediaType: req.file.mimetype,
      judgment: judgment
    });

  } catch (error) {
    console.error('[Verify Error]:', error.message);
    res.status(500).json({ error: 'Verification process failed.' });
  } finally {
    // Cleanup
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    tempFramePaths.forEach(p => {
      if (fs.existsSync(p)) fs.unlinkSync(p);
    });
  }
});

module.exports = router;
