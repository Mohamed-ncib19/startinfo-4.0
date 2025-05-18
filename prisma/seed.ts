import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();
  await prisma.instructor.deleteMany();

  // Create instructor
  const instructor = await prisma.instructor.create({
    data: {
      name: 'John Doe',
      bio: 'Experienced Arduino and electronics instructor with 10+ years of teaching experience.',
      avatar: 'https://ui-avatars.com/api/?name=John+Doe',
      expertise: 'Arduino,Electronics,Programming',
    },
  });

  console.log('Seeded instructor:', instructor);

  // Create courses
  const courses = await prisma.course.createMany({
    data: [
      {
        title: 'Introduction to Arduino',
        description: 'Learn the basics of Arduino programming and electronics.',
        level: 'BEGINNER',
        thumbnail: 'https://picsum.photos/800/600',
        duration: 120,
        instructorId: instructor.id,
        published: true,
      },
      {
        title: 'Introduction to Robotics',
        description: 'Learn the fundamentals of robotics and build your first robot.',
        level: 'INTERMEDIATE',
        thumbnail: 'https://picsum.photos/800/600',
        duration: 180,
        instructorId: instructor.id,
        published: true,
      }
    ]
  });

  console.log('Seeded courses:', courses);

  // Fetch the created courses to get their IDs
  const arduinoCourse = await prisma.course.findFirst({ where: { title: 'Introduction to Arduino' } });
  const roboticsCourse = await prisma.course.findFirst({ where: { title: 'Introduction to Robotics' } });

  // Create lessons for Arduino course
  if (arduinoCourse) {
    await prisma.lesson.createMany({
      data: [
        {
          title: 'Getting Started with Arduino',
          description: 'Learn about Arduino boards and development environment.',
          content: `# Getting Started with Arduino\n\n## What is Arduino?\nArduino is an open-source electronics platform based on easy-to-use hardware and software.\n\n## What You\'ll Learn\n- Understanding Arduino boards\n- Setting up Arduino IDE\n- Basic electronics concepts\n- Your first Arduino sketch`,
          duration: 30,
          order: 1,
          courseId: arduinoCourse.id,
          isPublished: true,
          objectives: [
            'Understand what Arduino is',
            'Set up the Arduino IDE',
            'Write and upload your first sketch'
          ],
          hints: [
            'Check your USB cable if upload fails',
            'Use the built-in LED for your first test'
          ]
        },
        {
          title: 'Digital Input and Output',
          description: 'Learn how to use digital pins for input and output.',
          content: `# Digital Input and Output\n\n## Understanding Digital Signals\nDigital signals are either HIGH (5V) or LOW (0V).\n\n## Digital Output\n- Using digitalWrite()\n- Controlling LEDs\n- Using multiple outputs`,
          duration: 45,
          order: 2,
          courseId: arduinoCourse.id,
          isPublished: true,
          objectives: [
            'Understand digital signals',
            'Control LEDs with digitalWrite()',
            'Read button input with digitalRead()'
          ],
          hints: [
            'Check pin numbers carefully',
            'Use pull-down resistors for buttons'
          ]
        }
      ]
    });
    console.log('Seeded Arduino lessons');

    // Create simulators for Arduino lessons
    const arduinoLessons = await prisma.lesson.findMany({ where: { courseId: arduinoCourse?.id } });
    for (const lesson of arduinoLessons) {
      await prisma.simulator.create({
        data: {
          config: '',
          components: '',
          wokwiId: '375297939731395585', // Example Wokwi project ID
          lessonId: lesson.id
        }
      });
    }
  }

  // Create lessons for Robotics course
  if (roboticsCourse) {
    await prisma.lesson.create({
      data: {
        title: 'Introduction to Robotics',
        description: 'Learn the basics of robotics and robot components.',
        content: `# Introduction to Robotics

## What is Robotics?
Robotics is an interdisciplinary field that combines mechanical engineering, electrical engineering, and computer science.

## Robot Components
- Sensors
- Actuators
- Controllers
- Power systems`,
        duration: 40,
        order: 1,
        courseId: roboticsCourse.id,
        isPublished: true,
      }
    });
    console.log('Seeded Robotics lesson');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });