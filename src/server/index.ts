//server/index.ts : 

import express, { Request, Response, Application, Router, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { authenticateToken } from '../lib/auth';

// Load environment variables
dotenv.config();

// Initialize Prisma client as a singleton
const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

const app: Application = express();
const router: Router = express.Router();
const PORT = process.env.PORT || 5000;

// Add this at the top of the file (after imports)
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: string;
      };
    }
  }
}

// Configure CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Add JSON parsing middleware
app.use(express.json());

// Verify database connection on startup
async function verifyDatabaseConnection() {
  try {
    console.log('Verifying database connection...');
    await prisma.$connect();
    console.log('Database connection successful');
    
    // Test query to verify User table access
    const userCount = await prisma.user.count();
    console.log(`Database connection verified. Current user count: ${userCount}`);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

// Call verifyDatabaseConnection on startup
verifyDatabaseConnection();

// Health check endpoint
router.get('/api/health', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', message: 'Database connection is healthy' });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

router.post('/api/auth/signup', async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ status: 'error', message: 'All fields are required.' });
    return;
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ status: 'error', message: 'Email already in use.' });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: { 
        name, 
        email, 
        password: hashedPassword,
        role: 'STUDENT',
        verified: false,
      },
    });

    res.status(201).json({ 
      status: 'success', 
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
});

router.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
     res.status(400).json({
      status: 'error',
      message: 'Email and password are required.',
    });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
       res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.',
      });
      return;
    }

    // Compare passwords
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
       res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.',
      });
      return;
    }

    // Generate a JWT token instead of a random hex
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role 
      }, 
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.status(200).json({
      ok: true,
      status: 'success',
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
});

