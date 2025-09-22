import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { User, SimulationResult } from '../../types';

interface PulseCheckSimulationProps {
  user: User;
  onComplete: (result: SimulationResult) => void;
  onBack: () => void;
  addNotification: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export const PulseCheckSimulation: React.FC<PulseCheckSimulationProps> = ({
  user,
  onComplete,
  onBack,
  addNotification,
}) => {
  const [isHolding, setIsHolding] = useState(false);
  const [timeHeld, setTimeHeld] = useState(0);
  const [pulseCount, setPulseCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Refs required by your requested hooks
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track active hold to avoid double-stops
  const holdActiveRef = useRef(false);

  // Heartbeat sound while holding (as requested)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      const createHeartbeatSound = () => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
      };

      if (isHolding) {
        const playHeartbeat = () => {
          try {
            createHeartbeatSound();
          } catch {
            console.log('Audio not supported');
          }
        };

        playHeartbeat();
        const heartbeatInterval = setInterval(playHeartbeat, 800);
        return () => clearInterval(heartbeatInterval);
      }
    }
  }, [isHolding]);

 useEffect(() => {
  if (isHolding) {
    intervalRef.current = setInterval(() => {
      setTimeHeld(prev => {
        const newTime = prev + 0.1;
        if (newTime >= 15) {
          setIsHolding(false);
          setIsCompleted(true);

          // ✅ Fix: calculate new pulse count safely
          const newPulseCount = pulseCount + 1;
          setPulseCount(newPulseCount);

          const result: SimulationResult = {
            id: Date.now().toString(),
            simulationType: 'pulse-checking',
            studentId: user.id,
            score: 75,
            details: { pulseCount: newPulseCount, timeTaken: newTime },
            completedAt: new Date(),
          };
          if (isCompleted) return 0; // Avoid duplicate complete
            setIsCompleted(true);

          onComplete(result);

          return 0;
        }
        return newTime;
      });
    }, 100);
  } else {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  return () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
}, [isHolding, user.id, onComplete]);


  // ---- Start/Stop helpers ----
  const startHold = () => {
    if (holdActiveRef.current) return;
    holdActiveRef.current = true;
    setIsCompleted(false);
    setTimeHeld(0);
    setIsHolding(true);
    addNotification('Started pulse check. Hold for 15 seconds.', 'info');
  };

  const stopHold = (opts?: { reason?: 'outside' | 'early' | 'cancel' }) => {
    if (!holdActiveRef.current) return;
    holdActiveRef.current = false;

    const wasEarly = timeHeld < 15 && timeHeld > 0;
    if (opts?.reason === 'outside') {
      addNotification('Keep your fingers inside the pulse zone.', 'warning');
    } else if (opts?.reason === 'cancel') {
      addNotification('Measurement canceled.', 'warning');
    } else if (wasEarly) {
      addNotification('Hold your fingers still for the full 15 seconds!', 'warning');
      warningTimeoutRef.current = setTimeout(() => {}, 3000);
    }

    setIsHolding(false);
    setTimeHeld(0);
  };
  // ----------------------------

  // Mouse-style wrappers (kept for keyboard reuse)
  const handleMouseDown = (e: React.SyntheticEvent) => {
    e.preventDefault();
    startHold();
  };
  const handleMouseUp = () => {
    stopHold();
  };

  // Pointer handlers with capture + move-out detection
  const LEAVE_TOLERANCE_PX = 4; // small buffer to avoid accidental exits on jitter

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    handleMouseDown(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!holdActiveRef.current) return;

    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    const inside =
      x >= rect.left - LEAVE_TOLERANCE_PX &&
      x <= rect.right + LEAVE_TOLERANCE_PX &&
      y >= rect.top - LEAVE_TOLERANCE_PX &&
      y <= rect.bottom + LEAVE_TOLERANCE_PX;

    if (!inside) {
      try {
        if (el.hasPointerCapture?.(e.pointerId)) {
          el.releasePointerCapture(e.pointerId);
        }
      } catch {}
      stopHold({ reason: 'outside' });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      if ((e.currentTarget as HTMLElement).hasPointerCapture?.(e.pointerId)) {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      }
    } catch {}
    handleMouseUp();
  };

  const handlePointerLeave = () => {
    // Fallback (most moves are handled by handlePointerMove with capture)
    if (holdActiveRef.current) stopHold({ reason: 'outside' });
  };

  const handlePointerCancel = () => stopHold({ reason: 'cancel' });

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      startHold();
    }
  };
  const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      stopHold();
    }
  };

  const resetSimulation = () => {
    holdActiveRef.current = false;
    setIsHolding(false);
    setTimeHeld(0);
    setPulseCount(0);
    setIsCompleted(false);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    addNotification('Simulation reset.', 'info');
  };

  const progress = Math.min(timeHeld / 15, 1);

  return (
    <div
      className="min-h-screen bg-gray-50 p-6 simulation-cursor select-none"
      style={{ cursor: 'url("../../../img/fingers.png") 16 0, auto' }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            style={{ cursor: 'url("../../../img/fingers.png") 16 0, auto' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pulse Check Simulation</h1>
            <p className="text-gray-600">Practice proper pulse assessment technique</p>
          </div>
          <button
            onClick={resetSimulation}
            disabled={isHolding}
            className={`ml-auto flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              isHolding
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Instructions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Objective:</h3>
                <p className="text-gray-600 text-sm">
                  Learn to check a patient's pulse using proper finger placement and timing.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Steps:</h3>
                <ol className="text-gray-600 text-sm space-y-1">
                  <li>1. Press and hold on the pulse zone</li>
                  <li>2. Hold still for exactly 15 seconds</li>
                  <li>3. Listen for the heartbeat sounds</li>
                  <li>4. Complete the measurement</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Simulation Area */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Pulse Check Station</h3>
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  Timer: <span className="font-mono">{timeHeld.toFixed(1)}s / 15.0s</span>
                </div>
                <div className="text-sm">
                  Pulse Count: <span className="font-bold">{pulseCount}</span>
                </div>
              </div>
            </div>

            <div className="relative h-96 bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center">
              {/* Hand/Wrist Visual (image) */}
              <div className="relative">
                <img
                  src="../../../img/hand.png"
                  alt="Hand Palm"
                  className="w-32 h-48 object-contain rotate-12 select-none pointer-events-none"
                  draggable={false}
                />

                {/* Pulse Zone (overlay hotspot) */}
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Pulse zone — press and hold for 15 seconds"
                  className={`absolute top-[10rem] left-[2.3rem] w-8 h-6 rounded-full border-4 border-dashed transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    isHolding ? 'border-green-500 bg-green-100' : 'border-blue-500 bg-blue-100 hover:bg-blue-200'
                  }`}
                  style={{
                    touchAction: 'none',
                    backgroundImage: isHolding
                      ? `conic-gradient(rgba(16,185,129,0.6) ${Math.floor(progress * 360)}deg, rgba(16,185,129,0.15) 0deg)`
                      : undefined,
                  }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerLeave}
                  onPointerCancel={handlePointerCancel}
                  onKeyDown={handleKeyDown}
                  onKeyUp={handleKeyUp}
                />
              </div>
            </div>

            {/* Session Summary */}
            {isCompleted && (
              <div className="mt-6 bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">Session Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{pulseCount}</div>
                    <div className="text-sm text-blue-800">Successful Checks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">75</div>
                    <div className="text-sm text-blue-800">Average BPM</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">Normal</div>
                    <div className="text-sm text-blue-800">Range Assessment</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
