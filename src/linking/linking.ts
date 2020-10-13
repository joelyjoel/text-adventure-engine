import {Predicate} from '../logic';
import {toCamelCase, splitCamelCase} from '../util/toCamelCase';

export function createAdjectivePredicate(adj:string):Predicate {
  return `${toCamelCase(`is ${adj}`)}/1`
}

export function parseAdjectivePredicate(P:Predicate):string {
  return splitCamelCase(P.slice(0, P.indexOf('<'))).slice(1).join(' ');
}

export function createNounPredicate(noun:string):Predicate {
  return `${toCamelCase(`is a ${noun}`)}/1`;
}

export function createPredicateSyntaxPredicate({verb, params}:{verb:string, params:string[]}):Predicate {
  return `${toCamelCase(verb)}_${params.map(p => toCamelCase(p)).join('_')}/${params.length}`
}

