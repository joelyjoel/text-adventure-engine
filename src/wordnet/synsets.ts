// This module sets out a set of operations that can be performed on WordNet Synsets. This is in contrast to its sister module `src/wordnet/words` which defines a similar set of operations dealing with words instead.


// @ts-ignore
import * as WordNet from 'node-wordnet';
import {Definition, Pointer, PointerSymbol} from './node-wordnet';

const wordnet = new WordNet();

/**
 * Returns `true` if passed two definitions for the same synset. `false` otherwise.
 */
export function compare(a: Definition|Pointer, b: Definition|Pointer) {
  return a.pos == b.pos && a.synsetOffset == b.synsetOffset;
}

export function expandPointer(pointer: Pointer):Promise<Definition> {
  return wordnet.getAsync(pointer.synsetOffset, pointer.pos);
}

export function * filterDuplicateDefinitions(defs: Iterable<Definition>) {
  let yielded: Definition[] = [];
  for(let def of defs)
    if(!yielded.some(yD => compare(def, yD))) {
      yielded.push(def);
      yield def;
    }
}

/**
 * Fetch definitions for all pointers from a given definition (`def`) that have
 * the given pointer symbol.
 */
export async function getPointers(def: Definition, pointerSymbol: PointerSymbol) {
  return await Promise.all(
    def.ptrs.filter((ptr: Pointer) => ptr.pointerSymbol === pointerSymbol)
      .map((ptr: Pointer) => expandPointer(ptr))
  )
}

export async function recursivePointers(def: Definition, pointerSymbol: PointerSymbol) {
  let list = [def];
  for(let i=0; i < list.length; ++i) {
    let D = list[i];
    for(let h of await getPointers(D, pointerSymbol)) {
      if(!list.some(H => compare(h, H)))
         list.push(h);
    }
  }

  list.shift();

  return list;
}

export function getHypernyms(def: Definition) {
  return getPointers(def, '@');
}
export function recursiveHypernyms(def: Definition) {
  return recursivePointers(def, '@');
}

export function getAntonyms(def: Definition) {
  return getPointers(def, '!');
}

/**
 * Return true is a is a hypernym of b.
 */
export async function isHypernym(a: Definition, b: Definition) {
  for(let hypernym of await getHypernyms(b))
    if(compare(hypernym, a))
      return true;

  // Otherwise,
  return false;
}

/**
 * List of antonyms and antonyms of hypernyms.
 */
export async function recursiveAntonyms(def: Definition) {
  let hypernyms = await recursiveHypernyms(def);
  let list = [...(await getAntonyms(def))];
  for(let h of hypernyms) {
    for(let a of await getAntonyms(h)) {
      if(!list.some(b => compare(a, b)))
        list.push(a);
    }
  }

  return list;
}



export function allWords(...defs:Definition[]) {
  let list:string[] = [];
  for(let def of defs)
    for(let word of def.synonyms)
      if(!list.includes(word))
        list.push(word);

  return list;
}


