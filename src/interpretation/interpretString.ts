/**
 * This module holds the quick functions for directly interpretting 
 * strings as logical structures.
 */
import {parseNounPhrase, parseSentence} from '../parsing';
import {interpretNounPhraseParse, interpretSimplePresent} from './interpret';

export async function * interpretNounPhrase(str:string) {
  for await (let parse of parseNounPhrase(str))
    yield interpretNounPhraseParse(parse); 
}

export async function * interpretSentence(str:string) {
  for await (let parse of parseSentence(str))
    yield interpretSimplePresent(parse);
}

export async function interpretSentenceOnce(str: string) {
  const interpretation = (await interpretSentence(str).next()).value;
  if(interpretation)
    return interpretation;
  else
    throw "Interpretation failed: "+str;
}
