export class CameraManager {
    constructor(videoElement) {
        this.video = videoElement;
        this.stream = null;
        this.currentDeviceId = null;
        this.isFrontFacing = true;
        this.videoTrack = null;
    }

    async getDevices() {
        if (!navigator.mediaDevices?.enumerateDevices) return [];

        try {
            const tempStream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
            tempStream.getTracks().forEach(track => track.stop());
        } catch {
            // Ignore permission denial here and still try to enumerate devices.
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.filter(d => d.kind === 'videoinput');
    }

    async start(deviceId = null) {
        this.stop();

        if (!navigator.mediaDevices?.getUserMedia) {
            throw new Error('Camera access is not supported by this browser.');
        }

        const isSecureContext = window.isSecureContext || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
        if (!isSecureContext) {
            throw new Error('Camera access requires a secure context. Please open the app through localhost or HTTPS.');
        }

        const constraints = {
            audio: false,
            video: deviceId
                ? { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
                : { facingMode: this.isFrontFacing ? 'user' : 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        };

        try {
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;
            this.video.muted = true;
            this.video.playsInline = true;
            this.videoTrack = this.stream.getVideoTracks()[0];
            this.video.style.transform = this.isFrontFacing ? 'scaleX(-1)' : 'scaleX(1)';

            return new Promise((resolve, reject) => {
                this.video.onloadedmetadata = async () => {
                    try {
                        await this.video.play();
                        resolve({
                            width: this.video.videoWidth,
                            height: this.video.videoHeight,
                            track: this.videoTrack
                        });
                    } catch (error) {
                        reject(new Error('Camera started, but video playback could not begin.'));
                    }
                };
            });
        } catch (err) {
            this.stop();
            throw new Error(`Camera initialization failed: ${err.message || 'Permission denied or unavailable.'}`);
        }
    }

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.video) {
            this.video.srcObject = null;
        }
        this.videoTrack = null;
    }

    async flip() {
        this.isFrontFacing = !this.isFrontFacing;
        this.currentDeviceId = null;
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
            this.videoTrack.applyConstraints({ advanced: [{ zoom: value }] }).catch(console.warn);
        }
    }
}                    height: this.video.videoHeight,
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
