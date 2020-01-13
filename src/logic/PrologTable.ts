import * as swipl from 'swipl';

import { Sentence, Entity, Variable, Predicate } from ".";

type TruthValue = '?'|'T'|'F'

export class PrologTable {
  assign(sentence:Sentence, truth:TruthValue) {
    let [line1, line2] = encodePrologSentence(sentence);
    swipl.call(`assertz(${line1}).`);
    swipl.call(`assertz(${line2}).`);
  }

  lookUp(sentence:Sentence):TruthValue {
    let [line1, line2] = encodePrologSentence(sentence);

    let known = swipl.call(line1 + '.');

    if(known)
      return swipl.call(line2 + '.') ? 'T' : 'F';
    else
      return '?'
  }
}

/** Convert logical objects into prolog clauses. */
export function encodeProlog(o:Entity|Variable|Sentence|Predicate):string {
  if(o instanceof Variable) {
    let symbol = o.symbol;
    if(/^[A-Z]/.test(symbol))
      return symbol;
    else
      throw `Invalid prolog variable symbol: "${symbol}". Prolog variable names must begin with a capital letter. `
  }
  
  else if(o instanceof Entity){
    let symbol = o.symbol;
    if(/^[a-z]/.test(symbol)) 
      return symbol;
    else
      throw `Invalid prolog variable symbol: "${symbol}". Prolog constants must begin with a lower case letter.`
  }
  
  else if(o instanceof Predicate)
    return o.symbol;

  else if(o instanceof Sentence)
    return `${encodeProlog(o.predicate)}(${o.args.map(o=>encodeProlog(o)).join(',')})`

  else
    throw `Unexpected logical object: ${o}`;
}

export function encodePrologSentence(sentence:Sentence):[string, string] {
  let args = sentence.args.map(arg => encodeProlog(arg)).join(',');
  let predicate = sentence.predicate.symbol;
  let knownPredicate = `known_${predicate}`;

  return [
    `${knownPredicate}(${args})`,
    `${predicate}(${args})`,
  ]
}