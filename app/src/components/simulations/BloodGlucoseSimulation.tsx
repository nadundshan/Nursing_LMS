import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Droplets, Syringe, AlertCircle, CheckCircle } from 'lucide-react';
import { User } from '../../types';
interface BloodGlucoseSimulationProps {
  user: User;
  onBack: () => void;
  addNotification: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}
export const BloodGlucoseSimulation: React.FC<BloodGlucoseSimulationProps> = ({ user, onBack, addNotification }) => {
  const [testNumber, setTestNumber] = useState(1);
  const [needlesUsed, setNeedlesUsed] = useState<string[]>([]);
  const [measurements, setMeasurements] = useState<number[]>([]);
  const [currentReading, setCurrentReading] = useState<number | null>(null);
  const [selectedNeedle, setSelectedNeedle] = useState<string | null>(null);
  const [fingerSelected, setFingerSelected] = useState<string | null>(null);
  const [isTestInProgress, setIsTestInProgress] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [timeStarted, setTimeStarted] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const needles = ['needle1', 'needle2', 'needle3', 'needle4'];
  const fingers = ['thumb', 'index', 'middle', 'ring', 'pinky'];
  const correctFingers = ['index', 'middle', 'ring']; // Side of finger pad

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timeStarted && testNumber <= 3) {
      interval = setInterval(() => {
        setTimeElapsed(Date.now() - timeStarted);
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeStarted, testNumber]);

  const handleNeedleSelect = (needleId: string) => {
    if (isTestInProgress) return;
    
    if (!timeStarted) {
      setTimeStarted(Date.now());
    }
    
    setSelectedNeedle(needleId);
  };

  const handleFingerSelect = (fingerId: string) => {
    if (!selectedNeedle || isTestInProgress) return;
    
    setFingerSelected(fingerId);
    performTest(fingerId);
  };

  const performTest = (fingerId: string) => {
    setIsTestInProgress(true);
    const currentErrors: string[] = [];
    
    // Check if needle was reused
    if (needlesUsed.includes(selectedNeedle!)) {
      currentErrors.push('Needle reuse detected - this is unsafe!');
    }
    
    // Check if correct finger area was selected
    if (!correctFingers.includes(fingerId)) {
      currentErrors.push('Incorrect finger selection - use side of finger pad');
    }
    
    // Simulate glucose reading
    setTimeout(() => {
      const reading = Math.floor(Math.random() * 40) + 80; // 80-120 mg/dL
      setCurrentReading(reading);
      setMeasurements(prev => [...prev, reading]);
      setNeedlesUsed(prev => [...prev, selectedNeedle!]);
      setErrors(prev => [...prev, ...currentErrors]);
      
      playBeepSound();
      
      setTimeout(() => {
        setIsTestInProgress(false);
        setSelectedNeedle(null);
        setFingerSelected(null);
        setCurrentReading(null);
        
        if (testNumber < 3) {
          setTestNumber(prev => prev + 1);
        } else {
          setShowResult(true);
        }
      }, 2000);
    }, 1500);
  };

  const playBeepSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  const resetSimulation = () => {
    setTestNumber(1);
    setNeedlesUsed([]);
    setMeasurements([]);
    setCurrentReading(null);
    setSelectedNeedle(null);
    setFingerSelected(null);
    setIsTestInProgress(false);
    setShowResult(false);
    setErrors([]);
    setTimeStarted(null);
    setTimeElapsed(0);
  };

  const getScore = () => {
    const safetyScore = (3 - (needlesUsed.length - new Set(needlesUsed).size)) * 33.33; // Deduct for reused needles
    const techniqueScore = errors.filter(e => e.includes('finger')).length === 0 ? 33.33 : 0;
    const completionScore = measurements.length === 3 ? 33.34 : (measurements.length / 3) * 33.34;
    
    return Math.max(0, Math.round(safetyScore + techniqueScore + completionScore));
  };

  const getAverageGlucose = () => {
    if (measurements.length === 0) return 0;
    return Math.round(measurements.reduce((a, b) => a + b, 0) / measurements.length);
  };

  const formatTime = (ms: number) => {
    return (ms / 1000).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="mr-2 w-5 h-5" />
                Back
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-bold text-gray-900">Blood Glucose Testing</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Test {testNumber}/3 • Time: {formatTime(timeElapsed)}s
              </div>
              <button
                onClick={resetSimulation}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instructions */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Blood Glucose Testing Protocol</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-800 mb-2">Safety Requirements</h3>
              <ul className="text-orange-700 space-y-1">
                <li>• Use a new needle for each test</li>
                <li>• Never reuse needles</li>
                <li>• Dispose of needles safely</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Proper Technique</h3>
              <ul className="text-blue-700 space-y-1">
                <li>• Use side of finger pad</li>
                <li>• Avoid thumb and pinky</li>
                <li>• Clean puncture site</li>
              </ul>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Testing Process</h3>
              <ul className="text-green-700 space-y-1">
                <li>• Complete 3 tests total</li>
                <li>• Record each reading</li>
                <li>• Check for consistency</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Testing Kit */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-orange-600 text-white p-4">
              <h3 className="text-lg font-semibold">Glucose Testing Kit</h3>
              <p className="text-orange-100 text-sm">Select needle and perform test</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Glucose Meter */}
              <div className="bg-gray-900 text-white p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-2">GLUCOSE METER</div>
                  {currentReading ? (
                    <div>
                      <div className="text-3xl font-bold">{currentReading}</div>
                      <div className="text-sm">mg/dL</div>
                    </div>
                  ) : (
                    <div className="text-lg text-gray-400">--</div>
                  )}
                </div>
              </div>

              {/* Needles */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Select Needle:</h4>
                <div className="grid grid-cols-2 gap-3">
                  {needles.map((needle) => {
                    const isUsed = needlesUsed.includes(needle);
                    const isSelected = selectedNeedle === needle;
                    
                    return (
                      <button
                        key={needle}
                        onClick={() => handleNeedleSelect(needle)}
                        disabled={isTestInProgress}
                        className={`p-3 rounded-lg border-2 transition-all flex items-center space-x-2 ${
                          isUsed 
                            ? 'bg-red-100 border-red-300 cursor-not-allowed' 
                            : isSelected
                            ? 'bg-blue-100 border-blue-400'
                            : 'bg-gray-50 border-gray-300 hover:border-orange-400'
                        }`}
                      >
                        <Syringe className={`w-4 h-4 ${
                          isUsed ? 'text-red-500' : isSelected ? 'text-blue-500' : 'text-gray-600'
                        }`} />
                        <div className="text-left">
                          <div className={`text-sm font-medium ${
                            isUsed ? 'text-red-700' : 'text-gray-800'
                          }`}>
                            Needle {needle.slice(-1)}
                          </div>
                          <div className={`text-xs ${
                            isUsed ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {isUsed ? 'Used' : 'Sterile'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Hand/Finger Selection */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-blue-600 text-white p-4">
              <h3 className="text-lg font-semibold">Finger Selection</h3>
              <p className="text-blue-100 text-sm">Choose the correct finger for testing</p>
            </div>
            
            <div className="p-6">
              <div className="h-80 relative flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg">
                {/* Hand illustration */}
                <div className="relative">
                  <div className="w-48 h-32 bg-gradient-to-br from-amber-200 to-amber-300 rounded-t-full relative">
                    {/* Fingers */}
                    {fingers.map((finger, index) => {
                      const isCorrect = correctFingers.includes(finger);
                      const isSelected = fingerSelected === finger;
                      
                      return (
                        <button
                          key={finger}
                          onClick={() => handleFingerSelect(finger)}
                          disabled={!selectedNeedle || isTestInProgress}
                          className={`absolute w-8 h-16 rounded-full transition-all ${
                            !selectedNeedle 
                              ? 'bg-amber-300 cursor-not-allowed'
                              : isSelected
                              ? 'bg-red-400 scale-110'
                              : isCorrect
                              ? 'bg-green-300 hover:bg-green-400 cursor-pointer'
                              : 'bg-red-300 hover:bg-red-400 cursor-pointer'
                          }`}
                          style={{
                            left: `${20 + index * 20}px`,
                            top: '-30px'
                          }}
                        >
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-700">
                            {finger === 'thumb' ? '👍' : 
                             finger === 'index' ? '☝️' : 
                             finger === 'middle' ? '🖕' : 
                             finger === 'ring' ? '💍' : '🤙'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="text-center mt-4">
                    <div className="text-sm text-gray-600">
                      {!selectedNeedle ? 'Select a needle first' : 
                       isTestInProgress ? 'Testing in progress...' : 
                       'Click on a finger to test'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Progress */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((test) => (
              <div key={test} className={`p-4 rounded-lg border-2 ${
                test <= measurements.length 
                  ? 'bg-green-50 border-green-200' 
                  : test === testNumber && isTestInProgress
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="text-center">
                  <div className="font-semibold text-gray-800">Test {test}</div>
                  {test <= measurements.length ? (
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {measurements[test - 1]}
                      </div>
                      <div className="text-sm text-green-800">mg/dL</div>
                    </div>
                  ) : test === testNumber && isTestInProgress ? (
                    <div className="text-blue-600">
                      <Droplets className="w-6 h-6 mx-auto animate-pulse" />
                      <div className="text-sm">Testing...</div>
                    </div>
                  ) : (
                    <div className="text-gray-400">Pending</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h4 className="font-medium text-red-800">Safety & Technique Issues</h4>
            </div>
            <ul className="text-red-700 text-sm space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Results */}
        {showResult && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-blue-900">Testing Session Complete!</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{getScore()}%</div>
                <div className="text-sm text-blue-800">Overall Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{getAverageGlucose()}</div>
                <div className="text-sm text-blue-800">Avg Glucose (mg/dL)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{errors.length}</div>
                <div className="text-sm text-blue-800">Safety Issues</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{formatTime(timeElapsed)}s</div>
                <div className="text-sm text-blue-800">Total Time</div>
              </div>
            </div>
            
            <div className="text-sm text-blue-700">
              <p><strong>Assessment:</strong> {
                getScore() >= 90 ? 'Excellent glucose testing technique! You followed proper safety protocols and used correct finger placement.' :
                getScore() >= 70 ? 'Good technique with some areas for improvement. Review safety protocols and proper finger selection.' :
                'Needs significant improvement. Please review glucose testing procedures, especially needle safety and proper finger selection.'
              }</p>
              
              <div className="mt-3">
                <strong>Glucose Readings:</strong> {measurements.join(', ')} mg/dL
                <br />
                <strong>Interpretation:</strong> {
                  getAverageGlucose() < 70 ? 'Low blood sugar (hypoglycemia)' :
                  getAverageGlucose() > 126 ? 'High blood sugar (hyperglycemia)' :
                  'Normal blood sugar range'
                }
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};