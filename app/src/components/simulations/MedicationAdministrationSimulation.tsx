// src/components/simulations/MedicationSimulation.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Pill,
  ClipboardCheck,
  CheckCircle,
  AlertCircle,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { User, SimulationResult } from '../../types';

interface MedicationAdministrationSimulation {
  user: User;
  onComplete: (result: SimulationResult) => void;
  onBack: () => void;
  addNotification: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

/**
 * Medication Administration Simulation
 * - Goal: Administer the correct medication by following the "Five Rights":
 *   1) Right Patient  2) Right Medication  3) Right Dose  4) Right Route  5) Right Time
 *
 * Flow:
 * - Read the prescription card
 * - Select the correct medication from the cart
 * - Confirm each of the 5-rights via checkboxes
 * - Start timer (optional realism) and press "Administer"
 * - Score is based on correctness + checks completed (with a small time penalty)
 */
export const MedicationSimulation: React.FC<MedicationAdministrationSimulation> = ({
  user,
  onComplete,
  onBack,
  addNotification,
}) => {
  // ---- Demo data (could come from Firestore later) ----
  const prescription = useMemo(
    () => ({
      id: 'rx-001',
      patientName: 'John Doe',
      medication: 'Amoxicillin',
      dose: '500 mg',
      route: 'PO', // by mouth
      time: 'Now',
      note: 'Administer after meal if possible.',
    }),
    []
  );

  const medicationCart = useMemo(
    () => [
      {
        id: 'med-1',
        label: 'Amoxicillin 500 mg (PO)',
        med: 'Amoxicillin',
        dose: '500 mg',
        route: 'PO',
      },
      {
        id: 'med-2',
        label: 'Amoxicillin 250 mg (PO)',
        med: 'Amoxicillin',
        dose: '250 mg',
        route: 'PO',
      },
      {
        id: 'med-3',
        label: 'Azithromycin 500 mg (PO)',
        med: 'Azithromycin',
        dose: '500 mg',
        route: 'PO',
      },
      {
        id: 'med-4',
        label: 'Amoxicillin 500 mg (IV)',
        med: 'Amoxicillin',
        dose: '500 mg',
        route: 'IV',
      },
    ],
    []
  );

  // ---- State ----
  const [selectedMedicationId, setSelectedMedicationId] = useState<string | null>(null);
  const [checks, setChecks] = useState({
    patient: false,
    medication: false,
    dose: false,
    route: false,
    time: false,
  });

  const [isTiming, setIsTiming] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0); // seconds
  const timerRef = useRef<number | null>(null);

  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [wasCorrectMedication, setWasCorrectMedication] = useState<boolean | null>(null);

