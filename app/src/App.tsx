import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { LoginPage } from './components/auth/LoginPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { CourseManagement } from './components/courses/CourseManagement';
import { AssessmentSystem } from './components/assessments/AssessmentSystem';
import { WoundDressingSimulation } from './components/simulations/WoundDressingSimulation';
import { BloodGlucoseSimulation } from './components/simulations/BloodGlucoseSimulation';
import { SimulationHub } from './components/simulations/SimulationHub';
import { PulseCheckSimulation } from './components/simulations/PulseCheckSimulation';
import MedicationAdministrationSimulation from './components/simulations/MedicationAdministrationSimulation';
//import { PatientAssessmentSimulation } from './components/simulations/PatientAssessmentSimulation';
import { ProgressTracking } from './components/progress/ProgressTracking';
import { UserManagement } from './components/admin/UserManagement';
import { Navigation } from './components/layout/Navigation';
import { NotificationSystem } from './components/notifications/NotificationSystem';
import { User, Course, Assessment, SimulationResult } from './types';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [courses, setCourses] = useState<Course[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [notifications, setNotifications] = useState<Array<{id: string, message: string, type: 'info' | 'success' | 'warning' | 'error'}>>([]);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: userData.name || 'User',
            role: userData.role,
            createdAt: new Date(userData.createdAt.seconds * 1000),
            enrolledCourses: userData.enrolledCourses || [],
          });
          setCurrentPage('dashboard');
        } else {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Keep demo data for courses and assessments (to be migrated later)
  useEffect(() => {
    const demoCourses: Course[] = [
      {
        id: '1',
        title: 'Fundamentals of Nursing',
        description: 'Introduction to basic nursing principles and practices',
        instructorId: 'instructor1',
        instructorName: 'Dr. Emily Rodriguez',
        modules: [
          {
            id: '1',
            title: 'Patient Care Basics',
            content: 'Essential skills for patient care including vital signs, hygiene, and safety protocols.',
            materials: [
              { id: '1', title: 'Vital Signs Guide', type: 'document', url: '#' },
              { id: '2', title: 'Patient Safety Video', type: 'video', url: '#' }
            ]
          },
          {
            id: '2',
            title: 'Medication Administration',
            content: 'Safe medication practices and the five rights of medication administration.',
            materials: [
              { id: '3', title: 'Medication Safety Protocols', type: 'document', url: '#' }
            ]
          }
        ],
        createdAt: new Date(),
        enrolledStudents: ['1']
      },
      {
        id: '2',
        title: 'Clinical Skills Practice',
        description: 'Hands-on practice with essential clinical skills',
        instructorId: 'instructor1',
        instructorName: 'Dr. Emily Rodriguez',
        modules: [
          {
            id: '3',
            title: 'Vital Signs Assessment',
            content: 'Comprehensive training on measuring and interpreting vital signs.',
            materials: [
              { id: '4', title: 'Pulse Assessment Techniques', type: 'document', url: '#' }
            ]
          }
        ],
        createdAt: new Date(),
        enrolledStudents: ['1']
      }
    ];
    setCourses(demoCourses);

    const demoAssessments: Assessment[] = [
      {
        id: '1',
        courseId: '1',
        title: 'Fundamentals Quiz 1',
        description: 'Test your knowledge of basic nursing principles',
        questions: [
          {
            id: '1',
            type: 'multiple-choice',
            question: 'What are the normal vital signs for an adult?',
            options: [
              'HR: 60-100, BP: 120/80, Temp: 98.6°F, RR: 12-20',
              'HR: 80-120, BP: 140/90, Temp: 99.6°F, RR: 10-18',
              'HR: 50-80, BP: 110/70, Temp: 97.6°F, RR: 14-22'
            ],
            correctAnswer: 0
          },
          {
            id: '2',
            type: 'true-false',
            question: 'Hand hygiene is crucial to prevent infection.',
            correctAnswer: true
          },
          {
            id: '3',
            type: 'short-answer',
            question: 'List the five rights of medication administration.',
            correctAnswer: 'Right patient, right medication, right dose, right route, right time'
          }
        ],
        timeLimit: 30,
        passingScore: 70,
        createdAt: new Date()
      }
    ];
    setAssessments(demoAssessments);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      setCurrentUser(null);
      setCurrentPage('dashboard');
    });
  };

  const addNotification = (message: string, type: 'info' | 'success' | 'warning' | 'error') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleSimulationComplete = (result: SimulationResult) => {
    setSimulationResults(prev => [...prev, result]);
    addNotification('Simulation completed successfully!', 'success');
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} addNotification={addNotification} />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            user={currentUser} 
            courses={courses} 
            assessments={assessments}
            simulationResults={simulationResults}
            onNavigate={setCurrentPage}
          />
        );
      case 'courses':
        return (
          <CourseManagement 
            user={currentUser} 
            courses={courses} 
            setCourses={setCourses}
            onNavigate={setCurrentPage}
          />
        );
      case 'assessments':
        return (
          <AssessmentSystem 
            user={currentUser} 
            assessments={assessments} 
            courses={courses}
            setAssessments={setAssessments}
            onComplete={(score) => addNotification(`Assessment completed with score: ${score}%`, score >= 70 ? 'success' : 'warning')}
          />
        );
      case 'simulations':
        return (
          <SimulationHub 
            user={currentUser} 
            onNavigate={setCurrentPage}
          />
        );
      case 'pulse-simulation':
        return (
          <PulseCheckSimulation 
            user={currentUser}
            onComplete={handleSimulationComplete}
            onBack={() => setCurrentPage('simulations')}
            addNotification={addNotification}
          />
        );
        case 'medication-simulation':
          return (
            <MedicationAdministrationSimulation
              user={currentUser}
              onBack={() => setCurrentPage('simulations')}
              onComplete={(res: { score: number; details: string }) => {
                // optional: push into your simulationResults + notify
                const result: SimulationResult = {
                  id: Date.now().toString(),
                  simulationType: 'medication-admin' as 'medication-admin',
                  studentId: currentUser.id,
                  score: res.score,
                  details: res.details,
                  completedAt: new Date(),
                };
                setSimulationResults(prev => [...prev, result]);
                addNotification(
                  `Medication simulation completed with score: ${res.score}%`,
                  res.score >= 70 ? 'success' : 'warning'
                );
              }}
              addNotification={addNotification}
            />
          );
          case 'wound-dressing':
            return (
              <WoundDressingSimulation
                user={currentUser}
                onBack={() => setCurrentPage('simulations')}
                onComplete={() => {
                  // handle completion logic
                }}
                addNotification={addNotification}
              />
            );
          case 'blood-glucose':
            return (
              <BloodGlucoseSimulation
                user={currentUser}
                onBack={() => setCurrentPage('simulations')}
                addNotification={addNotification}
              />
            );
      case 'progress':
        return (
          <ProgressTracking 
            user={currentUser} 
            courses={courses}
            assessments={assessments}
            simulationResults={simulationResults}
          />
        );
      case 'users':
        return currentUser.role === 'admin' ? (
          <UserManagement 
            onNavigate={setCurrentPage} 
            addNotification={addNotification}
          />
        ) : (
          <Dashboard 
            user={currentUser} 
            courses={courses} 
            assessments={assessments}
            simulationResults={simulationResults}
            onNavigate={setCurrentPage}
          />
        );
      default:
        return (
          <Dashboard 
            user={currentUser} 
            courses={courses} 
            assessments={assessments}
            simulationResults={simulationResults}
            onNavigate={setCurrentPage}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        user={currentUser} 
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
      />
      <main className="pt-16">
        {renderCurrentPage()}
      </main>
      <NotificationSystem notifications={notifications} />
    </div>
  );
}

export default App;