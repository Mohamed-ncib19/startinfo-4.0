import { useParams, useNavigate } from 'react-router-dom';
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/contexts/auth-context';
import axios from 'axios';
import { CodeEditor } from '@/components/ui/code-editor';
import { toast } from 'sonner';

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

interface CourseProgress {
  completed: boolean;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  isFinalLessonCompleted: boolean;
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

interface LessonContent {
  id: string;
  title: string;
  videoUrl: string;
  theory: string;
  practicalGuide: string;
  initialCode: string;
}

// Add this helper function before the component
function getEmbedUrl(url: string): string {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  return url;
}

const LessonDetail = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('content');
  const [isSimulatorRunning, setIsSimulatorRunning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [progress, setProgress] = useState<LessonProgress>({
    completed: false,
    timeSpent: 0,
    attempts: 0
  });
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgress>({
    completed: false,
    progress: 0,
    completedLessons: 0,
    totalLessons: 0,
    isFinalLessonCompleted: false
  });
  const [code, setCode] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSimulatorLoading, setIsSimulatorLoading] = useState(true);
  const [isFinalLesson, setIsFinalLesson] = useState(false);
  const [isCourseCompleted, setIsCourseCompleted] = useState(false);
  const [showCourseCompletion, setShowCourseCompletion] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!courseId || !lessonId) {
          throw new Error('Invalid course or lesson ID');
        }

        const numericCourseId = parseInt(courseId);
        const numericLessonId = parseInt(lessonId);

        if (isNaN(numericCourseId) || isNaN(numericLessonId)) {
          throw new Error('Invalid course or lesson ID format');
        }

        console.log('Fetching lesson:', { courseId: numericCourseId, lessonId: numericLessonId });
        
        // Fetch lesson data
        const response = await api.get(`/api/courses/${numericCourseId}/lessons/${numericLessonId}`);
        const data = response.data;
        
        if (!data) {
          throw new Error('No lesson data received');
        }

        console.log('Lesson data:', data);
        
        // Check if this is the final lesson
        const isLastLesson = !data.nextLessonId;
        setIsFinalLesson(isLastLesson);
        
        setLesson(data);
        setNextLessonId(data.nextLessonId);
        setCode(data.simulatorConfig?.files['main.ino'] || '');
        setStartTime(new Date());

        // Fetch progress
        try {
          const progressResponse = await progressApi.getLessonProgress(numericLessonId, user.id);
          setProgress(progressResponse);

          // Fetch course progress to check if course is completed
          const courseProgressResponse = await api.get(`/api/courses/${numericCourseId}/progress`, {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
          });
          
          if (courseProgressResponse.status === 200) {
            const courseProgressData = courseProgressResponse.data;
            setCourseProgress(courseProgressData);
            setIsCourseCompleted(courseProgressData.completed);
          }
        } catch (progressError) {
          console.warn('Failed to fetch progress:', progressError);
        }
      } catch (error: any) {
        console.error('Error fetching lesson:', error);
        const errorMessage = error.response?.data?.details || 
                           error.response?.data?.error || 
                           error.message || 
                           'Failed to load lesson. Please try again later.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLesson();
  }, [courseId, lessonId, user.id, user.token]);

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
  
      // Mark lesson as completed
      const progressData = await progressApi.completeLesson(numericLessonId, user.id, timeSpent);
      setProgress(progressData);
  
      // Check if this is the final lesson
      if (isFinalLesson) {
        // Fetch current course progress
        const courseProgressResponse = await api.get(`/api/courses/${numericCourseId}/progress`);
        const courseProgressData = courseProgressResponse.data;
        
        // Check if all lessons are completed
        if (courseProgressData.completedLessons === courseProgressData.totalLessons) {
          // Generate certificate (this will only succeed if all lessons are completed)
          const certResponse = await axios.post(`${API_BASE_URL}/api/courses/${numericCourseId}/certificate`, {
            userId: user.id
          });

          if (certResponse.status === 200) {
            const certData = certResponse.data;
            if (certData && !certData.error) {
              setCertificate(certData);
              setShowCourseCompletion(true);
              setIsCourseCompleted(true);
              toast.success('Congratulations! You have successfully completed the course.');
            }
          } else {
            // If certificate not generated, still show course completion dialog
            setShowCourseCompletion(true);
            setIsCourseCompleted(true);
            toast.success('Congratulations! You have successfully completed the course.');
          }
        }
      } else {
        setShowReview(true);
      }
  
      // Refresh course progress
      const courseProgressResponse = await api.get(`/api/courses/${numericCourseId}/progress`);
      if (courseProgressResponse.status === 200) {
        setCourseProgress(courseProgressResponse.data);
      }
  
    } catch (error: any) {
      console.error('Error completing lesson:', error);
      toast.error(error.response?.data?.error || 'Failed to complete lesson. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  const updateProgress = async (timeSpent: number) => {
    try {
      if (!lessonId || !user) return;

      const numericLessonId = parseInt(lessonId);
      if (isNaN(numericLessonId)) return;

      await progressApi.updateLessonProgress(numericLessonId, user.id, {
        timeSpent,
        completed: progress.completed
      });
    } catch (error: any) {
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

  const handleNextLesson = async () => {
    try {
      if (!lessonId || !courseId || !user) return;

      const numericLessonId = parseInt(lessonId);
      const numericCourseId = parseInt(courseId);
      if (isNaN(numericLessonId) || isNaN(numericCourseId)) return;

      // Calculate time spent
      const timeSpent = startTime 
        ? Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
        : progress.timeSpent;

      // Mark current lesson as completed
      const progressData = await progressApi.completeLesson(numericLessonId, user.id, timeSpent);
      setProgress(progressData);

      // Check if this was the final lesson
      if (isFinalLesson) {
        // Mark course as completed
        const courseProgressResponse = await api.get(`/api/courses/${numericCourseId}/progress`);
        const courseProgressData = courseProgressResponse.data;
        
        if (courseProgressData.completedLessons === courseProgressData.totalLessons) {
          // Generate certificate
          const certResponse = await axios.post(`${API_BASE_URL}/api/courses/${numericCourseId}/certificate`, {
            userId: user.id
          });

          if (certResponse.status === 200) {
            const certData = certResponse.data;
            if (certData && !certData.error) {
              setShowCertificate(true);
              setCertificate(certData);
              setIsCourseCompleted(true);
              toast.success('Congratulations! You have completed the course!');
            }
          }
        }
      }

      // Navigate to next lesson or course overview
      if (nextLessonId && !isNaN(Number(nextLessonId))) {
        navigate(`/courses/${courseId}/lessons/${nextLessonId}`);
      } else {
        navigate(`/courses/${courseId}`);
      }
    } catch (error: any) {
      console.error('Error completing lesson:', error);
      toast.error(error.response?.data?.error || 'Failed to complete lesson. Please try again.');
    }
  };

  const handleRunCode = () => {
    setIsSimulating(true);
    // Implementation for running code in Wokwi simulator
    if (lesson?.simulatorConfig?.wokwiId) {
      // Open Wokwi simulator in a new tab
      window.open(`https://wokwi.com/projects/${lesson.simulatorConfig.wokwiId}`, '_blank');
    }
    setIsSimulating(false);
  };

  // Add a function to check if user can access the lesson
  const canAccessLesson = () => {
    if (!lesson) return false;
    
    // If course is completed, only allow viewing the final lesson
    if (isCourseCompleted) {
      return isFinalLesson;
    }
    
    // If this is the first lesson, allow access
    if (!lesson.prevLessonId) return true;
    
    // Check if previous lesson is completed
    return progress.completed;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="space-x-4">
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button variant="outline" onClick={() => navigate(`/courses/${courseId}`)}>
              Back to Course
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Lesson Not Found</h2>
          <p className="text-muted-foreground mb-4">The lesson could not be loaded. Please check the course and lesson IDs or try again later.</p>
          <Button variant="outline" onClick={() => navigate(`/courses/${courseId}`)}>
            Back to Course
          </Button>
        </div>
      </div>
    );
  }

  // Modify the return statement to include access restrictions
  if (!canAccessLesson()) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Access Restricted</h2>
          <p className="text-muted-foreground mb-4">
            {isCourseCompleted 
              ? "This course has already been completed and cannot be reattempted."
              : "Please complete the previous lesson before accessing this one."}
          </p>
          <Button variant="outline" onClick={() => navigate(`/courses/${courseId}`)}>
            Back to Course
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{lesson.title}</CardTitle>
          <CardDescription>{lesson.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="video">Video Tutorial</TabsTrigger>
              <TabsTrigger value="simulator">Simulator</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-4">
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: lesson.content }} />
              
              {lesson.objectives.length > 0 ? (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Learning Objectives</h3>
                  <ul className="list-disc pl-6">
                    {lesson.objectives.map((objective, index) => (
                      <li key={index}>{objective}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="mt-6 text-muted-foreground">No objectives for this lesson.</div>
              )}

              {lesson.resources.length > 0 ? (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Additional Resources</h3>
                  <ul className="list-disc pl-6">
                    {lesson.resources.map((resource, index) => (
                      <li key={index}>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {resource.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="mt-6 text-muted-foreground">No additional resources for this lesson.</div>
              )}
            </TabsContent>

            <TabsContent value="video" className="mt-4">
              {lesson.videoUrl ? (
                <div className="aspect-video">
                  {(lesson.videoUrl.includes('youtube.com') || lesson.videoUrl.includes('youtu.be') || lesson.videoUrl.includes('vimeo.com')) ? (
                    <iframe
                      src={getEmbedUrl(lesson.videoUrl)}
                      className="w-full h-full rounded-lg"
                      allowFullScreen
                      title="Lesson Video"
                    />
                  ) : (
                    <video src={lesson.videoUrl} controls className="w-full h-full rounded-lg" />
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No video tutorial available for this lesson.</p>
              )}
            </TabsContent>

            <TabsContent value="simulator" className="mt-4">
              <div className="space-y-4">
                <div className="border rounded-lg p-4 relative">
                  {isSimulatorLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-sm text-muted-foreground">Loading simulator...</p>
                      </div>
                    </div>
                  )}
                  <iframe
                    src="https://wokwi.com/projects/new/arduino-uno"
                    width="100%"
                    height="600"
                    style={{ border: 0, borderRadius: 8 }}
                    allowFullScreen
                    title="Wokwi Arduino Simulator"
                    onLoad={() => setIsSimulatorLoading(false)}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-8 flex justify-between items-center">
            {lesson.prevLessonId && (
              <Button
                variant="outline"
                onClick={() => navigate(`/courses/${courseId}/lessons/${lesson.prevLessonId}`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous Lesson
              </Button>
            )}
            <div className="flex-1" />
            {!progress.completed && isFinalLesson && (
              <Button onClick={handleComplete} disabled={isCompleting}>
                {isCompleting ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Finish Course
                  </>
                )}
              </Button>
            )}
            {!progress.completed && !isFinalLesson && (
              <Button onClick={handleComplete} disabled={isCompleting}>
                {isCompleting ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Lesson
                  </>
                )}
              </Button>
            )}
            {progress.completed && isFinalLesson && (
              <div className="text-green-600 font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Course Completed!
              </div>
            )}
            {progress.completed && !isFinalLesson && lesson.nextLessonId && (
              <Button onClick={handleNextLesson}>
                Next Lesson
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

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

      {/* Course Completion Dialog */}
      <Dialog open={showCourseCompletion} onOpenChange={setShowCourseCompletion}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-green-600">
              Course Completed!
            </DialogTitle>
            <DialogDescription className="text-center">
              Congratulations! You have successfully completed the course.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {certificate && (
              <div className="border p-6 rounded-lg text-center space-y-4">
                <h3 className="text-xl font-bold">Certificate of Completion</h3>
                <p>This certifies that</p>
                <p className="text-lg font-semibold">{certificate.userName}</p>
                <p>has successfully completed the course</p>
                <p className="text-lg font-semibold">{lesson?.title.split(':')[0]}</p>
                <p className="text-sm text-muted-foreground">
                  Certificate #{certificate.certificateNumber}
                </p>
                <p className="text-sm text-muted-foreground">
                  Issued on {new Date(certificate.issuedAt).toLocaleDateString()}
                </p>
              </div>
            )}
            
            <div className="flex flex-col gap-4">
              <Button 
                className="w-full" 
                onClick={() => {
                  setShowCourseCompletion(false);
                  navigate(`/courses/${courseId}`);
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Certificate
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setShowCourseCompletion(false);
                  navigate(`/courses/${courseId}`);
                }}
              >
                <Share className="w-4 h-4 mr-2" />
                Share Achievement
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LessonDetail;
