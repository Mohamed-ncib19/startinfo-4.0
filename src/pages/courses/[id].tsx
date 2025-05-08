import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PlayCircle, CheckCircle, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Lesson {
  id: number;
  title: string;
  description: string;
  content: string;
  duration: number;
  order: number;
  isPublished: boolean;
}

interface Course {
  id: number;
  title: string;
  description: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  thumbnail: string;
  duration: number;
  published: boolean;
  lessons: Lesson[];
  createdAt: string;
  updatedAt: string;
}

const API_URL = 'http://localhost:5000/api';

const CourseDetailPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        console.log('Fetching course with ID:', id);
        const response = await fetch(`${API_URL}/courses/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch course');
        }
        const data = await response.json();
        console.log('Course data:', data);
        setCourse(data);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  if (loading) {
    return <div className="container mx-auto py-8">Loading course details...</div>;
  }

  if (error) {
    return <div className="container mx-auto py-8 text-red-500">Error: {error}</div>;
  }

  if (!course) {
    return <div className="container mx-auto py-8">Course not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Overview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-64 object-cover rounded-t-lg mb-4"
              />
              <div className="flex items-center justify-between mb-4">
                <div>
                  <CardTitle className="text-2xl mb-2">{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </div>
                <Badge>{course.level}</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{Math.ceil(course.duration / 60)} hours</span>
                <span>•</span>
                <span>{course.lessons.length} lessons</span>
              </div>
            </CardHeader>
          </Card>

          {/* Lessons List */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Lessons</h2>
            <div className="space-y-4">
              {course.lessons.map((lesson) => (
                <Card key={lesson.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{lesson.title}</CardTitle>
                        <CardDescription>{lesson.description}</CardDescription>
                      </div>
                      <Badge variant={lesson.isPublished ? 'default' : 'secondary'}>
                        {lesson.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Course Progress</CardTitle>
              <CardDescription>Track your progress through the course</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={0} className="mb-2" />
              <p className="text-sm text-muted-foreground">0% Complete</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
