'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import {
  Crop,
  ImageUp,
  RotateCcw,
  RotateCw,
  Trash2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AvatarImage } from '@/components/account/avatar-image';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { OptionalMark } from '@/components/common/form-field';

const MAX_SOURCE_BYTES = 8 << 20;
const MAX_AVATAR_BYTES = 2 << 20;

type DialogMode = 'actions' | 'crop' | 'confirm-delete';

function radians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function rotatedSize(width: number, height: number, rotation: number) {
  const angle = radians(rotation);
  return {
    width:
      Math.abs(Math.cos(angle) * width) + Math.abs(Math.sin(angle) * height),
    height:
      Math.abs(Math.sin(angle) * width) + Math.abs(Math.cos(angle) * height),
  };
}

async function cropAvatar(source: string, pixels: Area, rotation: number) {
  const image = new Image();
  image.src = source;
  await image.decode();

  const rotated = rotatedSize(image.width, image.height, rotation);
  const sourceCanvas = document.createElement('canvas');
  sourceCanvas.width = Math.round(rotated.width);
  sourceCanvas.height = Math.round(rotated.height);
  const sourceContext = sourceCanvas.getContext('2d');
  if (!sourceContext) throw new Error('Canvas is unavailable');
  sourceContext.translate(sourceCanvas.width / 2, sourceCanvas.height / 2);
  sourceContext.rotate(radians(rotation));
  sourceContext.drawImage(image, -image.width / 2, -image.height / 2);

  const cropped = sourceContext.getImageData(
    pixels.x,
    pixels.y,
    pixels.width,
    pixels.height
  );
  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = pixels.width;
  croppedCanvas.height = pixels.height;
  const croppedContext = croppedCanvas.getContext('2d');
  if (!croppedContext) throw new Error('Canvas is unavailable');
  croppedContext.putImageData(cropped, 0, 0);

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = 512;
  outputCanvas.height = 512;
  const outputContext = outputCanvas.getContext('2d');
  if (!outputContext) throw new Error('Canvas is unavailable');
  outputContext.drawImage(croppedCanvas, 0, 0, 512, 512);

  const blob = await new Promise<Blob>((resolve, reject) =>
    outputCanvas.toBlob(
      (result) =>
        result ? resolve(result) : reject(new Error('Image export failed')),
      'image/webp',
      0.9
    )
  );
  if (blob.size > MAX_AVATAR_BYTES) {
    throw new Error('avatar_output_too_large');
  }
  return new File([blob], 'avatar.webp', { type: 'image/webp' });
}

