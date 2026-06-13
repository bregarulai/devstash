import { useState } from 'react';

interface UploadResult {
  url: string;
  key: string;
  name: string;
  size: number;
  type: string;
}

async function uploadFile(
  file: File,
  onProgress: (progress: number) => void,
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        const resp = JSON.parse(xhr.responseText);
        reject(new Error(resp.error || 'Upload failed'));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Upload failed')));
    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  });
}

export function useFileUpload() {
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  function handleFileSelect(file: File) {
    setPendingFile(file);
  }

  function reset() {
    setPendingFile(null);
    setUploadProgress(0);
  }

  async function upload(): Promise<UploadResult> {
    if (!pendingFile) {
      throw new Error('No file selected');
    }
    setUploadProgress(0);
    return uploadFile(pendingFile, setUploadProgress);
  }

  return {
    pendingFile,
    uploadProgress,
    handleFileSelect,
    upload,
    reset,
  };
}
