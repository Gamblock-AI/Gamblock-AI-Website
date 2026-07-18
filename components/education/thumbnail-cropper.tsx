'use client';

import { useCallback, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { Crop, ImageUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

async function cropImage(source: string, pixels: Area, width = 1600) {
  const image = new Image();
  image.src = source;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = Math.round((width * 9) / 16);
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
              new File([blob], `education-${Date.now()}.webp`, {
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
  onCrop,
}: {
  busy?: boolean;
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

  if (!source)
    return (
      <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-blue-400 bg-blue-50 px-4 text-sm font-bold text-blue-800 hover:bg-blue-100">
        <ImageUp className="size-4" />
        {t('thumbnailChooseCrop')}
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

  return (
    <div
      className="bg-navy/70 fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('thumbnailCropDialog')}
    >
      <div className="bg-card w-full max-w-3xl rounded-3xl p-4 shadow-2xl sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-navy font-extrabold">
              {t('thumbnailCropTitle')}
            </h3>
            <p className="text-muted-foreground mt-1 text-xs">
              {t('thumbnailCropBody')}
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
        <div className="bg-navy relative mt-4 aspect-video overflow-hidden rounded-2xl">
          <Cropper
            image={source}
            crop={crop}
            zoom={zoom}
            aspect={16 / 9}
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
              await onCrop(await cropImage(source, pixels));
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
