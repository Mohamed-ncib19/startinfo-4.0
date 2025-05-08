// ... existing code ...

// Add this method to your API utility
const endLesson = async (userId, lessonId) => {
  try {
    const response = await axios.post(`/api/lessons/${lessonId}/complete`, {
      userId: userId
    });
    return response.data;
  } catch (error) {
    console.error('Error ending lesson:', error);
    throw error;
  }
};

// Add to your exports
export default {
  // ... existing code ...
  endLesson
};