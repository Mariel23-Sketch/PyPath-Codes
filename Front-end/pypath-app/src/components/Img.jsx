import { useState } from 'react';

export const IMG = `${import.meta.env.BASE_URL}assets/img/`;

/* dashed placeholder shown when a picture file is missing (same as the old PP.phSrc) */
function placeholder(label) {
  const t = String(label || 'Image').replace(/[<>&"]/g, '');
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect x="3" y="3" width="114" height="114" rx="18" fill="#eef5ff" stroke="#8fb3e6" stroke-width="3" stroke-dasharray="8 6"/>'
    + '<text x="60" y="66" text-anchor="middle" font-family="Segoe UI,Arial,sans-serif" font-size="15" font-weight="700" fill="#5b86c4">' + t + '</text></svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/* <Img file="mascot-wave.png" label="Mascot" /> loads from public/assets/img and falls back to a placeholder box */
export default function Img({ file, label = 'Image', className = '', alt = '' }) {
  const [failed, setFailed] = useState(false);
  const cls = `${className}${failed ? ' ph-missing' : ''}`.trim();
  return (
    <img
      className={cls || undefined}
      src={failed ? placeholder(label) : IMG + file}
      alt={alt}
      onError={() => setFailed(true)}
    />
  );
}
