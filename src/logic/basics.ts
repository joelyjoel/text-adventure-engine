/**
 * @module basic
 * Here we declare the basic types involved in the logic engine.
 */

/**
 * A unique string identifying a logical object.
 *
 * A better name would have been "Object", but obviously that was already taken
 * by js and would have led to confusion. Entities represent something in the
 * world. Pretty much anything really, but usually the sort of thing that could be
 * referred to using a noun-phrase. For example, "the dog", "the orange square"
etc.
 */
export type Entity = string;

export const EntityRegex = /^\w+$/;

/**
 * Check that an object is a valid entity string
 */
export function isEntity(o:any):o is Entity {
  return typeof o == 'string' && EntityRegex.test(o);
}


let entityCounter = -1;

/** 
 * Create a new unique entity string 
 */
export function createEntity() {
  entityCounter++;
  return 'abc'[entityCounter % 3] + (Math.floor(entityCounter/3) || '');
}

export function * createEntities() {
  while(true)
    yield createEntity();
}

/**
 * A variable is just like an entity but is used as a placeholder for unknown entities.
 * Note that all variables are also entities.
 */
export type Variable = string;
export const VariableRegex = /^[xyz]/;

/**
 * Check that an object is a valid variable string.
 */
export function isVariable(o:any):o is Variable {
  return typeof o == 'string' && VariableRegex.test(o);
}


let variableCounter = -1;

/**
 * Create a new unique variable string.
 */
export function createVariable() {
  ++variableCounter;
  return 'xyz'[variableCounter % 3] + (Math.floor(variableCounter/3) || '');
}

export function * createVariables() {
  while(true)
    yield createVariable();
}

/**
 * Corresponds exactly to eponymous concept in predicate logic. It represents a type of sentence that can be made about some entities. Each predicate accepts a specific number (`numberOfArgs` property) of arguments where each argument is an `Entity`.
 */
export type Predicate = string;

export const PredicateRegex = /^[0-9\w_]*\/(\d+)/

/**
 * Check whether a given object is a valid predicate string
 */
export function isPredicate(o: any):o is Predicate {
  return typeof o == 'string' && PredicateRegex.test(o);
}

let predicateCounter = -1;
export function createPredicate(numberOfArgs:number) {
  predicateCounter ++ ;
  return `${'PQR'[predicateCounter%3]}${Math.floor(predicateCounter/3) || ''}/${numberOfArgs}`;
}

export function getNumberOfArguments(predicate:Predicate) {
  const parse = PredicateRegex.exec(predicate);
  if(parse)
    return parseInt(parse[1]);
  else
    throw `Not a valid predicate: "${predicate}"`;
}

/**
 * A `Predicate` accompanied by an ordered list of entity arguments.
 */
export interface Sentence {
  predicate: Predicate;
  args: (Entity|Variable)[];
}

export function isSentence(o:any) {
  return typeof o == 'object' &&
    isPredicate(o.predicate) &&
    o.args instanceof Array &&
    o.args.every((arg:any) => isEntity(arg)) &&
    getNumberOfArguments(o.predicate) == o.args.length
}

export function stringifyArgs(S:Sentence) {
  return S.args.join(',');
}

export function stringifySentence(S:Sentence) {
  return `${S.predicate}(${stringifyArgs(S)})`;
}
