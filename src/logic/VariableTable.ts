import { TruthTable } from "./TruthTable";
import { Variable } from "./Variable";
import { Entity } from "./Entity";
import { findMappings } from "./mapping";

export class VariableTable extends TruthTable {
  readonly variables: Variable[];

  constructor(...variables:Variable[]) {
    super();
    this.variables = [];
    if(variables.length)
      this.addVariables(...variables)
  }

  addVariable(v:Variable) {
    if(!this.variables.includes(v))
      this.variables.push(v);
  }

  addVariables(...vars:Variable[]) {
    for(let v of vars) 
      this.addVariable(v);
  }

  get numberOfVariables() {
    return this.variables.length;
  }

  /** Create a new truth table by substituting the variables for a given list of entities. */
  substitute(...mapping:Entity[]) {
    if(mapping.length != this.numberOfVariables)
      throw "Attempting to substitute VariableTable with incorrect number of arguments."

    let newTable = this.clone();
    for(let i in this.variables)
      newTable.makeIdentical(mapping[i], this.variables[i], false);
    
    return newTable;
  }

  /** Compare a this table (under a given variable mapping) to another table, listing the differences or returning null (if none exist). */
  findMappingErrors(table:TruthTable, mapping:Entity[]) {
    const mapped = this.substitute(...mapping).facts;
    let errors = [];
    for(let {sentence, truth} of mapped) {
      if(table.lookUp(sentence) != truth)
        errors.push(sentence);
    }

    if(errors.length)
      return errors;
    else
      return null;
  }

  /** Quickly determine whether a mapping fits a sentence. */
  testMapping(table:TruthTable, mapping:Entity[]) {
    const mapped = this.substitute(...mapping).facts;
    for(let {sentence, truth} of mapped)
      if(table.lookUp(sentence) != truth)
        return false;

    return true;
  }

  findMappings(onto:TruthTable) {
    return findMappings(this, onto);
  }

  /** Represents the table as a string of logical symbols. */
  get symbol() {
    return `There exists (${this.variables.map(v => v.symbol).join(',')}) s.t. {` +
      this.facts
        .map(({sentence, truth}) => `(${sentence.symbol}=${truth})`)
        .join(' & ') 
      + '}';
  }

  merge(...tables:(TruthTable|VariableTable)[]) {
    for(let table of tables)
      if(table instanceof VariableTable)
        this.addVariables(...table.variables);
    
    TruthTable.prototype.merge.call(this, ...tables);
    return this;
  }
}