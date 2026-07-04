import { createIcons, icons } from 'lucide';
import { CameraManager } from './modules/cameraManager.js';
import { FaceEngine } from './modules/faceEngine.js';
import { UIManager } from './modules/uiManager.js';
import './style.css';

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize standard icons
    createIcons({ icons });

    const videoElement = document.getElementById('video-stream');
    const btnToggleAI = document.getElementById('btn-toggle-ai');
    const aiStatusText = document.getElementById('ai-status-text');
    const btnFlip = document.getElementById('btn-flip-cam');
    const btnCapture = document.getElementById('btn-capture');
    const btnFullscreen = document.getElementById('btn-fullscreen');
    const camSelect = document.getElementById('cam-select');
    const zoomSlider = document.getElementById('zoom-slider');

    // Instantiate Modules
    const ui = new UIManager();
    const camera = new CameraManager(videoElement);
    const ai = new FaceEngine();

    // Application State
    let lastVideoTime = -1;
    let frameCount = 0;
    let lastFpsTime = performance.now();
    let currentFps = 0;
    let animationFrameId = null;

    try {
        ui.showToast('Initializing Core Engines...', 'info');
        
        // 1. Boot AI
        await ai.initialize();
        ai.start();
        
        // 2. Boot Camera
        await camera.start();
        populateCameraList();
        checkCapabilities();
        
        // 3. Start Loop
        ui.showToast('System Online. AI Running.', 'success');
        detectLoop();
        
    } catch (error) {
        console.error(error);
        ui.showToast(error.message, 'error');
    }

    async function populateCameraList() {
        const devices = await camera.getDevices();
        camSelect.innerHTML = devices.map(d => 
            `<option value="${d.deviceId}">${d.label || `Camera ${d.deviceId.substring(0,5)}`}</option>`
        ).join('');
    }

    function checkCapabilities() {
        const caps = camera.getCapabilities();
        if (caps && caps.zoom) {
            zoomSlider.disabled = false;
            zoomSlider.min = caps.zoom.min;
            zoomSlider.max = caps.zoom.max;
            zoomSlider.step = caps.zoom.step;
            zoomSlider.value = caps.zoom.min;
        } else {
            zoomSlider.disabled = true;
        }
    }

    function detectLoop() {
        if (!videoElement.videoWidth) {
            animationFrameId = requestAnimationFrame(detectLoop);
            return;
        }

        // Sync visual canvas bounds to actual video display size
        const rect = videoElement.getBoundingClientRect();
        ui.syncCanvas(videoElement.videoWidth, videoElement.videoHeight, rect.width, rect.height);

        // Process frame if AI is running and video has advanced
        if (ai.isRunning && videoElement.currentTime !== lastVideoTime) {
            const startMs = performance.now();
            
            const results = ai.detect(videoElement, startMs);
            lastVideoTime = videoElement.currentTime;
            
            const latency = performance.now() - startMs;
            
            ui.drawResults(results, camera.isFrontFacing);
            
            // Calculate FPS
            frameCount++;
            if (startMs - lastFpsTime >= 1000) {
                currentFps = frameCount;
                frameCount = 0;
                lastFpsTime = startMs;
            }
            
            const faceCount = results?.faceLandmarks?.length || 0;
            ui.updateMetrics(faceCount, currentFps, latency);
        } else if (!ai.isRunning) {
            ui.clearCanvas();
        }

        animationFrameId = requestAnimationFrame(detectLoop);
    }

    // Event Listeners
    btnToggleAI.addEventListener('click', () => {
        const isRunning = ai.toggle();
        if (isRunning) {
            btnToggleAI.classList.add('active');
            btnToggleAI.classList.remove('btn-secondary');
            aiStatusText.textContent = 'AI Active';
            ui.showToast('AI Engine Resumed');
        } else {
            btnToggleAI.classList.remove('active');
            btnToggleAI.classList.add('btn-secondary');
            aiStatusText.textContent = 'AI Paused';
            ui.updateMetrics(0, 0, 0);
            ui.showToast('AI Engine Paused');
        }
    });

    btnFlip.addEventListener('click', async () => {
        try {
            await camera.flip();
            checkCapabilities();
        } catch (e) {
            ui.showToast('Failed to switch camera', 'error');
        }
    });

    camSelect.addEventListener('change', async (e) => {
        if(e.target.value) {
            try {
                await camera.start(e.target.value);
                checkCapabilities();
            } catch (err) {
                ui.showToast('Error selecting camera', 'error');
            }
        }
    });

    btnCapture.addEventListener('click', () => {
        ui.saveCapture(videoElement, camera.isFrontFacing);
    });

    zoomSlider.addEventListener('input', (e) => {
        camera.applyZoom(Number(e.target.value));
    });

    btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });
    
    // Handle window resize gracefully
    window.addEventListener('resize', () => {
        if (videoElement.videoWidth) {
            const rect = videoElement.getBoundingClientRect();
            ui.syncCanvas(videoElement.videoWidth, videoElement.videoHeight, rect.width, rect.height);
        }
    });
});