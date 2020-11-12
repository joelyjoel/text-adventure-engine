import {SimpleNounPhraseParse} from '../grammar/parseTypings';
import {getDefinitions} from './words';
import {recursiveHypernyms, allWords} from './synsets';
import {Definition} from './node-wordnet';
import {createNounPredicate, createAdjectivePredicate} from '../linking';
import {VariableTable, Predicate, Variable} from '../logic';

export async function * wordnetInterpretSimpleNounPhrase({
  noun, 
  adjectives
}:SimpleNounPhraseParse, x:Variable) {
  let definitionDisjunctionGroups:Definition[][] = await Promise.all([
    getDefinitions(noun, 'n'),
    ...adjectives.map(adj => getDefinitions(adj, 'a')),
  ]);

  let claimDisjunctionGroups:VariableTable[][] = await Promise.all(
    definitionDisjunctionGroups.map(
      group => Promise.all(group.map(def => definitionToLogic(def, x)))
    )
  );

  for(let combination of combinate(...claimDisjunctionGroups)) {
    let table = new VariableTable;
    table.merge(...combination);
    yield table;
  }
}

export async function definitionToLogic(def: Definition, x='x'):Promise<VariableTable> {
  let claim = new VariableTable(x);

  let createPredicate: (word:string) => Predicate;
  if(def.pos == 'n')
    createPredicate = createNounPredicate;
  else if (def.pos == 'a')
    createPredicate = createAdjectivePredicate;
  else throw `Unexpected part of speech: ${def.pos}`;

  for(let synonym of def.synonyms)
    claim.assign({predicate: createPredicate(synonym), args:[x]}, 'T');

  for(let hypernym of allWords(...await recursiveHypernyms(def)))
    claim.assign({predicate: createPredicate(hypernym), args:[x]}, 'T');

  return claim;
}

function * combinate<T>(...groups: T[][]):Generator<T[]> {
  let indices = new Array(groups.length).fill(0, 0, groups.length);
  let increment = () => {
    for(let i=0; i < indices.length; ++i) {
      indices[i] = (indices[i] + 1) % groups[i].length;
      if(indices[i])
        break;
    }
  }

  let total = 1;
  for(let group of groups)
    total *= group.length;

  for(let n=0; n < total; ++n) {
    yield groups.map((group, i) => group[indices[i]]);
    increment();
  }
}
