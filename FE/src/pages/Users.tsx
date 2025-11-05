import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/axios';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Users as UsersIcon, AlertTriangle, User, Plus, Calendar, Mail, LogOut } from 'lucide-react';

interface User {
  id: string;
  email: string;
  createdAt: string;
}

export default function Users() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await apiClient.get('/user/list');
      return response.data.data as User[];
    },
    staleTime: 5 * 1000, // 5s
    gcTime: 10 * 1000,  // 10s
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    
    retry: 1,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 8000),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4 sm:p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="mb-5 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              User Management
            </h1>
            <p className="text-gray-600 mt-1.5 text-sm">View and manage registered users</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="shadow-sm hover:shadow-md transition-all duration-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <Card className="shadow-2xl border-0 overflow-hidden backdrop-blur-sm bg-white/95">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-4">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center">
                <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">Registered Users</CardTitle>
                <CardDescription className="text-purple-100 text-sm">
                  Complete list of all users in the system
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading && (
              <div className="text-center py-10 sm:py-12 px-4">
                <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-purple-600"></div>
                <p className="mt-3 text-gray-600 text-sm">Loading users...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-10 sm:py-12 px-4">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-100 mb-3">
                  <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8 text-red-600" />
                </div>
                <p className="text-red-600 font-medium text-sm">Error: {error.message}</p>
              </div>
            )}

            {data && data.length === 0 && (
              <div className="text-center py-10 sm:py-12 px-4">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-100 mb-3">
                  <User className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium text-sm mb-3">No users registered yet</p>
                <Button
                  onClick={() => navigate('/signup')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Register First User
                </Button>
              </div>
            )}

            {data && data.length > 0 && (
              <div>
                {/* Mobile View */}
                <div className="block sm:hidden">
                  <div className="divide-y divide-gray-100">
                    {data.map((user, index) => (
                      <div
                        key={user.id}
                        className="p-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-colors duration-150"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                              <p className="text-xs text-gray-600">
                                {new Date(user.createdAt).toLocaleString('vi-VN', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-purple-50 to-blue-50 border-b-2 border-purple-200">
                        <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                          #
                        </th>
                        <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5" />
                            Email Address
                          </div>
                        </th>
                        <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs font-bold text-purple-900 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" />
                            Registration Date
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {data.map((user, index) => (
                        <tr
                          key={user.id}
                          className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-colors duration-150"
                        >
                          <td className="px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap">
                            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold">
                              {index + 1}
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{user.email}</div>
                          </td>
                          <td className="px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {new Date(user.createdAt).toLocaleString('vi-VN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-3 sm:px-4 py-2.5 sm:py-3 border-t border-purple-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
                    <div className="text-sm text-gray-600">
                      Showing <span className="font-bold text-purple-600">{data.length}</span> registered user{data.length !== 1 ? 's' : ''}
                    </div>
                    <Button
                      onClick={() => navigate('/signup')}
                      size="sm"
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New User
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        @media (max-width: 640px) {
          .animate-blob {
            animation-duration: 10s;
          }
        }
      `}</style>
    </div>
  );
}
