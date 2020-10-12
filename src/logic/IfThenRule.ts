import { VariableTable } from "./VariableTable";
import { TruthTable } from "./TruthTable";
import { mapFromSingleSentence, findCompleteMappings } from "./mapping";
import {Variable, Sentence} from './basics';

export class IfThenRule {
  variables: Variable[];
  antecedent: VariableTable;
  consequent: VariableTable;

  constructor(antecedent:VariableTable, consequent:VariableTable) {
    if(antecedent.numberOfVariables != consequent.numberOfVariables)
      throw new Error('Antecedent and consequent have different number of variables');
    for(let i in antecedent.variables)
      if(antecedent.variables[i] != consequent.variables[i])
        throw new Error('Variables do not match.')

    this.variables = antecedent.variables;

    this.antecedent = antecedent;
    this.consequent = consequent;
  }

  *additionMappings(addition:TruthTable|{sentence:Sentence, truth:string}, onto:TruthTable) {
    let additionTable = addition instanceof TruthTable
      ? addition
      : new TruthTable().assign(addition.sentence, addition.truth);

    // First check if any predicates in the addition match the antecedent.
    for(let statement of this.antecedent.iterate()) {
      let initialMappings = mapFromSingleSentence(
        this.variables, statement, additionTable
      );

      for(let initialMapping of initialMappings) {
        let mappings = findCompleteMappings(
          this.antecedent, [additionTable, onto], [initialMapping]
        )
        if(mappings)
          for(let mapping of mappings)
            yield mapping;
      }
    }
  }

  /** Generate the consequences of adding statements to the truth table. */
  *additionConsequences(addition:TruthTable, onto:TruthTable) {
    for(let mapping of this.additionMappings(addition, onto))
      yield this.consequent.implement(...mapping)
        .filter(
          ({sentence, truth}) => onto.lookUp(sentence) != truth && addition.lookUp(sentence) != truth
        )
  }

  get symbol() {
    return `If ${this.antecedent.symbol} then ${this.consequent.symbolBody}.`;
  }
}
