import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, BookOpen, Code, Play, Pause, RotateCw, BarChart, Award, Download, Share } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/contexts/auth-context';
import axios from 'axios';

interface SimulatorConfig {
  files: {
    [key: string]: string;
  };
  parts: Array<{
    type: string;
    id: string;
    top: number;
    left: number;
    attrs?: { [key: string]: string };
  }>;
  connections: Array<string[]>;
  wokwiId?: string;
}

interface LessonProgress {
  completed: boolean;
  timeSpent: number;
  attempts: number;
  completedAt?: string;
}

interface Resource {
  title: string;
  url: string;
}

interface Certificate {
  id: number;
  certificateNumber: string;
  issuedAt: string;
  userName: string;
}

interface Lesson {
  id: number;
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  duration: number;
  order: number;
  isPublished: boolean;
  courseId: number;
  nextLessonId: string | null;
  prevLessonId: string | null;
  objectives: string[];
  hints: string[];
  resources: Resource[];
  simulatorConfig: SimulatorConfig | null;
  createdAt: string;
  updatedAt: string;
}

const API_BASE_URL = 'http://localhost:5000';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token
// REMOVE the interceptor to avoid sending token for all requests
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// Remove this duplicate import that's causing conflicts
// import api from '../../utils/api';

// Import the new progress API utility
import progressApi from '../../utils/progress-api';

