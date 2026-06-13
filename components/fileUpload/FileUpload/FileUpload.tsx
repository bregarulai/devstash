'use client';

import { useRef, useCallback, useState } from 'react';
import { FileText, ImageIcon, X } from 'lucide-react';
import { cn, formatFileSize } from '@/lib/utils/utils';

interface FileUploadProps {
  accept: string;
  maxSize: number;
  fileType: 'image' | 'file';
  onFileSelect: (file: File) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export function FileUpload({
  accept,
  maxSize,
  fileType,
  onFileSelect,
  onError,
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (file.size > maxSize) {
        onError(`File exceeds ${formatFileSize(maxSize)} limit`);
        return;
      }

      setSelectedFile(file);

      if (fileType === 'image' && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }

      onFileSelect(file);
    },
    [maxSize, fileType, onFileSelect, onError],
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedFile(null);
      setPreview(null);
      if (inputRef.current) inputRef.current.value = '';
    },
    [],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      if (inputRef.current) inputRef.current.value = '';
    },
    [handleFile],
  );

  const Icon = fileType === 'image' ? ImageIcon : FileText;

  if (selectedFile) {
    return (
      <div className='flex items-center gap-3 rounded-lg border p-3'>
        {preview ? (
          <img
            src={preview}
            alt='Upload preview'
            className='h-16 w-16 rounded object-cover'
          />
        ) : (
          <FileText className='h-10 w-10 shrink-0 text-muted-foreground' />
        )}
        <div className='flex-1 min-w-0'>
          <p className='text-sm font-medium truncate'>{selectedFile.name}</p>
          <p className='text-xs text-muted-foreground'>
            {formatFileSize(selectedFile.size)}
          </p>
        </div>
        <button
          type='button'
          onClick={handleRemove}
          className='rounded-md p-1 text-muted-foreground hover:text-foreground'
        >
          <X className='h-4 w-4' />
        </button>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !disabled && inputRef.current?.click()}
      className={cn(
        'relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-muted-foreground/50',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <input
        ref={inputRef}
        type='file'
        accept={accept}
        onChange={handleInputChange}
        disabled={disabled}
        className='sr-only'
      />

      <Icon className='h-8 w-8 text-muted-foreground' />
      <div className='text-center'>
        <p className='text-sm text-muted-foreground'>
          <span className='font-medium text-foreground'>Click to upload</span>{' '}
          or drag and drop
        </p>
        <p className='mt-1 text-xs text-muted-foreground'>
          Max {formatFileSize(maxSize)}
        </p>
      </div>
    </div>
  );
}
