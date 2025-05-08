import React from 'react';
import { Button } from '@/components/ui/button';
import { Bot, ArrowRight } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="rounded-2xl bg-robotics-blue/10 border border-robotics-blue/20 p-8 md:p-12 relative overflow-hidden">
          {/* Abstract geometric shapes */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-robotics-blue/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-robotics-orange/20 rounded-full blur-3xl"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Start Your <span className="heading-gradient">Robotics Journey</span>?
              </h2>
              <p className="text-foreground/80 mb-6 max-w-xl">
                Join thousands of young robotics enthusiasts who are building skills for the future.
                Get started today with our free introduction courses!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="group">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </div>
            </div>

            <div className="flex-shrink-0 w-40 h-40 md:w-48 md:h-48 relative animate-float">
              <div className="absolute inset-0 bg-robotics-blue/20 rounded-full blur-xl"></div>
              <div className="relative z-10 flex items-center justify-center w-full h-full">
                <Bot className="w-24 h-24 text-robotics-blue" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
