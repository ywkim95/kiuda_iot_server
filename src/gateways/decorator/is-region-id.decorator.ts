export function IsRegionId() {
  return (target: any, propertyKey: string) => {
    Object.defineProperty(target, propertyKey, {
      get: () => {
        return this[propertyKey];
      },
      set: (value: string) => {
        this[propertyKey] = value.padStart(3, '0');
      },
    });
  };
}
