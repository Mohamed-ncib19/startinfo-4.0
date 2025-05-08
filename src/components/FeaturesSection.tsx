import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Trophy, Users, Code } from 'lucide-react';

const FeaturesSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="badge badge-orange inline-block mb-4">Platform Features</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to <span className="heading-gradient">Master Robotics</span>
          </h2>
          <p className="text-foreground/80 max-w-2xl mx-auto">
            Our platform combines theoretical learning with practical projects, gamification, and a
            supportive community.
          </p>
        </div>

        <Tabs defaultValue="learn" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="learn" className="flex flex-col items-center py-3 gap-2">
              <Bot className="h-5 w-5" />
              <span>Learn</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex flex-col items-center py-3 gap-2">
              <Code className="h-5 w-5" />
              <span>Projects</span>
            </TabsTrigger>
            <TabsTrigger value="gamify" className="flex flex-col items-center py-3 gap-2">
              <Trophy className="h-5 w-5" />
              <span>Gamify</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="flex flex-col items-center py-3 gap-2">
              <Users className="h-5 w-5" />
              <span>Community</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-8 bg-card rounded-lg border p-0 overflow-hidden">
            <TabsContent value="learn" className="p-0">
              <div className="grid md:grid-cols-2 h-full">
                <div className="p-6 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-4">Structured Learning Paths</h3>
                  <p className="text-foreground/80 mb-6">
                    Follow a carefully designed curriculum that takes you from the basics to
                    advanced concepts through interactive lessons.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="mr-3 mt-1 w-5 h-5 rounded-full bg-robotics-blue/20 flex items-center justify-center text-robotics-blue text-sm">
                        ✓
                      </div>
                      <span>Interactive video lessons with quizzes</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-3 mt-1 w-5 h-5 rounded-full bg-robotics-blue/20 flex items-center justify-center text-robotics-blue text-sm">
                        ✓
                      </div>
                      <span>Downloadable PDFs and resources</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-3 mt-1 w-5 h-5 rounded-full bg-robotics-blue/20 flex items-center justify-center text-robotics-blue text-sm">
                        ✓
                      </div>
                      <span>Progress tracking and assessments</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-3 mt-1 w-5 h-5 rounded-full bg-robotics-blue/20 flex items-center justify-center text-robotics-blue text-sm">
                        ✓
                      </div>
                      <span>Multiple difficulty levels</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-secondary">
                  <img
                    src="/placeholder.svg"
                    alt="Learning platform"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="projects" className="p-0">
              <div className="grid md:grid-cols-2 h-full">
                <div className="p-6 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-4">Hands-on Project-Based Learning</h3>
                  <p className="text-foreground/80 mb-6">
                    Apply your knowledge by building real robotic projects with guided instructions
                    and virtual simulators.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="mr-3 mt-1 w-5 h-5 rounded-full bg-robotics-orange/20 flex items-center justify-center text-robotics-orange text-sm">
                        ✓
                      </div>
                      <span>Step-by-step project guides</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-3 mt-1 w-5 h-5 rounded-full bg-robotics-orange/20 flex items-center justify-center text-robotics-orange text-sm">
                        ✓
                      </div>
                      <span>Virtual robotics simulators</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-3 mt-1 w-5 h-5 rounded-full bg-robotics-orange/20 flex items-center justify-center text-robotics-orange text-sm">
                        ✓
                      </div>
                      <span>Code editor with examples</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-3 mt-1 w-5 h-5 rounded-full bg-robotics-orange/20 flex items-center justify-center text-robotics-orange text-sm">
                        ✓
                      </div>
                      <span>Downloadable 3D models</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-secondary">
                  <img
                    src="/placeholder.svg"
                    alt="Robotics projects"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="gamify" className="p-0">
              <div className="grid md:grid-cols-2 h-full">
                <div className="p-6 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-4">Gamified Learning Experience</h3>
                  <p className="text-foreground/80 mb-6">
                    Stay motivated with XP points, badges, leaderboards, and achievements as you
                    progress through the platform.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="mr-3 mt-1 w-5 h-5 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 text-sm">
                        ✓
                      </div>
                      <span>Experience points and leveling</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-3 mt-1 w-5 h-5 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 text-sm">
                        ✓
                      </div>
                      <span>Skill badges and certifications</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-3 mt-1 w-5 h-5 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 text-sm">
                        ✓
                      </div>
                      <span>Challenge missions and contests</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-3 mt-1 w-5 h-5 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 text-sm">
                        ✓
                      </div>
                      <span>Progress visualization</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-secondary">
                  <img
                    src="/placeholder.svg"
                    alt="Gamification elements"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="community" className="p-0">
              <div className="grid md:grid-cols-2 h-full">
                <div className="p-6 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-4">Supportive Community</h3>
                  <p className="text-foreground/80 mb-6">
                    Connect with fellow robotics enthusiasts, share your projects, and get help from
                    mentors and peers.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="mr-3 mt-1 w-5 h-5 rounded-full bg-green-200 flex items-center justify-center text-green-700 text-sm">
                        ✓
                      </div>
                      <span>Moderated forums for all ages</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-3 mt-1 w-5 h-5 rounded-full bg-green-200 flex items-center justify-center text-green-700 text-sm">
                        ✓
                      </div>
                      <span>Project showcase gallery</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-3 mt-1 w-5 h-5 rounded-full bg-green-200 flex items-center justify-center text-green-700 text-sm">
                        ✓
                      </div>
                      <span>Weekly challenges and competitions</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-3 mt-1 w-5 h-5 rounded-full bg-green-200 flex items-center justify-center text-green-700 text-sm">
                        ✓
                      </div>
                      <span>Mentor feedback and support</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-secondary">
                  <img
                    src="/placeholder.svg"
                    alt="Community features"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </section>
  );
};

export default FeaturesSection;
