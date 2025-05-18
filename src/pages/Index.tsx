import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import CourseSection from '../components/CourseSection';
import FeaturesSection from '../components/FeaturesSection';
import TestimonialsSection from '../components/TestimonialsSection';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';

const API_BASE_URL = 'http://localhost:5000';

type CourseProgressMap = Record<string, { isCompleted: boolean; progress: number }>;

type Enrollment = {
  course: { title: string };
  progress: { progress: number };
  completed: boolean;
};

const Index = () => {
  const [courseProgressMap, setCourseProgressMap] = useState<CourseProgressMap>({});

  useEffect(() => {
    // Fetch all user course progress
    const fetchProgress = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/user-progress`);
        if (response.ok) {
          const data: Enrollment[] = await response.json();
          // Map progress to course title for CourseSection
          const progressMap: CourseProgressMap = {};
          data.forEach((enrollment) => {
            if (enrollment.course && enrollment.progress) {
              progressMap[enrollment.course.title] = {
                isCompleted: enrollment.completed || false,
                progress: enrollment.progress.progress || 0,
              };
            }
          });
          setCourseProgressMap(progressMap);
        }
      } catch (error) {
        console.error('Failed to fetch user course progress', error);
      }
    };
    fetchProgress();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <CourseSection courseProgressMap={courseProgressMap} />
        <FeaturesSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
