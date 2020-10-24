import {NounPhraseParse, PronounParse, SimpleNounPhraseParse, PredicateSyntaxParse} from '../grammar/parseTypings';
import {VariableTable, Entity, createVariable} from '../logic';
import {createNounPredicate, createAdjectivePredicate, createPredicateSyntaxPredicate} from '../linking/linking';

export function interpretSimplePresent(sentence: PredicateSyntaxParse):VariableTable {
  if(sentence.tense != 'simplePresent')
    throw 'Can only handle simplePresent tense (for now)';

  const table = new VariableTable;
  const args = [];

  for(let arg of sentence.args) {
    const npInterpretation = interpretNounPhraseParse(arg);
    table.merge(npInterpretation.table);
    args.push(npInterpretation.returning);
  }

  const predicate = createPredicateSyntaxPredicate(sentence);
  table.assign({predicate, args}, 'T');

  return table;
}

export function interpretNounPhraseParse(np:NounPhraseParse) {
  if(np.kind == 'simpleNounPhrase') {
    return interpretSimplNounPhraseParse(np);
  } else if(np.kind == 'pronoun')
    throw 'Gad zooks! We not sure how to interpret that.';
  else
    throw `Unexpected syntax kind: '${(np as NounPhraseParse).kind}'`;
}

export function interpretSimplNounPhraseParse(np:SimpleNounPhraseParse):{table: VariableTable, returning:Entity} {
  let e = createVariable();
  let table = new VariableTable(e);
  
  // Create the noun predicate
  table.assign({predicate: createNounPredicate(np.noun), args:[e]}, 'T');

  // Create the adjective predicates
  for(let adj of np.adjectives)
    table.assign(
      {predicate: createAdjectivePredicate(adj), args:[e]},
      'T',
    );

  return {returning: e, table};
}


