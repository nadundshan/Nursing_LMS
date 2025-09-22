import React from 'react';
import { 
  BookOpen, 
  ClipboardCheck, 
  Monitor, 
  TrendingUp, 
  Award,
  Users,
  ChevronRight,
  Target
} from 'lucide-react';
import { User, Course, Assessment, SimulationResult } from '../../types';

interface DashboardProps {
  user: User;
  courses: Course[];
  assessments: Assessment[];
  simulationResults: SimulationResult[];
  onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  courses,
  assessments,

  onNavigate
}) => {
  const userCourses = user.role === 'student' 
    ? courses.filter(course => user.enrolledCourses?.includes(course.id))
    : user.role === 'instructor'
    ? courses.filter(course => course.instructorId === user.id)
    : courses;

  // const recentAssessments = assessments.slice(0, 3);
  // const recentSimulations = simulationResults.slice(0, 3);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const quickActions = [
    { 
      title: 'Browse Modules', 
      description: 'Explore available nursing courses',
      icon: BookOpen, 
      action: () => onNavigate('courses'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    { 
      title: 'Take Assessment', 
      description: 'Complete pending assessments',
      icon: ClipboardCheck, 
      action: () => onNavigate('assessments'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    { 
      title: 'Simulations', 
      description: 'Improve skills with virtual practice',
      icon: Monitor, 
      action: () => onNavigate('simulations'),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    { 
      title: 'Progress', 
      description: 'Track your learning journey',
      icon: TrendingUp, 
      action: () => onNavigate('progress'),
      color: 'bg-teal-500 hover:bg-teal-600'
    }
  ];

  const getStatsForRole = () => {
    switch (user.role) {
      case 'student':
        return [
          { label: 'Active Modules', value: 5, icon: BookOpen, color: 'text-blue-600' },
          { label: 'Active Assessments', value: 1, icon: ClipboardCheck, color: 'text-green-600' },
          { label: 'Active Simulations', value: 4, icon: Monitor, color: 'text-purple-600' },
          { label: 'Average Score', value: '87%', icon: Award, color: 'text-yellow-600' }
        ];
      case 'instructor':
        return [
          { label: 'Teaching Courses', value: userCourses.length, icon: BookOpen, color: 'text-blue-600' },
          { label: 'Total Students', value: 45, icon: Users, color: 'text-green-600' },
          { label: 'Active Assessments', value: assessments.length, icon: ClipboardCheck, color: 'text-purple-600' },
          { label: 'This Month', value: '98%', icon: TrendingUp, color: 'text-teal-600' }
        ];
      case 'admin':
        return [
          { label: 'Total Modules', value: 5, icon: BookOpen, color: 'text-blue-600' },
          { label: 'Active Simulations', value: 4, icon: Users, color: 'text-green-600' },
          { label: 'System Health', value: '99.8%', icon: TrendingUp, color: 'text-purple-600' },
          { label: 'Monthly Growth', value: '+12%', icon: Target, color: 'text-teal-600' }
        ];
      default:
        return [];
    }
  };

  const stats = getStatsForRole();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getGreeting()}, {user.name}!
          </h1>
          <p className="text-gray-600">
            Welcome to your nursing education dashboard. Ready to continue learning?
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gray-50`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.action}
                  className={`${action.color} text-white p-6 rounded-xl transition-all transform hover:scale-105 hover:shadow-lg`}
                >
                  <Icon className="w-8 h-8 mb-3" />
                  <h3 className="font-semibold mb-1">{action.title}</h3>
                  <p className="text-sm opacity-90">{action.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg">
          {/* Recent Courses 
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {user.role === 'student' ? 'My Courses' : user.role === 'instructor' ? 'Teaching' : 'All Courses'}
                </h2>
                <button 
                  onClick={() => onNavigate('courses')}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {userCourses.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No courses available</p>
              ) : (
                <div className="space-y-4">
                  {userCourses.slice(0, 3).map((course) => (
                    <div key={course.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{course.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                        <p className="text-xs text-gray-500">Instructor: {course.instructorName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>*/}

          {/*Recent Activity*/}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                <button 
                  onClick={() => onNavigate('progress')}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                >
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <ClipboardCheck className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Assessment Completed</p>
                    <p className="text-xs text-gray-600">Fundamentals Quiz 1 - Score: 87%</p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Monitor className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Simulation Practice</p>
                    <p className="text-xs text-gray-600">Pulse Checking - Score: 92%</p>
                    <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Course Enrolled</p>
                    <p className="text-xs text-gray-600">Clinical Skills Practice</p>
                    <p className="text-xs text-gray-500 mt-1">3 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div> 
        </div>
      </div>
    </div>
  );
};