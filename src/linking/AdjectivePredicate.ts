import { SyntacticPredicate } from "./SyntacticPredicate";
import { Adjective } from "../Adjective";
import { Template } from "../Template";

export class AdjectivePredicate extends SyntacticPredicate {
  adjective: Adjective;

  constructor(adj:Adjective) {
    super(1, [
      new Template('_ <be '+adj.str),
    ]);

    this.adjective = adj;
  }
}