import { Parse } from "./Parse";
export interface ProperNounParse extends Parse {
  pos: 'proper_noun',
  properNoun: string,
}

export const properNounRegex = /^[A-Z]\w*(?: [A-Z]\w*)*$/;

export function parseProperNoun(str:string) : ProperNounParse|null {
  let parse = properNounRegex.exec(str);
  if(parse)
    return {
      syntaxKind: 'proper_noun',
      pos: 'proper_noun',
      properNoun: str,
      from: 0, 
      to: str.length,
      str
    };
  else
    return null;
}