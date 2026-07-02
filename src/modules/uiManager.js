export class UIManager {
    constructor() {
        this.canvas = document.getElementById('render-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.metrics = {
            faces: document.getElementById('metric-faces'),
            fps: document.getElementById('metric-fps'),
            ms: document.getElementById('metric-ms')
        };
        this.gallery = document.getElementById('gallery-container');
        this.toastContainer = document.getElementById('toast-container');
    }

    syncCanvas(videoWidth, videoHeight, displayWidth, displayHeight) {
        this.canvas.width = videoWidth;
        this.canvas.height = videoHeight;
        this.canvas.style.width = `${displayWidth}px`;
        this.canvas.style.height = `${displayHeight}px`;
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawResults(results, isMirrored) {
        this.clearCanvas();
        if (!results || !results.faceLandmarks || results.faceLandmarks.length === 0) {
            this.updateMetrics(0, null, null);
            return;
        }

        const w = this.canvas.width;
        const h = this.canvas.height;

        this.ctx.save();
        if (isMirrored) {
            this.ctx.translate(w, 0);
            this.ctx.scale(-1, 1);
        }

        results.faceLandmarks.forEach((landmarks, index) => {
            const xCoords = landmarks.map(l => l.x * w);
            const yCoords = landmarks.map(l => l.y * h);
            const minX = Math.min(...xCoords);
            const minY = Math.min(...yCoords);
            const maxX = Math.max(...xCoords);
            const maxY = Math.max(...yCoords);
            const width = maxX - minX;
            const height = maxY - minY;

            this.ctx.strokeStyle = '#38bdf8';
            this.ctx.lineWidth = 4;
            this.ctx.shadowColor = '#38bdf8';
            this.ctx.shadowBlur = 15;
            this.ctx.strokeRect(minX, minY, width, height);

            this.ctx.shadowBlur = 0;
            this.ctx.fillStyle = '#38bdf8';
            this.ctx.font = 'bold 20px Inter, sans-serif';
            const scoreText = `ID: ${index} | Face Detected`;

            this.ctx.save();
            if (isMirrored) {
                this.ctx.translate(minX + width, minY - 10);
                this.ctx.scale(-1, 1);
                this.ctx.fillText(scoreText, 0, 0);
            } else {
                this.ctx.fillText(scoreText, minX, minY - 10);
            }
            this.ctx.restore();
        });

        this.ctx.restore();
    }

    updateMetrics(facesCount, fps, latency) {
        this.metrics.faces.textContent = facesCount;
        if (fps !== null) this.metrics.fps.textContent = fps;
        if (latency !== null) this.metrics.ms.textContent = latency.toFixed(1);
    }

    saveCapture(videoElement, isMirrored) {
        if (!videoElement || !videoElement.videoWidth || !videoElement.videoHeight) {
            this.showToast('Camera preview is not ready yet.', 'error');
            return;
        }

        const offscreen = document.createElement('canvas');
        offscreen.width = videoElement.videoWidth;
        offscreen.height = videoElement.videoHeight;
        const ctx = offscreen.getContext('2d');

        if (!ctx) {
            this.showToast('Capture is unavailable in this browser.', 'error');
            return;
        }

        if (isMirrored) {
            ctx.translate(offscreen.width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(videoElement, 0, 0);
        ctx.drawImage(this.canvas, 0, 0);

        const dataUrl = offscreen.toDataURL('image/jpeg', 0.9);
        this.addToGallery(dataUrl);
        this.showToast('Snapshot captured securely!', 'success');
    }

    addToGallery(dataUrl) {
        const emptyState = this.gallery.querySelector('.empty-state');
        if (emptyState) emptyState.remove();

        const wrap = document.createElement('div');
        wrap.className = 'capture-item';
        const img = document.createElement('img');
        img.src = dataUrl;
        wrap.appendChild(img);

        wrap.addEventListener('click', () => {
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `IntelStream_Capture_${new Date().getTime()}.jpg`;
            a.click();
        });

        this.gallery.prepend(wrap);
        const exportBtn = document.getElementById('btn-export-all');
        if (exportBtn) exportBtn.style.display = 'block';
    }

    showToast(message, type = 'info') {
        if (!this.toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        this.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}            this.ctx.translate(w, 0);
            this.ctx.scale(-1, 1);
        }

        results.faceLandmarks.forEach((landmarks, index) => {
            // Calculate Bounding Box from Landmarks
            const xCoords = landmarks.map(l => l.x * w);
            const yCoords = landmarks.map(l => l.y * h);
            
            const minX = Math.min(...xCoords);
            const minY = Math.min(...yCoords);
            const maxX = Math.max(...xCoords);
            const maxY = Math.max(...yCoords);
            
            const width = maxX - minX;
            const height = maxY - minY;

            // Draw Neon Bounding Box
            this.ctx.strokeStyle = '#38bdf8';
            this.ctx.lineWidth = 4;
            this.ctx.shadowColor = '#38bdf8';
            this.ctx.shadowBlur = 15;
            this.ctx.strokeRect(minX, minY, width, height);
            
            // Draw UI Text Overlay (handle mirroring logic)
            this.ctx.shadowBlur = 0;
            this.ctx.fillStyle = '#38bdf8';
            this.ctx.font = 'bold 20px Inter, sans-serif';
            
            const scoreText = `ID: ${index} | Face Detected`;
            
            this.ctx.save();
            if (isMirrored) {
                // Un-mirror text drawing so it reads correctly
                this.ctx.translate(minX + width, minY - 10);
                this.ctx.scale(-1, 1);
                this.ctx.fillText(scoreText, 0, 0);
            } else {
                this.ctx.fillText(scoreText, minX, minY - 10);
            }
            this.ctx.restore();
        });

        this.ctx.restore();
    }

    updateMetrics(facesCount, fps, latency) {
        this.metrics.faces.textContent = facesCount;
        if (fps !== null) this.metrics.fps.textContent = fps;
        if (latency !== null) this.metrics.ms.textContent = latency.toFixed(1);
    }

    saveCapture(videoElement, isMirrored) {
        const offscreen = document.createElement('canvas');
        offscreen.width = videoElement.videoWidth;
        offscreen.height = videoElement.videoHeight;
        const ctx = offscreen.getContext('2d');
        
        if (isMirrored) {
            ctx.translate(offscreen.width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(videoElement, 0, 0);
        
        // Overlay current AI data
        ctx.drawImage(this.canvas, 0, 0);

        const dataUrl = offscreen.toDataURL('image/jpeg', 0.9);
        this.addToGallery(dataUrl);
        this.showToast('Snapshot captured securely!', 'success');
    }

    addToGallery(dataUrl) {
        const emptyState = this.gallery.querySelector('.empty-state');
        if (emptyState) emptyState.remove();
        
        const wrap = document.createElement('div');
        wrap.className = 'capture-item';
        
        const img = document.createElement('img');
        img.src = dataUrl;
        
        wrap.appendChild(img);
        
        // Click to download
        wrap.addEventListener('click', () => {
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `IntelStream_Capture_${new Date().getTime()}.jpg`;
            a.click();
        });
        
        this.gallery.prepend(wrap);
        document.getElementById('btn-export-all').style.display = 'block';
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        this.toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}
