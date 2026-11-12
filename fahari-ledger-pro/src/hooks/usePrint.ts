import { useCallback } from 'react';

export const usePrint = () => {
  const printElement = useCallback((element: HTMLElement) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(style => style.outerHTML)
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Bill</title>
          ${styles}
          <style>
            @page { margin: 0; }
            body { margin: 0; padding: 0; }
            @media print {
              body { width: 80mm; }
            }
          </style>
        </head>
        <body>
          ${element.outerHTML}
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }, []);

  return { printElement };
};
