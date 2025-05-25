import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

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

    // Define colors
    const primaryColor = rgb(0.18, 0.32, 0.59); // Dark blue
    const accentColor = rgb(0.85, 0.65, 0.13); // Gold
    const textColor = rgb(0.2, 0.2, 0.2); // Dark gray
    const borderColor = rgb(0.85, 0.75, 0.45); // Light gold for borders

    // Load fonts
    const titleFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const headerFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Draw fancy border (double border with corner designs)
    // Outer border
    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderColor: primaryColor,
      borderWidth: 2,
    });

    // Inner border
    page.drawRectangle({
      x: 35,
      y: 35,
      width: width - 70,
      height: height - 70,
      borderColor: borderColor,
      borderWidth: 1,
    });

    // Draw corner flourishes
    const cornerSize = 30;
    [[35, height - 35], [width - 35, height - 35], [35, 35], [width - 35, 35]].forEach(([x, y]) => {
      // Decorative circle
      page.drawCircle({
        x,
        y,
        size: 8,
        color: accentColor,
      });
      
      // Draw L-shaped corner flourish
      const isTop = y > height/2;
      const isRight = x > width/2;
      
      page.drawLine({
        start: { x: x + (isRight ? -cornerSize : 0), y },
        end: { x: x + (isRight ? 0 : cornerSize), y },
        thickness: 1,
        color: accentColor,
      });
      
      page.drawLine({
        start: { x, y: y + (isTop ? -cornerSize : 0) },
        end: { x, y: y + (isTop ? 0 : cornerSize) },
        thickness: 1,
        color: accentColor,
      });
    });

    // Add header
    page.drawText('CERTIFICATE', {
      x: width / 2 - 130,
      y: height - 100,
      size: 42,
      font: titleFont,
      color: primaryColor,
    });

    page.drawText('OF COMPLETION', {
      x: width / 2 - 110,
      y: height - 150,
      size: 28,
      font: titleFont,
      color: primaryColor,
    });

    // Add decorative line under header with end points
    const lineY = height - 170;
    page.drawLine({
      start: { x: width / 2 - 180, y: lineY },
      end: { x: width / 2 + 180, y: lineY },
      thickness: 2,
      color: accentColor,
    });

    // Add decorative circles at line ends
    page.drawCircle({
      x: width / 2 - 180,
      y: lineY,
      size: 4,
      color: accentColor,
    });
    
    page.drawCircle({
      x: width / 2 + 180,
      y: lineY,
      size: 4,
      color: accentColor,
    });

    // Add main content with improved typography
    page.drawText('This is to certify that', {
      x: width / 2 - 85,
      y: height - 240,
      size: 16,
      font: bodyFont,
      color: textColor,
    });

    // Draw name with decorative elements
    const nameWidth = headerFont.widthOfTextAtSize(data.userName, 32);
    const nameX = width / 2 - nameWidth / 2;
    
    page.drawText(data.userName, {
      x: nameX,
      y: height - 290,
      size: 32,
      font: headerFont,
      color: primaryColor,
    });

    // Add flourishes around name
    const flourishWidth = 40;
    const flourishGap = 10;
    
    page.drawLine({
      start: { x: nameX - flourishWidth - flourishGap, y: height - 295 },
      end: { x: nameX - flourishGap, y: height - 295 },
      thickness: 1,
      color: accentColor,
    });

    page.drawLine({
      start: { x: nameX + nameWidth + flourishGap, y: height - 295 },
      end: { x: nameX + nameWidth + flourishWidth + flourishGap, y: height - 295 },
      thickness: 1,
      color: accentColor,
    });

    page.drawText('has successfully completed the course', {
      x: width / 2 - 120,
      y: height - 340,
      size: 16,
      font: bodyFont,
      color: textColor,
    });

    // Draw course name with decorative elements
    const courseWidth = headerFont.widthOfTextAtSize(data.courseName, 28);
    const courseX = width / 2 - courseWidth / 2;

    page.drawText(data.courseName, {
      x: courseX,
      y: height - 390,
      size: 28,
      font: headerFont,
      color: primaryColor,
    });

    // Add course name underline with decorative ends
    const underlineY = height - 395;
    page.drawLine({
      start: { x: courseX - 10, y: underlineY },
      end: { x: courseX + courseWidth + 10, y: underlineY },
      thickness: 1,
      color: accentColor,
    });

    // Draw small circles at underline ends
    page.drawCircle({
      x: courseX - 10,
      y: underlineY,
      size: 2,
      color: accentColor,
    });
    
    page.drawCircle({
      x: courseX + courseWidth + 10,
      y: underlineY,
      size: 2,
      color: accentColor,
    });

    // Add verification section with improved styling
    const verificationY = 120;
    
    // Add decorative verification badge
    const badgeSize = 30;
    const badgeX = 50;
    const badgeY = verificationY;
    
    // Draw badge circle
    page.drawCircle({
      x: badgeX,
      y: badgeY,
      size: badgeSize,
      color: rgb(0.95, 0.95, 0.95), // Light gray fill
      borderColor: primaryColor,
      borderWidth: 1,
    });
    
    // Draw badge checkmark
    page.drawLine({
      start: { x: badgeX - 8, y: badgeY },
      end: { x: badgeX - 2, y: badgeY - 6 },
      thickness: 2,
      color: primaryColor,
    });
    
    page.drawLine({
      start: { x: badgeX - 2, y: badgeY - 6 },
      end: { x: badgeX + 8, y: badgeY + 6 },
      thickness: 2,
      color: primaryColor,
    });

    // Verification text
    page.drawText('Certificate Verification', {
      x: badgeX + 40,
      y: verificationY + 10,
      size: 14,
      font: headerFont,
      color: primaryColor,
    });

    page.drawText(`Certificate ID: ${data.certificateNumber}`, {
      x: badgeX + 40,
      y: verificationY - 10,
      size: 10,
      font: bodyFont,
      color: textColor,
    });

    page.drawText(`Issue Date: ${data.issuedAt.toLocaleDateString()}`, {
      x: badgeX + 40,
      y: verificationY - 30,
      size: 10,
      font: bodyFont,
      color: textColor,
    });

    // Generate and add QR code for verification
    const verificationUrl = `${process.env.FRONTEND_URL}/verify/${data.certificateNumber}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);
    const qrCodeImage = await pdfDoc.embedPng(qrCodeDataUrl);
    
    // Draw QR code with border
    const qrSize = 80;
    const qrX = width - 120;
    const qrY = 40;
    
    page.drawRectangle({
      x: qrX - 5,
      y: qrY - 5,
      width: qrSize + 10,
      height: qrSize + 10,
      borderColor: primaryColor,
      borderWidth: 1,
    });
    
    page.drawImage(qrCodeImage, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
    });

    // Add signature section with improved design
    const signatureY = 150;
    
    // Draw signature line
    page.drawLine({
      start: { x: width - 250, y: signatureY },
      end: { x: width - 50, y: signatureY },
      thickness: 1,
      color: primaryColor,
    });

    // Add small decorative elements at signature line ends
    page.drawCircle({
      x: width - 250,
      y: signatureY,
      size: 2,
      color: primaryColor,
    });
    
    page.drawCircle({
      x: width - 50,
      y: signatureY,
      size: 2,
      color: primaryColor,
    });

    page.drawText('Authorized Signature', {
      x: width - 190,
      y: signatureY - 20,
      size: 12,
      font: headerFont,
      color: primaryColor,
    });

    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }
}