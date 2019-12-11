export function getFirstWord(str:string) {
  let match = /^[\w'-]+/.exec(str)
  if(match)
    return match[0];
  else
    return str;
}

export function shiftWord(str:string):[string, string|null] {
  let firstWord = getFirstWord(str);

  return [
    firstWord,
    str.slice(firstWord.length).trim() || null,
  ]
}