router.get('/api/courses', async (req: Request, res: Response) => {
  try {
    console.log('Fetching courses...');
    const courses = await prisma.course.findMany({
      include: {
        lessons: true,
      },
    });
    console.log('Courses fetched:', courses);
    res.json(courses);

  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

router.get('/api/courses/:id', async (req: Request, res: Response) => {
  try {
    const courseId = Number(req.params.id);
    if (isNaN(courseId)) {
       res.status(400).json({ error: 'Invalid course ID' });
       return;
    }
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { lessons: true }
    });
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return ;
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

router.get('/api/courses/:courseId/lessons', async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.courseId);
    console.log('courseId', courseId);
    if (isNaN(courseId)) {
      res.status(400).json({ error: 'Invalid course ID' });
      return;
    }

    console.log('Fetching lessons for course:', courseId);

    const lessons = await prisma.lesson.findMany({
      where: {
        courseId: courseId,
      },
      orderBy: {
        order: 'asc',
      },
      include: {
        resources: true,
        course: true
      }
    });

    if (!lessons || lessons.length === 0) {
      console.log('No lessons found for course:', courseId);
       res.status(404).json({ error: 'No lessons found for this course' });
       return;
    }

    console.log('Found lessons:', lessons.length);

    // Transform lessons to include default values for frontend
    const transformedLessons = lessons.map(lesson => ({
      ...lesson,
      objectives: [],
      hints: [],
      simulatorConfig: {
        files: {},
        parts: [],
        connections: []
      }
    }));

    res.json(transformedLessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ 
      error: 'Failed to fetch lessons',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/api/courses/:courseId/lessons/:lessonId', async (req: Request, res: Response) => {
  const courseId = parseInt(req.params.courseId);
  const lessonId = parseInt(req.params.lessonId);

  if (isNaN(courseId) || isNaN(lessonId)) {
     res.status(400).json({ 
      error: 'Invalid course or lesson ID',
      details: 'Both courseId and lessonId must be valid numbers'
    });
    return;
  }

  try {
    // First check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });
    if (!course) {
       res.status(404).json({ 
        error: 'Course not found',
        details: `Course with ID ${courseId} does not exist`
      });
      return;
    }

    // Fetch the lesson with all related data
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        resources: true,
        course: {
          select: {
            id: true,
            title: true,
            description: true
          }
        },
        simulator: true,
        quizzes: {
          include: {
            questions: true
          }
        }
      }
    });
    if (!lesson) {
       res.status(404).json({ 
        error: 'Lesson not found',
        details: `Lesson with ID ${lessonId} does not exist`
      });
      return;
    }
    if (lesson.courseId !== courseId) {
       res.status(404).json({ 
        error: 'Lesson not found in course',
        details: `Lesson ${lessonId} does not belong to course ${courseId}`
      });
      return;
    }
    // Get next and previous lesson IDs
    const [prevLesson, nextLesson] = await Promise.all([
      prisma.lesson.findFirst({
        where: { courseId: courseId, order: { lt: lesson.order } },
        orderBy: { order: 'desc' },
        select: { id: true }
      }),
      prisma.lesson.findFirst({
        where: { courseId: courseId, order: { gt: lesson.order } },
        orderBy: { order: 'asc' },
        select: { id: true }
      })
    ]);
    // Transform the lesson data to include all required fields and safe defaults
    const transformedLesson = {
      id: lesson.id,
      title: lesson.title || '',
      description: lesson.description || '',
      content: lesson.content || '',
      videoUrl: lesson.videoUrl || '',
      duration: lesson.duration || 0,
      order: lesson.order || 0,
      isPublished: lesson.isPublished || false,
      courseId: lesson.courseId,
      nextLessonId: nextLesson?.id?.toString() || null,
      prevLessonId: prevLesson?.id?.toString() || null,
      objectives: Array.isArray(lesson.objectives) ? lesson.objectives : [],
      hints: Array.isArray(lesson.hints) ? lesson.hints : [],
      resources: Array.isArray(lesson.resources) ? lesson.resources : [],
      simulatorConfig: lesson.simulator ? {
        files: { 'main.ino': lesson.simulator.config || '' },
        parts: (() => { try { return JSON.parse(lesson.simulator.components || '[]'); } catch { return []; } })(),
        connections: []
      } : {
        files: {},
        parts: [],
        connections: []
      },
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt
    };
    res.json(transformedLesson);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ 
      error: 'Failed to fetch lesson',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/api/certificates', async (req: Request, res: Response) => {
  try {
    const userId = 1; // TODO: Get from auth context
    const certificates = await prisma.certificate.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            title: true,
            description: true,
            level: true
          }
        }
      }
    });
    res.json(certificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

router.get('/api/certificates/:id/download', async (req: Request, res: Response) => {
  try {
    const certificate = await prisma.certificate.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        course: true,
        user: true
      }
    });

    if (!certificate) {
       res.status(404).json({ error: 'Certificate not found' });
       return;
    }

    // TODO: Generate PDF certificate
    // For now, return a placeholder
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${certificate.certificateNumber}.pdf`);
    res.send('Certificate PDF content');
  } catch (error) {
    console.error('Error downloading certificate:', error);
    res.status(500).json({ error: 'Failed to download certificate' });
  }
});

router.post('/api/courses/:courseId/certificate', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
       res.status(401).json({ error: 'Unauthorized: No user in request' });
       return;
    }
    const userId = req.user.id; // Use authenticated user's ID
    const courseId = parseInt(req.params.courseId);

    console.log('Generating certificate for:', { userId, courseId });

    if (isNaN(courseId)) {
      console.error('Invalid course ID:', req.params.courseId);
       res.status(400).json({ error: 'Invalid course ID' });
       return;
    }

    // First check if the course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      console.error('Course not found:', courseId);
       res.status(404).json({ error: 'Course not found' });
       return;
    }

    console.log('Course found:', course);

    // Get all lessons for the course
    const lessons = await prisma.lesson.findMany({
      where: { courseId }
    });

    console.log('Lessons found:', lessons.length);

    if (!lessons.length) {
      console.error('No lessons found for course:', courseId);
       res.status(400).json({ error: 'Course has no lessons' });
       return;
    }

    // Get progress for all lessons
    const progress = await prisma.lessonProgress.findMany({
      where: {
        userId,
        lessonId: {
          in: lessons.map(lesson => lesson.id)
        }
      }
    });

    console.log('Lesson progress:', progress);

    // Check if all lessons are completed
    const allLessonsCompleted = lessons.every(lesson => {
      const lessonProgress = progress.find(p => p.lessonId === lesson.id);
      const isCompleted = lessonProgress?.completed;
      console.log(`Lesson ${lesson.id} completed:`, isCompleted);
      return isCompleted;
    });

    if (!allLessonsCompleted) {
      console.error('Not all lessons are completed');
       res.status(400).json({ 
        error: 'Course not completed',
        details: 'Some lessons are not marked as completed'
      });
      return;
    }

    // Check if certificate already exists
    const existingCertificate = await prisma.certificate.findFirst({
      where: {
        userId,
        courseId
      }
    });

    if (existingCertificate) {
      console.error('Certificate already exists:', existingCertificate);
       res.status(400).json({ error: 'Certificate already exists' });
       return;
    }

    // Generate certificate
    const certificate = await prisma.certificate.create({
      data: {
        userId,
        courseId,
        certificateNumber: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        issuedAt: new Date()
      },
      include: {
        course: true
      }
    });

    console.log('Certificate generated successfully:', certificate);
    res.json(certificate);
  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({ 
      error: 'Failed to generate certificate',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    console.log('Received registration request body:', req.body);
    const { email, password } = req.body;

    console.log('Parsed registration data:', { email });

    // Validate required fields
    if (!email || !password) {
      console.error('Missing required fields:', { email: !!email, password: !!password });
       res.status(400).json({ error: 'Email and password are required' });
       return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('Invalid email format:', email);
       res.status(400).json({ error: 'Invalid email format' });
       return;
    }

    // Validate password strength
    if (password.length < 8) {
      console.error('Password too short');
       res.status(400).json({ error: 'Password must be at least 8 characters long' });
       return;
    }

    // Check if user already exists
    console.log('Checking if user exists:', email);
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.error('User already exists:', email);
       res.status(400).json({ error: 'User with this email already exists' });
       return;
    }

    // Generate a default name from email
    const defaultName = email.split('@')[0];

    // Hash the password
    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('Attempting to create user with:', {
      email,
      name: defaultName,
      role: 'STUDENT',
      verified: false
    });

    try {
      // Create new user
      console.log('Creating user in database...');
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: defaultName,
          role: 'STUDENT', // Default role
          verified: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      console.log('User created successfully:', { 
        id: newUser.id, 
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      });

      // Return user data (excluding password)
      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (dbError) {
      console.error('Database error during user creation:', dbError);
      if (dbError instanceof Error) {
        console.error('Database error details:', {
          name: dbError.name,
          message: dbError.message,
          stack: dbError.stack
        });
      }
      throw dbError; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    console.error('Error registering user:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    res.status(500).json({ 
      error: 'Failed to register user',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user progress for all courses
router.get('/api/user-progress', async (req, res) => {
  try {
    const userId = 1; // TODO: Get from auth middleware
    const progress = await prisma.progress.findMany({
      where: { userId },
      include: {
        course: true
      }
    });
    res.json(progress);
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: 'Failed to fetch user progress' });
  }
});

// Get user progress for a specific course
router.get('/api/courses/:courseId/progress', async (req, res) => {
  try {
    const userId = 1; // TODO: Get from auth middleware
    const courseId = parseInt(req.params.courseId);
    if (isNaN(courseId)) {
      res.status(400).json({ error: 'Invalid course ID' });
      return;
    }
    // Find progress record for this user and course
    const progress = await prisma.progress.findFirst({ where: { userId, courseId } });
    if (!progress) {
      res.json({
        completed: false,
        progress: 0,
        lessonProgress: []
      });
      return;
    }
    // Get all lessons for this course
    const lessons = await prisma.lesson.findMany({ where: { courseId } });
    // Get progress for all lessons in this course for this user
    const lessonProgress = await prisma.lessonProgress.findMany({
      where: {
        userId: userId,
        lessonId: { in: lessons.map(lesson => lesson.id) }
      }
    });
    // Calculate overall progress
    const completedLessons = lessonProgress.filter(lp => lp.completed).length;
    const progressPercentage = lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0;
    res.json({
      completed: completedLessons === lessons.length,
      progress: progressPercentage,
      lessonProgress: lessonProgress
    });
  } catch (error) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({ error: 'Failed to fetch course progress' });
  }
});

// Get lessons with progress for a course
router.get('/api/courses/:courseId/lessons-with-progress', async (req: Request, res: Response) => {
  try {
    const courseId = Number(req.params.courseId);
    const userId = req.query.userId ? Number(req.query.userId) : undefined;
    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }
    if (isNaN(courseId)) {
      res.status(400).json({ error: 'Invalid course ID' });
      return;
    }

    // Get all lessons for the course
    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      orderBy: { order: 'asc' }
    });

    // Get all progress for these lessons for the user
    const progressList = await prisma.lessonProgress.findMany({
      where: {
        userId,
        lessonId: { in: lessons.map(l => l.id) }
      }
    });

    // Map progress by lessonId for quick lookup
    const progressMap: Record<number, any> = {};
    for (const p of progressList) {
      progressMap[p.lessonId] = p;
    }

    // Attach progress to each lesson
    const lessonsWithProgress = lessons.map(lesson => ({
      ...lesson,
      progress: progressMap[lesson.id] || {
        completed: false,
        timeSpent: 0,
        attempts: 0,
        completedAt: null
      }
    }));

    res.json(lessonsWithProgress);
  } catch (error) {
    console.error('Error fetching lessons with progress:', error);
    res.status(500).json({ error: 'Failed to fetch lessons with progress' });
  }
});

// Add this route to handle lesson progress updates
router.post('/api/lessons/:id/progress', async (req: Request, res: Response) => {
  try {
    const lessonId = parseInt(req.params.id);
    const { userId, completed, timeSpent, attempts, completedAt } = req.body;
    if (!userId || isNaN(lessonId)) {
      res.status(400).json({ error: 'User ID and valid lesson ID are required' });
      return;
    }
    // Upsert progress
    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId
        }
      },
      update: {
        completed,
        timeSpent,
        attempts,
        completedAt: completed ? (completedAt ? new Date(completedAt) : new Date()) : null,
        updatedAt: new Date()
      },
      create: {
        userId,
        lessonId,
        completed,
        timeSpent,
        attempts,
        completedAt: completed ? (completedAt ? new Date(completedAt) : new Date()) : null
      }
    });
    res.json(progress);
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    res.status(500).json({ error: 'Failed to update lesson progress' });
  }
});

// Mount the router
app.use(router);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
