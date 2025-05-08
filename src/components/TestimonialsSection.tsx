import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Alex Johnson, 14',
    text: "I've always been interested in robots but didn't know where to start. Startinfo's beginner courses made it so easy to understand the basics. Now I'm building my own line-following robot!",
    image: '/placeholder.svg',
    role: 'Beginner Robotics Enthusiast',
  },
  {
    name: 'Mia Chen, 16',
    text: 'The project-based learning approach is amazing. I could apply what I learned immediately and the simulators helped me test my code before building the physical robot. My science fair project won first place!',
    image: '/placeholder.svg',
    role: 'Intermediate Robotics Student',
  },
  {
    name: 'Jason Kim, 17',
    text: "The competitive challenges and community pushed me to improve my skills. The mentors are super helpful and I've made friends with other students who share my passion for robotics.",
    image: '/placeholder.svg',
    role: 'Advanced Robotics Competitor',
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="badge badge-blue inline-block mb-4">Success Stories</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            From Our <span className="heading-gradient">Student Community</span>
          </h2>
          <p className="text-foreground/80 max-w-2xl mx-auto">
            Hear from students who are building amazing robots and developing valuable skills
            through our platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-6">
                <Quote className="h-8 w-8 text-robotics-blue opacity-40 mb-4" />
                <p className="text-foreground/80 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-foreground/70">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
