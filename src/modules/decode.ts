import { randomChar } from './scrambleUtils';

export const keysAreSameLength = (keys: Array<string>) =>
	keys.length > 0 && keys.every((key) => key.length === keys[0].length);

export const decode = (str: string, key: string) => {
	const strArray: Array<string> = [...str];
	const mutateAt = Math.floor(Math.random() * strArray.length);

	if (strArray[mutateAt] !== key[mutateAt]) strArray[mutateAt] = randomChar(1);

	return strArray.join('');
};
