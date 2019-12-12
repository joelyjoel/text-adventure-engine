import { LPredicate } from "./LPredicate";
import { Adjective } from "../Adjective";
import { Template } from "../Template";
import { toCamelCase } from "../util/toCamelCase";
import { Predicate } from "../logic";

export class AdjectivePredicate extends LPredicate {
  adjective: Adjective;

  constructor(adj:Adjective) {
    super(
      [new Template('_ <be '+adj.str)], 
      `${Predicate.getNextSymbol()}_is${toCamelCase(adj.str)}`
    );

    this.adjective = adj;
  }
}