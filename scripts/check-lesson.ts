import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLesson() {
  try {
    const courseId = 2;
    const lessonId = 1;

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    console.log('Course:', course);

    // Check if lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        resources: true,
        course: true,
        simulator: true,
        quizzes: {
          include: {
            questions: true
          }
        }
      }
    });

    console.log('Lesson:', lesson);

    // Check if lesson belongs to course
    if (lesson && lesson.courseId !== courseId) {
      console.log('Lesson does not belong to course');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLesson(); 