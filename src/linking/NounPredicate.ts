import { Noun } from "../Noun";
import { SyntacticPredicate } from "./SyntacticPredicate";
import { Template } from "../Template";
import { toCamelCase } from "../util/toCamelCase";

export class NounPredicate extends SyntacticPredicate {
  noun: Noun;

  constructor(noun:Noun) {
    super(
      [new Template("_ <be a "+noun.str)],
      'isA' + toCamelCase(noun.str)
    );
    this.noun = noun;
  }
}