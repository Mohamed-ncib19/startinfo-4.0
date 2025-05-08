import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// Create a separate axios instance for progress-related operations
const progressApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get lesson progress using userId
export const getLessonProgress = async (lessonId: number, userId: number) => {
  try {
    const response = await progressApi.get(`/api/lessons/${lessonId}/progress?userId=${userId}`);
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

// Update lesson progress using userId
export const updateLessonProgress = async (lessonId: number, userId: number, data: any) => {
  try {
    const response = await progressApi.post(`/api/lessons/${lessonId}/progress`, {
      userId,
      ...data
    });
    return response.data;
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    throw error;
  }
};

// Complete lesson using userId
export const completeLesson = async (lessonId: number, userId: number, timeSpent: number) => {
  try {
    const response = await progressApi.post(`/api/lessons/${lessonId}/progress`, {
      userId,
      completed: true,
      timeSpent,
      completedAt: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    console.error('Error completing lesson:', error);
    throw error;
  }
};

export default {
  getLessonProgress,
  updateLessonProgress,
  completeLesson
};