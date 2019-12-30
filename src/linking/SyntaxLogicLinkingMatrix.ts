import { Adjective } from "../Adjective";

import { Noun } from "../Noun";

import { PredicateSyntax } from "../PredicateSyntax";
import { Predicate } from "../logic";
import { Tense } from "../util/tense";
import { Dictionary } from "../Dictionary";

/** There are 3 types of syntax (for now): Adjectives, nouns or sentences
 * MAY CHANGE IN FUTURE.
 */
type Syntax = Adjective|Noun|{syntax: PredicateSyntax, tense:Tense};

/** A meaning is a predicate + a truth-value.
 * THIS TYPE MAY CHANGE IN THE FUTURE.
 */
type Meaning = {predicate: Predicate, truth:string};

/** A class for associating syntaxs with logical meanings (Usually predicate + 
 *  truth-value). 
*/
export class SyntaxLogicLinkingMatrix {
  /** Index: syntaxs by meaning. */
  private m2sIndex:{
    [predicateSymbol: string]: {
      [truthValue:string]: Syntax[];
    }
  };

  /** Index: meanings by syntax. */
  private s2mIndex: {
    adjectives: {
      [adjective: string]: Meaning;
    };
    nouns: {
      [noun: string]: Meaning;
    };
    statements: {
      [syntaxSymbol:string]: {
        [tense:string]: Meaning;
      }
    }
  }

  /** A Dictionary object with all the syntaxs used in the matrix. */
  readonly dictionary?:Dictionary;

  constructor() {
    this.m2sIndex = {};
    this.s2mIndex = { nouns:{}, adjectives: {}, statements:{} }
    this.dictionary = new Dictionary
  }

  /** A flexible function for adding things to the matrix. */
  add() {
    throw '## function unfinished'
  }

  /** Associate a syntax with a meaning. */
  addLinkage(syntax:Syntax, meaning:Meaning):void {
    // Update the syntax -> meaning index.
    if(syntax instanceof Adjective) {
      if(this.s2mIndex.adjectives[syntax.symbol])
        throw `Duplicate adjectives in linking matrix: '${syntax.symbol}'`;
      else
        this.s2mIndex.adjectives[syntax.symbol] = meaning;

      if(this.dictionary)
        this.dictionary.addAdjective(syntax);
    }

     else if(syntax instanceof Noun) {
      if(this.s2mIndex.nouns[syntax.symbol])
        throw `Duplicate nouns in linking matrix: '${syntax.symbol}'`
      else
        this.s2mIndex.nouns[syntax.symbol] = meaning;

      if(this.dictionary)
        this.dictionary.addNoun(syntax);
    }

    else {
      // Syntax is predicate syntax.
      let subIndex = this.s2mIndex.statements[syntax.syntax.symbol];
      if(!subIndex)
        this.s2mIndex.statements[syntax.syntax.symbol] = subIndex = {};

      if(subIndex[syntax.tense])
        throw `Duplicate PredicateSyntax symbols in linking matrix: '${syntax.syntax.symbol};`;
      else
        subIndex[syntax.tense] = meaning;

      if(this.dictionary)
        this.dictionary.addStatementSyntax(syntax.syntax);
    }

    // Update the meaning -> syntax index.
    let predicateSymbol = meaning.predicate.symbol;
    if(this.m2sIndex[predicateSymbol]) {
      if(this.m2sIndex[predicateSymbol][meaning.truth])
        this.m2sIndex[predicateSymbol][meaning.truth].push(syntax);
      else
        this.m2sIndex[predicateSymbol][meaning.truth] = [syntax];
    } else
      this.m2sIndex[predicateSymbol] = {[meaning.truth]: [syntax]}
  }

  /** Given a meaning, get the corresponding syntaxs.
   * NOTE: meaning -> syntaxs is one to many.
   */
  meaningToSyntaxs(meaning:Meaning):Syntax[] {
    let predicateSymbol = meaning.predicate.symbol;
    let subIndex = this.m2sIndex[predicateSymbol];
    if(subIndex) {
      let syntaxs = subIndex[meaning.truth];
      if(syntaxs)
        return syntaxs.slice();
      else
        return [];
    } else
      return [];
  }

  /** Given a syntax, get the corresponding meaining.
   * NOTE: syntax -> meaning is many to one.
   */
  syntaxToMeaning(syntax:Syntax):Meaning|null {
    if(syntax instanceof Adjective) {
      return this.s2mIndex.adjectives[syntax.symbol] || null;
    } else if(syntax instanceof Noun) {
      return this.s2mIndex.nouns[syntax.symbol] || null;
    } else {
      // Syntax is PredicateSyntax.
      let subIndex = this.s2mIndex.statements[syntax.syntax.symbol];
      if(subIndex)
        return subIndex[syntax.tense] || null;
      else
        return null;
    }
  }
}