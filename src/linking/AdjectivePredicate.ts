import { LPredicate } from "./LPredicate";
import { Adjective } from "../Adjective";
import { Template } from "../Template";
import { toCamelCase } from "../util/toCamelCase";
import { Predicate } from "../logic";
import { PredicateSyntax } from "../PredicateSyntax";

export class AdjectivePredicate extends LPredicate {
  adjective: Adjective;

  constructor(adj:Adjective) {
    super(
      [new PredicateSyntax(`be ${adj.str}`, ['subject'])],
      `${Predicate.getNextSymbol()}_is${toCamelCase(adj.str)}`
    );

    this.adjective = adj;
  }
}