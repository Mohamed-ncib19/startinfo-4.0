import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export class PDFService {
  async generateCertificate(data: {
    userName: string;
    courseName: string;
    certificateNumber: string;
    issuedAt: Date;
  }) {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // A4 landscape
    const { width, height } = page.getSize();

    // Load fonts
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Add certificate content
    page.drawText('Certificate of Completion', {
      x: width / 2 - 150,
      y: height - 100,
      size: 30,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText(`This is to certify that`, {
      x: width / 2 - 100,
      y: height - 200,
      size: 16,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(data.userName, {
      x: width / 2 - 100,
      y: height - 250,
      size: 24,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText(`has successfully completed the course`, {
      x: width / 2 - 120,
      y: height - 300,
      size: 16,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(data.courseName, {
      x: width / 2 - 100,
      y: height - 350,
      size: 20,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Certificate Number: ${data.certificateNumber}`, {
      x: 50,
      y: 50,
      size: 12,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Issued on: ${data.issuedAt.toLocaleDateString()}`, {
      x: width - 200,
      y: 50,
      size: 12,
      font: regularFont,
      color: rgb(0, 0, 0),
    });

    // Add a decorative border
    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderColor: rgb(0, 0, 0),
      borderWidth: 2,
    });

    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }
} 