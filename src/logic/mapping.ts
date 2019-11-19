import { Entity, Sentence } from ".";
import { Variable } from "./Variable";
import { TruthTable } from "./TruthTable";
import { VariableTable } from "./VariableTable";

type PartialMapping = (Entity|null)[]
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

/** Combine two partial mappings, returns `null` if they are incompatible */
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

export function *mapFromSingleSentence(
  variables: Variable[], 
  from: {sentence:Sentence, truth:string}, 
  onto: TruthTable
):Generator<PartialMapping> {
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