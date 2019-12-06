export function getFirstWord(str:string) {
  let match = /^[\w'-]+/.exec(str)
  if(match)
    return match[0];
  else
    return str;
}