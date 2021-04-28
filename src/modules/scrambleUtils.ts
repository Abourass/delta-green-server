// utility fn to get a random character
export const randomChar = (length: number = 1): string => {
  const randomStr = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, length);
  if (' \t\n\r\v'.indexOf(randomStr) < 0) return randomStr;
  return randomChar(length);
};

export const randomCreep = (length = 1) => randomChar(length)
