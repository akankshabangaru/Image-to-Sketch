'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Download, Share2, Heart, X, RefreshCcw } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { api, getErrorMessage } from '@/lib/api';
import type { SketchImage } from '@/types';

function ResultsContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [image, setImage] = useState<SketchImage | null>(null);
  const [error, setError] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpg'>('png');

  const load = async () => {
    try {
      const { data } = await api.get(`/images/${id}`);
      setImage(data.image);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    load();
    // Poll while the image is still processing
    const interval = setInterval(async () => {
      const { data } = await api.get(`/images/${id}`);
      setImage(data.image);
      if (data.image.status !== 'processing') clearInterval(interval);
    }, 2500);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const toggleFavorite = async () => {
    const { data } = await api.patch(`/images/${id}/favorite`);
    setImage(data.image);
  };

  const download = async () => {
    if (!image?.resultUrl) return;
    const res = await fetch(image.resultUrl);
    const blob = await res.blob();

    if (downloadFormat === 'jpg') {
      const bmp = await createImageBitmap(blob);
      const canvas = document.createElement('canvas');
      canvas.width = bmp.width;
      canvas.height = bmp.height;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bmp, 0, 0);
      canvas.toBlob(
        (jpgBlob) => {
          if (!jpgBlob) return;
          triggerDownload(jpgBlob, `sketchify-${image._id}.jpg`);
        },
        'image/jpeg',
        0.92
      );
    } else {
      triggerDownload(blob, `sketchify-${image._id}.png`);
    }
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const share = async (platform: 'twitter' | 'facebook' | 'copy') => {
    const shareUrl = window.location.href;
    if (platform === 'copy') {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard');
      return;
    }
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out my AI sketch from Sketchify AI!')}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    };
    window.open(urls[platform], '_blank', 'noopener,noreferrer');
  };

  if (error) return <p className="mx-auto max-w-3xl px-6 py-12 text-red-500">{error}</p>;
  if (!image) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-pencil border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">{image.originalFileName}</h1>
          <p className="mt-1 text-sm capitalize text-ink-mist">{image.style} sketch · {image.status}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={toggleFavorite}>
            <Heart size={15} className={image.isFavorite ? 'fill-pencil-deep text-pencil-deep' : ''} />
            {image.isFavorite ? 'Favorited' : 'Favorite'}
          </Button>
          <Button variant="secondary" onClick={() => router.push('/upload')}>
            <RefreshCcw size={15} /> New sketch
          </Button>
        </div>
      </div>

      {image.status === 'processing' && (
        <Card className="mt-8 flex items-center gap-3 p-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-pencil border-t-transparent" />
          <p className="text-sm">Sketching in progress — this usually takes a few seconds…</p>
        </Card>
      )}

      {image.status === 'failed' && (
        <Card className="mt-8 p-6 text-sm text-red-500">
          Conversion failed: {image.errorMessage || 'Unknown error'}. Please try again from the upload page.
        </Card>
      )}

      {image.status === 'completed' && image.resultUrl && (
        <>
          <div className="mt-8">
            <BeforeAfterSlider beforeSrc={image.originalUrl} afterSrc={image.resultUrl} onFullscreen={() => setFullscreen(true)} />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <select
              value={downloadFormat}
              onChange={(e) => setDownloadFormat(e.target.value as 'png' | 'jpg')}
              className="rounded-full border border-ink/15 bg-paper-card px-4 py-2.5 text-sm dark:border-paper/15 dark:bg-graphite-800"
            >
              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
            </select>
            <Button onClick={download}><Download size={16} /> Download</Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => share('twitter')}><Share2 size={15} /> X</Button>
              <Button variant="secondary" onClick={() => share('facebook')}><Share2 size={15} /> Facebook</Button>
              <Button variant="secondary" onClick={() => share('copy')}><Share2 size={15} /> Copy link</Button>
            </div>
          </div>
        </>
      )}

      {fullscreen && image.resultUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-graphite-950/95 p-6">
          <button onClick={() => setFullscreen(false)} className="absolute right-6 top-6 text-paper" aria-label="Close">
            <X size={28} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.resultUrl} alt="Sketch fullscreen" className="max-h-full max-w-full rounded-xl object-contain" />
        </div>
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <ProtectedRoute>
      <ResultsContent />
    </ProtectedRoute>
  );
}
