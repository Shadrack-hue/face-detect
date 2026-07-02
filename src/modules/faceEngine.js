import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export class FaceEngine {
    constructor() {
        this.landmarker = null;
        this.isRunning = false;
    }

    async initialize() {
        const filesetResolver = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
        );

        const commonOptions = {
            outputFaceBlendshapes: false,
            outputFacialTransformationMatrixes: false,
            runningMode: 'VIDEO',
            numFaces: 10,
            minFaceDetectionConfidence: 0.5,
            minFacePresenceConfidence: 0.5,
            minTrackingConfidence: 0.5
        };

        try {
            this.landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
                baseOptions: {
                    modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                    delegate: 'GPU'
                },
                ...commonOptions
            });
        } catch (error) {
            console.warn('GPU face detection delegate is unavailable, retrying with CPU.', error);
            this.landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
                baseOptions: {
                    modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                    delegate: 'CPU'
                },
                ...commonOptions
            });
        }

        return true;
    }

    detect(videoElement, timestamp) {
        if (!this.landmarker || !this.isRunning) return null;
        return this.landmarker.detectForVideo(videoElement, timestamp);
    }

    start() { this.isRunning = true; }
    stop() { this.isRunning = false; }
    toggle() { this.isRunning = !this.isRunning; return this.isRunning; }
}    stop() { this.isRunning = false; }
    toggle() { this.isRunning = !this.isRunning; return this.isRunning; }
}
