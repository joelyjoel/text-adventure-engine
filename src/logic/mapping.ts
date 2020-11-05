import { Entity, Sentence, Variable, createEntity } from ".";
import { TruthTable } from "./TruthTable";
import { VariableTable } from "./VariableTable";

export type PartialMapping = (Entity|null)[]
type CompleteMapping = Entity[];

export function blankPartialMapping(numberOfVariables:number) {
  return new Array(numberOfVariables).fill(null);
}

export function findMappings<TruthValue extends string>(
  claim:VariableTable<TruthValue>, 
  onto:TruthTable<TruthValue>|TruthTable<TruthValue>[], 
  given:PartialMapping[] = [blankPartialMapping(claim.numberOfVariables)]
):PartialMapping[]|null {

  // Start with the given list or a blank (completely indifferent partial mapping.)
  let accumulatedMappings:PartialMapping[] = given

  // Get partial mappings for each sentence in the claim
  for(let statement of claim.iterate()) {
    // Get mappings from each statement in claim onto table
    let partialMappings = mapFromSingleSentence(
      claim.variables, 
      statement, 
      onto
    );


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

/** Filter the complete mapping from a list of partial mappings */
export function filterCompleteMappings(mappings:PartialMapping[]) {
  return mappings.filter(isCompleteMapping);
}

export function findCompleteMappings<TruthValue extends string>(
  claim:VariableTable<TruthValue>, 
  onto:TruthTable<TruthValue>|TruthTable<TruthValue>[], 
  given?:PartialMapping[],
):CompleteMapping[]|null {
  let mappings = findMappings(claim, onto, given);
  if(mappings) {
    let completeMappings = filterCompleteMappings(mappings);
    if(completeMappings.length)
      return completeMappings;
    else
      return null;
  } else  
    return null;
}

/** Combine two partial mappings, returns `null` if they are incompatible.
* Order of arguments doesn't matter. This operation is associative. */
export function combinePartialMappings(
  a:PartialMapping, 
  b:PartialMapping
):(PartialMapping|null) {
  if(a.length == b.length) {
    let c:PartialMapping = [];
    for(let i in a)
      if(a[i] == b[i] || b[i] === null)
        c[i] = a[i];
      else if(a[i] == null)
        c[i] = b[i];
      else
        return null;
    return c;
  } else
    return null;
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
  return mapping.map(x => x ? x: '?').join(' ')
}




type ScoredMappings = {
  [key:string]:{mapping: PartialMapping, score:number}
}


/**
 * - Contradictory Mapping: A mapping which results in one or more statements 
 *   which contradict the standard.
 * - Introductory Mapping: A mapping which results in new statements which had 
 *   indifferent (?) truth values in the standard.
 * - Imperfect Mapping: A mapping which is contradictory, introductory, neither or both.
 */
export function findImperfectMappings<TruthValue extends string>(
  claim:VariableTable<TruthValue>, 
  onto:TruthTable<TruthValue>,
  given?: PartialMapping,
): {mapping: PartialMapping, score: number}[] {
  let accumulation:ScoredMappings = {};

  /** 
   * Update the score of a mapping in a scored mappings set if it is greater
   * than the existing score */
  const update = (
    /** The set of mappings to be updated */
    set:ScoredMappings, 
    /** The mapping to add/update to the set */
    mapping:PartialMapping, 
    score = 1, 
    /** Use to avoid re-calculating the symbol  */
    symbol = mappingSymbol(mapping)
  ):void => {
    if(!set[symbol])
      set[symbol] = {mapping, score}
    else
      set[symbol].score = Math.max(score, set[symbol].score);
  }

  // For each statement in the claim
  for(let statement of claim.iterate()) {
    let matches:ScoredMappings = {}

    // For each mapping, `M`, from the statement onto the table (`onto`)
    for(let M of mapFromSingleSentence(claim.variables, statement, onto, given)) {
      update(matches, M)

      // For each mapping in the accumulation
      for(let i in accumulation) {

        let combined_mapping = combinePartialMappings(
          M,
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



export function *generatePartialMappings<TruthValue extends string>(
  claim:VariableTable<TruthValue>,
  onto:TruthTable<TruthValue>
) {
  for(let statement of claim.iterate())
    yield [...mapFromSingleSentence(claim.variables, statement, onto)]
}



/** 
 * Generate the partial mappings from a single sentence (with variables) onto a truth table
 */
export function *mapFromSingleSentence<TruthValue extends string>(
  variables: Variable[], 
  claim: {sentence:Sentence, truth:string}, 
  onto: TruthTable<TruthValue>|TruthTable<TruthValue>[],
  given: PartialMapping = blankPartialMapping(variables.length),
):Generator<PartialMapping> {
  const {sentence, truth} = claim
  
  // Identify the position of constants, variables e duplicates in the claim sentence args
  const constants = sentence.args.map(arg => {
    let variableIndex = variables.indexOf(arg);
    if(variableIndex != -1) {
      if(given[variableIndex])
        return given[variableIndex]
      else
        return null;
    } else
      return arg;
  });

  const varPositions = identifyVarPositions(variables, sentence);
  const duplicatePositions:number[][] = varPositions
    .filter(arr => arr !== null && arr.length > 1) as number[][]

  for(let table of (onto instanceof Array ? onto : [onto])) {
    // Find all sentences with a matching predicate.
    let candidates = table.byPredicate(sentence.predicate); 

    // Filter candidate sentences for a fit
    for(let fact of candidates) {
      if(fact.truth == truth &&
        // For 
        constants.every((c, i) => !c || fact.sentence.args[i] == c) &&
        duplicatePositions.every(indexs => {
          for(let i=1; i < indexs.length; ++i)
            if(fact.sentence.args[0] != fact.sentence.args[i])
              return false;
          // Otherwise
          return true; 
        }) 
      )
        // Yield a partial mapping
        yield varPositions.map( indexs => indexs ? fact.sentence.args[indexs[0]] : null );
    }
  }
  
}



/** 
 * Identify the position of variables in the sentence args. 
 */
export function identifyVarPositions(
  variables:Variable[], 
  sentence:Sentence
):(number[]|null)[] {
  return variables.map(x => {
    let list = [];
    for(let i=0; i < sentence.args.length; ++i)
      if(sentence.args[i] == x)
        list.push(i)

    return list.length ? list : null;
  })
}

/** 
  Check whether a mapping is a complete mapping. 
  */
export function isCompleteMapping(
  mapping:PartialMapping
): mapping is CompleteMapping {
  return !mapping.includes(null);
}

export function completePartialMapping(mapping:PartialMapping) {
  return mapping.map(x => x ? x : createEntity());
}
