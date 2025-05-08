import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MessageCircle, ThumbsUp, Eye } from 'lucide-react';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  category: string;
  tags: string[];
  replies: number;
  likes: number;
  views: number;
  createdAt: string;
}

const forumPosts: ForumPost[] = [
  {
    id: '1',
    title: 'Help with Arduino Servo Motor Control',
    content: 'I\'m trying to control a servo motor with my Arduino Uno but having trouble with the jittering...',
    author: {
      name: 'John Doe',
      avatar: '/avatars/john.jpg',
    },
    category: 'Hardware',
    tags: ['arduino', 'servo', 'motors'],
    replies: 5,
    likes: 3,
    views: 120,
    createdAt: '2024-04-14T10:30:00Z',
  },
  {
    id: '2',
    title: 'Best Practices for Arduino Project Organization',
    content: 'What\'s the best way to organize a complex Arduino project with multiple components?',
    author: {
      name: 'Jane Smith',
      avatar: '/avatars/jane.jpg',
    },
    category: 'Best Practices',
    tags: ['organization', 'project-management'],
    replies: 8,
    likes: 12,
    views: 345,
    createdAt: '2024-04-13T15:45:00Z',
  },
  {
    id: '3',
    title: 'Sharing My First Robot Project',
    content: 'I\'ve just completed my first robot project using Arduino. Here\'s what I learned...',
    author: {
      name: 'Mike Johnson',
      avatar: '/avatars/mike.jpg',
    },
    category: 'Projects',
    tags: ['robotics', 'showcase', 'beginner'],
    replies: 15,
    likes: 25,
    views: 567,
    createdAt: '2024-04-12T09:15:00Z',
  },
];

const ForumPage = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Community Forum</h1>
          <p className="text-muted-foreground">
            Connect with other learners, share your projects, and get help
          </p>
        </div>
        <Button>Create New Post</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <Input
                placeholder="Search forum posts..."
                className="mb-4"
              />
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="cursor-pointer">All</Badge>
                <Badge variant="outline" className="cursor-pointer">Hardware</Badge>
                <Badge variant="outline" className="cursor-pointer">Software</Badge>
                <Badge variant="outline" className="cursor-pointer">Projects</Badge>
                <Badge variant="outline" className="cursor-pointer">Questions</Badge>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {forumPosts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <Link to={`/community/forum/post/${post.id}`}>
                        <CardTitle className="hover:text-primary">
                          {post.title}
                        </CardTitle>
                      </Link>
                      <CardDescription className="mt-2">
                        {post.content}
                      </CardDescription>
                    </div>
                    <Badge>{post.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {post.replies}
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      {post.likes}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {post.views}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="h-6 w-6 rounded-full"
                    />
                    <span className="text-sm text-muted-foreground">
                      {post.author.name}
                    </span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Forum Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Posts</span>
                  <span className="font-medium">1,234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Users</span>
                  <span className="font-medium">567</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Topics</span>
                  <span className="font-medium">89</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Contributors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted" />
                    <div>
                      <div className="font-medium">User {i}</div>
                      <div className="text-sm text-muted-foreground">
                        {100 - i * 20} posts
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ForumPage;
