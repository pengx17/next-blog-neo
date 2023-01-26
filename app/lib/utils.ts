export const getTweetIdFromUrl = (url: string) => {
  const m = url.match(/twitter\.com\/.*\/status\/(.*)/);
  if (!m) return null;
  return m[1];
};
