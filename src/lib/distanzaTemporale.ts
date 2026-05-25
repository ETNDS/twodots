export function distanzaTemporale(createdAt: Date | string | null): string {
  if (!createdAt) return "";
  const diff = Date.now() - new Date(createdAt).getTime();
  const giorni = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (giorni < 7) return giorni <= 1 ? "ieri" : `${giorni} giorni fa`;
  const settimane = Math.floor(giorni / 7);
  if (settimane < 5) return settimane === 1 ? "1 settimana fa" : `${settimane} settimane fa`;
  const mesi = Math.floor(giorni / 30);
  if (mesi < 12) return mesi === 1 ? "1 mese fa" : `${mesi} mesi fa`;
  const anni = Math.floor(giorni / 365);
  return anni === 1 ? "1 anno fa" : `${anni} anni fa`;
}
