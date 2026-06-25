import { useState, useEffect, useRef, useCallback } from 'react';

export default function useProctoring(onEventTriggered) {
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamStream, setWebcamStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  const [webcamVideoElement, setWebcamVideoElement] = useState(null);
  const [screenVideoElement, setScreenVideoElement] = useState(null);
  const [canvasElement, setCanvasElement] = useState(null);

  const drawIntervalRef = useRef(null);
  const lastSnapshotTimeRef = useRef(0);
  const graceTimerRef = useRef(null);
  const webcamStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const isIntentionalStopRef = useRef(false);

  const setWebcamVideoRef = useCallback((node) => {
    setWebcamVideoElement(node);
    if (node && webcamStream) {
      if (node.srcObject !== webcamStream) {
        node.srcObject = webcamStream;
        node.play().catch(e => console.error("Webcam play error:", e));
      }
    }
  }, [webcamStream]);

  const setScreenVideoRef = useCallback((node) => {
    setScreenVideoElement(node);
    if (node && screenStream) {
      if (node.srcObject !== screenStream) {
        node.srcObject = screenStream;
        node.play().catch(e => console.error("Screen play error:", e));
      }
    }
  }, [screenStream]);

  const setCanvasRef = useCallback((node) => {
    setCanvasElement(node);
  }, []);

  // Stop everything
  const stopProctoring = useCallback(() => {
    isIntentionalStopRef.current = true;
    if (webcamStreamRef.current) webcamStreamRef.current.getTracks().forEach(track => track.stop());
    if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach(track => track.stop());
    setWebcamStream(null);
    setScreenStream(null);
    webcamStreamRef.current = null;
    screenStreamRef.current = null;
    setIsWebcamActive(false);
    if (drawIntervalRef.current) clearInterval(drawIntervalRef.current);
    if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopProctoring();
  }, [stopProctoring]);

  // Initialize Proctoring (Webcam + Screen)
  const startProctoring = useCallback(async () => {
    try {
      setCameraError(null);
      isIntentionalStopRef.current = false;

      // 1. Request Webcam
      let wStream;
      try {
        wStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false
        });
      } catch (err) {
        throw new Error(err.name === 'NotAllowedError'
          ? 'Camera access was denied.'
          : 'Could not access the camera.');
      }

      // 2. Request Screen Share
      let sStream;
      try {
        sStream = await navigator.mediaDevices.getDisplayMedia({
          video: { displaySurface: "monitor" },
          audio: false
        });
      } catch (err) {
        if (webcamStreamRef.current) webcamStreamRef.current.getTracks().forEach(t => t.stop());
        throw new Error(err.name === 'NotAllowedError'
          ? 'Screen share was denied. You must share your entire screen to proceed. (Mac users: Check System Preferences -> Privacy -> Screen Recording)'
          : 'Could not access screen share. Note: Proctored tests must be taken on a Desktop or Laptop computer (Mobile devices are not supported).');
      }

      // Validate that they selected "Entire Screen" (monitor)
      const videoTrack = sStream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      // On some older browsers, displaySurface might be undefined. If it exists, enforce "monitor".
      if (settings.displaySurface && settings.displaySurface !== 'monitor') {
        wStream.getTracks().forEach(t => t.stop());
        sStream.getTracks().forEach(t => t.stop());
        throw new Error("You selected a specific window or tab. You MUST select 'Entire Screen' to proceed.");
      }

      setWebcamStream(wStream);
      setScreenStream(sStream);
      webcamStreamRef.current = wStream;
      screenStreamRef.current = sStream;
      setIsWebcamActive(true);
    } catch (err) {
      console.error("Failed to start proctoring:", err);
      setCameraError(err.message || 'An unknown error occurred while starting the proctoring engine.');
      setIsWebcamActive(false);
    }
  }, []);

  // Buffer drawing loop (every 500ms) - merges screen and webcam
  useEffect(() => {
    if (isWebcamActive && webcamVideoElement && screenVideoElement && canvasElement) {
      drawIntervalRef.current = setInterval(() => {
        const sWidth = screenVideoElement.videoWidth;
        const sHeight = screenVideoElement.videoHeight;

        if (sWidth > 0 && sHeight > 0) {
          // Cap the resolution to 1280 to prevent massive memory usage
          const maxCanvasWidth = 1280;
          const scale = sWidth > maxCanvasWidth ? maxCanvasWidth / sWidth : 1;
          const drawWidth = sWidth * scale;
          const drawHeight = sHeight * scale;

          canvasElement.width = drawWidth;
          canvasElement.height = drawHeight;
          const ctx = canvasElement.getContext('2d');

          ctx.drawImage(screenVideoElement, 0, 0, drawWidth, drawHeight);

          // Draw Webcam as Picture-in-Picture (bottom right)
          const wWidth = webcamVideoElement.videoWidth;
          const wHeight = webcamVideoElement.videoHeight;
          if (wWidth > 0 && wHeight > 0) {
            const pipWidth = drawWidth * 0.2; // 20% of the canvas width
            const pipHeight = (pipWidth / wWidth) * wHeight;
            const padding = 15;

            // Draw a slight border for visibility
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.fillRect(drawWidth - pipWidth - padding - 4, drawHeight - pipHeight - padding - 4, pipWidth + 8, pipHeight + 8);

            // Draw webcam feed
            ctx.drawImage(webcamVideoElement, drawWidth - pipWidth - padding, drawHeight - pipHeight - padding, pipWidth, pipHeight);
          }
        }
      }, 500);
    }

    return () => {
      if (drawIntervalRef.current) clearInterval(drawIntervalRef.current);
    };
  }, [isWebcamActive, webcamVideoElement, screenVideoElement, canvasElement]);

  // Trigger snapshot logic
  const captureSnapshot = useCallback((eventType, isStrike = true, preCapturedImage = null) => {
    if (!isStrike) {
      onEventTriggered(eventType, null, false);
      return;
    }

    const now = Date.now();
    if (now - lastSnapshotTimeRef.current < 10000) { // 10 sec cooldown
      onEventTriggered(eventType, null, true);
      return;
    }

    lastSnapshotTimeRef.current = now;
    let imageData = preCapturedImage;

    if (!imageData && canvasElement && canvasElement.width > 0) {
      try {
        // Compress the image aggressively to save bandwidth (0.5 JPEG quality)
        imageData = canvasElement.toDataURL('image/jpeg', 0.5);
      } catch (e) {
        console.error("Canvas capture error:", e);
      }
    }

    onEventTriggered(eventType, imageData, true);
  }, [onEventTriggered, canvasElement]);

  // Track disconnection listeners
  useEffect(() => {
    if (!isWebcamActive) return;

    let triggered = false;
    const handleDisconnect = (source) => {
      if (triggered || isIntentionalStopRef.current) return;
      triggered = true;
      captureSnapshot(`${source}_disconnected`, true);
      setCameraError(`Proctoring connection lost (${source}). Please refresh and try again.`);
      setIsWebcamActive(false);
      stopProctoring();
    };

    const wTrack = webcamStreamRef.current?.getVideoTracks()[0];
    const sTrack = screenStreamRef.current?.getVideoTracks()[0];

    const checkTracks = () => {
      if (wTrack && wTrack.readyState === 'ended') handleDisconnect('camera');
      if (sTrack && sTrack.readyState === 'ended') handleDisconnect('screen');
    };

    const onCameraEnd = () => handleDisconnect('camera');
    const onScreenEnd = () => handleDisconnect('screen');

    if (wTrack) wTrack.addEventListener('ended', onCameraEnd);
    if (sTrack) sTrack.addEventListener('ended', onScreenEnd);

    const pollInterval = setInterval(checkTracks, 1000);

    return () => {
      if (wTrack) wTrack.removeEventListener('ended', onCameraEnd);
      if (sTrack) sTrack.removeEventListener('ended', onScreenEnd);
      clearInterval(pollInterval);
    };
  }, [isWebcamActive, captureSnapshot, stopProctoring]);

  // Event Listeners (Tab switch, mouse leave, copy)
  useEffect(() => {
    if (!isWebcamActive) return;

    const handleOut = (eventType) => {
      captureSnapshot(eventType, false); // Warning

      if (!graceTimerRef.current) {
        graceTimerRef.current = setTimeout(() => {
          captureSnapshot(eventType, true, null); // Capture the live screen (what they are currently looking at)
          graceTimerRef.current = null;
        }, 5000);
      }
    };

    const handleIn = () => {
      if (graceTimerRef.current) {
        clearTimeout(graceTimerRef.current);
        graceTimerRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) handleOut('tab_switch');
      else handleIn();
    };

    const handleCopy = () => captureSnapshot('copy_attempt', true);

    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 || e.clientX <= 0 || (e.clientX >= window.innerWidth || e.clientY >= window.innerHeight)) {
        handleOut('mouse_exit');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleIn);
    document.addEventListener('copy', handleCopy);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleIn);
      document.removeEventListener('copy', handleCopy);
      if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
    };
  }, [isWebcamActive, captureSnapshot, canvasElement]);

  return {
    isWebcamActive,
    startProctoring,
    stopProctoring,
    setWebcamVideoRef,
    setScreenVideoRef,
    setCanvasRef,
    cameraError
  };
}