  // ---- Timer ----
  useEffect(() => {
    if (isTiming) {
      timerRef.current = window.setInterval(() => {
        setTimeElapsed((t) => t + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isTiming]);

  // ---- Helpers ----
  const selectedMedication = useMemo(
    () => medicationCart.find((m) => m.id === selectedMedicationId) || null,
    [medicationCart, selectedMedicationId]
  );

  const allChecksDone = Object.values(checks).every(Boolean);

  const isCorrectMedication =
    selectedMedication &&
    selectedMedication.med === prescription.medication &&
    selectedMedication.dose === prescription.dose &&
    selectedMedication.route === prescription.route;

  const resetSimulation = () => {
    setSelectedMedicationId(null);
    setChecks({ patient: false, medication: false, dose: false, route: false, time: false });
    setIsTiming(false);
    setTimeElapsed(0);
    setShowResult(false);
    setScore(0);
    setWasCorrectMedication(null);
    addNotification('Simulation reset.', 'info');
  };

  // ---- Administer Logic ----
  const administerMedication = () => {
    if (!selectedMedication) {
      addNotification('Select a medication from the cart first.', 'warning');
      return;
    }
    if (!allChecksDone) {
      addNotification('Confirm all 5 rights before administering.', 'warning');
      return;
    }

    // Compute score:
    // - Correct med: base 60 + 8 points per confirmed right (5 * 8 = 40) => 100 max
    // - Wrong med: base 0 + 8 points per right => up to 40
    // - Time penalty: subtract 1 point every 10 seconds (max 10 points)
    const rightsCompleted = Object.values(checks).filter(Boolean).length;
    const base = isCorrectMedication ? 60 : 0;
    const rightsScore = rightsCompleted * 8; // 0..40
    const raw = base + rightsScore;

    const penalty = Math.min(Math.floor(timeElapsed / 10), 10);
    const finalScore = Math.max(0, Math.min(100, raw - penalty));

    setScore(finalScore);
    setShowResult(true);
    setWasCorrectMedication(!!isCorrectMedication);
    setIsTiming(false);

    addNotification(
      isCorrectMedication
        ? 'Medication administered correctly!'
        : 'Incorrect medication selected. Review the prescription.',
      isCorrectMedication ? 'success' : 'error'
    );

    // Report result to parent
    const result: SimulationResult = {
      id: Date.now().toString(),
      simulationType: 'medication-admin',
      studentId: user.id,
      score: finalScore,
      details: {
        prescription,
        selectedMedication,
        checks,
        timeElapsed,
        isCorrectMedication: !!isCorrectMedication,
      },
      completedAt: new Date(),
    };
    onComplete(result);
  };

  // ---- UI ----
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-5 h-5" />
              <span className="font-medium tabular-nums">
                {String(Math.floor(timeElapsed / 60)).padStart(2, '0')}:
                {String(timeElapsed % 60).padStart(2, '0')}
              </span>
            </div>
            <button
              onClick={() => setIsTiming((v) => !v)}
              className={`px-4 py-2 rounded-lg border transition ${
                isTiming
                  ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                  : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
              }`}
              aria-pressed={isTiming}
            >
              {isTiming ? 'Pause Timer' : 'Start Timer'}
            </button>
            <button
              onClick={resetSimulation}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Medication Administration</h1>
          <p className="text-gray-600">Follow the five rights to safely administer medication.</p>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Prescription Panel */}
          <section className="xl:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <ClipboardCheck className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Prescription</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Patient</span>
                <span className="font-medium text-gray-900">{prescription.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Medication</span>
                <span className="font-medium text-gray-900">{prescription.medication}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Dose</span>
                <span className="font-medium text-gray-900">{prescription.dose}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Route</span>
                <span className="font-medium text-gray-900">{prescription.route}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time</span>
                <span className="font-medium text-gray-900">{prescription.time}</span>
              </div>

              {prescription.note && (
                <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-100 text-blue-800 text-xs">
                  {prescription.note}
                </div>
              )}
            </div>

            {/* Five Rights Checklist */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Confirm the 5 Rights</h3>
              <div className="space-y-2">
                {([
                  ['patient', 'Right Patient'],
                  ['medication', 'Right Medication'],
                  ['dose', 'Right Dose'],
                  ['route', 'Right Route'],
                  ['time', 'Right Time'],
                ] as const).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={checks[key]}
                      onChange={(e) => setChecks((c) => ({ ...c, [key]: e.target.checked }))}
                    />
                    <span className="text-gray-800 text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* Medication Cart */}
          <section className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Pill className="w-6 h-6 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">Medication Cart</h2>
              </div>
              <div className="text-sm text-gray-500">
                Select the correct medication that matches the prescription.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {medicationCart.map((item) => {
                const active = selectedMedicationId === item.id;
                const activeClasses = active
                  ? 'border-blue-300 ring-2 ring-blue-200 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300';
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedMedicationId(item.id)}
                    className={`w-full text-left p-4 rounded-lg border transition ${activeClasses}`}
                    aria-pressed={active}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.med} • {item.dose} • {item.route}
                        </p>
                      </div>
                      {active ? (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 text-sm text-gray-600">
                {selectedMedication ? (
                  <span>
                    Selected: <strong>{selectedMedication.label}</strong>
                  </span>
                ) : (
                  <span>Select a medication to proceed.</span>
                )}
              </div>

              <button
                onClick={administerMedication}
                disabled={!selectedMedication || !allChecksDone}
                className={`px-5 py-2 rounded-lg text-white transition ${
                  !selectedMedication || !allChecksDone
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                Administer
              </button>
            </div>
          </section>
        </div>

        {/* Result Panel */}
        {showResult && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-2">
              {wasCorrectMedication ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600" />
              )}
              <h3 className="text-lg font-semibold text-gray-900">Result</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500">Score</p>
                <p className="text-3xl font-bold text-gray-900">{score}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Time Taken</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {String(Math.floor(timeElapsed / 60)).padStart(2, '0')}:
                  {String(timeElapsed % 60).padStart(2, '0')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Correct Medication</p>
                <p
                  className={`text-2xl font-semibold ${
                    wasCorrectMedication ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {wasCorrectMedication ? 'Yes' : 'No'}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Summary</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>
                  Prescription: {prescription.medication} {prescription.dose} via{' '}
                  {prescription.route} — {prescription.time}
                </li>
                <li>
                  Selected:{' '}
                  {selectedMedication ? (
                    <span className="font-medium">{selectedMedication.label}</span>
                  ) : (
                    'None'
                  )}
                </li>
                <li>
                  Rights confirmed:{' '}
                  {Object.entries(checks)
                    .filter(([, v]) => v)
                    .map(([k]) => k)
                    .join(', ') || 'None'}
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicationSimulation;
