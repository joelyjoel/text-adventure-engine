import { Noun } from "../Noun";
import { LPredicate } from "./LPredicate";
import { Template } from "../Template";
import { toCamelCase } from "../util/toCamelCase";

export class NounPredicate extends LPredicate {
  noun: Noun;

  constructor(noun:Noun) {
    super(
      [new Template("_ <be a "+noun.str)],
      'isA' + toCamelCase(noun.str)
    );
    this.noun = noun;
  }
}