import React from 'react';
import { 
  Heart, 
  Pill, 
  Stethoscope, 
  Play,
  Star,
  Clock,
} from 'lucide-react';
import { User } from '../../types';

interface SimulationHubProps {
  user: User;
  onNavigate: (page: string) => void;
}

const simulations = [
  {
    id: 'pulse-checking',
    title: 'Pulse Check Simulation',
    description: 'Practice proper pulse assessment techniques with realistic patient scenarios',
    icon: Heart,
    difficulty: 'Beginner',
    //duration: '10-15 min',
    rating: 4.8,
    //completions: 156,
    color: 'bg-red-500',
    available: true
  },
  {
    id: 'medication-admin',
    title: 'Medication Administration',
    description: 'Learn safe medication practices and the five rights of administration',
    icon: Pill,
    difficulty: 'Intermediate',
    //duration: '20-30 min',
    rating: 4.9,
    //completions: 89,
    color: 'bg-green-500',
    available: true // Coming soon
  },
  {
    id: 'wound-dressing',
    title: 'Wound Dressing Simulation',
    description: 'Practice proper wound dressing techniques with realistic patient scenarios',
    icon: Stethoscope,
    difficulty: 'Advanced',
    //duration: '30-45 min',
    rating: 4.7,
    //completions: 67,
    color: 'bg-purple-500',
    available: true // Coming soon
  },
  {
    id: 'blood-glucose',
    title: 'Blood Glucose Simulation',
    description: 'Practice proper blood glucose monitoring techniques with realistic patient scenarios',
    icon: Pill,
    difficulty: 'Advanced',
    //duration: '30-45 min',
    rating: 4.7,
    //completions: 67,
    color: 'bg-purple-500',
    available: true // Coming soon
  },
  {
    id: 'blood-pressure',
    title: 'Blood Pressure Simulation',
    description: 'Practice proper blood pressure monitoring techniques with realistic patient scenarios',
    icon: Pill,
    difficulty: 'Advanced',
    //duration: '30-45 min',
    rating: 4.7,
    //completions: 67,
    color: 'bg-purple-500',
    available: false // Coming soon
  }
];

export const SimulationHub: React.FC<SimulationHubProps> = ({ onNavigate }) => {
  const handleStartSimulation = (simulationId: string) => {
    if (simulationId === 'pulse-checking') {
      onNavigate('pulse-simulation');
    } else if (simulationId === 'medication-admin') {
      onNavigate('medication-simulation');
    } else if (simulationId === 'wound-dressing') {
      onNavigate('wound-dressing');
    } else if (simulationId === 'blood-glucose') {
      onNavigate('blood-glucose');
    } else {
      alert('This simulation is coming soon!');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Simulation Center</h1>
          <p className="text-gray-600">
            Practice essential nursing skills in a safe, virtual environment
          </p>
        </div>

        {/* Stats Overview
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Monitor className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-sm text-gray-600">Available Simulations</p>
              </div>
            </div>
          </div>
           */}
          {/* <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">Completed This Week</p>
              </div>
            </div>
          </div> */}
          
          {/* <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">4.8</p>
                <p className="text-sm text-gray-600">Average Rating</p>
              </div>
            </div>
          </div> */}
        {/* </div> */}

        {/* Simulation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {simulations.map((simulation) => {
            const Icon = simulation.icon;
            return (
              <div key={simulation.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${simulation.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{simulation.rating}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(simulation.difficulty)}`}>
                      {simulation.difficulty}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{simulation.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{simulation.description}</p>
                
                {/* <div hidden className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {simulation.duration}
                  </span>
                  <span>{simulation.completions} completed</span>
                </div> */}
                
                {simulation.available ? (
                  <button 
                    onClick={() => handleStartSimulation(simulation.id)}
                    className={`w-full ${simulation.color} hover:opacity-90 text-white py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2 font-medium`}
                  >
                    <Play className="w-4 h-4" />
                    Start Simulation
                  </button>
                ) : (
                  <button 
                    disabled
                    className="w-full bg-gray-100 text-gray-500 py-2 px-4 rounded-lg cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                  >
                    <Clock className="w-4 h-4" />
                    Coming Soon
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Learning Tips */}
        <div className="mt-12 bg-blue-50 rounded-xl p-8 border border-blue-100">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Simulation Learning Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-blue-800 mb-2">Before You Start:</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Review relevant course materials</li>
                <li>• Ensure you have a quiet environment</li>
                <li>• Have paper and pen ready for notes</li>
                <li>• Check your audio settings</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-blue-800 mb-2">During Practice:</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Take your time and think critically</li>
                <li>• Pay attention to feedback messages</li>
                <li>• Repeat simulations to improve scores</li>
                <li>• Practice with different scenarios</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};