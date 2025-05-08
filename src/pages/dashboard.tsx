import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/auth-context';
import { BookOpen, MessageCircle, Trophy, Activity, Star, Users, Rocket } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  progress: number;
  lastAccessed: string;
}

interface Activity {
  id: string;
  type: 'course' | 'forum' | 'project';
  title: string;
  description: string;
  timestamp: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
  progress: number;
}

const courses: Course[] = [
  {
    id: '1',
    title: 'Introduction to Arduino',
    progress: 75,
    lastAccessed: '2024-04-14T10:30:00Z',
  },
  {
    id: '2',
    title: 'Advanced Robotics',
    progress: 30,
    lastAccessed: '2024-04-13T15:45:00Z',
  },
  {
    id: '3',
    title: 'IoT Projects',
    progress: 90,
    lastAccessed: '2024-04-12T09:15:00Z',
  },
];

const activities: Activity[] = [
  {
    id: '1',
    type: 'course',
    title: 'Completed Lesson: Arduino Basics',
    description: 'You completed the introduction to Arduino programming',
    timestamp: '2024-04-14T11:30:00Z',
  },
  {
    id: '2',
    type: 'forum',
    title: 'New Reply: Help with Sensors',
    description: 'Someone replied to your question about temperature sensors',
    timestamp: '2024-04-14T10:15:00Z',
  },
  {
    id: '3',
    type: 'project',
    title: 'Project Update: Smart Home',
    description: 'You updated your Smart Home project',
    timestamp: '2024-04-14T09:45:00Z',
  },
];

const achievements: Achievement[] = [
  {
    id: '1',
    title: 'First Steps',
    description: 'Complete your first Arduino project',
    icon: <Trophy className="h-8 w-8 text-yellow-500" />,
    earned: true,
    progress: 100,
  },
  {
    id: '2',
    title: 'Community Helper',
    description: 'Help 10 community members with their questions',
    icon: <Users className="h-8 w-8 text-blue-500" />,
    earned: false,
    progress: 70,
  },
  {
    id: '3',
    title: 'Project Master',
    description: 'Complete 5 advanced projects',
    icon: <Star className="h-8 w-8 text-purple-500" />,
    earned: false,
    progress: 40,
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  console.log(user)

  return (
    <div className="container py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name} !</h1>
          <p className="text-muted-foreground">
            Track your progress and stay connected with the community
          </p>
        </div>
        <Button asChild>
          <Link to="/courses">Continue Learning</Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">3</div>
                <div className="text-muted-foreground">Active Courses</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">12</div>
                <div className="text-muted-foreground">Forum Posts</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Rocket className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">2</div>
                <div className="text-muted-foreground">Projects</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">5</div>
                <div className="text-muted-foreground">Achievements</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Progress */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Course Progress</CardTitle>
            <CardDescription>Track your learning journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {courses.map((course) => (
                <div key={course.id} className="space-y-2">
                  <div className="flex justify-between">
                    <Link
                      to={`/courses/${course.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {course.title}
                    </Link>
                    <span className="text-sm text-muted-foreground">
                      {course.progress}%
                    </span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity and Achievements */}
        <div className="space-y-6">
          <Tabs defaultValue="activity">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="mt-6">
              <Card>
                <ScrollArea className="h-[400px]">
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {activities.map((activity) => (
                        <div key={activity.id} className="flex gap-4">
                          <div className="p-2 bg-primary/10 rounded-lg h-fit">
                            {activity.type === 'course' && <BookOpen className="h-4 w-4 text-primary" />}
                            {activity.type === 'forum' && <MessageCircle className="h-4 w-4 text-primary" />}
                            {activity.type === 'project' && <Rocket className="h-4 w-4 text-primary" />}
                          </div>
                          <div>
                            <div className="font-medium">{activity.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {activity.description}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(activity.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </ScrollArea>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="mt-6">
              <Card>
                <ScrollArea className="h-[400px]">
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {achievements.map((achievement) => (
                        <div key={achievement.id} className="flex gap-4">
                          <div className="shrink-0">{achievement.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="font-medium">{achievement.title}</div>
                              {achievement.earned && (
                                <Badge variant="default">Earned</Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {achievement.description}
                            </div>
                            {!achievement.earned && (
                              <Progress
                                value={achievement.progress}
                                className="h-2 mt-2"
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </ScrollArea>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Button
          variant="outline"
          className="w-full flex items-center gap-2"
          asChild
        >
          <Link to="/community/forum">
            <MessageCircle className="h-4 w-4" />
            Visit Forum
          </Link>
        </Button>
        <Button
          variant="outline"
          className="w-full flex items-center gap-2"
          asChild
        >
          <Link to="/community/projects">
            <Rocket className="h-4 w-4" />
            View Projects
          </Link>
        </Button>
        <Button
          variant="outline"
          className="w-full flex items-center gap-2"
          asChild
        >
          <Link to="/account/certifications">
            <Trophy className="h-4 w-4" />
            View Certifications
          </Link>
        </Button>
      </div>
    </div>
  );
}
