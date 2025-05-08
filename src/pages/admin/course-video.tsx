import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const API_URL = 'http://localhost:5000/api';

interface Course {
  id: number;
  title: string;
}

export default function AdminCourseVideo() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch all courses for selection
    fetch(`${API_URL}/courses`)
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(() => setError('Failed to load courses'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!selectedCourse || !videoUrl) {
      setError('Please select a course and provide a video URL.');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/courses/${selectedCourse}/video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl }),
      });
      if (!response.ok) {
        throw new Error('Failed to post video');
      }
      setSuccess('Video posted successfully!');
      setVideoUrl('');
    } catch (err) {
      setError('Failed to post video');
    }
  };

  return (
    <div className="container py-8">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Post Course Video</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="course">Select Course</Label>
              <select
                id="course"
                className="w-full border rounded p-2"
                value={selectedCourse ?? ''}
                onChange={e => setSelectedCourse(Number(e.target.value))}
              >
                <option value="">-- Select a course --</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="videoUrl">Video URL</Label>
              <Input
                id="videoUrl"
                type="url"
                placeholder="https://example.com/video.mp4"
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
              />
            </div>
            {error && <div className="text-red-500">{error}</div>}
            {success && <div className="text-green-600">{success}</div>}
            <Button type="submit">Post Video</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}