import {VariableTable, Entity, Variable, createVariable} from '../logic'
import {NounPhraseParse, SimpleNounPhraseParse} from '../grammar/parseTypings';

interface Context {};

/**
 *
 */
export interface Interpretation {
  table: VariableTable;
  ctx: Context;
  returns: Variable | Entity | null;
  probability: number;
}

/**
 * A function which takes a parse and 
 */
export type Interpreter<ParseType> = (parse:ParseType, ctx:Context) => Generator<Interpretation>;

export function sequence<T>(...interpreters:Interpreter<T>[]): Interpreter<T> {
  return function *(parse: T, ctx:Context) {
    for(let interpreter of interpreters)
      for(let interpretation of interpreter(parse, ctx))
        yield interpretation;
  };
}

export function * contextFreeSNPInterpreter(parse:SimpleNounPhraseParse, ctx:Context) {
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
