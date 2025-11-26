import { PDFDocument, PageSizes, Degrees } from 'pdf-lib';
import { PageLayout, ProcessingOptions } from '../types';

export const generateTiledPdf = async (
  file: File, 
  options: ProcessingOptions
): Promise<Uint8Array> => {
  try {
    const fileArrayBuffer = await file.arrayBuffer();
    
    // Load the source PDF
    const srcDoc = await PDFDocument.load(fileArrayBuffer);
    const srcPages = srcDoc.getPages();
    
    if (srcPages.length === 0) {
      throw new Error("The uploaded PDF has no pages.");
    }

    // Create a new PDF
    const pdfDoc = await PDFDocument.create();

    // Determine Page Size based on layout
    let pageWidth: number;
    let pageHeight: number;

    switch (options.layout) {
      case PageLayout.LetterLandscape:
        pageWidth = PageSizes.Letter[1];
        pageHeight = PageSizes.Letter[0];
        break;
      case PageLayout.LetterPortrait:
        pageWidth = PageSizes.Letter[0];
        pageHeight = PageSizes.Letter[1];
        break;
      case PageLayout.A4Landscape:
        pageWidth = PageSizes.A4[1];
        pageHeight = PageSizes.A4[0];
        break;
      case PageLayout.A4Portrait:
        pageWidth = PageSizes.A4[0];
        pageHeight = PageSizes.A4[1];
        break;
      default:
        pageWidth = PageSizes.Letter[0];
        pageHeight = PageSizes.Letter[1];
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    
    // Embed the first page of the source PDF
    const [embeddedPage] = await pdfDoc.embedPages([srcPages[0]]);
    const { width: srcWidth, height: srcHeight } = embeddedPage.scale(1);

    // Configuration for 8-up (2 columns x 4 rows)
    const cols = 2;
    const rows = 4;
    const margin = options.margin || 18;

    // Calculate cell dimensions
    const workingWidth = pageWidth - (margin * 2);
    const workingHeight = pageHeight - (margin * 2);
    const cellWidth = workingWidth / cols;
    const cellHeight = workingHeight / rows;

    // Loop to place 8 copies
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Calculate the center of the cell
        const cellX = margin + (c * cellWidth);
        // PDF coordinates start from bottom-left, so row 0 is at the top
        const cellY = pageHeight - margin - ((r + 1) * cellHeight);

        // Determine scale to fit within cell while maintaining aspect ratio
        const scaleX = (cellWidth - 10) / srcWidth; // -10 for inner padding
        const scaleY = (cellHeight - 10) / srcHeight;
        const scale = Math.min(scaleX, scaleY);

        const scaledWidth = srcWidth * scale;
        const scaledHeight = srcHeight * scale;

        // Center within the cell
        const x = cellX + (cellWidth - scaledWidth) / 2;
        const y = cellY + (cellHeight - scaledHeight) / 2;

        page.drawPage(embeddedPage, {
          x,
          y,
          width: scaledWidth,
          height: scaledHeight,
        });
      }
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    console.error("PDF Generation Error", error);
    throw new Error("Failed to generate PDF. Ensure the file is a valid PDF.");
  }
};