import { getAccessToken } from './client';

/**
 * Resolves the absolute backend API endpoint for PDF generation,
 * with optional orientation and preview query parameters.
 */
export function buildPdfUrl(
  url: string,
  orientation?: 'portrait' | 'landscape',
  preview: boolean = false
): string {
  const envBase = import.meta.env.VITE_API_BASE as string | undefined;
  const baseUrl = (envBase && envBase.trim().length > 0 ? envBase : 'http://localhost:8001/api').replace(/\/$/, '');
  const rawPath = url.startsWith('/') ? url : `/${url}`;
  const cleanPath = baseUrl.endsWith('/api') && rawPath.startsWith('/api/')
    ? rawPath.substring(4)
    : rawPath;

  const targetUrl = new URL(`${baseUrl}${cleanPath}`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8001');
  if (orientation) {
    targetUrl.searchParams.set('orientation', orientation);
  }
  if (preview) {
    targetUrl.searchParams.set('preview', '1');
  }
  return targetUrl.toString();
}

/**
 * Fetches PDF bytes from the Django backend as a Blob, returning the blob and an object URL.
 */
export async function fetchPdfBlob(
  url: string,
  orientation?: 'portrait' | 'landscape',
  preview: boolean = false
): Promise<{ blob: Blob; filename: string; blobUrl: string }> {
  const targetUrl = buildPdfUrl(url, orientation, preview);
  const token = getAccessToken();

  const headers: Record<string, string> = {
    Accept: 'application/pdf, */*',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(targetUrl, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    let errMessage = 'Failed to generate PDF document';
    try {
      const errJson = await response.json();
      errMessage = errJson.error || errJson.detail || errMessage;
    } catch {
      // response might be non-json error page
      const text = await response.text().catch(() => '');
      if (text && text.length < 200) {
        errMessage = text;
      }
    }
    throw new Error(errMessage);
  }

  let filename = 'document.pdf';
  const disposition = response.headers.get('Content-Disposition');
  if (disposition && disposition.includes('filename=')) {
    const match = disposition.match(/filename="?([^";]+)"?/);
    if (match && match[1]) {
      filename = match[1];
    }
  }

  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  return { blob, filename, blobUrl };
}

/**
 * Downloads a generated PDF document from the backend.
 * Uses Bearer JWT authentication and triggers a direct browser file download.
 */
export async function downloadPdf(
  url: string,
  filename?: string,
  orientation?: 'portrait' | 'landscape'
): Promise<void> {
  const result = await fetchPdfBlob(url, orientation, false);
  const targetFilename = filename || result.filename;

  const a = document.createElement('a');
  a.href = result.blobUrl;
  a.download = targetFilename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  // Defer revoking to allow browser download to start
  setTimeout(() => {
    window.URL.revokeObjectURL(result.blobUrl);
  }, 10000);
}

/**
 * Opens a PDF in a new tab for native browser printing/viewing.
 */
export async function openPdfPreview(
  url: string,
  orientation?: 'portrait' | 'landscape'
): Promise<string> {
  const result = await fetchPdfBlob(url, orientation, true);
  window.open(result.blobUrl, '_blank');
  return result.blobUrl;
}
