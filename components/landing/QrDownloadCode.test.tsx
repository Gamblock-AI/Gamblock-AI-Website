import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { QrDownloadCode } from './QrDownloadCode';

describe('QrDownloadCode', () => {
  it('renders an accessible SVG for the exact download URL', () => {
    const downloadURL =
      'https://github.com/Gamblock-AI/releases/download/v1/app.apk';

    const { container } = render(
      <QrDownloadCode
        value={downloadURL}
        title="Gamblock-AI Android download"
      />
    );

    expect(
      screen.getByRole('img', { name: 'Gamblock-AI Android download' })
    ).toBeInTheDocument();
    expect(container.querySelector('[data-qr-value]')).toHaveAttribute(
      'data-qr-value',
      downloadURL
    );
  });

  it('does not render a code for an empty URL', () => {
    const { container } = render(
      <QrDownloadCode value="   " title="Invalid download" />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
