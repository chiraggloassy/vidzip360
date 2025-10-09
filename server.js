const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve favicon to avoid 404
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Check if file is a video
    if (file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Only video files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB limit
    }
});

// Serve static files from public directory
app.use(express.static('public'));

// Handle missing service worker
app.get('/sw.js', (req, res) => {
    res.status(404).send('Service Worker not found');
});

// Utility function to get file size
function getFileSizeInMB(filePath) {
    const stats = fs.statSync(filePath);
    return (stats.size / (1024 * 1024)).toFixed(2);
}

// Utility function to clean up files
function cleanupFiles(...filePaths) {
    filePaths.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
                console.log(`🧹 Cleaned up: ${filePath}`);
            } catch (error) {
                console.log(`⚠️ Could not delete: ${filePath}`);
            }
        }
    });
}

// FFmpeg verification endpoint
app.get('/verify-ffmpeg', (req, res) => {
    ffmpeg.getAvailableFormats((err, formats) => {
        if (err) {
            return res.json({ 
                success: false, 
                error: 'FFmpeg not available: ' + err.message 
            });
        }
        res.json({ 
            success: true, 
            message: 'FFmpeg is working correctly',
            version: 'FFmpeg available'
        });
    });
});

// Routes

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check route
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'VidCrush server is running',
        timestamp: new Date().toISOString()
    });
});

// Store compression progress for real-time updates
const compressionProgress = new Map();

// Compression endpoint - FIXED WITH REAL PROGRESS
app.post('/compress', upload.single('video'), async (req, res) => {
    console.log('🎬 Received compression request');
    
    if (!req.file) {
        return res.status(400).json({ 
            success: false, 
            error: 'No video file uploaded' 
        });
    }

    const inputPath = req.file.path;
    const originalFilename = req.file.originalname;
    const outputFileName = `vidcrush_compressed_${Date.now()}.mp4`;
    const outputPath = path.join(__dirname, 'compressed', outputFileName);
    const compressionId = Date.now().toString();
    
    // Create compressed directory if it doesn't exist
    const compressedDir = path.join(__dirname, 'compressed');
    if (!fs.existsSync(compressedDir)) {
        fs.mkdirSync(compressedDir, { recursive: true });
    }

    const quality = req.body.quality || 'medium';
    
    console.log(`📊 File details:`, {
        originalName: originalFilename,
        inputSize: getFileSizeInMB(inputPath) + ' MB',
        quality: quality,
        inputPath: inputPath,
        outputPath: outputPath
    });

    // Debug file existence
    console.log('🔍 Input file exists:', fs.existsSync(inputPath));
    console.log('🔍 Output directory exists:', fs.existsSync(compressedDir));

    // Compression settings based on quality
    let crf, preset, audioBitrate;
    
    switch(quality) {
        case 'low': 
            crf = '23';
            preset = 'medium';
            audioBitrate = '128k';
            break;
        case 'medium': 
            crf = '28';
            preset = 'medium'; 
            audioBitrate = '96k';
            break;
        case 'high': 
            crf = '32';
            preset = 'slow';
            audioBitrate = '64k';
            break;
        default: 
            crf = '28';
            preset = 'medium';
            audioBitrate = '96k';
    }

    console.log(`⚙️ Compression settings:`, { crf, preset, audioBitrate });

    try {
        // Get original file size for comparison
        const originalSize = fs.statSync(inputPath).size;
        console.log('📁 Original file size:', originalSize, 'bytes');

        // Initialize progress tracking
        compressionProgress.set(compressionId, { progress: 0, status: 'Starting...' });

        await new Promise((resolve, reject) => {
            let lastProgress = 0;
            
            const command = ffmpeg(inputPath)
                .output(outputPath)
                .videoCodec('libx264')
                .audioCodec('aac')
                .outputOptions([
                    `-crf ${crf}`,
                    `-preset ${preset}`,
                    `-b:a ${audioBitrate}`,
                    '-pix_fmt yuv420p',
                    '-movflags +faststart',
                    '-max_muxing_queue_size 9999'
                ])
                .on('start', (commandLine) => {
                    console.log('🚀 FFmpeg process started:', commandLine);
                    compressionProgress.set(compressionId, { progress: 10, status: 'Analyzing video...' });
                })
                .on('progress', (progress) => {
                    // Real progress from FFmpeg
                    const currentProgress = Math.min(95, Math.round(progress.percent || lastProgress + 5));
                    lastProgress = currentProgress;
                    
                    console.log(`📈 Real FFmpeg progress:`, {
                        percent: progress.percent,
                        time: progress.timemark,
                        frames: progress.frames,
                        currentProgress: currentProgress
                    });
                    
                    compressionProgress.set(compressionId, { 
                        progress: currentProgress, 
                        status: `Processing... ${progress.timemark || ''}` 
                    });
                })
                .on('stderr', (stderrLine) => {
                    // Log FFmpeg process details for debugging
                    if (stderrLine.includes('Error') || stderrLine.includes('error')) {
                        console.log('🔴 FFmpeg error:', stderrLine);
                    }
                })
                .on('end', () => {
                    console.log('✅ FFmpeg process ended');
                    compressionProgress.set(compressionId, { progress: 100, status: 'Complete!' });
                    
                    // Verify the output file was actually created
                    setTimeout(() => {
                        if (fs.existsSync(outputPath)) {
                            const stats = fs.statSync(outputPath);
                            console.log('📁 Output file created:', stats.size, 'bytes');
                            
                            if (stats.size > 0) {
                                const compressedSize = stats.size;
                                const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
                                
                                console.log(`📊 Compression results:`, {
                                    originalSize: (originalSize / (1024 * 1024)).toFixed(2) + ' MB',
                                    compressedSize: (compressedSize / (1024 * 1024)).toFixed(2) + ' MB',
                                    savings: savings + '%'
                                });

                                // Clean up original file after successful compression
                                cleanupFiles(inputPath);

                                // Send success response with file info
                                res.json({
                                    success: true,
                                    message: 'Video compressed successfully',
                                    data: {
                                        originalSize: originalSize,
                                        compressedSize: compressedSize,
                                        savingsPercent: savings,
                                        downloadUrl: `/download/${outputFileName}`,
                                        filename: outputFileName,
                                        compressionId: compressionId
                                    }
                                });
                                
                                // Clean up progress tracking after short delay
                                setTimeout(() => {
                                    compressionProgress.delete(compressionId);
                                }, 5000);
                                
                                resolve();
                            } else {
                                cleanupFiles(inputPath, outputPath);
                                compressionProgress.delete(compressionId);
                                reject(new Error('Output file is empty (0 bytes)'));
                            }
                        } else {
                            cleanupFiles(inputPath);
                            compressionProgress.delete(compressionId);
                            reject(new Error('Output file was not created'));
                        }
                    }, 1000); // Wait 1 second to ensure file is written
                })
                .on('error', (err) => {
                    console.error('❌ FFmpeg error:', err);
                    // Clean up files on compression failure
                    cleanupFiles(inputPath, outputPath);
                    compressionProgress.delete(compressionId);
                    reject(new Error('FFmpeg compression failed: ' + err.message));
                });

            // Run the command
            command.run();
        });

    } catch (error) {
        console.error('💥 Compression process failed:', error);
        
        // Clean up files on global error
        cleanupFiles(inputPath, outputPath);
        compressionProgress.delete(compressionId);
        
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Compression process failed'
        });
    }
});

