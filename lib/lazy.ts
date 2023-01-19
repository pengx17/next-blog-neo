export function lazy<T>(generator: () => T): { value: T } {
  let cache: T | undefined;

  const obj: { value: T } = {} as any;
  Object.defineProperty(obj, "value", {
    get() {
      if (cache) {
        return cache;
      }
      cache = generator();
      return cache;
    },
  });

  return obj;
}
