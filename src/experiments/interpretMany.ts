import {interpretSentenceOnce} from '../interpretation';
import {TruthTable} from '../logic';
import {mapFromSingleSentence, findImperfectMappings} from '../logic/mapping';

/**
 * Experimental function, interpretting many sentences.
 */
export async function interpretMany(...statements:string[]) {
  const interpretations = await Promise.all(
    statements.map(str => interpretSentenceOnce(str))
  );

  const table = new TruthTable;

  for(let addition of interpretations) {
    const mappings = findImperfectMappings(addition, table);
    if(mappings == null) {
      table.merge(addition.spawn());
    } else {
      if(mappings.length >= 1)
        table.merge(addition.implementPartialMapping(mappings[0].mapping));
      else
        table.merge(addition.spawn())
    }
  }
  
  return table;
}

interpretMany(
  'the table is in the room',
  'the mug is on the table',
).then(table => {
  console.log(table.symbol);
});
