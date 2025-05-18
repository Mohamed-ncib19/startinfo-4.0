//server/index.ts : 

import express, { Request, Response, Application, Router } from 'express';
import cors from 'cors';
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();
const app: Application = express();
const router: Router = express.Router();
const PORT = process.env.PORT || 5000;

// Configure CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ status: 'error', message: 'All fields are required.' });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ status: 'error', message: 'Email already in use.' });
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

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Email and password are required.',
    });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.',
      });
    }

    // Compare passwords
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.',
      });
    }

    // Generate a JWT token instead of a random hex
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role 
      }, 
      process.env.JWT_SECRET || 'a8d4f7e2c6b9a1d5e8f3c7b2a9d6e5f4c3b2a1d8e7f6c5b4a3d2e1f8c7b6a5',
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






// Get all courses
app.get('/api/courses', async (req, res) => {
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

// Get course by ID
app.get('/api/courses/:id', async (req, res) => {
  try {
    const courseId = Number(req.params.id);
    if (isNaN(courseId)) {
      return res.status(400).json({ error: 'Invalid course ID' });
    }
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { lessons: true }
    });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});



// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'a8d4f7e2c6b9a1d5e8f3c7b2a9d6e5f4c3b2a1d8e7f6c5b4a3d2e1f8c7b6a5');
    
    // Set the user information on the request object
    // Match the property names with what's in the token
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Get lesson progress - modified to accept userId as a query parameter
app.get('/api/lessons/:id/progress', async (req, res) => {
  try {
    const lessonId = Number(req.params.id);
    // Get userId from query parameter or from authenticated user
    const userId = req.query.userId ? Number(req.query.userId) : (req.user?.id || null);
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    if (isNaN(lessonId)) {
      return res.status(400).json({ error: 'Invalid lesson ID' });
    }
    
    // Find existing progress for this user and lesson
    let progress = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: userId,
          lessonId: lessonId
        }
      }
    });
    
    // If no progress exists yet, create a default progress object
    if (!progress) {
      progress = {
        id: 0,
        userId: userId,
        lessonId: lessonId,
        completed: false,
        completedAt: null,
        timeSpent: 0,
        attempts: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
    
    res.json(progress);
  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    res.status(500).json({ error: 'Failed to fetch lesson progress' });
  }
});

// Update lesson progress - modified to accept userId in the request body
app.post('/api/lessons/:id/progress', async (req, res) => {
  try {
    const lessonId = Number(req.params.id);
    // Get userId from request body or from authenticated user
    const userId = req.body.userId ? Number(req.body.userId) : (req.user?.id || null);
    const { completed, timeSpent, attempts } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    if (isNaN(lessonId)) {
      return res.status(400).json({ error: 'Invalid lesson ID' });
    }
    
    // Find existing progress or create new one
    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: userId,
          lessonId: lessonId
        }
      },
      update: {
        completed: completed || false,
        completedAt: completed ? new Date() : null,
        timeSpent: timeSpent || 0,
        attempts: attempts || 0,
        updatedAt: new Date()
      },
      create: {
        userId: userId,
        lessonId: lessonId,
        completed: completed || false,
        completedAt: completed ? new Date() : null,
        timeSpent: timeSpent || 0,
        attempts: attempts || 0
      }
    });
    
    res.json(progress);
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    res.status(500).json({ error: 'Failed to update lesson progress' });
  }
});

