import React from 'react';
import { 
  TrendingUp, 
  Award, 
  BookOpen, 
  Monitor, 
  Clock,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { User, Course, Assessment, SimulationResult } from '../../types';

interface ProgressTrackingProps {
  user: User;
  courses: Course[];
  assessments?: Assessment[];            // kept optional to match your snippet usage
  simulationResults?: SimulationResult[]; // kept optional to match your snippet usage
}

export const ProgressTracking: React.FC<ProgressTrackingProps> = ({
  user,
  courses,
}) => {
  // Toggle this to show/hide the overlay
  const SHOW_COMING_SOON = true;

  const userCourses = user.role === 'student' 
    ? courses.filter(course => user.enrolledCourses?.includes(course.id))
    : courses;

  // Calculate progress metrics
  const totalModules = userCourses.reduce((total, course) => total + course.modules.length, 0);
  const completedModules = Math.floor(totalModules * 0.6); // Demo: 60% completion
  const completionPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  const averageScore = 87; // Demo average
  const totalStudyHours = 24; // Demo hours
  const streak = 5; // Demo streak

  // Recent activity data
  const recentActivity = [
    {
      id: '1',
      type: 'assessment' as const,
      title: 'Fundamentals Quiz 1',
      course: 'Fundamentals of Nursing',
      score: 87,
      date: '2025-01-09',
      icon: Award
    },
    {
      id: '2',
      type: 'simulation' as const,
      title: 'Pulse Check Simulation',
      course: 'Clinical Skills Practice',
      score: 75,
      date: '2025-01-08',
      icon: Monitor
    },
    {
      id: '3',
      type: 'module' as const,
      title: 'Patient Care Basics',
      course: 'Fundamentals of Nursing',
      score: null as number | null,
      date: '2025-01-07',
      icon: BookOpen
    }
  ];

  const skillsProgress = [
    { name: 'Vital Signs Assessment', progress: 85, level: 'Advanced' },
    { name: 'Patient Communication', progress: 78, level: 'Intermediate' },
    { name: 'Medication Safety', progress: 92, level: 'Expert' },
    { name: 'Clinical Documentation', progress: 67, level: 'Intermediate' },
    { name: 'Infection Control', progress: 88, level: 'Advanced' }
  ];

  return (
    <>
      {/* Full-screen COMING SOON overlay */}
      {SHOW_COMING_SOON && (
        <div
          className="fixed left-0 right-0 bottom-0 top-16 z-40 flex items-center justify-center"
          aria-hidden="true"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px]" />
          {/* Watermark text */}
          <div className="relative px-6 text-center">
            <span className="block select-none text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold uppercase tracking-[0.2em] text-gray-900/10 -rotate-12">
              Coming Soon
            </span>
          </div>
        </div>
      )}


      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Progress Tracking</h1>
            <p className="text-gray-600">Monitor your learning journey and achievements</p>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{completionPercentage}%</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Course Progress</h3>
              <p className="text-sm text-gray-600">{completedModules} of {totalModules} modules</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{averageScore}%</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Average Score</h3>
              <p className="text-sm text-gray-600">Across all assessments</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${averageScore}%` }}
                />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{totalStudyHours}h</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Study Time</h3>
              <p className="text-sm text-gray-600">Total hours spent</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${(totalStudyHours / 50) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-teal-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{streak}d</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Study Streak</h3>
              <p className="text-sm text-gray-600">Current active days</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                  className="bg-teal-600 h-2 rounded-full transition-all"
                  style={{ width: `${(streak / 7) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Skills Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Skills Progress</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {skillsProgress.map((skill) => (
                  <div key={skill.name} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{skill.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        skill.level === 'Expert' ? 'bg-purple-100 text-purple-800' :
                        skill.level === 'Advanced' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {skill.level}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          skill.progress >= 90 ? 'bg-purple-600' :
                          skill.progress >= 80 ? 'bg-blue-600' :
                          'bg-green-600'
                        }`}
                        style={{ width: `${skill.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Course Progress */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Course Progress</h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {userCourses.map((course) => {
                  const moduleProgress = Math.floor(Math.random() * 100); // Demo progress
                  const completedModulesInCourse = Math.floor(course.modules.length * (moduleProgress / 100));
                  
                  return (
                    <div key={course.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                          <p className="text-sm text-gray-600 mb-4">{course.description}</p>
                          <p className="text-sm text-gray-500">
                            {completedModulesInCourse} of {course.modules.length} modules completed
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 mb-1">{moduleProgress}%</div>
                          <div className="text-xs text-gray-500">Complete</div>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                        <div 
                          className="bg-blue-600 h-3 rounded-full transition-all"
                          style={{ width: `${moduleProgress}%` }}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        {course.modules.slice(0, 3).map((module, index) => (
                          <div key={module.id} className="flex items-center gap-2 text-sm">
                            <CheckCircle className={`w-4 h-4 ${
                              index < completedModulesInCourse ? 'text-green-600' : 'text-gray-300'
                            }`} />
                            <span className={
                              index < completedModulesInCourse ? 'text-gray-900' : 'text-gray-500'
                            }>
                              {module.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className={`flex items-start gap-4 p-4 rounded-lg ${
                      activity.type === 'assessment' ? 'bg-green-50' :
                      activity.type === 'simulation' ? 'bg-purple-50' : 'bg-blue-50'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'assessment' ? 'bg-green-100' :
                        activity.type === 'simulation' ? 'bg-purple-100' : 'bg-blue-100'
                      }`}>
                        <Icon className={`w-4 h-4 ${
                          activity.type === 'assessment' ? 'text-green-600' :
                          activity.type === 'simulation' ? 'text-purple-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.type === 'assessment' ? 'Assessment Completed' :
                          activity.type === 'simulation' ? 'Simulation Practice' : 'Module Completed'}
                        </p>
                        <p className="text-xs text-gray-600">{activity.title} - {activity.course}</p>
                        {activity.score !== null && (
                          <p className="text-xs text-gray-500 mt-1">Score: {activity.score}%</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
