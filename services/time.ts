export function secondsToTime(seconds: number): string {
  if (isNaN(seconds)) return 'unknown';
  const minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds - minutes * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
