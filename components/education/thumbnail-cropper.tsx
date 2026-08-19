'use client';

import { useCallback, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { Crop, ImageUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

async function cropImage(
  source: string,
  pixels: Area,
  aspect = 16 / 9,
  width = 1600
) {
  const image = new Image();
  image.src = source;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = Math.round(width / aspect);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is unavailable');
  context.drawImage(
    image,
    pixels.x,
    pixels.y,
    pixels.width,
    pixels.height,
    0,
    0,
    canvas.width,
    canvas.height
  );
  return new Promise<File>((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(
              new File([blob], `media-${Date.now()}.webp`, {
                type: 'image/webp',
              })
            )
          : reject(new Error('Image export failed')),
      'image/webp',
      0.9
    )
  );
}

export function ThumbnailCropper({
  busy,
  aspect = 16 / 9,
  title,
  body,
  label,
  buttonVariant = 'dashed',
  onCrop,
}: {
  busy?: boolean;
  aspect?: number;
  title?: string;
  body?: string;
  label?: string;
  buttonVariant?: 'dashed' | 'outline' | 'compact';
  onCrop: (file: File) => Promise<void>;
}) {
  const t = useTranslations('adminPage');
  const [source, setSource] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixels, setPixels] = useState<Area | null>(null);
  const completed = useCallback(
    (_area: Area, cropped: Area) => setPixels(cropped),
    []
  );

  const buttonLabel = label || t('thumbnailChooseCrop');

  if (!source) {
    if (buttonVariant === 'compact') {
      return (
        <label className="inline-flex h-8.5 cursor-pointer items-center gap-1.5 rounded-xl border border-border/80 bg-background px-3 text-xs font-semibold text-navy hover:bg-muted/50 hover:text-navy transition-colors shadow-2xs">
          <ImageUp className="size-3.5" />
          {buttonLabel}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) setSource(URL.createObjectURL(file));
              event.currentTarget.value = '';
            }}
          />
        </label>
      );
    }

    if (buttonVariant === 'outline') {
      return (
        <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-border/80 bg-background px-4 text-xs font-bold text-navy hover:bg-muted/50 transition-colors shadow-2xs">
          <ImageUp className="size-4" />
          {buttonLabel}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) setSource(URL.createObjectURL(file));
              event.currentTarget.value = '';
            }}
          />
        </label>
      );
    }

    return (
      <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-navy-light/40 bg-azure/60 text-navy hover:bg-azure border-dashed px-4 text-sm font-bold">
        <ImageUp className="size-4" />
        {buttonLabel}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) setSource(URL.createObjectURL(file));
            event.currentTarget.value = '';
          }}
        />
      </label>
    );
  }

  return (
    <div
      className="bg-navy/70 fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title || t('thumbnailCropDialog')}
    >
      <div className="bg-card w-full max-w-3xl rounded-3xl p-4 shadow-2xl sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-navy font-extrabold">
              {title || t('thumbnailCropTitle')}
            </h3>
            <p className="text-muted-foreground mt-1 text-xs">
              {body || t('thumbnailCropBody')}
            </p>
          </div>
          <button
            type="button"
            className="hover:bg-muted flex size-10 items-center justify-center rounded-full"
            onClick={() => setSource('')}
            aria-label={t('close')}
          >
            <X className="size-5" />
          </button>
        </div>
        <div
          className="bg-navy relative mt-4 overflow-hidden rounded-2xl max-h-[50vh] flex items-center justify-center"
          style={{ aspectRatio: String(aspect) }}
        >
          <Cropper
            image={source}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={completed}
          />
        </div>
        <label className="text-navy mt-4 flex items-center gap-3 text-sm font-semibold">
          {t('thumbnailZoom')}
          <input
            className="flex-1 accent-blue-700"
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
          />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setSource('')}>
            {t('cancel')}
          </Button>
          <Button
            type="button"
            disabled={!pixels || busy}
            onClick={async () => {
              if (!pixels) return;
              await onCrop(await cropImage(source, pixels, aspect));
              setSource('');
            }}
          >
            <Crop className="size-4" />
            {busy ? t('uploading') : t('thumbnailUseCrop')}
          </Button>
        </div>
      </div>
    </div>
  );
}
