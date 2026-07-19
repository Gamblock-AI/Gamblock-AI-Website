'use client';

import { useCallback, useEffect, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { Crop, ImageUp, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

const MAX_SOURCE_BYTES = 8 << 20;

async function cropAvatar(source: string, pixels: Area) {
  const image = new Image();
  image.src = source;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
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
          ? resolve(new File([blob], 'avatar.webp', { type: 'image/webp' }))
          : reject(new Error('Image export failed')),
      'image/webp',
      0.9
    )
  );
}

export function AvatarCropper({
  busy,
  onCrop,
}: {
  busy?: boolean;
  onCrop: (file: File) => Promise<void>;
}) {
  const t = useTranslations('profileWorkspace');
  const [source, setSource] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixels, setPixels] = useState<Area | null>(null);
  const [error, setError] = useState<string | null>(null);
  const complete = useCallback(
    (_area: Area, cropped: Area) => setPixels(cropped),
    []
  );

  useEffect(() => {
    return () => {
      if (source) URL.revokeObjectURL(source);
    };
  }, [source]);

  const clear = () => {
    if (source) URL.revokeObjectURL(source);
    setSource('');
    setPixels(null);
    setError(null);
  };

  if (!source) {
    return (
      <div>
        <label className="border-navy/20 text-navy hover:bg-navy/[0.04] inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors">
          <ImageUp className="size-4" aria-hidden="true" />
          {t('avatarChoose')}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.currentTarget.value = '';
              if (!file) return;
              if (file.size > MAX_SOURCE_BYTES) {
                setError(t('avatarSourceTooLarge'));
                return;
              }
              setError(null);
              setSource(URL.createObjectURL(file));
            }}
          />
        </label>
        {error ? (
          <p className="text-crimson mt-2 text-xs" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className="bg-navy/70 fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('avatarCropDialog')}
    >
      <div className="bg-card w-full max-w-xl rounded-3xl p-4 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-navy font-extrabold">{t('avatarCropTitle')}</h3>
            <p className="text-muted-foreground mt-1 text-xs leading-5">
              {t('avatarCropBody')}
            </p>
          </div>
          <button
            type="button"
            onClick={clear}
            className="hover:bg-muted flex size-10 shrink-0 items-center justify-center rounded-full"
            aria-label={t('avatarCancel')}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="bg-navy relative mt-4 aspect-square overflow-hidden rounded-2xl">
          <Cropper
            image={source}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={complete}
          />
        </div>
        <label className="text-navy mt-4 flex items-center gap-3 text-sm font-semibold">
          {t('avatarZoom')}
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
          <Button type="button" variant="outline" onClick={clear}>
            {t('avatarCancel')}
          </Button>
          <Button
            type="button"
            disabled={!pixels || busy}
            onClick={async () => {
              if (!pixels) return;
              await onCrop(await cropAvatar(source, pixels));
              clear();
            }}
          >
            <Crop className="size-4" aria-hidden="true" />
            {busy ? t('avatarUploading') : t('avatarUseCrop')}
          </Button>
        </div>
      </div>
    </div>
  );
}
