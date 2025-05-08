import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlayCircle, Code, BookOpen, MessageCircle, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface LessonContent {
  id: string;
  title: string;
  videoUrl: string;
  theory: string;
  practicalGuide: string;
  initialCode: string;
}

const API_BASE_URL = 'http://localhost:5000';

const LessonDetailPage = () => {
  const { courseId, lessonId } = useParams();
  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [code, setCode] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!courseId || !lessonId) {
          throw new Error('Invalid course or lesson ID');
        }

        const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/lessons/${lessonId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch lesson');
        }

        const data = await response.json();
        setLesson(data);
        setCode(data.initialCode || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load lesson');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLesson();
  }, [courseId, lessonId]);

  const handleRunCode = () => {
    setIsSimulating(true);
    console.log(`Running code for lesson ${lessonId} in course ${courseId}`);
    // In a real app, this would connect to an Arduino simulator
    setTimeout(() => setIsSimulating(false), 2000);
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
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{lesson.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="video" className="w-full">
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
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                {lesson.videoUrl ? (
                  <video
                    src={lesson.videoUrl}
                    controls
                    className="w-full h-full rounded-lg"
                  />
                ) : (
                  <PlayCircle className="h-12 w-12" />
                )}
              </div>
            </TabsContent>

            <TabsContent value="theory" className="mt-4">
              <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                <div className="prose dark:prose-invert max-w-none">
                  {lesson.theory}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="practical" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                    <div className="prose dark:prose-invert max-w-none">
                      {lesson.practicalGuide}
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
                      {isSimulating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Running...
                        </>
                      ) : (
                        'Run Code'
                      )}
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
    </div>
  );
};

export default LessonDetailPage; 