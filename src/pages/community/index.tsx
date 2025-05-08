import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Users, Rocket } from 'lucide-react';

const CommunityPage = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Community Hub</h1>
        <p className="text-muted-foreground">
          Connect, share, and learn with fellow robotics enthusiasts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Forum Card */}
        <Link to="/community/forum">
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Discussion Forum</CardTitle>
              <CardDescription>
                Ask questions, share knowledge, and participate in discussions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Get help with your projects</li>
                <li>• Share your experiences</li>
                <li>• Learn from others</li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        {/* Projects Card */}
        <Link to="/community/projects">
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Rocket className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Project Showcase</CardTitle>
              <CardDescription>
                Discover and share amazing robotics projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Browse community projects</li>
                <li>• Share your creations</li>
                <li>• Get inspired</li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        {/* Network Card */}
        <Link to="/community/network">
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Connect</CardTitle>
              <CardDescription>
                Build connections with other robotics enthusiasts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Find collaborators</li>
                <li>• Join study groups</li>
                <li>• Build your network</li>
              </ul>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Community Guidelines</CardTitle>
            <CardDescription>
              Help us maintain a positive and supportive learning environment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Be Respectful</h3>
                <p className="text-sm text-muted-foreground">
                  Treat others with kindness and respect. We're all here to learn and grow together.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Share Knowledge</h3>
                <p className="text-sm text-muted-foreground">
                  Help others by sharing your experiences and knowledge. Everyone has something to contribute.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Stay On Topic</h3>
                <p className="text-sm text-muted-foreground">
                  Keep discussions relevant to robotics, Arduino, and related technologies.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommunityPage;
