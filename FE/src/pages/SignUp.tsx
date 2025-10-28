import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_USER_REGISTER = import.meta.env.VITE_API_USER_REGISTER || '/user/register';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  // React Query mutation - gọi API trực tiếp
  const mutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await fetch(`${API_URL}${API_USER_REGISTER}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      return response.json();
    },
    onSuccess: () => {
      navigate('/login');
    },
    onError: (error: Error) => {
      setErrorMessage(error.message);
    },
  });

  const onSubmit = (data: SignupFormData) => {
    setErrorMessage('');
    mutation.mutate({
      email: data.email,
      password: data.password,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <Card className="w-full max-w-sm mx-auto shadow-2xl border-0 relative z-10 backdrop-blur-sm bg-white/95 sm:max-w-md">
        <CardHeader className="space-y-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg pb-5 sm:pb-6 px-5 sm:px-6">
          <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 shadow-lg">
            <UserPlus className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-center">Join us today</CardTitle>
          <CardDescription className="text-center text-purple-100 text-sm">
            Create your account and start your journey
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 sm:px-6 pb-5 sm:pb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
            <div className="space-y-2 mt-3">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="h-10 sm:h-11 text-sm"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span className="text-xs"></span> {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="h-10 sm:h-11 text-sm pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span className="text-xs"></span> {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="h-10 sm:h-11 text-sm pr-10"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span className="text-xs"></span> {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {errorMessage && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-800 font-medium">Registration failed</p>
                <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
              </div>
            )}

            {mutation.isSuccess && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                <p className="text-sm text-green-800 font-medium">Success!</p>
                <p className="text-sm text-green-600 mt-1">Account created successfully! Redirecting to login...</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-10 sm:h-11 text-sm font-semibold"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <span className="flex items-center gap-2 justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2 justify-center">
                  <UserPlus className="w-4 h-4" />
                  Create account
                </span>
              )}
            </Button>
          </form>

          <div className="mt-5 text-center pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-600 hover:text-pink-600 hover:underline font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-3 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors hover:gap-3">
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
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
