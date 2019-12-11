import { Entity, Sentence } from ".";
import { Variable } from "./Variable";
import { TruthTable } from "./TruthTable";
import { VariableTable } from "./VariableTable";

export type PartialMapping = (Entity|null)[]
type CompleteMapping = Entity[];

export function findMappings(claim:VariableTable, onto:TruthTable) {
  // Get partial mappings for each sentence in the claim
  let accumulatedMappings:PartialMapping[] = [new Array(claim.numberOfVariables)
    .fill(null)];
  for(let statement of claim.iterate()) {
    let partialMappings = mapFromSingleSentence(claim.variables, statement, onto);

    let combinedMappings:PartialMapping[] = []
    for(let a of partialMappings) {
      for(let b of accumulatedMappings) {
        let c = combinePartialMappings(a, b);
        if(c)
          combinedMappings.push(c)
      }
    }

    if(combinedMappings.length == 0)
      return null
    accumulatedMappings = combinedMappings;
  }

  return accumulatedMappings
}

/** Combine two partial mappings, returns `null` if they are incompatible. Order of arguments doesn't matter. This operation is associative. */
export function combinePartialMappings(
  a:PartialMapping, 
  b:PartialMapping
):(PartialMapping|null) {
  if(a.length == b.length) {
    let c:PartialMapping = [];
    for(let i in a)
      if(a[i] == b[i] || b[i] === null)
        c[i] = a[i]
      else if(a[i] == null)
        c[i] = b[i]
      else
        return null
    return c
  } else
    return null
}



/** Check for equality between two partial mappings */
export function compareMappings(
  a: PartialMapping,
  b: PartialMapping
) {
  return a.length == b.length && a.every((x, i) => x == b[i])
}




/** Get a symbol for a partial mapping. */
export function mappingSymbol(mapping: PartialMapping) {
  return mapping.map(x => x ? x.symbol : '?').join(' ')
}




type ScoredMappings = {
  [key:string]:{mapping: PartialMapping, score:number}
}


export function findImperfectMappings(
  claim:VariableTable, onto:TruthTable
) {
  let accumulation:ScoredMappings = {};

  /** Update the score of a mapping in a scored mappings set if it is greater than the existing score */
  const update = (
    set:ScoredMappings, 
    mapping:PartialMapping, 
    score = 1, 
    /** Use to avoid re-calculating the symbol  */
    symbol = mappingSymbol(mapping)
  ) => {
    if(!set[symbol])
      set[symbol] = {mapping, score}
    else
      set[symbol].score = score > set[symbol].score ? score : set[symbol].score
  }

  // For each statement in the claim
  for(let statement_mappings of generatePartialMappings(claim, onto)) {
    let matches:ScoredMappings = {}
    for(let statement_mapping of statement_mappings) {
      update(matches, statement_mapping)

      for(let i in accumulation) {
        let combined_mapping = combinePartialMappings(
          statement_mapping,
          accumulation[i].mapping
        )

        if(combined_mapping)
          update(matches, combined_mapping, accumulation[i].score + 1)
      }
    }
  
    // Merge matches back into accumulation
    for(let symbol in matches)
      update(
        accumulation, 
        matches[symbol].mapping, 
        matches[symbol].score, 
        symbol
      )
  }

  return Object.values(accumulation)
    .sort((a, b) => b.score - a.score)
}



export function *generatePartialMappings(claim:VariableTable, onto:TruthTable) {
  for(let statement of claim.iterate())
    yield [...mapFromSingleSentence(claim.variables, statement, onto)]
}



/** Generate the partial mappings from a single sentence (with varaibles) onto a truth table */
export function *mapFromSingleSentence(
  variables: Variable[], 
  from: {sentence:Sentence, truth:string}, 
  onto: TruthTable
) {
  const {sentence, truth} = from
  
  // Identify the position of variables in the sentence args
  const constantPositions = sentence.args
    .map((e,i) => i)
    .filter(i => !variables.includes(sentence.args[i]))
  const varPositions = identifyVarPositions(variables, sentence);
  const duplicatePositions:number[][] = varPositions
    .filter(arr => arr !== null && arr.length > 1) as number[][]

  // Find all sentences with a matching predicate.
  let candidates = onto.byPredicate(sentence.predicate); 

  // Filter candidate sentences for a fit
  for(let fact of candidates) {
    if(fact.truth == truth
    && constantPositions.every(i => sentence.args[i] == fact.sentence.args[i])
    && duplicatePositions.every(indexs => {
      for(let i=1; i<indexs.length; ++i)
        if(fact.sentence.args[0] != fact.sentence.args[i])
          return false;

      return true;
    })) {
      // Yield a partial mapping
      yield varPositions.map((indexs, i) => {
        if(indexs)
          return fact.sentence.args[indexs[0]]
        else
          return null;
      })
    }
  }
}



/* Identify the position of variables in the sentence args. */
export function identifyVarPositions(
  variables:Variable[], 
  sentence:Sentence
):(number[]|null)[] {
  return variables.map(x => {
    let list = [];
    for(let i=0; i<sentence.args.length; ++i)
      if(sentence.args[i] == x)
        list.push(i)

    return list.length ? list : null;
  })
}