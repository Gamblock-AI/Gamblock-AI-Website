import type { ProgressSnapshot } from '@/hooks/use-progress-snapshot';
import { progressCategories, type ProgressCategory } from './progress-utils';

export interface PrintableProgressCopy {
  locale: string;
  title: string;
  instruction: string;
  privacy: string;
  generatedAt: string;
  range: string;
  rangeValue: string;
  summary: string;
  checkIns: string;
  activeDays: string;
  reflections: string;
  activity: string;
  date: string;
  noActivity: string;
  frameTitle: string;
  categories: Record<ProgressCategory, string>;
}

export function printProgressSnapshot(
  snapshot: ProgressSnapshot,
  copy: PrintableProgressCopy
) {
  return printHtmlDocument(
    buildPrintableProgressHtml(snapshot, copy),
    copy.frameTitle
  );
}

function buildPrintableProgressHtml(
  snapshot: ProgressSnapshot,
  copy: PrintableProgressCopy
) {
  const exportedAt = new Intl.DateTimeFormat(copy.locale, {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date());
  const rows = snapshot.activity_days.length
    ? snapshot.activity_days
        .map(
          (day) => `<tr>
            <td>${escapeHtml(formatPrintableDate(day.date, copy.locale))}</td>
            ${progressCategories.map((category) => `<td>${day[category]}</td>`).join('')}
          </tr>`
        )
        .join('')
    : `<tr><td colspan="7" class="empty">${escapeHtml(copy.noActivity)}</td></tr>`;

  return `<!doctype html>
<html lang="${escapeHtml(copy.locale)}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(copy.title)}</title>
    <style>
      @page { size: A4; margin: 16mm; }
      * { box-sizing: border-box; }
      body { margin: 0; color: #17264d; font: 14px/1.55 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      h1, h2, p { margin-top: 0; }
      h1 { margin-bottom: 8px; font-size: 26px; line-height: 1.2; }
      h2 { margin: 28px 0 12px; font-size: 17px; }
      .muted { color: #58647c; }
      .privacy { margin: 20px 0; padding: 12px 14px; border: 1px solid #cbd7e4; border-radius: 12px; background: #f3f8fb; }
      .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 20px; margin-top: 20px; }
      .meta p { margin: 0; }
      .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
      .metric { padding: 14px; border: 1px solid #d8e0e9; border-radius: 12px; }
      .metric strong { display: block; margin-top: 4px; font-size: 22px; }
      table { width: 100%; border-collapse: collapse; font-size: 11px; }
      th, td { padding: 8px 7px; border: 1px solid #d8e0e9; text-align: center; }
      th:first-child, td:first-child { text-align: left; }
      th { background: #edf7fb; font-weight: 700; }
      tr { break-inside: avoid; }
      .empty { padding: 20px; text-align: center !important; color: #58647c; }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(copy.title)}</h1>
    <p class="muted">${escapeHtml(copy.instruction)}</p>
    <div class="privacy">${escapeHtml(copy.privacy)}</div>
    <div class="meta">
      <p><strong>${escapeHtml(copy.generatedAt)}:</strong> ${escapeHtml(exportedAt)}</p>
      <p><strong>${escapeHtml(copy.range)}:</strong> ${escapeHtml(copy.rangeValue)}</p>
    </div>
    <h2>${escapeHtml(copy.summary)}</h2>
    <div class="summary">
      <div class="metric"><span>${escapeHtml(copy.checkIns)}</span><strong>${snapshot.check_in_count}</strong></div>
      <div class="metric"><span>${escapeHtml(copy.activeDays)}</span><strong>${snapshot.active_days}</strong></div>
      <div class="metric"><span>${escapeHtml(copy.reflections)}</span><strong>${snapshot.reflections}</strong></div>
    </div>
    <h2>${escapeHtml(copy.activity)}</h2>
    <table>
      <thead>
        <tr>
          <th>${escapeHtml(copy.date)}</th>
          ${progressCategories.map((category) => `<th>${escapeHtml(copy.categories[category])}</th>`).join('')}
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </body>
</html>`;
}

function formatPrintableDate(value: string, locale: string) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
}

function printHtmlDocument(html: string, title: string) {
  return new Promise<void>((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.title = title;
    iframe.tabIndex = -1;
    iframe.setAttribute('aria-hidden', 'true');
    Object.assign(iframe.style, {
      position: 'fixed',
      right: '0',
      bottom: '0',
      width: '1px',
      height: '1px',
      border: '0',
      opacity: '0',
      pointerEvents: 'none',
    });

    let cleanedUp = false;
    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      iframe.remove();
    };

    iframe.onerror = () => {
      cleanup();
      reject(new Error('Printable progress document could not be loaded'));
    };

    iframe.onload = () => {
      const printWindow = iframe.contentWindow;
      if (!printWindow || typeof printWindow.print !== 'function') {
        cleanup();
        reject(new Error('Browser print is unavailable'));
        return;
      }
      try {
        printWindow.focus();
        printWindow.addEventListener('afterprint', cleanup, { once: true });
        setTimeout(cleanup, 60000);

        setTimeout(() => {
          try {
            printWindow.print();
            resolve();
          } catch (error) {
            cleanup();
            reject(error);
          }
        }, 100);
      } catch (error) {
        cleanup();
        reject(error);
      }
    };
    iframe.srcdoc = html;
    document.body.appendChild(iframe);
  });
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      })[character] ?? character
  );
}
