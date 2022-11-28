export const compareStringVersion = (version1: string, version2: string) => {
  const arrStr1 = version1.split('.');
  const arrStr2 = version2.split('.');
  const n = arrStr1.length < arrStr2.length ? arrStr1.length : arrStr2.length;
  for (let i = 0; i < n; i++) {
    if (parseInt(arrStr1[i]) > parseInt(arrStr2[i])) {
      return true;
    } else if (parseInt(arrStr1[i]) < parseInt(arrStr2[i])) {
      return false;
    }
  }
  // if equal
  return true;
};
