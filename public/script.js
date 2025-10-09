// ===== VidZip360 - Professional Video Compression =====
// Fixed version with single file selection, proper progress display, and video previews

class VidZip360 {
    constructor() {
        this.init();
    }

    init() {
        console.log('🚀 Initializing VidZip360...');
        this.setupElements();
        this.setupEventListeners();
        this.setupState();
        this.startIntroSequence();
    }

    setupElements() {
        // Intro Elements
        this.introScreen = document.getElementById('intro-screen');
        this.mainContainer = document.querySelector('.main-container');
        this.loadingProgress = document.getElementById('loading-progress');
        this.loadingText = document.getElementById('loading-text');
        this.logoText = document.getElementById('logo-text');

        // Upload Elements
        this.fileInput = document.getElementById('file-input');
        this.uploadBtn = document.getElementById('upload-btn');
        this.uploadArea = document.getElementById('upload-area');
        this.fileInfo = document.getElementById('file-info');
        this.fileName = document.getElementById('file-name');
        this.fileSize = document.getElementById('file-size');
        this.fileDuration = document.getElementById('file-duration');
        this.fileResolution = document.getElementById('file-resolution');
        this.clearFile = document.getElementById('clear-file');
        this.previewBtn = document.getElementById('preview-btn');
        this.previewModal = document.getElementById('preview-modal');
        this.previewPlayer = document.getElementById('preview-player');
        this.closeModal = document.getElementById('close-modal');

        // Compression Elements
        this.compressionSection = document.getElementById('compression-section');
        this.compressBtn = document.getElementById('compress-btn');
        this.compressionPreview = document.getElementById('compression-preview');
        this.previewLevel = document.getElementById('preview-level');
        this.originalSizeBar = document.getElementById('original-size-bar');
        this.compressedSizeBar = document.getElementById('compressed-size-bar');
        this.originalSizeValue = document.getElementById('original-size-value');
        this.compressedSizeValue = document.getElementById('compressed-size-value');
        this.savingsPreview = document.getElementById('savings-preview');
        this.estimatedTime = document.getElementById('estimated-time');

        // Progress Elements
        this.progressSection = document.getElementById('progress-section');
        this.progressRing = document.getElementById('progress-ring');
        this.progressPercentage = document.getElementById('progress-percentage');
        this.progressStatus = document.getElementById('progress-status');
        this.timeElapsed = document.getElementById('time-elapsed');
        this.timeLeft = document.getElementById('time-left');
        this.processingSpeed = document.getElementById('processing-speed');

        // Progress Steps
        this.steps = {
            step1: document.getElementById('step-1'),
            step2: document.getElementById('step-2'),
            step3: document.getElementById('step-3'),
            step4: document.getElementById('step-4')
        };

        // Results Elements
        this.resultsSection = document.getElementById('results-section');
        this.compressionTime = document.getElementById('compression-time');
        this.spaceSavedResult = document.getElementById('space-saved-result');
        this.reductionPercent = document.getElementById('reduction-percent');
        this.efficiencyScore = document.getElementById('efficiency-score');

        // Video Comparison
        this.originalVideo = document.getElementById('original-video');
        this.compressedVideo = document.getElementById('compressed-video');
        this.finalOriginalSize = document.getElementById('final-original-size');
        this.finalCompressedSize = document.getElementById('final-compressed-size');
        this.finalOriginalDuration = document.getElementById('final-original-duration');
        this.finalCompressedDuration = document.getElementById('final-compressed-duration');
        this.finalOriginalResolution = document.getElementById('final-original-resolution');
        this.finalCompressedResolution = document.getElementById('final-compressed-resolution');
        this.finalOriginalBitrate = document.getElementById('final-original-bitrate');
        this.finalCompressedBitrate = document.getElementById('final-compressed-bitrate');
        this.finalSavingsPercent = document.getElementById('final-savings-percent');
        this.compressionLevelBadge = document.getElementById('compression-level-badge');

        // Quality Metrics
        this.visualQualityBar = document.getElementById('visual-quality-bar');
        this.audioQualityBar = document.getElementById('audio-quality-bar');
        this.efficiencyBar = document.getElementById('efficiency-bar');
        this.visualQualityValue = document.getElementById('visual-quality-value');
        this.audioQualityValue = document.getElementById('audio-quality-value');
        this.efficiencyValue = document.getElementById('efficiency-value');

        // Action Buttons
        this.downloadBtn = document.getElementById('download-btn');
        this.shareBtn = document.getElementById('share-btn');
        this.newVideoBtn = document.getElementById('new-video-btn');
        this.settingsBtn = document.getElementById('settings-btn');

        // Stats
        this.videosCompressed = document.getElementById('videos-compressed');
        this.spaceSaved = document.getElementById('space-saved');
        this.compressionRate = document.getElementById('compression-rate');

        // Theme Toggle
        this.themeToggle = document.getElementById('theme-toggle');

        // Particle Container
        this.particleContainer = document.getElementById('completion-particles');
    }

