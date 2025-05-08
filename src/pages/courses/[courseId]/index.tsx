import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Clock, BookOpen, Code, Award, Users, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';

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
    completedAt?: string;
  }>;
}

const API_BASE_URL = 'http://localhost:5000';

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
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!courseId) {
          throw new Error('Invalid course ID');
        }

        const numericCourseId = parseInt(courseId);
        if (isNaN(numericCourseId)) {
          throw new Error('Invalid course ID format');
        }

        // Fetch course data
        const courseResponse = await fetch(`${API_BASE_URL}/api/courses/${numericCourseId}`);
        if (!courseResponse.ok) {
          throw new Error('Failed to fetch course');
        }
        const courseData = await courseResponse.json();
        setCourse(courseData);

        // Fetch progress
        const progressResponse = await fetch(`${API_BASE_URL}/api/courses/${numericCourseId}/progress`);
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          setProgress(progressData);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        setError(error instanceof Error ? error.message : 'Failed to load course');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleStartLearning = () => {
    if (!course || !course.lessons || course.lessons.length === 0) return;

    // Find the first lesson that's not completed
    const firstIncompleteLesson = course.lessons.find(lesson => {
      const lessonProgress = progress.lessonProgress.find(p => p.lessonId === lesson.id);
      return !lessonProgress?.completed;
    });

    // If all lessons are completed, start from the first lesson
    const targetLesson = firstIncompleteLesson || course.lessons[0];

    // Navigate to the lesson
    navigate(`/courses/${courseId}/lessons/${targetLesson.id}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid gap-8">
          {/* Header Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-96" />
            <Skeleton className="h-4 w-64" />
          </div>

          {/* Content Skeleton */}
          <div className="grid md:grid-cols-[1fr_300px] gap-8">
            <div className="space-y-8">
              <Skeleton className="h-[400px] w-full" />
              <Skeleton className="h-[200px] w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[200px] w-full" />
            </div>
          </div>
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
          <Button asChild>
            <Link to="/courses">
              Back to Courses
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
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
          <h1 className="text-4xl font-bold">{course.title}</h1>
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
                <CardTitle>Course Content</CardTitle>
                <CardDescription>
                  Learn at your own pace with our comprehensive lessons
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {course.lessons.map((lesson, index) => {
                    const lessonProgress = progress.lessonProgress.find(p => p.lessonId === lesson.id);
                    return (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{lesson.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {lesson.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            <Clock className="w-3 h-3 mr-1" />
                            {lesson.duration} min
                          </Badge>
                          {lessonProgress?.completed && (
                            <Badge variant="secondary">
                              <Award className="w-3 h-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>
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
                    disabled={!course.lessons || course.lessons.length === 0}
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