// Progress endpoint for real-time updates
app.get('/compression-progress/:id', (req, res) => {
    const progress = compressionProgress.get(req.params.id) || { progress: 0, status: 'Unknown' };
    res.json(progress);
});

// Download endpoint
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'compressed', filename);
    
    console.log('📥 Download request for:', filename);
    console.log('📁 File path:', filePath);
    console.log('📁 File exists:', fs.existsSync(filePath));
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ 
            success: false, 
            error: 'File not found: ' + filename 
        });
    }

    const stats = fs.statSync(filePath);
    console.log('📊 File size:', stats.size, 'bytes');

    res.download(filePath, filename, (err) => {
        if (err) {
            console.error('❌ Download error:', err);
            res.status(500).json({ 
                success: false, 
                error: 'Download failed: ' + err.message 
            });
        } else {
            console.log(`✅ File downloaded successfully: ${filename}`);
            
            // Schedule cleanup after successful download
            setTimeout(() => {
                cleanupFiles(filePath);
            }, 604800000); // Clean up after 7 days
        }
    });
});

// Cleanup endpoint (manual cleanup)
app.delete('/cleanup', (req, res) => {
    try {
        const uploadsDir = path.join(__dirname, 'uploads');
        const compressedDir = path.join(__dirname, 'compressed');
        
        [uploadsDir, compressedDir].forEach(dir => {
            if (fs.existsSync(dir)) {
                fs.readdirSync(dir).forEach(file => {
                    const filePath = path.join(dir, file);
                    fs.unlinkSync(filePath);
                    console.log(`🧹 Deleted: ${filePath}`);
                });
                console.log(`🧹 Cleaned directory: ${dir}`);
            }
        });
        
        res.json({ 
            success: true, 
            message: 'All temporary files cleaned up' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Cleanup failed: ' + error.message 
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                success: false, 
                error: 'File too large. Maximum size is 500MB.' 
            });
        }
    }
    
    console.error('🚨 Server error:', error);
    res.status(500).json({ 
        success: false, 
        error: 'Internal server error: ' + error.message 
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        success: false, 
        error: 'Endpoint not found' 
    });
});

// Server configuration
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// Start server
app.listen(PORT, HOST, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 VIDCRUSH - Professional Video Compression');
    console.log('='.repeat(50));
    console.log(`📍 Server running on: http://${HOST}:${PORT}`);
    console.log(`📁 Upload directory: ${path.join(__dirname, 'uploads')}`);
    console.log(`💾 Compressed files: ${path.join(__dirname, 'compressed')}`);
    console.log(`🔍 FFmpeg test: http://${HOST}:${PORT}/verify-ffmpeg`);
    console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
    console.log('='.repeat(50) + '\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down VidCrush server...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 VidCrush server terminated');
    process.exit(0);
});