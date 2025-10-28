import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, LogIn, Users, Shield, Zap, Palette } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <Card className="w-full max-w-sm mx-auto shadow-2xl border-0 relative z-10 backdrop-blur-sm bg-white/95 sm:max-w-md md:max-w-lg lg:max-w-xl">
        <CardHeader className="text-center space-y-2 pb-5 sm:pb-6 px-5 sm:px-6">
          <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
            <Rocket className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
            Auth App
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
            Secure authentication system built with NestJS and React
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 px-5 sm:px-6 pb-5 sm:pb-6">
          <Link to="/signup" className="block">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base py-2.5 sm:py-3" size="lg">
              <Rocket className="w-4 h-4 mr-2" />
              Get Started - Sign Up
            </Button>
          </Link>

          <Link to="/login" className="block">
            <Button variant="outline" className="w-full border-2 border-purple-600 text-purple-600 hover:bg-purple-50 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm sm:text-base py-2.5 sm:py-3" size="lg">
              <LogIn className="w-4 h-4 mr-2" />
              Already have an account? Login
            </Button>
          </Link>

          <Link to="/users" className="block">
            <Button variant="secondary" className="w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm sm:text-base py-2.5 sm:py-3" size="lg">
              <Users className="w-4 h-4 mr-2" />
              View All Users
            </Button>
          </Link>

          <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
              <div className="flex flex-col items-center gap-1">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                </div>
                <span className="font-medium text-center text-xs sm:text-sm">Secure</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                </div>
                <span className="font-medium text-center text-xs sm:text-sm">Fast</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                </div>
                <span className="font-medium text-center text-xs sm:text-sm">Modern</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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