import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, UserPlus, Star } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  avatar: string;
  role: string;
  skills: string[];
  projects: number;
  followers: number;
  following: number;
  isFollowing: boolean;
}

const members: Member[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    avatar: '/avatars/sarah.jpg',
    role: 'Arduino Expert',
    skills: ['Arduino', 'Robotics', 'IoT'],
    projects: 12,
    followers: 245,
    following: 180,
    isFollowing: false,
  },
  {
    id: '2',
    name: 'Michael Brown',
    avatar: '/avatars/michael.jpg',
    role: 'Robotics Engineer',
    skills: ['ROS', 'Computer Vision', 'Machine Learning'],
    projects: 8,
    followers: 312,
    following: 156,
    isFollowing: true,
  },
  {
    id: '3',
    name: 'Emma Wilson',
    avatar: '/avatars/emma.jpg',
    role: 'IoT Developer',
    skills: ['IoT', 'Embedded Systems', 'Web Development'],
    projects: 15,
    followers: 189,
    following: 210,
    isFollowing: false,
  },
];

const NetworkPage = () => {
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Connect with Members</h1>
        <p className="text-muted-foreground">
          Find and connect with other robotics enthusiasts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <Input
                placeholder="Search members by name or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-4"
              />
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="cursor-pointer">All</Badge>
                <Badge variant="outline" className="cursor-pointer">Arduino Experts</Badge>
                <Badge variant="outline" className="cursor-pointer">Robotics</Badge>
                <Badge variant="outline" className="cursor-pointer">IoT</Badge>
                <Badge variant="outline" className="cursor-pointer">Students</Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {members.map((member) => (
              <Card key={member.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <Button
                      variant={member.isFollowing ? "secondary" : "default"}
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <UserPlus className="h-4 w-4" />
                      {member.isFollowing ? 'Following' : 'Follow'}
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {member.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center mb-4">
                    <div>
                      <div className="font-semibold">{member.projects}</div>
                      <div className="text-sm text-muted-foreground">Projects</div>
                    </div>
                    <div>
                      <div className="font-semibold">{member.followers}</div>
                      <div className="text-sm text-muted-foreground">Followers</div>
                    </div>
                    <div>
                      <div className="font-semibold">{member.following}</div>
                      <div className="text-sm text-muted-foreground">Following</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="w-full flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      Message
                    </Button>
                    <Button variant="outline" className="w-full flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Network</CardTitle>
              <CardDescription>
                Connect and grow your network
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Following</span>
                <Badge variant="secondary">180</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Followers</span>
                <Badge variant="secondary">156</Badge>
              </div>
              <Button className="w-full">Find More Connections</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Suggested Groups</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Arduino Beginners</div>
                    <div className="text-sm text-muted-foreground">1.2k members</div>
                  </div>
                </div>
                <Button variant="outline" size="sm">Join</Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Robotics Projects</div>
                    <div className="text-sm text-muted-foreground">3.4k members</div>
                  </div>
                </div>
                <Button variant="outline" size="sm">Join</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NetworkPage;
