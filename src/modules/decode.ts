import {randomChar} from './scrambleUtils';

export const keysAreSameLength = (keys: Array<string>) => keys.map(key => key.length === keys[0].length).length === keys.length

export const decode = (str: string, key: string) => {
  const strArray: Array<string> = [...str];
  let mutateAt = Math.floor(Math.random() * strArray.length);

  if (strArray[mutateAt] !== key[mutateAt]) strArray[mutateAt] = randomChar(1);

  return strArray.join('')
}
