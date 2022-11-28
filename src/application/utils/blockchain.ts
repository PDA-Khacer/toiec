// /address/0x68d1569d1a6968f194b4d93f8d0b416c123a599f#tokentxns
export function formatAddressHrefBSCScan(input: string): string {
  if (input.length > 42) {
    const index = input.indexOf('0x', 0);
    return input.substring(index, index + 42);
  }
  if (input.length == 42) {
    return input;
  }
  return '';
}

export function checkAgeTransaction(age: string, dayOut: number) {
  const subTime =
    Math.abs(new Date().getTime() - new Date(age).getTime()) / 86400000;
  return subTime < dayOut;
}