    setupState() {
        this.state = {
            // File State
            currentFile: null,
            fileSize: 0,
            fileDuration: 0,
            fileResolution: '0x0',
            fileBitrate: 0,
            originalVideoUrl: null,

            // Compression State
            selectedCompression: null,
            compressionStartTime: null,
            compressionEndTime: null,
            compressionId: null,

            // Progress State
            progressInterval: null,
            progressCheckInterval: null,
            currentProgress: 0,
            currentStep: 1,

            // Results State
            downloadUrl: null,
            compressedSize: 0,
            compressedFilename: null,
            compressionStats: null,

            // App State
            isCompressing: false,
            isDarkMode: true
        };

        // Load stats from localStorage
        this.loadStats();
    }

    setupEventListeners() {
        // File Upload - FIXED: Single click file selection
        this.uploadBtn.addEventListener('click', () => {
            this.fileInput.click();
        });
        
        this.uploadArea.addEventListener('click', (e) => {
            // Only trigger file input if not clicking on child elements
            if (e.target === this.uploadArea || e.target.classList.contains('upload-content')) {
                this.fileInput.click();
            }
        });
        
        // FIXED: Proper file change handling
        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelect(e);
            }
        });

        // Drag and Drop
        this.setupDragAndDrop();

        // File Actions
        this.clearFile.addEventListener('click', () => this.clearCurrentFile());
        this.previewBtn.addEventListener('click', () => this.showPreview());
        this.closeModal.addEventListener('click', () => this.hidePreview());

        // Compression Options
        document.querySelectorAll('.option-card').forEach(card => {
            card.addEventListener('click', () => this.selectCompressionOption(card));
        });

        // Compression Actions
        this.compressBtn.addEventListener('click', () => this.startCompression());

        // Results Actions
        this.downloadBtn.addEventListener('click', () => this.downloadCompressedVideo());
        this.shareBtn.addEventListener('click', () => this.shareResults());
        this.newVideoBtn.addEventListener('click', () => this.compressNewVideo());
        this.settingsBtn.addEventListener('click', () => this.showSettings());

        // Theme Toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Global Event Listeners
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    setupDragAndDrop() {
        const events = ['dragenter', 'dragover', 'dragleave', 'drop'];
        
        events.forEach(eventName => {
            this.uploadArea.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, () => this.highlightArea(), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, () => this.unhighlightArea(), false);
        });

        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e), false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    highlightArea() {
        this.uploadArea.classList.add('drag-over');
    }

    unhighlightArea() {
        this.uploadArea.classList.remove('drag-over');
    }

    handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    // ===== INTRO SEQUENCE =====
    startIntroSequence() {
        console.log('🎬 Starting intro sequence...');
        
        // Update loading text sequence
        const loadingTexts = [
            "Initializing Systems...",
            "Loading Compression Engine...",
            "Preparing Interface...",
            "Optimizing Performance...",
            "Almost Ready..."
        ];

        loadingTexts.forEach((text, index) => {
            setTimeout(() => {
                if (this.loadingText) {
                    this.loadingText.textContent = text;
                }
            }, (index + 1) * 1000);
        });

        // Show main app after intro
        setTimeout(() => {
            this.hideIntro();
            this.showMainApp();
        }, 8000);
    }

    hideIntro() {
        if (this.introScreen) {
            this.introScreen.style.opacity = '0';
            setTimeout(() => {
                this.introScreen.style.display = 'none';
            }, 500);
        }
    }

    showMainApp() {
        if (this.mainContainer) {
            this.mainContainer.classList.remove('hidden');
            this.mainContainer.style.opacity = '1';
        }
    }

    // ===== FILE HANDLING - FIXED =====
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            console.log('📁 File selected:', file.name);
            this.processFile(file);
        }
    }

    async processFile(file) {
        if (!file.type.startsWith('video/')) {
            this.showError('Please select a valid video file (MP4, AVI, MOV, MKV, etc.)');
            return;
        }

        if (file.size > 500 * 1024 * 1024) {
            this.showError('File size exceeds 500MB limit. Please choose a smaller video.');
            return;
        }

        try {
            this.showLoadingState();
            this.state.currentFile = file;
            this.state.fileSize = file.size;

            // Create object URL for preview - FIXED: Store for later use
            this.state.originalVideoUrl = URL.createObjectURL(file);

            // Get video metadata
            const videoInfo = await this.getVideoInfo(file);
            this.state.fileDuration = videoInfo.duration;
            this.state.fileResolution = videoInfo.resolution;
            this.state.fileBitrate = videoInfo.bitrate;

            this.displayFileInfo(file, videoInfo);
            this.showCompressionOptions();

        } catch (error) {
            console.error('Error processing file:', error);
            this.showError('Failed to process video file. Please try another file.');
        } finally {
            this.hideLoadingState();
        }
    }

    async getVideoInfo(file) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            const url = URL.createObjectURL(file);

            video.addEventListener('loadedmetadata', () => {
                const duration = video.duration;
                const resolution = `${video.videoWidth}x${video.videoHeight}`;
                const bitrate = Math.round((file.size * 8) / duration / 1000);

                URL.revokeObjectURL(url);

                resolve({
                    duration,
                    resolution,
                    bitrate,
                    videoWidth: video.videoWidth,
                    videoHeight: video.videoHeight
                });
            });

            video.addEventListener('error', (e) => {
                URL.revokeObjectURL(url);
                reject(new Error('Could not read video metadata'));
            });

            video.src = url;
            video.load();
        });
    }

    displayFileInfo(file, videoInfo) {
        // Update file info display
        this.fileName.textContent = file.name;
        this.fileSize.textContent = this.formatFileSize(file.size);
        this.fileDuration.textContent = this.formatTime(videoInfo.duration);
        this.fileResolution.textContent = videoInfo.resolution;

        // FIXED: Set video sources for preview
        if (this.state.originalVideoUrl) {
            this.originalVideo.src = this.state.originalVideoUrl;
            this.previewPlayer.src = this.state.originalVideoUrl;
            
            // Preload videos for instant playback
            this.originalVideo.load();
            this.previewPlayer.load();
        }

        // Show file info section
        this.fileInfo.classList.remove('hidden');

        // Update stats for compression preview
        this.updateCompressionPreview();
    }

    clearCurrentFile() {
        // Clean up object URLs
        if (this.state.originalVideoUrl) {
            URL.revokeObjectURL(this.state.originalVideoUrl);
        }

        this.state.currentFile = null;
        this.state.originalVideoUrl = null;
        this.state.downloadUrl = null;
        this.state.compressedSize = 0;
        this.state.compressedFilename = null;
        this.state.compressionId = null;
        
        this.fileInput.value = '';
        this.fileInfo.classList.add('hidden');
        this.compressionSection.classList.add('hidden');
        this.compressionPreview.classList.add('hidden');
        
        // Reset compression button
        this.compressBtn.disabled = true;
        
        // Clear video previews
        this.originalVideo.src = '';
        this.compressedVideo.src = '';
        this.previewPlayer.src = '';

        // Reset selected compression
        this.state.selectedCompression = null;
        document.querySelectorAll('.option-card').forEach(card => {
            card.classList.remove('selected');
        });
    }

    showPreview() {
        if (this.state.currentFile && this.previewModal) {
            this.previewModal.classList.remove('hidden');
            // Ensure video is ready to play
            this.previewPlayer.load();
        }
    }

    hidePreview() {
        if (this.previewModal) {
            this.previewModal.classList.add('hidden');
            this.previewPlayer.pause();
        }
    }

    // ===== COMPRESSION OPTIONS =====
    selectCompressionOption(card) {
        // Remove selection from all cards
        document.querySelectorAll('.option-card').forEach(c => {
            c.classList.remove('selected');
        });

        // Add selection to clicked card
        card.classList.add('selected');
        
        const level = card.getAttribute('data-level');
        this.state.selectedCompression = level;

        // Update compression preview
        this.updateCompressionPreview();

        // Enable compress button
        this.compressBtn.disabled = false;

        // Update button text
        const levelNames = {
            low: 'Light',
            medium: 'Balanced',
            high: 'Maximum'
        };
        
        const btnText = this.compressBtn.querySelector('.btn-text');
        if (btnText) {
            btnText.textContent = `Start ${levelNames[level]} Compression`;
        }
    }

    updateCompressionPreview() {
        if (!this.state.currentFile || !this.state.selectedCompression) return;

        const originalSize = this.state.fileSize;
        const compressionRatios = {
            low: 0.7,
            medium: 0.5,
            high: 0.3
        };

        const ratio = compressionRatios[this.state.selectedCompression];
        const compressedSize = originalSize * ratio;
        const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

        // Update preview display
        this.originalSizeValue.textContent = this.formatFileSize(originalSize);
        this.compressedSizeValue.textContent = this.formatFileSize(compressedSize);
        this.savingsPreview.textContent = savings + '%';

        // Update size bars
        this.compressedSizeBar.style.width = (ratio * 100) + '%';

        // Update level badge
        const levelNames = {
            low: 'Light',
            medium: 'Balanced',
            high: 'Maximum'
        };
        this.previewLevel.textContent = levelNames[this.state.selectedCompression];

        // Update estimated time
        const timeEstimates = {
            low: '1-2 minutes',
            medium: '2-3 minutes',
            high: '3-5 minutes'
        };
        this.estimatedTime.textContent = timeEstimates[this.state.selectedCompression];

        // Show preview section
        this.compressionPreview.classList.remove('hidden');
    }

    showCompressionOptions() {
        this.compressionSection.classList.remove('hidden');
        this.scrollToElement(this.compressionSection);
    }

    // ===== COMPRESSION PROCESS =====
