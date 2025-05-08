import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  author: {
    name: string;
    avatar: string;
  };
  image: string;
  tags: string[];
  likes: number;
  comments: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  createdAt: string;
}

const projects: Project[] = [
  {
    id: '1',
    title: 'Smart Home Weather Station',
    description: 'A DIY weather station using Arduino that measures temperature, humidity, and pressure. Data is displayed on an LCD screen and can be accessed via a web interface.',
    author: {
      name: 'John Maker',
      avatar: '/avatars/john.jpg',
    },
    image: '/projects/weather-station.jpg',
    tags: ['arduino', 'iot', 'sensors', 'web'],
    likes: 156,
    comments: 23,
    difficulty: 'Intermediate',
    createdAt: '2024-04-10T15:30:00Z',
  },
  {
    id: '2',
    title: 'Automated Plant Watering System',
    description: 'Keep your plants healthy with this automated watering system. Uses soil moisture sensors and a water pump controlled by Arduino.',
    author: {
      name: 'Sarah Green',
      avatar: '/avatars/sarah.jpg',
    },
    image: '/projects/plant-watering.jpg',
    tags: ['arduino', 'automation', 'gardening'],
    likes: 89,
    comments: 15,
    difficulty: 'Beginner',
    createdAt: '2024-04-12T10:15:00Z',
  },
  {
    id: '3',
    title: 'Robot Arm with Computer Vision',
    description: 'A 3D-printed robot arm controlled by Arduino and enhanced with computer vision capabilities using OpenCV.',
    author: {
      name: 'Mike Tech',
      avatar: '/avatars/mike.jpg',
    },
    image: '/projects/robot-arm.jpg',
    tags: ['robotics', '3d-printing', 'computer-vision'],
    likes: 234,
    comments: 45,
    difficulty: 'Advanced',
    createdAt: '2024-04-13T09:45:00Z',
  },
];

const ProjectsPage = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Community Projects</h1>
          <p className="text-muted-foreground">
            Discover amazing projects built by the community
          </p>
        </div>
        <Button>Share Your Project</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <Input
                placeholder="Search projects..."
                className="mb-4"
              />
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="cursor-pointer">All</Badge>
                <Badge variant="outline" className="cursor-pointer">Robotics</Badge>
                <Badge variant="outline" className="cursor-pointer">IoT</Badge>
                <Badge variant="outline" className="cursor-pointer">Home Automation</Badge>
                <Badge variant="outline" className="cursor-pointer">Sensors</Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                <div className="aspect-video relative">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className={
                      project.difficulty === 'Beginner' ? 'bg-green-500' :
                      project.difficulty === 'Intermediate' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }>
                      {project.difficulty}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <Link to={`/community/projects/${project.id}`}>
                    <CardTitle className="hover:text-primary">
                      {project.title}
                    </CardTitle>
                  </Link>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-muted-foreground hover:text-primary">
                      <Heart className="h-4 w-4" />
                      {project.likes}
                    </button>
                    <button className="flex items-center gap-1 text-muted-foreground hover:text-primary">
                      <MessageCircle className="h-4 w-4" />
                      {project.comments}
                    </button>
                    <button className="flex items-center gap-1 text-muted-foreground hover:text-primary">
                      <Share2 className="h-4 w-4" />
                    </button>
                    <button className="flex items-center gap-1 text-muted-foreground hover:text-primary">
                      <Bookmark className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <img
                      src={project.author.avatar}
                      alt={project.author.name}
                      className="h-6 w-6 rounded-full"
                    />
                    <span className="text-sm text-muted-foreground">
                      {project.author.name}
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
              <CardTitle>Featured Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {projects.slice(0, 3).map((project) => (
                <Link
                  key={project.id}
                  to={`/community/projects/${project.id}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium group-hover:text-primary">
                      {project.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      by {project.author.name}
                    </p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Popular Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">arduino</Badge>
                <Badge variant="outline">robotics</Badge>
                <Badge variant="outline">iot</Badge>
                <Badge variant="outline">sensors</Badge>
                <Badge variant="outline">automation</Badge>
                <Badge variant="outline">3d-printing</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
