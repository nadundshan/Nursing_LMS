import React, { useState } from 'react';
import { 
  Home, 
  BookOpen, 
  ClipboardCheck, 
  Monitor, 
  TrendingUp, 
  Users, 
  Bell, 
  LogOut,
  Menu,
  X,
  Stethoscope
} from 'lucide-react';
import { User } from '../../types';

interface NavigationProps {
  user: User;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  user,
  currentPage,
  onNavigate,
  onLogout
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['admin', 'instructor', 'student'] },
    { id: 'courses', label: 'Modules', icon: BookOpen, roles: ['admin', 'instructor', 'student'] },
    { id: 'assessments', label: 'Assessments', icon: ClipboardCheck, roles: ['admin', 'instructor', 'student'] },
    { id: 'simulations', label: 'Simulations', icon: Monitor, roles: ['admin', 'instructor', 'student'] },
    { id: 'progress', label: 'Progress', icon: TrendingUp, roles: ['admin', 'instructor', 'student'] },
    { id: 'users', label: 'User Management', icon: Users, roles: ['admin'] },
  ];

  const filteredItems = navigationItems.filter(item => item.roles.includes(user.role));

  const roleColors = {
    admin: 'bg-purple-100 text-purple-800 border-purple-200',
    instructor: 'bg-teal-100 text-teal-800 border-teal-200',
    student: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-lg border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-900">NursingLMS</h1>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentPage === item.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:text-blue-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* User Info and Actions */}
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-600 hover:text-blue-900 hover:bg-gray-100 rounded-lg transition-all" title="Notifications">
                <Bell className="w-5 h-5" />
              </button>
              
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className={`text-xs px-2 py-0.5 rounded-full border ${roleColors[user.role]}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </p>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-600 hover:text-blue-900 hover:bg-gray-100 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-blue-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-3 space-y-2">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentPage === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-blue-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
              
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className={`text-xs px-2 py-0.5 rounded-full border ${roleColors[user.role]}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};