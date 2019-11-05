import { Parse } from "./Parse";

const articleRegex = /^(?:the|an|a)(?=\s)/i;
const demonstrativeRegex = /^(this|that)(?=\s)/
const possessiveRegex = /^(?:my|your|his|her|its|our|their|[\w ]+\'s)(?=\s)/i;

export interface IdentifierParse extends Parse {
  identifier: string;
  pos: 'article' | 'demonstrative' | 'possessive'
}

export function parseArticle(str:string) : (IdentifierParse|null) {
  let parse = articleRegex.exec(str);
  if(parse) {
    return {
      identifier: parse[0],
      pos: 'article',
      from: 0,
      to: parse[0].length,
      str,
    };
  } else
    return null;
}

export function parseDemonstrative(str:string) : (IdentifierParse|null) {
  let parse = demonstrativeRegex.exec(str);
  if(parse) {
    return {
      identifier: parse[0],
      pos: 'demonstrative',
      from: 0, to: parse[0].length,
      str,
    };
  } else
    return null;
}

export function parsePossessive(str: string): (IdentifierParse|null) {
  let parse = possessiveRegex.exec(str);
  if(parse) {
    return {
      identifier: parse[0],
      pos: 'possessive',
      from: 0, to: parse[0].length,
      str,
    };
  } else
    return null;
}

export function parseIdentifier(str:string): (IdentifierParse|null) {
  return parseArticle(str) 
    || parsePossessive(str) 
    || parseDemonstrative(str)
}