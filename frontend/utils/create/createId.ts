export function createId(): string {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const first = letters[Math.floor(Math.random() * letters.length)];
  const random = Math.random().toString(36).substring(2, 10);
  const timestamp = Date.now().toString(36);
  return `id-${first}${random}-${timestamp}`;
}