import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Clock, CheckCircle, ChevronRight, Star, Users, Award, BarChart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';

interface LessonProgress {
  id: number;
  completed: boolean;
  timeSpent: number;
  attempts: number;
  completedAt?: string;
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
  progress?: LessonProgress;
}

interface Course {
  id: number;
  title: string;
  description: string;
  level: string;
  thumbnail: string;
  duration: number;
  published: boolean;
  instructorId: number;
  lessons: Lesson[];
  instructor: {
    name: string;
    bio: string;
    avatar: string;
    expertise: string;
  };
}

const API_BASE_URL = 'http://localhost:5000';

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('content');
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    completed: boolean;
    progress: number;
    lessonProgress: LessonProgress[];
  } | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/courses/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch course');
        }
        const data = await response.json();
        setCourse(data);
      } catch (error) {
        console.error('Error fetching course:', error);
        setError('Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    const fetchProgress = async () => {
      if (!id || !user || !user.token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/courses/${id}/progress`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            // 'Content-Type': 'application/json' // Optional for GET, but good practice
          }
        });
        if (response.ok) {
          const data = await response.json();
          setProgress(data);
        } else {
          console.error('Failed to fetch progress:', response.statusText);
          // Optionally, set an error state here if progress is critical
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
    };

    fetchCourse();
    fetchProgress();
  }, [id, user]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-gray-600">{error || 'Course not found'}</p>
          <Button className="mt-4" asChild>
            <Link to="/courses">Back to Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  const toggleLesson = (lessonId: number) => {
    setExpandedLesson(expandedLesson === lessonId ? null : lessonId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
              <CardDescription>{course.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="instructor">Instructor</TabsTrigger>
                </TabsList>
                <TabsContent value="content">
                  <div className="space-y-4">
                    {course.lessons.map((lesson) => (
                      <Card key={lesson.id}>
                        <CardHeader>
                          <CardTitle>{lesson.title}</CardTitle>
                          <CardDescription>{lesson.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>{lesson.duration} minutes</span>
                              {progress?.lessonProgress?.find(p => p.id === lesson.id)?.completed && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                            <Button
                              variant="outline"
                              onClick={() => toggleLesson(lesson.id)}
                            >
                              {expandedLesson === lesson.id ? 'Hide' : 'Show'} Details
                            </Button>
                          </div>
                          {expandedLesson === lesson.id && (
                            <div className="mt-4">
                              <p>{lesson.content}</p>
                              {lesson.videoUrl && (
                                <div className="mt-4">
                                  <video
                                    src={lesson.videoUrl}
                                    controls
                                    className="w-full"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="overview">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Duration: {course.duration} minutes</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BarChart className="h-4 w-4" />
                      <span>Level: {course.level}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Instructor: {course.instructor?.name || 'Not available'}</span>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="instructor">
                  <div className="space-y-4">
                    {course.instructor ? (
                      <>
                        <div className="flex items-center space-x-4">
                          <img
                            src={course.instructor.avatar}
                            alt={course.instructor.name}
                            className="w-16 h-16 rounded-full"
                          />
                          <div>
                            <h3 className="font-semibold">{course.instructor.name}</h3>
                            <p className="text-sm text-gray-500">{course.instructor.bio}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Expertise</h4>
                          <div className="flex flex-wrap gap-2">
                            {course.instructor.expertise.split(',').map((skill) => (
                              <Badge key={skill} variant="secondary">
                                {skill.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">Instructor information not available</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Course Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progress && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Progress</span>
                      <span className="font-semibold">{progress.progress}%</span>
                    </div>
                    <Progress value={progress.progress} />
                  </div>
                )}
                <Button className="w-full" asChild>
                  {course.lessons && course.lessons.length > 0 ? (
                    <Link to={`/courses/${id}/lessons/${course.lessons[0].id}`}>Start Learning</Link>
                  ) : (
                    <span>Start Learning</span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
