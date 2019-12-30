import { Dictionary } from "./Dictionary";
import { TruthTable } from "./logic/TruthTable";
import { Entity } from "./logic";
import { SyntaxLogicLinkingMatrix } from "./linking/SyntaxLogicLinkingMatrix";

export class Context {
  dictionary: Dictionary;
  truthTable?: TruthTable;
  linkingMatrix: SyntaxLogicLinkingMatrix;

  speaker: Entity;
  listener: Entity;

  constructor(
    dictionaryOrLinking:Dictionary|SyntaxLogicLinkingMatrix, 
    truthTable?:TruthTable
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
  }
}
