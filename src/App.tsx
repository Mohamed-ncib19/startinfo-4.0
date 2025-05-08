import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { Layout } from '@/components/layout';
import { HomeLayout } from '@/components/home-layout';
import { useAuth } from '@/contexts/auth-context';
import { Navigate } from 'react-router-dom';

// Pages
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import Login from '@/pages/auth/login';
import Signup from '@/pages/auth/signup';
import ResetPassword from '@/pages/auth/reset-password';
import Dashboard from '@/pages/dashboard';
import Profile from '@/pages/profile';

// Course Pages
import Courses from '@/pages/courses/index';
import CourseDetail from '@/pages/courses/course-detail';
import LessonDetail from '@/pages/courses/lesson-detail';

// Community Pages
import Community from '@/pages/community/index';
import Forum from '@/pages/community/forum';
import Projects from '@/pages/community/projects';

// Account Management
import AccountSettings from '@/pages/account/settings';
import Certifications from '@/pages/account/certifications';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public routes */}
              <Route element={<HomeLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
                <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
              </Route>

              {/* Protected routes */}
              <Route element={<Layout />}>
                {/* Dashboard */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                {/* Course routes */}
                <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
                <Route path="/courses/:id" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
                <Route path="/courses/:courseId/lessons/:lessonId" element={<ProtectedRoute><LessonDetail /></ProtectedRoute>} />

                {/* Community routes */}
                <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
                <Route path="/community/forum" element={<ProtectedRoute><Forum /></ProtectedRoute>} />
                <Route path="/community/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />

                {/* Account Management */}
                <Route path="/account/settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
                <Route path="/account/certifications" element={<ProtectedRoute><Certifications /></ProtectedRoute>} />
              </Route>

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;


function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
