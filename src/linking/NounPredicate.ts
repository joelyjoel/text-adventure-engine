import { Noun } from "../Noun";
import { LPredicate } from "./LPredicate";
import { Template } from "../Template";
import { toCamelCase } from "../util/toCamelCase";
import { Predicate } from "../logic";

export class NounPredicate extends LPredicate {
  noun: Noun;

  constructor(noun:Noun) {
    super(
      [new Template("_ <be a "+noun.str)],
      `${Predicate.getNextSymbol()}_isA${toCamelCase(noun.str)}`
    );
    this.noun = noun;
  }
}