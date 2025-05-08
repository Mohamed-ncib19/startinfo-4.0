import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

const CourseDetailPage: React.FC = () => {
  const [courseId, setCourseId] = useState<string | null>(null);
  const [course, setCourse] = useState<any>(null);
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
    const fetchCourseProgress = async () => {
      if (!courseId) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/progress`);
        if (response.ok) {
          const data = await response.json();
          setCourseProgress(data);
        }
      } catch (error) {
        console.error('Error fetching course progress:', error);
      }
    };

    fetchCourseProgress();
  }, [courseId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Course Progress</span>
            <div className="w-32 h-2 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-primary rounded-full" 
                style={{ width: `${courseProgress.progress}%` }}
              />
            </div>
            <span className="text-sm font-medium">
              {courseProgress.completedLessons}/{courseProgress.totalLessons} lessons completed
            </span>
          </div>
          {courseProgress.completed && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Course Completed</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage; 