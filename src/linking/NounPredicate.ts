import { Noun } from "../Noun";
import { SyntacticPredicate } from "./SyntacticPredicate";
import { Template } from "../Template";

export class NounPredicate extends SyntacticPredicate {
  noun: Noun;

  constructor(noun:Noun) {
    super(1, [new Template("_ <be a "+noun.str)]);
    this.noun = noun;
  }
}