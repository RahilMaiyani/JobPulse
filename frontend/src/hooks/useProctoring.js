import { useState, useEffect, useRef, useCallback } from 'react';

export default function useProctoring(onEventTriggered) {
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  const [videoElement, setVideoElement] = useState(null);
  const [canvasElement, setCanvasElement] = useState(null);
  const drawIntervalRef = useRef(null);
  const lastSnapshotTimeRef = useRef(0);

  const setVideoRef = useCallback((node) => {
    setVideoElement(node);
    if (node && stream) {
      if (node.srcObject !== stream) {
        node.srcObject = stream;
        node.play().catch(e => console.error("Video play error:", e));
      }
    }
  }, [stream]);

  const setCanvasRef = useCallback((node) => {
    setCanvasElement(node);
  }, []);

  // Initialize Webcam
  const startWebcam = useCallback(async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      setStream(mediaStream);
      setIsWebcamActive(true);
    } catch (err) {
      console.error("Failed to access webcam:", err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera access was denied. Please click the lock icon in your browser address bar to allow camera access, then try again.'
          : 'Could not access the camera. Please ensure it is connected and not used by another application.'
      );
      setIsWebcamActive(false);
    }
  }, []);

  const stopWebcam = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsWebcamActive(false);
    }
    if (drawIntervalRef.current) {
      clearInterval(drawIntervalRef.current);
    }
  }, [stream]);

  // Buffer drawing loop (every 500ms)
  useEffect(() => {
    if (isWebcamActive && videoElement && canvasElement) {
      drawIntervalRef.current = setInterval(() => {
        if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
          canvasElement.width = videoElement.videoWidth;
          canvasElement.height = videoElement.videoHeight;
          const ctx = canvasElement.getContext('2d');
          ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
        }
      }, 500); // 500ms buffer
    }

    return () => {
      if (drawIntervalRef.current) clearInterval(drawIntervalRef.current);
    };
  }, [isWebcamActive, videoElement, canvasElement]);

  const graceTimerRef = useRef(null);

  // Trigger snapshot logic
  const captureSnapshot = useCallback((eventType, isStrike = true, preCapturedImage = null) => {
    if (!isStrike) {
      // Just trigger warning locally, don't count as strike or upload
      onEventTriggered(eventType, null, false);
      return;
    }

    const now = Date.now();
    // 30 second cooldown
    if (now - lastSnapshotTimeRef.current < 30000) {
      // Just trigger event locally without a new snapshot if on cooldown
      onEventTriggered(eventType, null, true);
      return;
    }

    lastSnapshotTimeRef.current = now;
    let imageData = preCapturedImage;

    if (!imageData && canvasElement && canvasElement.width > 0) {
      try {
        imageData = canvasElement.toDataURL('image/jpeg', 0.5);
      } catch (e) {
        console.error("Canvas capture error:", e);
      }
    }

    onEventTriggered(eventType, imageData, true);
  }, [onEventTriggered, canvasElement]);

  // Event Listeners
  useEffect(() => {
    if (!isWebcamActive) return; // Don't trigger if test hasn't started yet

    const handleOut = (eventType) => {
      // Give immediate warning
      captureSnapshot(eventType, false);

      // Pre-capture image while tab is active to prevent black screens/failures
      let preCapturedImage = null;
      if (canvasElement && canvasElement.width > 0) {
        try { preCapturedImage = canvasElement.toDataURL('image/jpeg', 0.5); }
        catch (e) { }
      }

      // Start 5s timer for actual strike
      if (!graceTimerRef.current) {
        graceTimerRef.current = setTimeout(() => {
          captureSnapshot(eventType, true, preCapturedImage);
          graceTimerRef.current = null;
        }, 5000);
      }
    };

    const handleIn = () => {
      // Clear 5s timer if they return
      if (graceTimerRef.current) {
        clearTimeout(graceTimerRef.current);
        graceTimerRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleOut('tab_switch');
      } else {
        handleIn();
      }
    };

    const handleMouseLeave = (e) => {
      // Detect if mouse left the document body
      if (e.clientY <= 0 || e.clientX <= 0 || (e.clientX >= window.innerWidth || e.clientY >= window.innerHeight)) {
        handleOut('mouse_exit');
      }
    };

    const handleMouseEnter = () => {
      handleIn();
    };

    const handleCopy = (e) => {
      captureSnapshot('copy_attempt', true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('copy', handleCopy);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('copy', handleCopy);
      if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
    };
  }, [isWebcamActive, captureSnapshot, canvasElement]);

  return {
    isWebcamActive,
    startWebcam,
    stopWebcam,
    setVideoRef,
    setCanvasRef,
    cameraError
  };
}