// Get course progress
app.get('/api/courses/:id/progress', authenticateToken, async (req, res) => {
  try {
    const courseId = Number(req.params.id);
    const userId = req.user.id; // Get user ID from authenticated user
    
    if (isNaN(courseId)) {
      return res.status(400).json({ error: 'Invalid course ID' });
    }
    
    // Get all lessons for this course
    const lessons = await prisma.lesson.findMany({
      where: { courseId: courseId }
    });
    
    if (lessons.length === 0) {
      return res.json({
        completed: false,
        progress: 0,
        lessonProgress: []
      });
    }
    
    // Get progress for all lessons in this course for this user
    const lessonProgress = await prisma.lessonProgress.findMany({
      where: {
        userId: userId,
        lessonId: { in: lessons.map(lesson => lesson.id) }
      }
    });
    
    // Calculate overall progress
    const completedLessons = lessonProgress.filter(progress => progress.completed).length;
    const progressPercentage = Math.round((completedLessons / lessons.length) * 100);
    
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

// Get all lessons for a course
app.get('/api/courses/:courseId/lessons', async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    console.log('courseId', courseId);
    if (isNaN(courseId)) {
      return res.status(400).json({ error: 'Invalid course ID' });
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
      return res.status(404).json({ error: 'No lessons found for this course' });
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

// Get lesson by ID (the canonical endpoint)
app.get('/api/courses/:courseId/lessons/:lessonId', async (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const lessonId = parseInt(req.params.lessonId);

  if (isNaN(courseId) || isNaN(lessonId)) {
    return res.status(400).json({ 
      error: 'Invalid course or lesson ID',
      details: 'Both courseId and lessonId must be valid numbers'
    });
  }

  try {
    // First check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });
    if (!course) {
      return res.status(404).json({ 
        error: 'Course not found',
        details: `Course with ID ${courseId} does not exist`
      });
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
      return res.status(404).json({ 
        error: 'Lesson not found',
        details: `Lesson with ID ${lessonId} does not exist`
      });
    }
    if (lesson.courseId !== courseId) {
      return res.status(404).json({ 
        error: 'Lesson not found in course',
        details: `Lesson ${lessonId} does not belong to course ${courseId}`
      });
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

// Get user's certificates
app.get('/api/certificates', async (req, res) => {
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

// Download certificate
app.get('/api/certificates/:id/download', async (req, res) => {
  try {
    const certificate = await prisma.certificate.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        course: true,
        user: true
      }
    });

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
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

// Generate certificate when course is completed
app.post('/api/courses/:courseId/certificate', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Use authenticated user's ID
    const courseId = parseInt(req.params.courseId);

    console.log('Generating certificate for:', { userId, courseId });

    if (isNaN(courseId)) {
      console.error('Invalid course ID:', req.params.courseId);
      return res.status(400).json({ error: 'Invalid course ID' });
    }

    // First check if the course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      console.error('Course not found:', courseId);
      return res.status(404).json({ error: 'Course not found' });
    }

    console.log('Course found:', course);

    // Get all lessons for the course
    const lessons = await prisma.lesson.findMany({
      where: { courseId }
    });

    console.log('Lessons found:', lessons.length);

    if (!lessons.length) {
      console.error('No lessons found for course:', courseId);
      return res.status(400).json({ error: 'Course has no lessons' });
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
      return res.status(400).json({ 
        error: 'Course not completed',
        details: 'Some lessons are not marked as completed'
      });
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
      return res.status(400).json({ error: 'Certificate already exists' });
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

// User registration endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Received registration request body:', req.body);
    const { email, password } = req.body;

    console.log('Parsed registration data:', { email });

    // Validate required fields
    if (!email || !password) {
      console.error('Missing required fields:', { email: !!email, password: !!password });
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('Invalid email format:', email);
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password strength
    if (password.length < 8) {
      console.error('Password too short');
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Check if user already exists
    console.log('Checking if user exists:', email);
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.error('User already exists:', email);
      return res.status(400).json({ error: 'User with this email already exists' });
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
router.get('/api/user-progress', async (req: Request, res: Response) => {
  try {
    const userId = 1; // TODO: Get from auth middleware
    const progress = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: true,
        progress: true
      }
    });
    res.json(progress);
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: 'Failed to fetch user progress' });
  }
});

// Get user progress for a specific course
router.get('/api/courses/:courseId/progress', async (req: Request<{ courseId: string }>, res: Response) => {
  try {
    const userId = 1; // TODO: Get from auth middleware
    const courseId = parseInt(req.params.courseId);
    
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      },
      include: {
        progress: true
      }
    });

    if (!enrollment) {
      return res.json({
        completed: false,
        progress: 0,
        lessonProgress: []
      });
    }

    res.json({
      completed: enrollment.completed,
      progress: enrollment.progress?.progress || 0,
      lessonProgress: enrollment.progress?.lessonProgress || []
    });
  } catch (error) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({ error: 'Failed to fetch course progress' });
  }
});

// Get course progress
app.get('/api/courses/:courseId/progress', async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    
    if (isNaN(courseId)) {
      return res.status(400).json({ error: 'Invalid course ID' });
    }

    // Ensure default user exists
    const defaultUser = await prisma.user.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        email: 'default@startinfo.com',
        password: 'defaultpass123',
        name: 'Default User',
        role: 'STUDENT',
        verified: true
      }
    });

    const userId = defaultUser.id;

    // Get all lessons for the course
    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      select: { id: true }
    });

    // Get progress for all lessons
    const progress = await prisma.lessonProgress.findMany({
      where: {
        userId,
        lessonId: {
          in: lessons.map(lesson => lesson.id)
        }
      }
    });

    // Calculate overall progress
    const completedLessons = progress.filter(p => p.completed).length;
    const totalLessons = lessons.length;
    const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    res.json({
      completed: completedLessons === totalLessons,
      progress: progressPercentage,
      completedLessons,
      totalLessons,
      lessonProgress: progress
    });
  } catch (error) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({ 
      error: 'Failed to fetch course progress',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
const server = app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await verifyDatabaseConnection();
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
