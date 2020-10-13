import { IfThenRule } from "./IfThenRule";
import { TruthTable } from "./TruthTable";
import { Sentence } from "./basics";

export class RuleSet {
  rules: IfThenRule[];
  index: {
    [predicateSymbol: string]: IfThenRule[];
  };

  constructor(...rules: IfThenRule[]) {
    this.rules = [];
    this.index = {};

    this.addRules(...rules);
  }

  get symbol() {
    return `{\n${this.rules.map(rule => `\t${rule.symbol}`).join('\n')}\n}`;
  }

  addRule(rule:IfThenRule) {
    // Add to rule list.
    this.rules.push(rule);

    // Add to index
    for(let P of rule.antecedent.predicateSymbols) {
      if(!this.index[P])
        this.index[P] = [rule];
      else
        this.index[P].push(rule);
    }
  }

  addRules(...rules:IfThenRule[]) {
    for(let rule of rules)
      this.addRule(rule);
  }

  *additionConsequences(
    addition: TruthTable, 
    onto: TruthTable
  ) {
    let releventRules:IfThenRule[] = [];
    for(let P of addition.predicateSymbols) {
      let rules = this.index[P];
      for(let rule of rules)
        if(!releventRules.includes(rule))
          releventRules.push(rule);
    }

    for(let rule of releventRules)
      for(let consequence of rule.additionConsequences(addition, onto))
        yield consequence;
  }
}
