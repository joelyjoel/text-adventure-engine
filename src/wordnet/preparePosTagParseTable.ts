import {ParseTable} from '../grammar/Grammar';
import {posTagString} from './pos-tagging';
import {isMorphologyRelation} from '../morphology'

export async function preparePosTagParseTable(str:string[]):Promise<ParseTable<string, string>> {
  const taggedString = await posTagString(str);
  const table:ParseTable<string, string> = [];

  for(let i=0; i<taggedString.length; ++i) {
    for(let tag of taggedString[i].posTags)
      // JOEL START HERE
      if(typeof tag === 'string')
        table.push([i, '_'+tag, i+1]);
      else if(isMorphologyRelation(tag))
        table.push([i, '_'+tag.form, i+1, () => tag])
      else
        throw "Something bad happened.";
  }     

  return table;
}
