import React, { useState } from 'react';
import { ArrowLeft, RotateCcw, Ban as Bandage, CheckCircle, AlertTriangle } from 'lucide-react';
import { User } from '../../types';

interface WoundDressingSimulationProps {
  user: User;
  onBack: () => void;
  onComplete: (payload: { score: number; details?: any }) => void;
  addNotification: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

const dressingItems = [
  { id: 'gloves', name: 'Sterile Gloves', required: true },
  { id: 'antiseptic', name: 'Antiseptic Solution', required: true },
  { id: 'gauze', name: 'Sterile Gauze', required: true },
  { id: 'tape', name: 'Medical Tape', required: true },
  { id: 'bandage', name: 'Elastic Bandage', required: false },
];

const steps = [
  { id: 'gloves', title: 'Put on sterile gloves', description: 'Apply sterile gloves before touching any sterile equipment' },
  { id: 'antiseptic', title: 'Clean the wound', description: 'Apply antiseptic solution to clean the wound area' },
  { id: 'gauze', title: 'Apply sterile gauze', description: 'Place sterile gauze pad over the wound' },
  { id: 'tape', title: 'Secure with tape', description: 'Use medical tape to secure the gauze in place' }
];

export const WoundDressingSimulation: React.FC<WoundDressingSimulationProps> = ({onBack, onComplete, addNotification }) => {
  const [items, setItems] = useState(() => dressingItems.map(item => ({ ...item, applied: false })));
  const [currentStep, setCurrentStep] = useState(0);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [sterileFieldMaintained, setSterileFieldMaintained] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDragStart = (itemId: string) => setDraggedItem(itemId);
  const handleDragEnd = () => setDraggedItem(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem || currentStep >= steps.length) return;

    const expectedItem = steps[currentStep].id;
    if (draggedItem === expectedItem) {
      setItems(prev => prev.map(item => item.id === draggedItem ? { ...item, applied: true } : item));
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setProgress((nextStep / steps.length) * 100);
      if (nextStep === steps.length) handleCompletion();
    } else {
      setSterileFieldMaintained(false);
      addNotification('Incorrect item! You broke the sterile technique.', 'error');
    }
  };

  const handleCompletion = () => {
    const completedSteps = items.filter(i => i.required && i.applied).length;
    const totalRequired = items.filter(i => i.required).length;
    const baseScore = (completedSteps / totalRequired) * 100;
    const finalScore = sterileFieldMaintained ? baseScore : Math.max(baseScore * 0.5, 0);

    setShowResult(true);
    onComplete({ score: Math.round(finalScore), details: { sterileFieldMaintained } });
    addNotification(`Wound dressing simulation completed. Score: ${Math.round(finalScore)}%`, finalScore >= 70 ? 'success' : 'warning');
  };

  const resetSimulation = () => {
    setItems(dressingItems.map(item => ({ ...item, applied: false })));
    setCurrentStep(0);
    setDraggedItem(null);
    setSterileFieldMaintained(true);
    setShowResult(false);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="mr-2 w-5 h-5" />
            Back
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Wound Dressing Simulation</h1>
        </div>
        <button
          onClick={resetSimulation}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-800 mb-1">Progress: {Math.round(progress)}%</h2>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-purple-500 h-3 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Current Step */}
        {!showResult && currentStep < steps.length && (
          <div className="mb-6 p-4 bg-white shadow rounded-lg">
            <h3 className="text-lg font-semibold mb-1">{steps[currentStep].title}</h3>
            <p className="text-sm text-gray-600">{steps[currentStep].description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Supply Tray */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-purple-600 font-semibold mb-2">Sterile Supply Tray</h3>
            <div className="grid grid-cols-2 gap-4">
              {items.map(item => (
                <div
                  key={item.id}
                  draggable={!item.applied}
                  onDragStart={() => handleDragStart(item.id)}
                  onDragEnd={handleDragEnd}
                  className={`p-3 border rounded transition-all ${
                    item.applied ? 'bg-green-100 opacity-50' : 'bg-white cursor-move hover:shadow-md'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-700">{item.name}</div>
                  <div className="text-xs text-gray-500">
                    {item.required && 'Required'} {item.applied && '✔'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Wound Site */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-red-600 font-semibold mb-2">Wound Site</h3>
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              className={`h-48 border-4 border-dashed rounded-lg flex items-center justify-center transition-colors ${
                draggedItem ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-gray-100'
              }`}
            >
              <span className="text-gray-600 text-sm">
                {currentStep < steps.length ? 'Drop item here' : 'Dressing complete'}
              </span>
            </div>
          </div>
        </div>

        {/* Sterile Field Status */}
        <div className="mt-6 flex items-center text-sm">
          {sterileFieldMaintained ? (
            <CheckCircle className="text-green-600 mr-2" />
          ) : (
            <AlertTriangle className="text-red-600 mr-2" />
          )}
          <span className={sterileFieldMaintained ? 'text-green-800' : 'text-red-800'}>
            Sterile Field: {sterileFieldMaintained ? 'Maintained' : 'Compromised'}
          </span>
        </div>

        {/* Result */}
        {showResult && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bandage className="text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">Wound Dressing Complete!</h3>
            </div>
            <p className="text-sm text-blue-800 mb-2">
              Your technique has been evaluated. Review your score and try again if needed.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
