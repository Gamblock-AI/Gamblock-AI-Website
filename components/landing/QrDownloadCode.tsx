'use client';

import { QRCodeSVG } from 'qrcode.react';

interface QrDownloadCodeProps {
  value: string;
  title: string;
}

export function QrDownloadCode({ value, title }: QrDownloadCodeProps) {
  const normalizedValue = value.trim();

  if (!normalizedValue) return null;

  return (
    <div
      className="inline-flex rounded-2xl bg-white p-3 shadow-[0_12px_30px_-18px_rgba(20,52,100,0.45)]"
      data-qr-value={normalizedValue}
    >
      <QRCodeSVG
        value={normalizedValue}
        size={224}
        level="M"
        marginSize={4}
        fgColor="#081a39"
        bgColor="#ffffff"
        role="img"
        aria-label={title}
        title={title}
      />
    </div>
  );
}
