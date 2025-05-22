import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, BarChart } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/auth-context';

interface Course {
  id: number;
  title: string;
  description: string;
  level: string;
  thumbnail: string;
  duration: number;
  published: boolean;
  instructor: {
    name: string;
  };
  progress?: {
    completed: boolean;
    progress: number;
    completedLessons: number;
    totalLessons: number;
  };
  lessons?: {
    id: number;
  }[];
}

const API_BASE_URL = 'http://localhost:5000';

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    setCourses([]); // Reset courses when user changes to avoid showing another user's progress
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/courses`);
        if (response.ok) {
          const coursesData = await response.json();
          
          // Fetch progress for each course for the current user only
          const coursesWithProgress = await Promise.all(
            coursesData.map(async (course: Course) => {
              if (!user?.id) return course;
              
              try {
                const progressResponse = await fetch(
                  `${API_BASE_URL}/api/courses/${course.id}/progress?userId=${user.id}`
                );
                if (progressResponse.ok) {
                  const progressData = await progressResponse.json();
                  return { ...course, progress: progressData };
                }
              } catch (error) {
                console.error(`Error fetching progress for course ${course.id}:`, error);
              }
              return course;
            })
          );
          
          setCourses(coursesWithProgress);
          console.log('coursesWithProgress : ', coursesWithProgress);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchCourses();
    } else {
      setLoading(false);
    }
  }, [user?.id, location]);

  if (loading) {
    return <div>Loading courses...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Available Courses</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-48 object-cover rounded-t-lg mb-4"
              />
              <CardTitle>{course.title}</CardTitle>
              <CardDescription>{course.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration} minutes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BarChart className="h-4 w-4" />
                    <span>{course.level}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{course.instructor?.name || 'Unknown'}</span>
                  </div>
                </div>
                
                {course.progress && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {course.progress.totalLessons && course.progress.totalLessons > 0
                          ? `${Math.round((course.progress.completedLessons / course.progress.totalLessons) * 100)}% (${course.progress.completedLessons}/${course.progress.totalLessons})`
                          : '0% (0/0)'}
                      </span>
                    </div>
                    <Progress value={course.progress.totalLessons && course.progress.totalLessons > 0 ? (course.progress.completedLessons / course.progress.totalLessons) * 100 : 0} className="h-2" />
                  </div>
                )}
                
                <Button className="w-full" asChild>
                  <Link to={
                    course.lessons && course.lessons.length > 0
                      ? `/courses/${course.id}/lessons/${course.lessons[0].id}`
                      : `/courses/${course.id}`
                  }>
                    {course.progress?.completed ? 'Review Course' : 'Start Learning'}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CoursesPage;
