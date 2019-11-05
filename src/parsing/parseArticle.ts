const articleRegex = /^(?:the|an|a)(?=\s)/i;
const demonstrativeRegex = /^(this|that)(?=\s)/
const possessiveRegex = /^(?:my|your|his|her|its|our|their|[\w ]+\'s)(?=\s)/i;

export function parseArticle(str:string) {
  let parse = articleRegex.exec(str);
  if(parse) {
    return {
      article: parse[0],
      postArticle: str.slice(parse[0].length).trim(),
      str,
    };
  } else
    return null;
}

export function parseDemonstrative(str:string) {
  let parse = demonstrativeRegex.exec(str);
  if(parse) {
    return {
      demonstrative: parse[0],
      postArticle: str.slice(parse[0].length).trim(),
      str,
    };
  } else
    return null;
}

export function parsePossessive(str: string) {
  let parse = possessiveRegex.exec(str);
  if(parse) {
    return {
      possessive: parse[0],
      postArticle: str.slice(parse[0].length).trim(),
      str,
    };
  } else
    return null;
}

export function parseIdentifier(str:string) {
  return parseArticle(str) 
    || parsePossessive(str) 
    || parseDemonstrative(str)
}