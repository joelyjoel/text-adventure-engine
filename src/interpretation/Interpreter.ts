import {VariableTable, createVariable, Entity, Variable, createEntity} from '../logic'
import {createNounPredicate, createAdjectivePredicate} from '../linking/';
import {SimpleNounPhraseParse, NounPhraseParse} from '../grammar/parseTypings';
import {findImperfectMappings, completePartialMapping} from '../logic/mapping';
import {Context} from './Context';

/**
 *
 */
export interface Interpretation {
  /**
    The context as altered by this interpretation, should it be accepted.
  */
  ctx: Context;

  /**
    The return value of the interpretation if it is used as an argument inside
    a larger structure.
    */
  returns: Variable | Entity | null;
  confidence?: number;
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

export function * contextFreeSNPInterpreter(parse:SimpleNounPhraseParse, ctx:Context): Generator<Interpretation>{
  let newCtx = new Context(ctx);
  let present = newCtx.present;
  
  let returns = createEntity();

  // Create the noun predicate
  present.assign({predicate: createNounPredicate(parse.noun), args:[returns]}, 'T');

  // Create the adjective predicates
  for(let adj of parse.adjectives)
    present.assign(
      {predicate: createAdjectivePredicate(adj), args:[returns]},
      'T',
    );

  yield {returns, ctx: newCtx};
}

export function * pureLogicalSNPInterpreter(parse: SimpleNounPhraseParse, ctx:Context): Generator<Interpretation> {
  let x = createVariable();
  let claim = new VariableTable();

  // Create the noun predicate
  claim.assign({predicate: createNounPredicate(parse.noun), args:[x]}, 'T');

  // Create the adjective predicates
  for(let adj of parse.adjectives)
    claim.assign(
      {predicate: createAdjectivePredicate(adj), args:[x]},
      'T',
    );

  for(let {mapping} of findImperfectMappings(claim, ctx.present)) {
    // Create a new context
    const newCtx = new Context(ctx);
    const completeMapping = completePartialMapping(mapping);

    // Add the mapping to the new table
    newCtx.present.merge(claim.implement(...completeMapping));

    // Return value is always the first (and only) arg in the mapping.
    const [returns] = completeMapping;
    newCtx.addMention( parse, returns );

    yield {ctx: newCtx, returns};
  }
}




function variableInterpretation(
  np: SimpleNounPhraseParse,
) {
  let x = createVariable();
  let claim = new VariableTable();

  // Create the noun predicate
  claim.assign({predicate: createNounPredicate(np.noun), args:[x]}, 'T');

  // Create the adjective predicates
  for(let adj of np.adjectives)
    claim.assign(
      {predicate: createAdjectivePredicate(adj), args:[x]},
      'T',
    );

  return {claim, x};
}

function *interpretSimpleNounPhrase(
  np: SimpleNounPhraseParse,
  ctx: Context
): Generator<Interpretation> {
  let {claim, x} = variableInterpretation(np);

  if(np.article == 'the') {
    // Find recent np that are a logical match.
    // Score them depending on number of introductions etc
    for(let mention of ctx.iterateAnaphora()) {
      let initialMapping:PartialMapping = [mention.returns];
      for(let mapping of findImperfectMappings(claim, ctx.present)) {

      }
    }
  } else
    return ;
}


