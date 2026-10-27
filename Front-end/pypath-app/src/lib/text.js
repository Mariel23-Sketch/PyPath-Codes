/* Small text helpers shared by pages. */
export const letter = (i) => String.fromCharCode(65 + i);

export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

export const lines = (s) => String(s || '').split('\n').map((x) => x.trim()).filter(Boolean);

export const nextId = (list, base = 0) => list.reduce((m, x) => Math.max(m, x.id), base) + 1;
