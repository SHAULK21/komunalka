import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export async function exportElementToPdf(elementId: string, filename: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return false;
  }

  try {
    // Wait for fonts to be ready before capturing
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    const width = element.offsetWidth || 820;
    const height = element.scrollHeight || element.offsetHeight || 1100;

    // Use html-to-image which natively renders using browser SVG foreignObject
    // (does not fail on modern CSS functions like oklch from Tailwind CSS v4)
    const imgData = await toPng(element, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      width,
      height,
      style: {
        transform: 'none',
        left: '0',
        top: '0',
        position: 'static',
      },
    });

    // Create an Image to accurately verify dimensions
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (e) => reject(new Error('Failed to load captured image: ' + String(e)));
      img.src = imgData;
    });

    // A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const canvasWidth = img.naturalWidth || width * 2;
    const canvasHeight = img.naturalHeight || height * 2;

    // Calculate aspect ratio
    const margin = 10; // 10mm margin
    const contentWidth = pdfWidth - margin * 2;
    const contentHeight = (canvasHeight * contentWidth) / canvasWidth;

    // Check if content fits on one page or needs scaling
    if (contentHeight <= pdfHeight - margin * 2) {
      pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);
    } else {
      // Scale down slightly to fit cleanly on 1 A4 page
      const scale = (pdfHeight - margin * 2) / contentHeight;
      const finalWidth = contentWidth * scale;
      const finalHeight = contentHeight * scale;
      const offsetX = (pdfWidth - finalWidth) / 2;
      pdf.addImage(imgData, 'PNG', offsetX, margin, finalWidth, finalHeight);
    }

    pdf.save(filename);
    return true;
  } catch (err) {
    console.error('Error generating PDF:', err);
    return false;
  }
}

export function triggerPrint(): void {
  window.print();
}
