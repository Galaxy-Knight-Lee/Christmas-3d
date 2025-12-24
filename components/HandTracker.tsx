import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker, DrawingUtils } from '@mediapipe/tasks-vision';
import { useStore } from '../store';
import { GestureState } from '../types';

export const HandTracker: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const { setGestureState, setHandScore, demoMode, toggleDemoMode } = useStore();

  useEffect(() => {
    let handLandmarker: HandLandmarker | null = null;
    let animationFrameId: number;

    const setupMediaPipe = async () => {
      try {
        // Use version 0.10.9 specifically to match package.json dependencies
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm"
        );
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        setLoading(false);
        startWebcam();
      } catch (error) {
        console.error("Error loading MediaPipe:", error);
        setLoading(false);
        toggleDemoMode(); // Fallback to demo mode if model fails
      }
    };

    const startWebcam = async () => {
      if (!videoRef.current) return;
      
      // Check for browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn("navigator.mediaDevices.getUserMedia is not available");
        toggleDemoMode();
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            facingMode: "user",
            width: { ideal: 640 }, 
            height: { ideal: 480 }
          } 
        });
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener("loadeddata", predictWebcam);
      } catch (err) {
        console.error("Error accessing webcam:", err);
        // Fallback to demo mode if camera fails (e.g. not found or denied)
        toggleDemoMode();
      }
    };

    const predictWebcam = () => {
      if (!handLandmarker || !videoRef.current || !canvasRef.current) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) return;

      // Match canvas size to video
      if (canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      let startTimeMs = performance.now();
      if (video.currentTime > 0) {
        const result = handLandmarker.detectForVideo(video, startTimeMs);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (result.landmarks && result.landmarks.length > 0) {
          const landmarks = result.landmarks[0];
          
          // Draw logic
          const drawingUtils = new DrawingUtils(ctx);
          drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, { color: "#FFD700", lineWidth: 2 });
          drawingUtils.drawLandmarks(landmarks, { color: "#FFFFFF", lineWidth: 1, radius: 2 });

          // Logic: Calculate openness
          // Compare Wrist (0) to Tips (4, 8, 12, 16, 20)
          const wrist = landmarks[0];
          const tips = [4, 8, 12, 16, 20].map(i => landmarks[i]);
          
          // Calculate average distance from wrist to tips
          let totalDist = 0;
          tips.forEach(tip => {
            const d = Math.sqrt(
              Math.pow(tip.x - wrist.x, 2) + 
              Math.pow(tip.y - wrist.y, 2) + 
              Math.pow(tip.z - wrist.z, 2)
            );
            totalDist += d;
          });
          
          const avgDist = totalDist / 5;
          
          // Heuristic thresholds (normalized roughly 0.1 to 0.4 usually)
          const minOpen = 0.15;
          const maxOpen = 0.35;
          const score = Math.min(Math.max((avgDist - minOpen) / (maxOpen - minOpen), 0), 1);
          
          setHandScore(score);
          setGestureState(score > 0.5 ? GestureState.EXPLODE : GestureState.TREE);

        } else {
           // No hand detected
        }
      }
      
      if (!demoMode) {
        animationFrameId = requestAnimationFrame(predictWebcam);
      }
    };

    if (!demoMode) {
      setupMediaPipe();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      handLandmarker?.close();
      if(videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [demoMode, setGestureState, setHandScore, toggleDemoMode]);

  if (demoMode) return null;

  return (
    <div className="relative w-48 h-36 bg-black/50 border border-amber-500/30 rounded-lg overflow-hidden backdrop-blur-sm">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-amber-500 text-xs">
          Loading AI Model...
        </div>
      )}
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover opacity-50" autoPlay playsInline muted />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover flip-horizontal" style={{ transform: 'scaleX(-1)' }} />
      <div className="absolute bottom-1 left-2 text-[10px] text-amber-500 font-mono">
        MEDIAPIPE DEBUG
      </div>
    </div>
  );
};