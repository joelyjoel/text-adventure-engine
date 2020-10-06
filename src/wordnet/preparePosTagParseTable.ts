import {ParseTable} from '../grammar/Grammar';
import {posTagString} from './pos-tagging';

export async function preparePosTagParseTable(str:string[]):Promise<ParseTable<string, string>> {
  const taggedString = await posTagString(str);
  const table:ParseTable<string, string> = [];

  for(let i=0; i<taggedString.length; ++i) {
    for(let tag of taggedString[i].posTags)
      table.push([i, '_'+tag, i+1]);
  }     

  return table;
}
