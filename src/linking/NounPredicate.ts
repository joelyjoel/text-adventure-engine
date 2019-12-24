import { Noun } from "../Noun";
import { LPredicate } from "./LPredicate";
import { Template } from "../Template";
import { toCamelCase } from "../util/toCamelCase";
import { Predicate } from "../logic";
import { PredicateSyntax } from "../PredicateSyntax";

export class NounPredicate extends LPredicate {
  noun: Noun;

  constructor(noun:Noun) {
    super(
      [new PredicateSyntax(`be a ${noun.str}`, ['subject'])],
      `${Predicate.getNextSymbol()}_isA${toCamelCase(noun.str)}`
    );
    this.noun = noun;
  }
}