const LessonDetail = () => {
  const { courseId, lessonId } = useParams();
  const { user } = useAuth(); // Add this line to get the current user
  const [activeTab, setActiveTab] = useState('content');
  const [isSimulatorRunning, setIsSimulatorRunning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [progress, setProgress] = useState<LessonProgress>({ 
    completed: false, 
    timeSpent: 0,
    attempts: 0,
    completedAt: undefined
    // lastAccessedAt: new Date().toISOString() // REMOVE THIS LINE
  });
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [courseProgress, setCourseProgress] = useState<{
    completed: boolean;
    progress: number;
    completedLessons: number;
    totalLessons: number;
  }>({
    completed: false,
    progress: 0,
    completedLessons: 0,
    totalLessons: 0
  });

  useEffect(() => {
    // Fetch lesson data
    const fetchLesson = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Validate IDs
        if (!courseId || !lessonId) {
          throw new Error('Invalid course or lesson ID');
        }

        const numericCourseId = parseInt(courseId);
        const numericLessonId = parseInt(lessonId);

        if (isNaN(numericCourseId) || isNaN(numericLessonId)) {
          throw new Error('Invalid course or lesson ID format');
        }

        console.log('Fetching lesson:', { courseId: numericCourseId, lessonId: numericLessonId });
        
        // Using axios instead of fetch
        const response = await api.get(`/api/courses/${numericCourseId}/lessons/${numericLessonId}`);
        const data = response.data;
        
        console.log('lesson data', data);
        
        setLesson(data);
        setNextLessonId(data.nextLessonId);
      } catch (error) {
        console.error('Error fetching lesson:', error);
        setError(
          error.response?.data?.error || 
          error.message || 
          'Failed to load lesson. Please try again later.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchLesson();
  }, [courseId, lessonId]);

  useEffect(() => {
    // Fetch lesson progress
    const fetchProgress = async () => {
      try {
        if (!lessonId || !user) return; // Check for user

        const numericLessonId = parseInt(lessonId);
        if (isNaN(numericLessonId)) return;

        console.log('Fetching progress for lesson:', numericLessonId);
        
        // Use the new progress API utility
        const data = await progressApi.getLessonProgress(numericLessonId, user.id);
        
        setProgress(data);
        console.log('Lesson progress data:', data);
      } catch (error) {
        console.error('Error fetching progress:', error);
        // Create default progress if API fails
        setProgress({ 
          completed: false, 
          timeSpent: 0,
          attempts: 0
        });
      }
    };

    fetchProgress();
  }, [lessonId, user]);

  // Add the missing endLesson function
  // Use the new progress API utility
  const handleComplete = async () => {
    try {
      setIsCompleting(true);
      if (!lessonId || !courseId || !user) return;
  
      const numericLessonId = parseInt(lessonId);
      const numericCourseId = parseInt(courseId);
      if (isNaN(numericLessonId) || isNaN(numericCourseId)) return;
  
      // Calculate time spent
      const timeSpent = startTime 
        ? Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
        : progress.timeSpent;
  
      console.log('Completing lesson:', numericLessonId);
      
      // Use the progress API utility instead of the regular API
      const progressData = await progressApi.completeLesson(numericLessonId, user.id, timeSpent);
      
      setProgress(progressData);
      setShowReview(true);
  
      // Check if all lessons are completed - also use userId in the request
      const certResponse = await axios.post(`${API_BASE_URL}/api/courses/${numericCourseId}/certificate`, {
        userId: user.id
      });
  
      if (certResponse.status === 200) {
        const certData = certResponse.data;
        if (certData && !certData.error) {
          setShowCertificate(true);
          setCertificate(certData);
        }
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
      setError(error.response?.data?.error || error.message || 'Failed to complete lesson. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  // Update the updateProgress function to use the progress API utility
  const updateProgress = async (timeSpent: number) => {
    try {
      if (!lessonId || !user) return; // Check for user

      const numericLessonId = parseInt(lessonId);
      if (isNaN(numericLessonId)) return;

      // Use the progress API utility
      await progressApi.updateLessonProgress(numericLessonId, user.id, {
        timeSpent,
        completed: progress.completed
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  useEffect(() => {
    // Start timer when component mounts
    setStartTime(new Date());

    // Cleanup timer when component unmounts
    return () => {
      if (startTime) {
        const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
        updateProgress(timeSpent);
      }
    };
  }, []);



  const handleNextLesson = () => {
    if (nextLessonId) {
      window.location.href = `/courses/${courseId}/lessons/${nextLessonId}`;
    } else {
      window.location.href = `/courses/${courseId}`;
    }
  };

  useEffect(() => {
    const fetchCourseProgress = async () => {
      if (!courseId) return;
      try {
        // Using axios instead of fetch
        const response = await api.get(`/api/courses/${courseId}/progress`);
        if (response.status === 200) {
          const data = response.data;
          setCourseProgress(data);
        }
      } catch (error) {
        console.error('Error fetching course progress:', error);
      }
    };

    fetchCourseProgress();
  }, [courseId, progress.completed]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8">
          {/* Navigation Skeleton */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <Skeleton className="h-10 w-32 bg-primary/20" />
            <div className="ml-auto flex items-center gap-4">
              <Skeleton className="h-10 w-40 bg-primary/20" />
              <Skeleton className="h-10 w-40 bg-primary/20" />
            </div>
          </motion.div>

          {/* Content Skeleton */}
          <div className="grid md:grid-cols-[1fr_300px] gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Title and Duration */}
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="h-10 w-96 bg-primary/20" />
                  <Skeleton className="h-10 w-32 ml-auto bg-primary/20" />
                </div>
                <Skeleton className="h-6 w-64 bg-primary/20" />
              </div>

              {/* Tabs */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Skeleton className="h-12 w-32 bg-primary/20" />
                  <Skeleton className="h-12 w-32 bg-primary/20" />
                </div>
                <Skeleton className="h-[500px] w-full bg-primary/20" />
              </div>
            </motion.div>

            {/* Sidebar Skeleton */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-6"
            >
              {/* Progress Card */}
              <div className="space-y-4 p-6 border rounded-lg">
                <Skeleton className="h-8 w-40 bg-primary/20" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-24 bg-primary/20" />
                    <Skeleton className="h-6 w-20 bg-primary/20" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-24 bg-primary/20" />
                    <Skeleton className="h-6 w-20 bg-primary/20" />
                  </div>
                  <Skeleton className="h-10 w-full bg-primary/20" />
                </div>
              </div>

              {/* Objectives Card */}
              <div className="space-y-4 p-6 border rounded-lg">
                <Skeleton className="h-8 w-40 bg-primary/20" />
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5 rounded-full bg-primary/20" />
                      <Skeleton className="h-6 flex-1 bg-primary/20" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Hints Card */}
              <div className="space-y-4 p-6 border rounded-lg">
                <Skeleton className="h-8 w-40 bg-primary/20" />
                <Skeleton className="h-10 w-full bg-primary/20" />
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-6 w-full bg-primary/20" />
                  ))}
                </div>
              </div>

              {/* Resources Card */}
              <div className="space-y-4 p-6 border rounded-lg">
                <Skeleton className="h-8 w-40 bg-primary/20" />
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-8 w-full bg-primary/20" />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button asChild>
            <Link to={`/courses/${courseId}`}>
              Back to Course
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8">
        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Button variant="ghost" asChild>
            <Link to={`/courses/${courseId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Course
            </Link>
          </Button>
          <div className="ml-auto flex items-center gap-4">
            {lesson.prevLessonId && (
              <Button variant="ghost" asChild>
                <Link to={`/courses/${courseId}/lessons/${lesson.prevLessonId}`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous Lesson
                </Link>
              </Button>
            )}
            {lesson.nextLessonId && (
              <Button asChild>
                <Link to={`/courses/${courseId}/lessons/${lesson.nextLessonId}`}>
                  Next Lesson
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>
        </motion.div>

        {/* Lesson Content */}
        <div className="grid md:grid-cols-[1fr_300px] gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div>
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold">{lesson.title}</h1>
                <Badge variant="secondary" className="ml-auto">
                  <Clock className="w-4 h-4 mr-2" />
                  {lesson.duration} minutes
                </Badge>
              </div>
              <p className="text-muted-foreground">{lesson.description?.split('\n')[0]}</p>
            </div>

            <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList>
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Content
                </TabsTrigger>
                <TabsTrigger value="simulator" className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Simulator
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="mt-6">
                <Card>
                  <CardContent className="prose dark:prose-invert max-w-none p-6">
                    <ReactMarkdown>{lesson.content || ''}</ReactMarkdown>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="simulator" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Arduino Simulator</CardTitle>
                    <CardDescription>Try out the circuit in Wokwi's online simulator</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full aspect-video rounded-lg overflow-hidden border">
                      <iframe 
                        src="https://wokwi.com/projects/new/arduino-uno"
                        className="w-full h-full border-none"
                        title="Arduino Simulator"
                        allow="camera; display-capture"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {!progress.completed && (
              <div className="mt-8 flex justify-end">
                <Button 
                  size="lg" 
                  onClick={handleComplete}
                  disabled={isCompleting}
                >
                  {isCompleting ? (
                    <>
                      <div className="animate-spin mr-2">⏳</div>
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Mark as Complete
                    </>
                  )}
                </Button>
              </div>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Lesson Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Time Spent</span>
                    <span className="text-sm font-medium">
                      {Math.floor(progress.timeSpent / 60)} min {progress.timeSpent % 60} sec
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Attempts</span>
                    <span className="text-sm font-medium">
                      {progress.attempts}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Completion Date</span>
                    <span className="text-sm font-medium">
                      {progress.completedAt ? new Date(progress.completedAt).toLocaleDateString() : 'Not completed'}
                    </span>
                  </div>
                  {!progress.completed ? (
                    <Button className="w-full" onClick={handleComplete}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Complete
                    </Button>
                  ) : (
                    <Button className="w-full" variant="outline" disabled>
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      Completed
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Objectives */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Objectives</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {lesson.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1 shrink-0" />
                      <span className="text-sm">{objective}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Hints */}
            <Card>
              <CardHeader>
                <CardTitle>Hints</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full mb-4"
                  onClick={() => setShowHint(!showHint)}
                >
                  {showHint ? 'Hide Hints' : 'Show Hints'}
                </Button>
                {showHint && (
                  <ul className="space-y-2">
                    {lesson.hints.map((hint, index) => (
                      <li key={index} className="text-sm">
                        <span className="font-medium">Hint {index + 1}:</span> {hint}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {lesson.resources.map((resource, index) => (
                    <li key={index}>
                      <Button variant="link" className="p-0 h-auto" asChild>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          {resource.title}
                        </a>
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={showReview} onOpenChange={setShowReview}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Lesson Completed!</DialogTitle>
            <DialogDescription>
              Congratulations on completing this lesson. You're making great progress!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Course Progress</span>
              <span className="text-sm text-muted-foreground">
                {courseProgress.completedLessons}/{courseProgress.totalLessons} lessons
              </span>
            </div>
            <Progress value={courseProgress.progress} className="h-2" />
            
            <div className="flex justify-end gap-4 mt-4">
              <Button variant="outline" onClick={() => setShowReview(false)}>
                Close
              </Button>
              <Button onClick={handleNextLesson}>
                {nextLessonId ? 'Next Lesson' : 'Back to Course'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Certificate Dialog */}
      <Dialog open={showCertificate} onOpenChange={setShowCertificate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Course Completed!</DialogTitle>
            <DialogDescription>
              Congratulations! You've completed all lessons in this course.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {certificate && (
              <div className="border p-6 rounded-lg text-center space-y-4">
                <h3 className="text-xl font-bold">Certificate of Completion</h3>
                <p>This certifies that</p>
                <p className="text-lg font-semibold">{certificate.userName}</p>
                <p>has successfully completed the course</p>
                <p className="text-lg font-semibold">{lesson.title.split(':')[0]}</p>
                <p className="text-sm text-muted-foreground">
                  Certificate #{certificate.certificateNumber}
                </p>
                <p className="text-sm text-muted-foreground">
                  Issued on {new Date(certificate.issuedAt).toLocaleDateString()}
                </p>
              </div>
            )}
            
            <div className="flex justify-end gap-4 mt-4">
              <Button variant="outline" onClick={() => setShowCertificate(false)}>
                Close
              </Button>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Download Certificate
              </Button>
              <Button variant="secondary">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LessonDetail;
