import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Trophy } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Background geometric shapes */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-robotics-blue/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] right-[5%] w-80 h-80 bg-robotics-orange/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <div className="badge badge-blue inline-block">For Ages 12-18</div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Learn <span className="heading-gradient">Robotics</span> in a Fun & Interactive Way
              </h1>
            </div>

            <p className="text-foreground/80 text-lg md:text-xl max-w-2xl">
              Join thousands of young robotics enthusiasts on a journey from beginner to expert
              through interactive courses, hands-on projects, and a supportive community.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="group">
                Start Learning
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline">
                Explore Courses
              </Button>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-robotics-blue flex items-center justify-center text-white text-xs">
                  JD
                </div>
                <div className="w-8 h-8 rounded-full bg-robotics-orange flex items-center justify-center text-white text-xs">
                  KM
                </div>
                <div className="w-8 h-8 rounded-full bg-robotics-dark flex items-center justify-center text-white text-xs">
                  TS
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs">
                  +5k
                </div>
              </div>
              <p className="text-sm text-foreground/80">
                <span className="font-semibold">5,000+ students</span> already learning
              </p>
            </div>
          </div>

          <div className="flex-1 relative">
            <div className="glass-card p-6 rounded-2xl animate-float">
              <img
                src="/placeholder.svg"
                alt="Robot illustration"
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="mt-4 space-y-3">
                <h3 className="font-bold text-lg">Introduction to Robotics</h3>
                <div className="flex justify-between items-center">
                  <div className="badge badge-orange">Beginner</div>
                  <div className="text-sm">12 modules</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-robotics-blue h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 bg-white dark:bg-robotics-dark rounded-xl p-3 shadow-lg glow-border">
              <div className="flex items-center gap-2">
                <div className="bg-robotics-orange/20 rounded-full p-2">
                  <Trophy className="h-5 w-5 text-robotics-orange" />
                </div>
                <div>
                  <div className="text-xs text-foreground/80">Achievement unlocked!</div>
                  <div className="font-medium">First Circuit</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
