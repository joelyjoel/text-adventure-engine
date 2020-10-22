import { Dictionary } from "./Dictionary";
import { TruthTable } from "./logic/TruthTable";
import { Entity , createEntity } from "./logic";
import { SyntaxLogicLinkingMatrix } from "./linking/SyntaxLogicLinkingMatrix";

export interface ContextConstructorOptions {
  speaker: Entity;
  listener: Entity;
}

export class Context<TruthValue extends string = 'T'|'F'|'?'> {
  dictionary: Dictionary;
  linkingMatrix: SyntaxLogicLinkingMatrix;
  
  truthTable: TruthTable<TruthValue>;
  speaker: Entity;
  listener: Entity;

  properNouns: {
    [properNoun:string]: Entity;
  }

  constructor(
    dictionaryOrLinking:Dictionary|SyntaxLogicLinkingMatrix, 
    truthTable:TruthTable<TruthValue> = new TruthTable<TruthValue>(),
    options:Partial<ContextConstructorOptions> = {},
  ) {
    let dictionary:Dictionary, linkingMatrix:SyntaxLogicLinkingMatrix;
    if(dictionaryOrLinking instanceof Dictionary) {
      dictionary = dictionaryOrLinking;
      linkingMatrix = new SyntaxLogicLinkingMatrix({dictionary});
    } else if(dictionaryOrLinking instanceof SyntaxLogicLinkingMatrix) {
      linkingMatrix = dictionaryOrLinking;
      if(linkingMatrix.dictionary)
        dictionary = linkingMatrix.dictionary;
      else
        throw "Cannot create a Context from a SyntaxLogicLinkingMatrix that has no Dictionary."
    } else
      throw "Something bad happened."

    this.linkingMatrix = linkingMatrix;
    this.dictionary = dictionary;
    this.truthTable = truthTable;
    this.properNouns = {};

    this.speaker = options.speaker || createEntity();
    this.listener = options.listener || createEntity();
  }
}