async startCompression() {
    if (!this.state.currentFile || !this.state.selectedCompression || this.state.isCompressing) {
        return;
    }

    try {
        this.state.isCompressing = true;
        this.state.compressionStartTime = Date.now();
        this.state.currentProgress = 0;
        
        // Update UI for compression start
        this.showProgressSection();
        this.updateProgress(10, 'Preparing compression engine...');
        this.updateStep(1);

        // Artificial 7-second progress (10% to 90%)
        let progress = 10;
        const progressInterval = setInterval(() => {
            progress += 11.4; // 80% over 7 seconds = ~11.4% per second
            
            // Update status messages
            if (progress >= 20 && progress < 40) {
                this.updateProgress(Math.min(90, progress), 'Analyzing video structure...');
                this.updateStep(2);
            } else if (progress >= 40 && progress < 60) {
                this.updateProgress(Math.min(90, progress), 'Optimizing video streams...');
                this.updateStep(3);
            } else if (progress >= 60 && progress < 80) {
                this.updateProgress(Math.min(90, progress), 'Applying compression...');
                this.updateStep(4);
            } else if (progress >= 80) {
                this.updateProgress(Math.min(90, progress), 'Finalizing output...');
            } else {
                this.updateProgress(Math.min(90, progress), 'Processing video...');
            }
            
            if (progress >= 90) {
                clearInterval(progressInterval);
                // Start actual compression after 7 seconds
                this.performActualCompression();
            }
        }, 1000); // Update every second

    } catch (error) {
        console.error('❌ Compression failed:', error);
        this.showError('Compression failed: ' + error.message);
        this.hideProgressSection();
        this.stopProgressTracking();
        this.state.isCompressing = false;
    }
}

