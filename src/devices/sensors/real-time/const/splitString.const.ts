export const splitString = (str: string, size: number) => {
  const regex = new RegExp(`.{1,${size}}`, 'g');
  return str.match(regex);
};
