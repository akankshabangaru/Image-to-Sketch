'use client';

import { useCallback, useRef, useState } from 'react';
import { UploadCloud, ImageIcon, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024;

export default function UploadDropzone({ onFileSelected }: { onFileSelected: (file: File) => void }) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndEmit = useCallback(
    (file: File) => {
      setError(null);
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError('Unsupported format. Please use PNG, JPG, JPEG, or WEBP.');
        return;
      }
      if (file.size > MAX_SIZE) {
        setError('File is too large. Maximum size is 10 MB.');
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected]
  );

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) validateAndEmit(file);
        }}
        onClick={() => inputRef.current?.click()}
        className={clsx(
          'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-14 text-center transition',
          dragOver
            ? 'border-pencil-deep bg-pencil/10 dark:border-pencil'
            : 'border-ink/20 hover:border-ink/40 dark:border-paper/20 dark:hover:border-paper/40'
        )}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-pencil/15">
          <UploadCloud className="text-pencil-deep dark:text-pencil" size={26} />
        </div>
        <div>
          <p className="font-medium text-ink dark:text-paper">Drag and drop your photo here</p>
          <p className="mt-1 text-sm text-ink-mist">or click to browse · PNG, JPG, JPEG, WEBP · up to 10 MB</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) validateAndEmit(file);
          }}
        />
      </div>
      {error && (
        <div className="mt-3 flex items-center gap-2 text-sm text-red-500">
          <AlertCircle size={15} /> {error}
        </div>
      )}
      <div className="mt-3 flex items-center gap-2 text-xs text-ink-mist">
        <ImageIcon size={13} /> Your image stays private and is only used to generate your sketch.
      </div>
    </div>
  );
}
