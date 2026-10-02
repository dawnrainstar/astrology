import { SavedReading, UserAccount } from '../types';

const READINGS_STORAGE_PREFIX = 'omnioracle_readings_';

export function getUserReadingsKey(userId?: string): string {
  return `${READINGS_STORAGE_PREFIX}${userId || 'guest'}`;
}

export function loadUserReadings(userId?: string): SavedReading[] {
  try {
    const key = getUserReadingsKey(userId);
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
    // Also check legacy key if guest or first load
    const legacy = localStorage.getItem('divination_journal_entries');
    if (legacy && (!userId || userId === 'guest')) {
      const parsed: SavedReading[] = JSON.parse(legacy);
      localStorage.setItem(key, JSON.stringify(parsed));
      return parsed;
    }
    return [];
  } catch (e) {
    console.error('Error loading readings:', e);
    return [];
  }
}

export function saveUserReadings(readings: SavedReading[], userId?: string): void {
  try {
    const key = getUserReadingsKey(userId);
    localStorage.setItem(key, JSON.stringify(readings));
    // Maintain backwards compatibility
    if (!userId || userId === 'guest') {
      localStorage.setItem('divination_journal_entries', JSON.stringify(readings));
    }
  } catch (e) {
    console.error('Error saving readings:', e);
  }
}

// Generate Printable Divination Dossier (HTML)
export function generatePrintableReport(reading: SavedReading, user?: UserAccount | null): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate the printable divination dossier.');
    return;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>OmniOracle Divination Dossier - ${reading.title}</title>
  <style>
    body {
      font-family: 'Georgia', serif;
      background: #0f111a;
      color: #e2e8f0;
      padding: 40px 20px;
      line-height: 1.6;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: #16192b;
      border: 2px solid #d4af37;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.8);
    }
    .header {
      text-align: center;
      border-bottom: 1px solid rgba(212,175,55,0.4);
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .title {
      font-size: 28px;
      color: #facc15;
      letter-spacing: 2px;
      margin: 0 0 10px 0;
      text-transform: uppercase;
    }
    .subtitle {
      font-size: 13px;
      color: #94a3b8;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .meta-box {
      background: rgba(0,0,0,0.3);
      border-left: 4px solid #d4af37;
      padding: 15px 20px;
      margin-bottom: 25px;
      border-radius: 4px;
    }
    .meta-item {
      font-size: 14px;
      margin: 4px 0;
    }
    .meta-label {
      color: #facc15;
      font-weight: bold;
    }
    .content {
      font-size: 15px;
      color: #cbd5e1;
      white-space: pre-wrap;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid rgba(212,175,55,0.3);
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }
    @media print {
      body { background: white; color: black; padding: 0; }
      .container { border: 1px solid #999; box-shadow: none; background: white; color: black; }
      .title, .meta-label { color: #854d0e; }
      .content { color: #1e293b; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title">OMNIORACLE</div>
      <div class="subtitle">Sacred Divination Dossier & Cosmic Record</div>
    </div>

    <div class="meta-box">
      <div class="meta-item"><span class="meta-label">Seeker:</span> ${user?.name || 'Anonymous Seeker'} (${user?.tier === 'creator' ? 'Oracle Keeper 👑' : user?.tier || 'Free Tier'})</div>
      <div class="meta-item"><span class="meta-label">Divination Rite:</span> ${reading.type.toUpperCase()}</div>
      <div class="meta-item"><span class="meta-label">Date of Consultation:</span> ${reading.date}</div>
      <div class="meta-item"><span class="meta-label">Intention / Query:</span> ${reading.question || 'General Guidance'}</div>
      <div class="meta-item"><span class="meta-label">Subject:</span> ${reading.title}</div>
    </div>

    <h3>Oracle Synthesis & Reading Record</h3>
    <div class="content">${reading.fullReading || reading.summary}</div>

    <div class="footer">
      Generated via OmniOracle Divine Intelligence System • Sacred Hermetic Synthesis
    </div>
  </div>
  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>
`;

  printWindow.document.write(html);
  printWindow.document.close();
}

// Export Reading as Markdown
export function exportReadingAsMarkdown(reading: SavedReading, user?: UserAccount | null): void {
  const md = `# OMNIORACLE DIVINATION RECORD
**Oracle:** OmniOracle Esoteric Synthesis
**Date:** ${reading.date}
**Seeker:** ${user?.name || 'Anonymous Seeker'} (${user?.tier || 'Free'})
**Method:** ${reading.type.toUpperCase()}
**Subject:** ${reading.title}
**Inquiry:** ${reading.question || 'General Inquiry'}

---

## Oracle Synthesis
${reading.fullReading || reading.summary}

---
*Generated by OmniOracle - Unlock the hidden language of fate.*
`;

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `omnioracle-${reading.type}-${Date.now()}.md`;
  a.click();
}