export function AvatarPhotoDialog({
  open,
  onOpenChange,
  avatarUrl,
  avatarAlt,
  fallback,
  onUpload,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  avatarUrl?: string;
  avatarAlt: string;
  fallback: ReactNode;
  onUpload: (file: File) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
}) {
  const t = useTranslations('profileWorkspace');
  const [mode, setMode] = useState<DialogMode>('actions');
  const [source, setSource] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pixels, setPixels] = useState<Area | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const complete = useCallback(
    (_area: Area, cropped: Area) => setPixels(cropped),
    []
  );

  const clearEditor = useCallback(() => {
    setSource((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setPixels(null);
  }, []);

  const close = useCallback((force = false) => {
    if (submitting && !force) return;
    clearEditor();
    setError(null);
    setMode('actions');
    onOpenChange(false);
  }, [clearEditor, onOpenChange, submitting]);

  useEffect(() => () => clearEditor(), [clearEditor]);

  const startCrop = (file: File) => {
    if (file.size > MAX_SOURCE_BYTES) {
      setError(t('avatarSourceTooLarge'));
      return;
    }
    clearEditor();
    setError(null);
    setSource(URL.createObjectURL(file));
    setMode('crop');
  };

  const resetCrop = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const submitCrop = async () => {
    if (!source || !pixels || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const file = await cropAvatar(source, pixels, rotation);
      if (await onUpload(file)) close(true);
    } catch (caught) {
      setError(
        caught instanceof Error && caught.message === 'avatar_output_too_large'
          ? t('avatarOutputTooLarge')
          : t('avatarUploadError')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const submitDelete = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      if (await onDelete()) close(true);
    } finally {
      setSubmitting(false);
    }
  };

  const renderActions = () => (
    <>
      <DialogHeader className="items-center text-center">
        <AvatarImage
          avatarUrl={avatarUrl}
          alt={avatarAlt}
          fallback={fallback}
          className="bg-azure text-navy flex size-24 items-center justify-center rounded-3xl"
        />
        <DialogTitle className="text-navy">{t('avatarDialogTitle')}</DialogTitle>
        <DialogDescription>{t('avatarDialogBody')}</DialogDescription>
      </DialogHeader>
      <div className="grid gap-2">
        <label className="bg-navy text-primary-foreground hover:bg-navy/90 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors">
          <ImageUp className="size-4" aria-hidden="true" />
          {t('avatarChoose')}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.currentTarget.value = '';
              if (file) startCrop(file);
            }}
          />
        </label>
        {avatarUrl ? (
          <Button
            type="button"
            variant="outline"
            className="text-crimson hover:text-crimson"
            onClick={() => {
              setError(null);
              setMode('confirm-delete');
            }}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            {t('avatarRemove')}
          </Button>
        ) : null}
        {error ? (
          <p className="text-crimson text-center text-xs" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </>
  );

  const renderCropper = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-navy">{t('avatarCropTitle')}</DialogTitle>
        <DialogDescription>{t('avatarCropBody')}</DialogDescription>
      </DialogHeader>
      <div className="bg-navy relative aspect-square overflow-hidden rounded-2xl">
        {source ? (
          <Cropper
            image={source}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={complete}
          />
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={submitting}
          onClick={() => setRotation((value) => (value + 270) % 360)}
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          {t('avatarRotateLeft')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={submitting}
          onClick={() => setRotation((value) => (value + 90) % 360)}
        >
          <RotateCw className="size-4" aria-hidden="true" />
          {t('avatarRotateRight')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={submitting}
          onClick={resetCrop}
        >
          {t('avatarReset')}
        </Button>
      </div>
      <label className="text-navy flex items-center gap-3 text-sm font-semibold">
        <span className="flex items-center">
          <span>{t('avatarZoom')}</span>
          <OptionalMark />
        </span>
        <input
          className="flex-1 accent-blue-700"
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          disabled={submitting}
          onChange={(event) => setZoom(Number(event.target.value))}
        />
      </label>
      {error ? (
        <p className="text-crimson text-xs" role="alert">
          {error}
        </p>
      ) : null}
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={() => {
            clearEditor();
            setError(null);
            setMode('actions');
          }}
        >
          {t('avatarCancel')}
        </Button>
        <Button
          type="button"
          disabled={!pixels || submitting}
          onClick={() => void submitCrop()}
        >
          <Crop className="size-4" aria-hidden="true" />
          {submitting ? t('avatarUploading') : t('avatarUseCrop')}
        </Button>
      </DialogFooter>
    </>
  );

  const renderDeleteConfirmation = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-navy">{t('avatarDeleteTitle')}</DialogTitle>
        <DialogDescription>{t('avatarDeleteBody')}</DialogDescription>
      </DialogHeader>
      {error ? (
        <p className="text-crimson text-xs" role="alert">
          {error}
        </p>
      ) : null}
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={() => setMode('actions')}
        >
          {t('avatarCancel')}
        </Button>
        <Button
          type="button"
          variant="destructive"
          disabled={submitting}
          onClick={() => void submitDelete()}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          {t('avatarRemove')}
        </Button>
      </DialogFooter>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? close() : undefined)}>
      <DialogContent
        className="max-h-[min(90dvh,44rem)] overflow-y-auto sm:max-w-md"
        showCloseButton={!submitting}
      >
        {mode === 'actions'
          ? renderActions()
          : mode === 'crop'
            ? renderCropper()
            : renderDeleteConfirmation()}
      </DialogContent>
    </Dialog>
  );
}
