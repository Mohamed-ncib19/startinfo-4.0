import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { PDFService } from '../services/pdf.service';
import { authenticateToken } from '../middleware/auth';
import { sendCertificateEmail } from '../lib/email';

const router = Router();
const prisma = new PrismaClient();
const pdfService = new PDFService();

// Generate certificate for completed course
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user and course details
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!user || !course) {
      return res.status(404).json({ error: 'User or course not found' });
    }

    // Check if certificate already exists
    const existingCertificate = await prisma.certificate.findFirst({
      where: {
        userId,
        courseId,
      },
    });

    if (existingCertificate) {
      return res.status(400).json({ error: 'Certificate already exists' });
    }

    // Generate certificate
    const certificate = await prisma.certificate.create({
      data: {
        userId,
        courseId,
        certificateNumber: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        issuedAt: new Date(),
      },
      include: {
        course: true,
        user: {
          select: {
            name: true,
            email: true
          }
        },
      },
    });

    // Send email notification
    const verificationUrl = `${process.env.FRONTEND_URL}/verify/${certificate.certificateNumber}`;
    await sendCertificateEmail(user.email, user.name, course.title, verificationUrl);

    // Return certificate with user name
    res.json({
      ...certificate,
      userName: certificate.user.name
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({ error: 'Failed to generate certificate' });
  }
});

// Download certificate PDF
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const certificate = await prisma.certificate.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        course: true,
        user: true,
      },
    });

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    // Generate PDF
    const pdfBytes = await pdfService.generateCertificate({
      userName: certificate.user.name,
      courseName: certificate.course.title,
      certificateNumber: certificate.certificateNumber,
      issuedAt: certificate.issuedAt,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${certificate.certificateNumber}.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('Error downloading certificate:', error);
    res.status(500).json({ error: 'Failed to download certificate' });
  }
});

// Get user's certificates
router.get('/my-certificates', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const certificates = await prisma.certificate.findMany({
      where: { userId },
      include: {
        course: true,
      },
    });

    res.json(certificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

// Verify certificate (public endpoint)
router.get('/verify/:certificateNumber', async (req, res) => {
  try {
    const { certificateNumber } = req.params;
    const certificate = await prisma.certificate.findUnique({
      where: { certificateNumber },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        course: true,
      },
    });

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    res.json({
      valid: true,
      certificate: {
        userName: certificate.user.name,
        courseName: certificate.course.title,
        issuedAt: certificate.issuedAt,
        certificateNumber: certificate.certificateNumber,
      },
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({ error: 'Failed to verify certificate' });
  }
});

export default router; 