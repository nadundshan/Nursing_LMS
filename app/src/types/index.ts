export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'instructor' | 'student';
  createdAt: Date;
  enrolledCourses?: string[];
  assignedCourses?: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
  modules: Module[];
  createdAt: Date;
  enrolledStudents: string[];
}

export interface Module {
  id: string;
  title: string;
  content: string;
  materials: Material[];
}

export interface Material {
  id: string;
  title: string;
  type: 'document' | 'video' | 'link';
  url: string;
}

export interface Assessment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit: number; // in minutes
  passingScore: number; // percentage
  createdAt: Date;
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer: number | boolean | string;
}

export interface AssessmentResult {
  id: string;
  assessmentId: string;
  studentId: string;
  score: number;
  answers: { questionId: string; answer: any }[];
  completedAt: Date;
}

export interface SimulationResult {
  id: string;
  simulationType: 'pulse-checking' | 'medication-admin' | 'wound-dressing' | 'blood-glucose' | 'blood-pressure';
  studentId: string;
  score: number;
  details: any;
  completedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' |'swarning' | 'error';
  read: boolean;
  createdAt: Date;
}