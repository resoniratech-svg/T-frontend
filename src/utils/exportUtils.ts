/**
 * Global Export Utilities covering CSV, JSON, and mock file downloads 
 * as well as helper wrappers around window.print() for PDF exports.
 */

export const exportToCSV = (data: any[], filename: string) => {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]).join(",");
  const rows = data
    .map((row) =>
      Object.values(row)
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  const csvContent = `${headers}\n${rows}`;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
};

export const exportToJSON = (data: any, filename: string) => {
  if (!data) return;
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  downloadBlob(blob, filename.endsWith('.json') ? filename : `${filename}.json`);
};

export const downloadMockFile = (filename: string, content: string = "Placeholder content for generated file export.") => {
  // If the content is actually a URL, trigger a real download
  if (content.startsWith('http') || content.startsWith('/uploads')) {
    const link = document.createElement("a");
    link.href = content;
    link.download = filename;
    link.target = "_blank";
    link.click();
    return;
  }

  const extension = filename.split('.').pop()?.toLowerCase();
  let type = "text/plain";
  
  if (extension === "pdf") type = "application/pdf";
  else if (extension === "png") type = "image/png";
  else if (extension === "jpg" || extension === "jpeg") type = "image/jpeg";

  const blob = new Blob([content], { type });
  downloadBlob(blob, filename);
};

export const exportToWord = (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  // Get all styles to try to preserve some formatting in Word
  let styles = '';
  for (const sheet of document.styleSheets) {
    try {
      if (sheet.cssRules) {
        for (const rule of sheet.cssRules) {
          styles += rule.cssText + '\n';
        }
      }
    } catch (e) {
      console.warn("Could not read stylesheet", e);
    }
  }

  const header = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${filename}</title>
      <style>
        ${styles}
        body { font-family: Arial, sans-serif; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid black; padding: 8px; }
      </style>
    </head><body>
  `;
  const footer = "</body></html>";
  const sourceHTML = header + element.outerHTML + footer;
  
  const blob = new Blob(['\ufeff', sourceHTML], {
    type: 'application/msword'
  });
  downloadBlob(blob, filename.endsWith('.docx') ? filename : `${filename}.docx`);
};

export const exportHTMLToWord = (htmlContent: string, filename: string) => {
  const header = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${filename}</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 13px; }
        table { border-collapse: collapse; }
      </style>
    </head><body>
  `;
  const footer = "</body></html>";
  const sourceHTML = header + htmlContent + footer;
  
  const blob = new Blob(['\ufeff', sourceHTML], {
    type: 'application/msword'
  });
  downloadBlob(blob, filename.endsWith('.docx') ? filename : `${filename}.docx`);
};

export const downloadDocx = (blob: Blob, filename: string) => {
  downloadBlob(blob, filename.endsWith('.docx') ? filename : `${filename}.docx`);
};

export const printDocument = (title?: string) => {
  if (title) {
    const originalTitle = document.title;
    document.title = title;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 500);
  } else {
    window.print();
  }
};

const downloadBlob = (blob: Blob, filename: string) => {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
