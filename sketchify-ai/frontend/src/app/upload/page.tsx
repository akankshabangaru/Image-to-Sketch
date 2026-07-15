'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import UploadDropzone from '@/components/UploadDropzone';
import SketchControls from '@/components/SketchControls';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { api, getErrorMessage } from '@/lib/api';
import { loadImageToCanvas, renderSketchPreview } from '@/lib/canvasSketch';
import type { SketchSettings, SketchStyle } from '@/types';

const DEFAULT_SETTINGS: SketchSettings = { intensity: 60, contrast: 50, brightness: 50, edgeSharpness: 50 };

function UploadContent() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [style, setStyle] = useState<SketchStyle>('pencil');
  const [settings, setSettings] = useState<SketchSettings>(DEFAULT_SETTINGS);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const runPreview = useCallback(
    (s: SketchStyle, opts: SketchSettings) => {
      if (!sourceCanvasRef.current || !previewCanvasRef.current) return;
      renderSketchPreview(sourceCanvasRef.current, previewCanvasRef.current, s, opts);
    },
    []
  );

  const handleFileSelected = async (selected: File) => {
    setError('');
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    const canvas = await loadImageToCanvas(selected);
    sourceCanvasRef.current = canvas;
    requestAnimationFrame(() => runPreview(style, settings));
  };

  const handleStyleChange = (s: SketchStyle) => {
    setStyle(s);
    runPreview(s, settings);
  };

  const handleSettingsChange = (s: SketchSettings) => {
    setSettings(s);
    runPreview(style, s);
  };

  const handleGenerate = async () => {
    if (!file) return;
    setError('');
    setUploading(true);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data: uploadData } = await api.post('/images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100));
        },
      });

      setUploading(false);
      setProcessing(true);

      const imageId = uploadData.image._id;
      await api.post(`/images/${imageId}/convert`, { style, ...settings });

      router.push(`/results/${imageId}`);
    } catch (err) {
      setError(getErrorMessage(err));
      setUploading(false);
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-3xl">Create a new sketch</h1>
      <p className="mt-1 text-sm text-ink-mist">Upload a photo, choose a style, and preview instantly.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div>
          {!file ? (
            <UploadDropzone onFileSelected={handleFileSelected} />
          ) : (
            <Card className="overflow-hidden p-0">
              <div className="grid grid-cols-2 divide-x divide-ink/8 dark:divide-paper/8">
                <div>
                  <p className="border-b border-ink/8 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-ink-mist dark:border-paper/8">Original</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl!} alt="Original" className="aspect-square w-full object-cover" />
                </div>
                <div>
                  <p className="border-b border-ink/8 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-ink-mist dark:border-paper/8">Live preview</p>
                  <canvas ref={previewCanvasRef} className="aspect-square w-full object-cover" />
                </div>
              </div>
            </Card>
          )}

          {file && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button variant="secondary" onClick={() => { setFile(null); setPreviewUrl(null); }}>
                Choose a different photo
              </Button>
              <Button onClick={handleGenerate} isLoading={uploading || processing}>
                <UploadCloud size={16} />
                {uploading ? `Uploading ${progress}%` : processing ? 'Generating sketch…' : 'Generate final sketch'}
              </Button>
            </div>
          )}
          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
        </div>

        <Card className="h-fit p-6">
          <SketchControls style={style} settings={settings} onStyleChange={handleStyleChange} onSettingsChange={handleSettingsChange} />
        </Card>
      </div>
    </div>
  );
}

export default function UploadPage() {
  return (
    <ProtectedRoute>
      <UploadContent />
    </ProtectedRoute>
  );
}