async performActualCompression() {
    try {
        // Prepare form data
        const formData = new FormData();
        formData.append('video', this.state.currentFile);
        formData.append('quality', this.state.selectedCompression);

        console.log('🚀 Starting actual compression...');

        // Start compression
        const response = await fetch('/compress', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            let errorDetails = 'Server error occurred';
            try {
                const errorData = await response.json();
                errorDetails = errorData.error || errorDetails;
            } catch (parseError) {
                errorDetails = `HTTP ${response.status}: ${response.statusText}`;
            }
            throw new Error(errorDetails);
        }

        // Parse response
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Compression failed');
        }

        // Store results from server
        this.state.downloadUrl = result.data.downloadUrl;
        this.state.compressedSize = result.data.compressedSize;
        this.state.compressedFilename = result.data.filename;
        this.state.compressionId = result.data.compressionId;
        
        this.state.compressionEndTime = Date.now();

        // Update stats
        this.updateStats();

        console.log('✅ Compression successful:', {
            downloadUrl: this.state.downloadUrl,
            compressedSize: this.state.compressedSize
        });

        // Show 100% completion
        this.updateProgress(100, 'Compression complete!');
        
        // Wait for final progress
        setTimeout(() => {
            this.showResults();
        }, 1000);

    } catch (error) {
        console.error('❌ Actual compression failed:', error);
        this.showError('Compression failed: ' + error.message);
        this.hideProgressSection();
        this.stopProgressTracking();
    } finally {
        this.state.isCompressing = false;
    }
}

    // Real progress tracking from server
    startRealProgressTracking() {
        this.stopProgressTracking();
        
        this.state.progressCheckInterval = setInterval(async () => {
            if (!this.state.compressionId) return;
            
            try {
                const response = await fetch(`/compression-progress/${this.state.compressionId}`);
                if (response.ok) {
                    const progress = await response.json();
                    
                    if (progress && progress.progress > this.state.currentProgress) {
                        this.updateProgress(progress.progress, progress.status);
                        
                        // Update steps based on progress
                        if (progress.progress >= 25) this.updateStep(2);
                        if (progress.progress >= 50) this.updateStep(3);
                        if (progress.progress >= 75) this.updateStep(4);
                        
                        // Trigger particle effect at 100%
                        if (progress.progress === 100) {
                            this.triggerCompletionParticles();
                        }
                    }
                }
            } catch (error) {
                console.log('Progress check failed:', error);
            }
        }, 1000);
    }

    stopProgressTracking() {
        if (this.state.progressCheckInterval) {
            clearInterval(this.state.progressCheckInterval);
            this.state.progressCheckInterval = null;
        }
        if (this.state.progressInterval) {
            clearInterval(this.state.progressInterval);
            this.state.progressInterval = null;
        }
    }

    updateProgress(percent, status) {
        this.state.currentProgress = Math.min(100, percent);
        
        // FIXED: Proper progress ring calculation
        const circumference = 2 * Math.PI * 54;
        const offset = circumference - (this.state.currentProgress / 100) * circumference;
        
        if (this.progressRing) {
            this.progressRing.style.strokeDashoffset = offset;
        }
        
        // FIXED: Ensure percentage stays within circle
        if (this.progressPercentage) {
            this.progressPercentage.textContent = Math.round(this.state.currentProgress) + '%';
            // Ensure text doesn't overflow
            this.progressPercentage.style.fontSize = this.state.currentProgress === 100 ? '1.6rem' : '1.8rem';
        }
        
        if (this.progressStatus) {
            this.progressStatus.textContent = status;
            // Truncate long status text
            if (status.length > 30) {
                this.progressStatus.textContent = status.substring(0, 30) + '...';
            }
        }

        // Update timer
        this.updateProgressTimer();
    }

    updateStep(stepNumber) {
        Object.values(this.steps).forEach(step => {
            step.classList.remove('active', 'completed');
        });

        for (let i = 1; i <= stepNumber; i++) {
            const step = this.steps[`step${i}`];
            if (step) {
                if (i === stepNumber) {
                    step.classList.add('active');
                } else {
                    step.classList.add('completed');
                }
            }
        }
    }

    updateProgressTimer() {
        if (!this.state.compressionStartTime) return;

        const elapsed = Math.floor((Date.now() - this.state.compressionStartTime) / 1000);
        
        if (this.timeElapsed) {
            this.timeElapsed.textContent = elapsed + 's';
        }

        if (this.state.currentProgress > 0) {
            const totalEstimated = elapsed / (this.state.currentProgress / 100);
            const remaining = Math.max(0, Math.round(totalEstimated - elapsed));
            
            if (this.timeLeft) {
                this.timeLeft.textContent = remaining + 's';
            }
        }
    }

    // ===== PARTICLE EFFECTS =====
    triggerCompletionParticles() {
        if (!this.particleContainer) return;
        
        this.particleContainer.classList.remove('hidden');
        this.particleContainer.innerHTML = '';
        
        const particleCount = 50;
        const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6'];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'completion-particle';
            
            const size = Math.random() * 8 + 4;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 200 + 100;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            const duration = Math.random() * 1 + 1;
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.background = color;
            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            particle.style.animationDuration = `${duration}s`;
            particle.style.left = '50%';
            particle.style.top = '50%';
            
            this.particleContainer.appendChild(particle);
        }
        
        setTimeout(() => {
            this.particleContainer.classList.add('hidden');
        }, 2000);
    }

    // ===== RESULTS - FIXED VIDEO PREVIEW =====
    showResults() {
        this.hideProgressSection();
        this.resultsSection.classList.remove('hidden');

        // Calculate compression statistics
        const originalSize = this.state.fileSize;
        const compressedSize = this.state.compressedSize;
        const savedBytes = originalSize - compressedSize;
        const savingsPercent = ((savedBytes / originalSize) * 100).toFixed(1);
        const compressionTime = Math.round((this.state.compressionEndTime - this.state.compressionStartTime) / 1000);

        // Update results display
        this.compressionTime.textContent = `Completed in ${compressionTime}s`;
        this.spaceSavedResult.textContent = this.formatFileSize(savedBytes);
        this.reductionPercent.textContent = savingsPercent + '%';
        
        let efficiency = 'Excellent';
        if (savingsPercent < 30) efficiency = 'Good';
        if (savingsPercent < 50) efficiency = 'Very Good';
        this.efficiencyScore.textContent = efficiency;

        // Update video comparison - FIXED: Ensure both videos are properly set
        this.finalOriginalSize.textContent = this.formatFileSize(originalSize);
        this.finalCompressedSize.textContent = this.formatFileSize(compressedSize);
        this.finalSavingsPercent.textContent = savingsPercent + '%';

        // FIXED: Set compressed video source properly
        if (this.state.downloadUrl) {
            console.log('🎬 Loading compressed video:', this.state.downloadUrl);
            
            // Create new video element to avoid caching issues
            this.compressedVideo.src = this.state.downloadUrl + '?t=' + Date.now();
            this.compressedVideo.load();
            
            this.compressedVideo.onloadeddata = () => {
                console.log('✅ Compressed video loaded successfully');
            };
            
  
        }

        // Ensure original video is still set
        if (this.state.originalVideoUrl) {
            this.originalVideo.src = this.state.originalVideoUrl;
            this.originalVideo.load();
        }

        // Update quality metrics
        this.updateQualityMetrics(savingsPercent);

        // Update compression level badge
        const levelNames = {
            low: 'Light',
            medium: 'Balanced',
            high: 'Maximum'
        };
        this.compressionLevelBadge.textContent = levelNames[this.state.selectedCompression];

        // Scroll to results
        this.scrollToElement(this.resultsSection);

        // Update global stats
        this.updateGlobalStats(originalSize, compressedSize);

        // Trigger completion particles
        this.triggerCompletionParticles();
    }

    updateQualityMetrics(savingsPercent) {
        const qualityLevels = {
            low: { visual: 95, audio: 90, efficiency: 85 },
            medium: { visual: 85, audio: 80, efficiency: 90 },
            high: { visual: 75, audio: 70, efficiency: 95 }
        };

        const quality = qualityLevels[this.state.selectedCompression] || qualityLevels.medium;

        this.visualQualityBar.style.width = quality.visual + '%';
        this.audioQualityBar.style.width = quality.audio + '%';
        this.efficiencyBar.style.width = quality.efficiency + '%';

        this.visualQualityValue.textContent = quality.visual + '%';
        this.audioQualityValue.textContent = quality.audio + '%';
        this.efficiencyValue.textContent = quality.efficiency + '%';
    }

    // ===== DOWNLOAD & SHARING =====
    downloadCompressedVideo() {
        const downloadUrl = this.state.downloadUrl;

        if (!downloadUrl) {
            this.showError('No compressed video available to download. Please compress a file first.');
            return;
        }

        try {
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = this.state.compressedFilename || `VidZip360_compressed_${Date.now()}.mp4`;
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            this.showSuccess('Download started!');

        } catch (error) {
            console.error('Download failed:', error);
            this.showError('Download failed. Please try again.');
        }
    }

    shareResults() {
        if (!this.state.downloadUrl) {
            this.showError('No results to share.');
            return;
        }

        const originalSize = this.formatFileSize(this.state.fileSize);
        const compressedSize = this.formatFileSize(this.state.compressedSize);
        const savings = ((this.state.fileSize - this.state.compressedSize) / this.state.fileSize * 100).toFixed(1);

        const shareText = `🎬 Just compressed a video with VidZip360!
📊 Reduced from ${originalSize} to ${compressedSize} (${savings}% smaller!)
🔗 Try it at: ${window.location.href}`;

        if (navigator.share) {
            navigator.share({
                title: 'VidZip360 Compression Results',
                text: shareText,
                url: window.location.href
            }).catch(error => {
                console.log('Share cancelled:', error);
                this.copyToClipboard(shareText);
            });
        } else {
            this.copyToClipboard(shareText);
        }
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showSuccess('Results copied to clipboard!');
        } catch (error) {
            console.error('Copy failed:', error);
            this.showError('Failed to copy to clipboard.');
        }
    }

    compressNewVideo() {
    // Clear compressed video source FIRST
    this.compressedVideo.src = '';
    this.compressedVideo.load();
    
    // Then clear everything else
    this.clearCurrentFile();
    this.hideResults();
    this.hideProgressSection();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

    showSettings() {
        const settings = {
            format: 'MP4',
            quality: this.state.selectedCompression,
            autoDownload: true
        };

        const message = `Current Settings:
• Format: ${settings.format}
• Quality: ${this.state.selectedCompression}
• Auto Download: ${settings.autoDownload ? 'Yes' : 'No'}`;

        alert(message);
    }

    // ===== STATISTICS =====
    updateStats() {
        console.log('📊 Compression stats updated');
        
        const stats = JSON.parse(localStorage.getItem('VidZip360_stats')) || {
            videosCompressed: 0,
            totalSpaceSaved: 0,
            successRate: 98
        };
        
        stats.videosCompressed += 1;
        localStorage.setItem('VidZip360_stats', JSON.stringify(stats));
    }

    loadStats() {
        const stats = JSON.parse(localStorage.getItem('VidZip360_stats')) || {
            videosCompressed: 0,
            totalSpaceSaved: 0,
            successRate: 98
        };

        if (this.videosCompressed) this.videosCompressed.textContent = this.formatNumber(stats.videosCompressed);
        if (this.spaceSaved) this.spaceSaved.textContent = this.formatFileSize(stats.totalSpaceSaved);
        if (this.compressionRate) this.compressionRate.textContent = stats.successRate + '%';
    }

    updateGlobalStats(originalSize, compressedSize) {
        const stats = JSON.parse(localStorage.getItem('VidZip360_stats')) || {
            videosCompressed: 0,
            totalSpaceSaved: 0,
            successRate: 98
        };

        stats.videosCompressed += 1;
        stats.totalSpaceSaved += (originalSize - compressedSize);

        localStorage.setItem('VidZip360_stats', JSON.stringify(stats));

        if (this.videosCompressed) this.videosCompressed.textContent = this.formatNumber(stats.videosCompressed);
        if (this.spaceSaved) this.spaceSaved.textContent = this.formatFileSize(stats.totalSpaceSaved);
    }

    // ===== UI MANAGEMENT =====
    showProgressSection() {
        this.compressionSection.classList.add('hidden');
        this.progressSection.classList.remove('hidden');
        this.scrollToElement(this.progressSection);
    }

    hideProgressSection() {
        this.progressSection.classList.add('hidden');
        this.stopProgressTracking();
    }

    hideResults() {
        this.resultsSection.classList.add('hidden');
    }

    showLoadingState() {
        this.uploadArea.classList.add('loading');
        this.uploadBtn.disabled = true;
    }

    hideLoadingState() {
        this.uploadArea.classList.remove('loading');
        this.uploadBtn.disabled = false;
    }

    scrollToElement(element) {
        if (element) {
            element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }

    // ===== THEME MANAGEMENT =====
    toggleTheme() {
        this.state.isDarkMode = !this.state.isDarkMode;
        document.body.setAttribute('data-theme', this.state.isDarkMode ? 'dark' : 'light');
        
        const themeIcon = this.themeToggle.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = this.state.isDarkMode ? '🌙' : '☀️';
        }
        
        localStorage.setItem('VidZip360_theme', this.state.isDarkMode ? 'dark' : 'light');
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('VidZip360_theme') || 'dark';
        this.state.isDarkMode = savedTheme === 'dark';
        document.body.setAttribute('data-theme', savedTheme);
        
        const themeIcon = this.themeToggle.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = this.state.isDarkMode ? '🌙' : '☀️';
        }
    }

    // ===== UTILITY FUNCTIONS =====
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    // ===== ERROR HANDLING =====
    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        document.querySelectorAll('.notification').forEach(notif => notif.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✅' : (type === 'error' ? '🚨' : 'ℹ️')}</span>
                <span class="notification-message">${message}</span>
                <button class="close-btn">✕</button>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        `;

        notification.querySelector('.notification-content').style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
        `;

        notification.querySelector('.close-btn').style.cssText = `
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            margin-left: auto;
        `;

        notification.querySelector('.close-btn').onclick = () => {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        };

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideInRight 0.3s ease reverse';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }

    // ===== KEYBOARD SHORTCUTS =====
    handleKeydown(event) {
        if (event.key === 'Escape') {
            this.hidePreview();
        }

        if (event.ctrlKey && event.key === 'd' && this.state.downloadUrl) {
            event.preventDefault();
            this.downloadCompressedVideo();
        }

        if (event.ctrlKey && event.key === 'n') {
            event.preventDefault();
            this.compressNewVideo();
        }

        if (event.ctrlKey && event.key === 't') {
            event.preventDefault();
            this.toggleTheme();
        }
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    window.VidZip360 = new VidZip360();
    window.VidZip360.loadTheme();
    
    window.addEventListener('error', function(event) {
        console.error('Global error:', event.error);
        if (window.VidZip360) {
            window.VidZip360.showError('An unexpected error occurred. Please refresh.');
        }
    });

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
});