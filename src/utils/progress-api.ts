import axios from 'axios';

const progressApi = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
    // Do not set Authorization here!
  },
});

// Always set the token in the interceptor
progressApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

interface LessonProgress {
  completed: boolean;
  timeSpent: number;
  attempts: number;
  completedAt?: string;
}

// Helper to get userId from localStorage
function getUserId() {
  try {
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      return parsed.id;
    }
  } catch (e) {}
  return null;
}

// Helper to get token from localStorage
function getToken() {
  return localStorage.getItem('token') || '';
}

// Get lesson progress using authenticated user (no userId param)
export const getLessonProgress = async (lessonId: number): Promise<LessonProgress> => {
  try {
    const userId = getUserId();
    const response = await progressApi.get(`/api/lessons/${lessonId}/progress`, {
      params: userId ? { userId } : {}
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    // Return default progress if API fails
    return { 
      completed: false, 
      timeSpent: 0,
      attempts: 0
    };
  }
};

// Update lesson progress using authenticated user
export const updateLessonProgress = async (
  lessonId: number, 
  data: Partial<LessonProgress>
): Promise<LessonProgress> => {
  console.log('data', data);
  try {
    const userId = getUserId();
    const response = await progressApi.post(`/api/lessons/${lessonId}/progress`, {
      userId,
      completed: data.completed || false,
      timeSpent: data.timeSpent || 0,
      attempts: data.attempts || 0,
      completedAt: data.completed ? new Date().toISOString() : null
    });
    console.log('response', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating progress:', error);
    if (error instanceof Error) {
      throw new Error(error.message || 'Failed to update progress');
    }
    throw error;
  }
};

// Complete lesson using authenticated user
export const completeLesson = async (
  lessonId: number, 
  timeSpent: number
): Promise<LessonProgress> => {
  try {
    const userId = getUserId();
    const validTimeSpent = typeof timeSpent === 'number' && !isNaN(timeSpent) ? timeSpent : 0;
    const response = await progressApi.post(`/api/lessons/${lessonId}/progress`, {
      userId,
      completed: true,
      timeSpent: validTimeSpent,
      attempts: 1,
      completedAt: new Date().toISOString()
    });
    
    if (response.status !== 200) {
      throw new Error(response.data?.error || 'Failed to complete lesson');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error completing lesson:', error);
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || error.message;
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export const getCourseProgress = async (courseId: number): Promise<any> => {
  try {
    const userId = getUserId();
    const response = await progressApi.get(`/api/courses/${courseId}/progress`, {
      params: userId ? { userId } : {}
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching course progress:', error);
    return { completed: false, progress: 0, lessonProgress: [] };
  }
};

export default {
  getLessonProgress,
  updateLessonProgress,
  completeLesson,
  getCourseProgress
};