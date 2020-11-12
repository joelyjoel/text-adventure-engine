// This module sets out a set of operations that can be performed on words. This is in contrast to its sister module `src/wordnet/synsets` which defines a similar set of operations dealing with synsets instead.

// @ts-ignore
import * as WordNet from 'node-wordnet';
const wordnet = new WordNet;
import {Definition, PartOfSpeech} from './node-wordnet';
import {allWords, recursivePointers} from './synsets';

/**
 * Fetch the definitions of the given word from the wordnet database.
 */
export function getDefinitions(word:string, pos?: PartOfSpeech):Promise<Definition[]> {
  let defs:Promise<Definition[]> = wordnet.lookupAsync(word);
  if(pos)
    return defs.then(defs => defs.filter(def => def.pos == pos));
  else
    return defs;
}

export function * filterDuplicates(list:Iterable<string>) {
  let yielded:string[] = [];
  for(let word of list)
    if(!yielded.includes(word)) {
      yield word;
      yielded.push(word);
    }
}

export function * ungroup<T>(groups: Iterable<T[]>): Generator<T> {
  for(let group of groups)
    for(let member of group)
      yield member;
}



export async function getSynonyms(word: string):Promise<string[]> {
  const defs = await getDefinitions(word);
  return [...filterDuplicates(ungroup(defs.map(def => def.synonyms)))];
}

export async function getSynonymsGrouped(word: string): Promise<string[][]> {
  return (await getDefinitions(word))
        .map(def => def.synonyms.slice())
}

/**
 * Returns `true` if `a` and `b` are synonyms (according to any definition).
 */
export async function isSynonym(a: string, b: string):Promise<boolean> {
  const definitions = await getDefinitions(a);
  for(let def of definitions)
    if(def.synonyms.includes(b))
      return true;

  // Otherwise,
  return false;
}

export async function getHypernymsGrouped(word:string) {
  let definitions = await getDefinitions(word);
  let groups = [];
  for(let def of definitions) {
    groups.push(
      [...filterDuplicates(allWords(...await recursivePointers(def, '@')))],
    );
  }

  return groups;
}

export async function getHypernyms(word: string):Promise<Iterable<string>> {
  return filterDuplicates(ungroup(await getHypernymsGrouped(word)));
}

/**
 * Returns `true` iff `a` is a hypernym of `b`.
 */
export async function isHypernym(a: string, b: string):Promise<boolean> {
  for(let hypernym of await getHypernyms(b)) {
    if (a == hypernym)
      return true;
  }
  
  // Otherwise,
  return false;
}


/**
 * Returns `true` iff `a` is a hyponym of `b` (i.e. `b` is a hypernym of `a`).
 */
export async function isHyponym(a: string, b:string):Promise<boolean> {
  return await isHypernym(b, a);
}

export async function getRelation(a: string, b:string) {
  if(await isSynonym(a, b))
    return 'synonym';
  else if(await isHypernym(a, b))
    return 'hypernym';
  else if(await isHyponym(a, b))
    return 'hyponym';
  else
    return 'none';
}

export async function canBeAnimate(noun: string) {
  
}
