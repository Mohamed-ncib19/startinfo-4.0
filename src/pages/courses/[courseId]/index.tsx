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
  }>;
}

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<CourseProgress>({
    completed: false,
    progress: 0,
    completedLessons: 0,
    totalLessons: 0,
    lessonProgress: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch course data
        const courseResponse = await fetch(`${API_BASE_URL}/api/courses/${courseId}`);
        if (!courseResponse.ok) {
          throw new Error('Failed to fetch course');
        }
        const courseData = await courseResponse.json();
        setCourse(courseData);

        // Fetch course progress
        const progressResponse = await fetch(`${API_BASE_URL}/api/courses/${courseId}/progress`);
        if (!progressResponse.ok) {
          throw new Error('Failed to fetch progress');
        }
        const progressData = await progressResponse.json();
        setProgress(progressData);
      } catch (error: any) {
        console.error('Error fetching course data:', error);
        setError(error.message || 'Failed to load course data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  const handleStartLearning = () => {
    if (!course) return;

    if (progress.completed) {
      toast.error('This course has already been completed and cannot be reattempted.');
      return;
    }

    // Find the first incomplete lesson or start from the beginning
    const firstIncompleteLesson = course.lessons.find(
      lesson => !progress.lessonProgress.find(p => p.lessonId === lesson.id)?.completed
    );
    const lessonId = firstIncompleteLesson?.id || course.lessons[0].id;
    navigate(`/courses/${courseId}/lessons/${lessonId}`);
  };

  // Add a function to check if user can access the course
  const canAccessCourse = () => {
    if (!course) return false;
    
    // If course is completed, only allow viewing the course overview
    if (progress.completed) {
      return true;
    }
    
    return true; // Allow access to course overview for all users
  };

  if (!canAccessCourse()) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Access Restricted</h2>
          <p className="text-muted-foreground mb-4">
            This course has already been completed and cannot be reattempted.
          </p>
          <Button variant="outline" onClick={() => navigate('/courses')}>
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

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

  if (error || !course) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Error</h2>
          <p className="text-muted-foreground mb-4">{error || 'Course not found'}</p>
          <Button variant="outline" onClick={() => navigate('/courses')}>
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold">{course.title}</h1>
            {progress.completed && (
              <Badge className="bg-green-500 hover:bg-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                Course Completed
              </Badge>
            )}
          </div>
          <p className="text-xl text-muted-foreground">{course.description}</p>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">
              <Clock className="w-4 h-4 mr-2" />
              {course.duration} minutes
            </Badge>
            <Badge variant="secondary">
              <BookOpen className="w-4 h-4 mr-2" />
              {course.lessons.length} lessons
            </Badge>
            <Badge variant="secondary">
              <Code className="w-4 h-4 mr-2" />
              {course.level}
            </Badge>
          </div>
        </motion.div>

        {/* Content */}
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
                    const isLocked = !progress.completed && index > 0 && 
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
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>{lesson.duration} minutes</span>
                            </div>
                            <Button
                              variant="outline"
                              onClick={() => {
                                if (progress.completed) {
                                  toast.error('This course has already been completed and cannot be reattempted.');
                                  return;
                                }
                                navigate(`/courses/${courseId}/lessons/${lesson.id}`);
                              }}
                              disabled={isLocked || progress.completed}
                            >
                              {isCompleted ? 'Review Lesson' : 'Start Lesson'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About the Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <img
                    src={course.instructor.avatar}
                    alt={course.instructor.name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div className="space-y-2">
                    <h3 className="font-medium">{course.instructor.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {course.instructor.bio}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {course.instructor.expertise.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
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
    </div>
  );
};

export default CourseDetailPage; 