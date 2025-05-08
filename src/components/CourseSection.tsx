import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Award, Clock, ChevronRight, Play, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

type CourseCardProps = {
  title: string;
  description: string;
  level: string;
  modules: number;
  duration: string;
  image: string;
  rating: number;
  students: number;
};

const CourseCard = ({ title, description, level, modules, duration, image, rating, students }: CourseCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card 
        className="overflow-hidden h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="aspect-[16/9] overflow-hidden relative">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
          {isHovered && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Button variant="outline" className="text-white border-white hover:bg-white/20">
                <Play className="mr-2 h-4 w-4" />
                Watch Preview
              </Button>
            </div>
          )}
        </div>
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                level === 'Beginner' ? 'bg-blue-100 text-blue-700' :
                level === 'Intermediate' ? 'bg-orange-100 text-orange-700' :
                'bg-purple-100 text-purple-700'
              }`}
            >
              {level}
            </span>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" />
              {duration}
            </div>
          </div>
          <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
            {title}
          </CardTitle>
          <CardDescription className="line-clamp-2">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <BookOpen className="mr-2 h-4 w-4" />
              <span>{modules} Modules</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="text-sm font-medium">{rating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-muted-foreground">{students} students</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/courses/preview`}>Preview</Link>
          </Button>
          <Button size="sm" className="group" asChild>
            <Link to={`/courses/enroll`}>
              Enroll Now
              <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const CourseSection = () => {
  const courses = [
    {
      title: 'Robotics Fundamentals',
      description: 'Learn the basics of robot design, electronics, and programming with hands-on projects',
      level: 'Beginner',
      modules: 8,
      duration: '6 weeks',
      image: '/images/courses/robotics-fundamentals.jpg',
      rating: 4.8,
      students: 1234,
    },
    {
      title: 'Arduino Programming',
      description: 'Build interactive projects using Arduino microcontrollers and sensors',
      level: 'Intermediate',
      modules: 12,
      duration: '8 weeks',
      image: '/images/courses/arduino-programming.jpg',
      rating: 4.9,
      students: 2156,
    },
    {
      title: 'Advanced Sensors & Controls',
      description: 'Master complex sensor integration and control algorithms for robotics',
      level: 'Advanced',
      modules: 10,
      duration: '10 weeks',
      image: '/images/courses/advanced-sensors.jpg',
      rating: 4.7,
      students: 876,
    },
    {
      title: 'Robotic Arm Design',
      description: 'Design and build a functional robotic arm with precision control systems',
      level: 'Intermediate',
      modules: 9,
      duration: '7 weeks',
      image: '/images/courses/robotic-arm.jpg',
      rating: 4.6,
      students: 1543,
    },
  ];

  return (
    <section id="courses" className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="badge badge-blue inline-block mb-4">Structured Learning Paths</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Explore Our <span className="heading-gradient">Courses</span>
          </h2>
          <p className="text-foreground/80 max-w-2xl mx-auto">
            From electronics basics to advanced robotics engineering, we've crafted age-appropriate
            learning paths to guide you on your journey.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <CourseCard {...course} />
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Button variant="outline" className="group" asChild>
            <Link to="/courses">
              View All Courses
              <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default CourseSection;
