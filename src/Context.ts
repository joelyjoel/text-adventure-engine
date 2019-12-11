import { Dictionary } from "./Dictionary";
import { TruthTable } from "./logic/TruthTable";
import { Entity } from "./logic";

export class Context {
  dictionary: Dictionary;
  truthTable?: TruthTable;

  speaker: Entity;
  listener: Entity;

  constructor(dictionary:Dictionary, truthTable?:TruthTable) {
    this.dictionary = dictionary;
    this.truthTable = truthTable;
  }
}
