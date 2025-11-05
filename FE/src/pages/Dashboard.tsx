import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, LogOut, Users, Calendar, Mail, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout, user, isLoading } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4 sm:p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-600 mt-1 text-sm">Welcome back! Here's your profile information.</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="shadow-sm hover:shadow-md transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Home
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

        {/* User Profile Card */}
        <Card className="shadow-2xl border-0 overflow-hidden backdrop-blur-sm bg-white/95 mb-6">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Your Profile</CardTitle>
                <CardDescription className="text-purple-100 text-sm">
                  Account information and settings
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
                <p className="mt-3 text-gray-600 text-sm">Loading your profile...</p>
              </div>
            )}

            {!isLoading && !user && (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-3">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-red-600 font-medium">Failed to load profile</p>
                <p className="text-gray-600 text-sm mt-1">Please try logging in again</p>
                <Button onClick={() => navigate('/login')} className="mt-4" variant="outline">
                  Go to Login
                </Button>
              </div>
            )}

            {user && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                  <Mail className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email Address</p>
                    <p className="text-lg font-semibold text-gray-900">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                  <User className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">User ID</p>
                    <p className="text-lg font-semibold text-gray-900">#{user.id}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Member Since</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card className="shadow-2xl border-0 overflow-hidden backdrop-blur-sm bg-white/95">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription className="text-indigo-100 text-sm">
              Navigate to other sections
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={() => navigate('/users')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-auto py-4 justify-start"
              >
                <Users className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">View All Users</div>
                  <div className="text-xs opacity-90">Browse registered users</div>
                </div>
              </Button>

              <Button
                onClick={() => navigate('/signup')}
                variant="outline"
                className="h-auto py-4 justify-start border-purple-300 hover:bg-purple-50"
              >
                <User className="w-5 h-5 mr-3 text-purple-600" />
                <div className="text-left">
                  <div className="font-semibold">Register New User</div>
                  <div className="text-xs text-gray-600">Create new account</div>
                </div>
              </Button>
            </div>
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
      `}</style>
    </div>
  );
}
