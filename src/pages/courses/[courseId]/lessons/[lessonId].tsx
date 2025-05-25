import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlayCircle, Code, BookOpen, MessageCircle, ArrowLeft, ArrowRight, CheckCircle, Clock, Award, Download, Share, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

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
  resources: Array<{
    title: string;
    url: string;
  }>;
  simulatorConfig: {
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
  } | null;
}

interface LessonProgress {
  completed: boolean;
  timeSpent: number;
  attempts: number;
  completedAt?: string;
}

interface Certificate {
  id: number;
  certificateNumber: string;
  issuedAt: string;
  userName: string;
}

const API_BASE_URL = 'http://localhost:5000';

const LessonDetailPage = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Block all rendering and API calls until user.id is available
  if (!user?.id) {
    return <div>Loading user...</div>;
  }

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<LessonProgress>({
    completed: false,
    timeSpent: 0,
    attempts: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('theory');
  const [isCompleting, setIsCompleting] = useState(false);
  const [code, setCode] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonProgress, setLessonProgress] = useState<any[]>([]);

  useEffect(() => {
    const fetchLessonAndProgress = async () => {
      if (!courseId || !lessonId || !user?.id) return;

      try {
        // Fetch lesson details
        const lessonResponse = await fetch(
          `${API_BASE_URL}/api/courses/${courseId}/lessons/${lessonId}`
        );
        if (!lessonResponse.ok) throw new Error('Failed to fetch lesson');
        const lessonData = await lessonResponse.json();
        setLesson(lessonData);
        setCode(lessonData.simulatorConfig?.files['main.ino'] || '');

        // Fetch lesson progress
        const progressResponse = await fetch(
          `${API_BASE_URL}/api/lessons/${lessonId}/progress?userId=${user.id}`
        );
        if (!progressResponse.ok) throw new Error('Failed to fetch progress');
        const progressData = await progressResponse.json();
        setProgress(progressData);
      } catch (error) {
        console.error('Error fetching lesson data:', error);
        toast.error('Failed to load lesson data');
      } finally {
        setLoading(false);
      }
    };

    fetchLessonAndProgress();
  }, [courseId, lessonId, user?.id]);

  useEffect(() => {
    const fetchLessonsAndProgress = async () => {
      if (!courseId || !user?.id) return;
      // Fetch all lessons for the course
      const lessonsRes = await fetch(`${API_BASE_URL}/api/courses/${courseId}/lessons`);
      const lessonsData = await lessonsRes.json();
      setLessons(lessonsData);

      // Fetch course progress (including lesson progress)
      const progressRes = await fetch(`${API_BASE_URL}/api/courses/${courseId}/progress?userId=${user.id}`);
      const progressData = await progressRes.json();
      setLessonProgress(progressData.lessonProgress);
    };
    fetchLessonsAndProgress();
  }, [courseId, user?.id, progress.completed]);

  const updateProgress = async (completed: boolean) => {
    if (!courseId || !lessonId || !user?.id) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/lessons/${lessonId}/progress`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            completed,
            timeSpent: progress.timeSpent + 1, // Increment time spent
            attempts: progress.attempts + 1,
            completedAt: completed ? new Date().toISOString() : undefined
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to update progress');
      
      const updatedProgress = await response.json();
      setProgress(updatedProgress);

      if (completed) {
        toast.success('Lesson completed!');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  // Find the current lesson index in the lessons array
  const currentLessonIndex = lessons.findIndex(l => l.id === Number(lessonId));
  const currentLesson = lessons[currentLessonIndex];

  // Prevent navigation or completion if lesson does not belong to course
  if (!currentLesson && !loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Error</h2>
          <p className="text-muted-foreground mb-4">This lesson does not belong to the current course.</p>
          <Button onClick={() => navigate(`/courses/${courseId}`)}>
            Back to Course
          </Button>
        </div>
      </div>
    );
  }

  const handleNextLesson = () => {
    if (currentLessonIndex === -1 || currentLessonIndex === lessons.length - 1) return;
    const nextLesson = lessons[currentLessonIndex + 1];
    if (nextLesson) {
      navigate(`/courses/${courseId}/lessons/${nextLesson.id}`);
    }
  };

  const handlePrevLesson = () => {
    if (currentLessonIndex <= 0) return;
    const prevLesson = lessons[currentLessonIndex - 1];
    if (prevLesson) {
      navigate(`/courses/${courseId}/lessons/${prevLesson.id}`);
    }
  };

  const handleComplete = () => {
    // Only allow completion if lesson belongs to course
    if (!currentLesson) return;
    updateProgress(true);
  };

  const handleRunCode = () => {
    setIsSimulating(true);
    // In a real app, this would connect to an Arduino simulator
    setTimeout(() => setIsSimulating(false), 2000);
  };

  // Helper to determine if a lesson is locked
  const isLessonLocked = (index: number) => {
    if (index === 0) return false;
    return !lessonProgress?.[index - 1]?.completed;
  };

  // Helper to set certificate and ensure userName is present
  const setCertificateWithUserName = (cert: any) => {
    if (!cert) return;
    if (!cert.userName && user?.name) {
      setCertificate({ ...cert, userName: user.name });
    } else {
      setCertificate(cert);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid gap-8">
          {/* Navigation Skeleton */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-32" />
            <div className="ml-auto flex items-center gap-4">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>

          {/* Content Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-96" />
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="theory">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="video">
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Video
                  </TabsTrigger>
                  <TabsTrigger value="theory">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Theory
                  </TabsTrigger>
                  <TabsTrigger value="practical">
                    <Code className="h-4 w-4 mr-2" />
                    Practical
                  </TabsTrigger>
                  <TabsTrigger value="discussion">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Discussion
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="theory" className="mt-4">
                  <Skeleton className="h-[600px] w-full" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Lesson Not Found</h2>
          <p className="text-muted-foreground mb-4">The lesson you're looking for doesn't exist.</p>
          <Button onClick={() => navigate(`/courses/${courseId}`)}>
            Back to Course
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="w-64 border-r p-4">
        <h2 className="font-bold mb-4">Lessons</h2>
        <ul>
          {lessons.map((l, idx) => {
            const completed = lessonProgress?.find(p => p.lessonId === l.id)?.completed;
            const locked = isLessonLocked(idx);
            return (
              <li key={l.id} className={`mb-2 ${locked ? 'opacity-50 pointer-events-none' : ''}`}>
                <Link to={`/courses/${courseId}/lessons/${l.id}`} className={l.id === lesson?.id ? 'font-bold' : ''}>
                  {l.title}
                  {completed && <CheckCircle className="inline ml-2 text-green-500" />}
                  {locked && <Lock className="inline ml-2 text-gray-400" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>
      {/* Main lesson content */}
      <main className="flex-1 p-8">
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
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <CardTitle>{lesson.title}</CardTitle>
                <Badge variant="secondary" className="ml-auto">
                  <Clock className="w-4 h-4 mr-2" />
                  {lesson.duration} minutes
                </Badge>
              </div>
              <CardDescription>{lesson.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="video" className="flex items-center gap-2">
                    <PlayCircle className="h-4 w-4" />
                    Video
                  </TabsTrigger>
                  <TabsTrigger value="theory" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Theory
                  </TabsTrigger>
                  <TabsTrigger value="practical" className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Practical
                  </TabsTrigger>
                  <TabsTrigger value="discussion" className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Discussion
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="video" className="mt-4">
                  {lesson.videoUrl ? (
                    <div className="aspect-video">
                      <iframe
                        src={lesson.videoUrl}
                        className="w-full h-full rounded-lg"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <PlayCircle className="h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground ml-2">No video available</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="theory" className="mt-4">
                  <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                    <div className="prose dark:prose-invert max-w-none">
                      <ReactMarkdown>{lesson.content}</ReactMarkdown>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="practical" className="mt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                        <div className="prose dark:prose-invert max-w-none">
                          <ReactMarkdown>{lesson.content}</ReactMarkdown>
                        </div>
                      </ScrollArea>
                    </div>
                    <div className="space-y-4">
                      <div className="relative">
                        <textarea
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          className="w-full h-[400px] font-mono text-sm p-4 bg-muted rounded-lg"
                        />
                        <Button
                          onClick={handleRunCode}
                          disabled={isSimulating}
                          className="absolute top-2 right-2"
                        >
                          {isSimulating ? 'Running...' : 'Run Code'}
                        </Button>
                      </div>
                      <div className="bg-muted rounded-lg p-4 h-[160px]">
                        <h4 className="font-semibold mb-2">Serial Monitor</h4>
                        <div className="font-mono text-sm">
                          {isSimulating ? 'Simulating Arduino code...' : 'Ready'}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="discussion" className="mt-4">
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Discussion Forum</h3>
                    <p className="text-muted-foreground">
                      Share your thoughts and questions about this lesson with other learners.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Progress and Completion */}
          {!progress.completed && (
            <div className="flex justify-end">
              <Button
                size="lg"
                onClick={() => {
                  setStartTime(new Date());
                  handleComplete();
                }}
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
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <Button
            disabled={currentLessonIndex <= 0}
            onClick={handlePrevLesson}
          >
            Previous
          </Button>
          <Button
            disabled={currentLessonIndex === -1 || currentLessonIndex === lessons.length - 1 || !progress.completed}
            onClick={handleNextLesson}
          >
            Next
          </Button>
        </div>

        {/* Review Dialog */}
        <Dialog open={showReview} onOpenChange={setShowReview}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Lesson Review</DialogTitle>
              <DialogDescription>
                Here's how you did in this lesson
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Time Spent</span>
                <span className="text-sm font-medium">
                  {Math.floor(progress.timeSpent / 60)} min {progress.timeSpent % 60} sec
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Attempts</span>
                <span className="text-sm font-medium">{progress.attempts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completion Date</span>
                <span className="text-sm font-medium">
                  {new Date(progress.completedAt || '').toLocaleDateString()}
                </span>
              </div>
              <Button className="w-full" onClick={handleNextLesson}>
                {lesson.nextLessonId ? 'Next Lesson' : 'Back to Course'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Certificate Dialog */}
        <Dialog open={showCertificate} onOpenChange={setShowCertificate}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Course Certificate</DialogTitle>
              <DialogDescription>
                Congratulations! You've completed all lessons in this course.
              </DialogDescription>
            </DialogHeader>
            {certificate && (
              <div className="space-y-6 py-4">
                <div className="bg-card p-6 rounded-lg border text-center space-y-4">
                  <Award className="w-12 h-12 mx-auto text-primary" />
                  <h3 className="text-2xl font-bold">Certificate of Completion</h3>
                  <p className="text-muted-foreground">This certifies that</p>
                  <p className="text-xl font-semibold">{certificate.userName}</p>
                  <p className="text-muted-foreground">has successfully completed</p>
                  <p className="text-lg font-medium">{lesson.title}</p>
                  <p className="text-sm text-muted-foreground mt-4">
                    Certificate #{certificate.certificateNumber}<br />
                    Issued on {new Date(certificate.issuedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-4">
                  <Button className="flex-1" asChild>
                    <a href={`${API_BASE_URL}/api/certificates/${certificate.id}/download`} download>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </a>
                  </Button>
                  <Button className="flex-1" variant="outline" onClick={() => {
                    // Implement share functionality
                    navigator.share?.({
                      title: 'My Course Certificate',
                      text: `I've completed the ${lesson.title} course!`,
                      url: `${window.location.origin}/certificates/${certificate.id}`
                    }).catch(console.error);
                  }}>
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default LessonDetailPage;
