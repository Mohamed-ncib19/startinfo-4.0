import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export class PDFService {
  async generateCertificate(data: {
    userName: string;
    courseName: string;
    courseDescription: string;
    certificateNumber: string;
    issuedAt: Date;
  }) {
    // Load the certificate template
    const templatePath = path.resolve(__dirname, 'certificate-template.pdf');
    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);

    // Get the first page of the template
    const page = pdfDoc.getPage(0);
    const { width, height } = page.getSize();

    // Fonts
    const titleFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Colors
    const primary = rgb(0.09, 0.32, 0.67); // #1852ab
    const mutedText = rgb(0.45, 0.45, 0.45); // text-muted-foreground

    // Content Positioning
    const centerX = width / 2;
    let y = height - 200;

    // Add dynamic content to the template

    // User Name
    const nameFontSize = 32;
    const nameWidth = titleFont.widthOfTextAtSize(data.userName, nameFontSize);
    page.drawText(data.userName, {
      x: centerX - nameWidth / 2,
      y: y,
      size: nameFontSize,
      font: titleFont,
      color: primary,
    });
    y -= 50;

    // Course Name
    const courseFontSize = 24;
    const courseWidth = titleFont.widthOfTextAtSize(data.courseName, courseFontSize);
    page.drawText(data.courseName, {
      x: centerX - courseWidth / 2,
      y: y,
      size: courseFontSize,
      font: titleFont,
      color: primary,
    });
    y -= 30;

    // Certificate Number
    const certNumberFontSize = 12;
    page.drawText(`Certificate Number: ${data.certificateNumber}`, {
      x: 50,
      y: 50,
      size: certNumberFontSize,
      font: regularFont,
      color: mutedText,
    });

    // Issue Date
    const issueDateFontSize = 12;
    const issueDateText = `Issue Date: ${data.issuedAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`;
    page.drawText(issueDateText, {
      x: width - 200,
      y: 50,
      size: issueDateFontSize,
      font: regularFont,
      color: mutedText,
    });

    // Save the updated PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }
}