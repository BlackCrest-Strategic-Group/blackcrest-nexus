export function makeNotice(type, message) {
  return { id: `${Date.now()}-${Math.random()}`, type, message };
}
