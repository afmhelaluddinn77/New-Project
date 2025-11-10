import React, { useRef, useCallback } from 'react';

export interface PrintOptions {
  title?: string;
  margins?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  paperSize?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
  backgroundColor?: boolean;
}

/**
 * Hook for printing content
 * 
 * @param options Print configuration options
 * @returns Object with print ref and print function
 * 
 * @example
 * const { printRef, print } = usePrint({ title: 'Prescription' });
 * 
 * return (
 *   <>
 *     <div ref={printRef}>Content to print</div>
 *     <button onClick={print}>Print</button>
 *   </>
 * );
 */
export const usePrint = (options: PrintOptions = {}) => {
  const {
    title = 'Document',
    margins = { top: 10, right: 10, bottom: 10, left: 10 },
    paperSize = 'A4',
    orientation = 'portrait',
    backgroundColor = false,
  } = options;

  const printRef = useRef<HTMLDivElement>(null);

  const print = useCallback(() => {
    if (!printRef.current) {
      console.error('Print ref not found');
      return;
    }

    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) {
      console.error('Failed to open print window');
      return;
    }

    const content = printRef.current.innerHTML;

    // Paper sizes in mm
    const paperSizes = {
      A4: { width: 210, height: 297 },
      Letter: { width: 216, height: 279 },
    };

    const size = paperSizes[paperSize];
    const marginTop = margins.top || 10;
    const marginRight = margins.right || 10;
    const marginBottom = margins.bottom || 10;
    const marginLeft = margins.left || 10;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: 'Times New Roman', serif;
              line-height: 1.6;
              color: #333;
              ${backgroundColor ? 'background-color: white;' : ''}
            }

            @page {
              size: ${paperSize} ${orientation};
              margin: ${marginTop}mm ${marginRight}mm ${marginBottom}mm ${marginLeft}mm;
            }

            @media print {
              body {
                margin: 0;
                padding: 0;
              }

              .no-print {
                display: none !important;
              }

              a {
                text-decoration: none;
                color: #000;
              }

              img {
                max-width: 100%;
                height: auto;
              }

              table {
                border-collapse: collapse;
                width: 100%;
              }

              th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
              }

              th {
                background-color: #f5f5f5;
              }

              .page-break {
                page-break-after: always;
              }

              .no-page-break {
                page-break-inside: avoid;
              }
            }

            /* Print-specific styles */
            h1, h2, h3, h4, h5, h6 {
              page-break-after: avoid;
              page-break-inside: avoid;
            }

            p {
              page-break-inside: avoid;
            }

            ul, ol {
              page-break-inside: avoid;
            }

            li {
              page-break-inside: avoid;
            }

            table {
              page-break-inside: avoid;
            }

            blockquote {
              page-break-inside: avoid;
            }

            /* Responsive print */
            @media (max-width: 768px) {
              body {
                font-size: 12px;
              }
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for content to load before printing
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  }, [title, margins, paperSize, orientation, backgroundColor]);

  return { printRef, print };
};

/**
 * Hook to print with PDF export capability
 * Requires html2pdf library
 */
export const usePrintToPDF = (options: PrintOptions & { filename?: string } = {}) => {
  const { filename = 'document.pdf', ...printOptions } = options;
  const { printRef, print } = usePrint(printOptions);

  const printToPDF = useCallback(async () => {
    if (!printRef.current) {
      console.error('Print ref not found');
      return;
    }

    try {
      // Check if html2pdf is available
      if (typeof (window as any).html2pdf === 'undefined') {
        console.warn('html2pdf library not found. Using standard print instead.');
        print();
        return;
      }

      const element = printRef.current;
      const opt = {
        margin: 10,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
      };

      await (window as any).html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF export failed:', error);
      // Fallback to standard print
      print();
    }
  }, [print, filename]);

  return { printRef, print, printToPDF };
};

/**
 * Hook to handle print preview
 */
export const usePrintPreview = () => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

  const openPreview = useCallback(() => {
    setIsPreviewOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  return {
    previewRef,
    isPreviewOpen,
    openPreview,
    closePreview,
  };
};

/**
 * Hook to handle print settings
 */
export interface PrintSettings {
  pageSize: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  backgroundColor: boolean;
  includeHeader: boolean;
  includeFooter: boolean;
}

export const usePrintSettings = (defaultSettings?: Partial<PrintSettings>) => {
  const [settings, setSettings] = React.useState<PrintSettings>({
    pageSize: 'A4',
    orientation: 'portrait',
    margins: { top: 10, right: 10, bottom: 10, left: 10 },
    backgroundColor: false,
    includeHeader: true,
    includeFooter: true,
    ...defaultSettings,
  });

  const updateSetting = useCallback(
    (key: keyof PrintSettings, value: any) => {
      setSettings((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const resetSettings = useCallback(() => {
    setSettings({
      pageSize: 'A4',
      orientation: 'portrait',
      margins: { top: 10, right: 10, bottom: 10, left: 10 },
      backgroundColor: false,
      includeHeader: true,
      includeFooter: true,
      ...defaultSettings,
    });
  }, [defaultSettings]);

  return {
    settings,
    updateSetting,
    resetSettings,
  };
};
