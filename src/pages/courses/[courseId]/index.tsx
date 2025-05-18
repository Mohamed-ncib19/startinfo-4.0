import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Clock, BookOpen, Code, Award, Users, Play, CheckCircle, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';

const API_BASE_URL = 'http://localhost:5000';

interface Course {
  id: number;
  title: string;
  description: string;
  duration: number;
  level: string;
  isPublished: boolean;
  lessons: Array<{
    id: number;
    title: string;
    description: string;
    duration: number;
    order: number;
    isPublished: boolean;
  }>;
  instructor: {
    id: number;
    name: string;
    bio: string;
    avatar: string;
    expertise: string[];
  };
}

interface CourseProgress {
  completed: boolean;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  lessonProgress: Array<{
    lessonId: number;
    completed: boolean;
    timeSpent: number;
    attempts: number;
    completedAt?: string;
  }>;
}

const CourseDetailPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<CourseProgress>({
    completed: false,
    progress: 0,
    completedLessons: 0,
    totalLessons: 0,
    lessonProgress: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseAndProgress = async () => {
      if (!courseId || !user?.id) return;
      
      try {
        // Fetch course details
        const courseResponse = await fetch(`${API_BASE_URL}/api/courses/${courseId}`);
        if (!courseResponse.ok) throw new Error('Failed to fetch course');
        const courseData = await courseResponse.json();
        setCourse(courseData);

        // Fetch course progress
        const progressResponse = await fetch(
          `${API_BASE_URL}/api/courses/${courseId}/progress?userId=${user.id}`
        );
        if (!progressResponse.ok) throw new Error('Failed to fetch progress');
        const progressData = await progressResponse.json();
        setProgress(progressData);
      } catch (error) {
        console.error('Error fetching course data:', error);
        toast.error('Failed to load course data');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndProgress();
  }, [courseId, user?.id]);

  const handleStartLearning = () => {
    if (!course?.lessons?.length) return;
    
    // Find the first incomplete lesson or the first lesson if all are complete
    const firstLesson = course.lessons.find(
      lesson => !progress.lessonProgress.find(p => p.lessonId === lesson.id)?.completed
    ) || course.lessons[0];
    
    navigate(`/courses/${courseId}/lessons/${firstLesson.id}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-32 w-full mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Skeleton className="h-64 w-full mb-4" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div>
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Course Not Found</h2>
          <p className="text-muted-foreground mb-4">The course you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/courses">Back to Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid md:grid-cols-[1fr_300px] gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <CardTitle>Course Content</CardTitle>
                {progress.completed && (
                  <Badge className="bg-green-500 hover:bg-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Course Completed
                  </Badge>
                )}
              </div>
              <CardDescription>
                {progress.completed 
                  ? "Review the course content at your own pace"
                  : "Learn at your own pace with our comprehensive lessons"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {course.lessons.map((lesson, index) => {
                  const lessonProgress = progress.lessonProgress.find(p => p.lessonId === lesson.id);
                  const isCompleted = lessonProgress?.completed || false;
                  const isLocked = index > 0 && !progress.completed && 
                    !progress.lessonProgress.find(p => p.lessonId === course.lessons[index - 1].id)?.completed;

                  return (
                    <Card key={lesson.id} className={isLocked ? 'opacity-50' : ''}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{index + 1}.</span>
                            <CardTitle className="text-lg">{lesson.title}</CardTitle>
                            {isCompleted && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                            {isLocked && (
                              <Lock className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <Badge variant={lesson.isPublished ? 'default' : 'secondary'}>
                            {lesson.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                        <CardDescription>{lesson.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{lesson.duration} minutes</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isLocked}
                            asChild
                          >
                            <Link to={`/courses/${courseId}/lessons/${lesson.id}`}>
                              {isCompleted ? 'Review Lesson' : 'Start Lesson'}
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Course Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {progress.completedLessons} / {progress.totalLessons} lessons
                    </span>
                  </div>
                  <Progress value={progress.progress} />
                </div>
                <Button
                  className="w-full"
                  onClick={handleStartLearning}
                  disabled={!course.lessons || course.lessons.length === 0 || progress.completed}
                >
                  {progress.completed ? (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Review Course
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Start Learning
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Level</span>
                  <span className="text-sm font-medium">{course.level}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="text-sm font-medium">{course.duration} minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Lessons</span>
                  <span className="text-sm font-medium">{course.lessons.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CourseDetailPage; 