export const splitString = (str: string, size: number) => {
  const regex = new RegExp(`.{1,${size}}`, 'g');
  const returningString = str.match(regex);
  return returningString;
};
