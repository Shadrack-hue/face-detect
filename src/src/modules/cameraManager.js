export class CameraManager {
    constructor(videoElement) {
        this.video = videoElement;
        this.stream = null;
        this.currentDeviceId = null;
        this.isFrontFacing = true;
        this.videoTrack = null;
    }

    async getDevices() {
        await navigator.mediaDevices.getUserMedia({ audio: false, video: true }).catch(() => {}); // Force permission prompt if needed
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.filter(d => d.kind === 'videoinput');
    }

    async start(deviceId = null) {
        this.stop();
        
        const constraints = {
            audio: false,
            video: deviceId 
                ? { deviceId: { exact: deviceId } }
                : { facingMode: this.isFrontFacing ? 'user' : 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
        };

        try {
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;
            this.videoTrack = this.stream.getVideoTracks()[0];
            
            // Handle native CSS mirroring for front camera
            this.video.style.transform = this.isFrontFacing ? 'scaleX(-1)' : 'scaleX(1)';
            
            return new Promise((resolve) => {
                this.video.onloadedmetadata = () => resolve({
                    width: this.video.videoWidth,
                    height: this.video.videoHeight,
                    track: this.videoTrack
                });
            });
        } catch (err) {
            throw new Error(`Camera initialization failed: ${err.message}`);
        }
    }

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    }

    async flip() {
        this.isFrontFacing = !this.isFrontFacing;
        this.currentDeviceId = null; // Reset specific device selection
        return this.start();
    }

    getCapabilities() {
        if (this.videoTrack && this.videoTrack.getCapabilities) {
            return this.videoTrack.getCapabilities();
        }
        return null;
    }

    applyZoom(value) {
        if (this.videoTrack && this.videoTrack.applyConstraints) {
            this.videoTrack.applyConstraints({
                advanced: [{ zoom: value }]
            }).catch(console.warn);
        }
    }
}
