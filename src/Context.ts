import { Dictionary } from "./Dictionary";
import { TruthTable } from "./logic/TruthTable";

export class Context {
  dictionary: Dictionary;
  truthTable?: TruthTable;

  constructor(dictionary:Dictionary, truthTable?:TruthTable) {
    this.dictionary = dictionary;
    this.truthTable = truthTable;
  }
}