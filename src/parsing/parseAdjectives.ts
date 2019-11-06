import { Dictionary } from "../Dictionary";
import { Parse } from "./Parse";
import { Adjective } from "../Adjective";

export interface AdjectiveParse extends Parse {
  pos: 'adjective';
  adj: Adjective;
}

/** Pop the last adjective from a list. */
export function parseLastAdjective(str:string, dict:Dictionary) : (AdjectiveParse|null) {
  let lastWord = str.slice(str.lastIndexOf(' ') + 1);

  let adjs = dict.adjectiveIndex[lastWord];
  let adj;
  if(!adjs)
    return null;
  if(adjs.length == 1)
    adj = adjs.find(n => str.slice(-n.str.length) == n.str);

  if(adj)
    return {
      pos:'adjective',
      adj: adj,
      from: str.length - adj.str.length,
      to: str.length,
      str
    }
  else
    return null
}

/** Parse a series of multiple adjectives */
export function parseAdjectives(
  str:string, 
  dict:Dictionary
):AdjectiveParse[]|null {
  const wholeStr = str;
  const list:AdjectiveParse[] = []
  while(str.length) {
    let adj = parseLastAdjective(str, dict);
    if(adj) {
      list.push(adj);
      str = str.slice(0, adj.from).trim();
    } else
      return null;
  }

  return list.reverse()
}