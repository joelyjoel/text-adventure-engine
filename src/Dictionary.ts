import { Noun } from "./Noun";
import { Adjective } from "./Adjective";
import {StatementSyntax} from './parsing/parseStatement'


export class Dictionary {
  /** List of all nouns in the dictionary. */
  nouns: Noun[];
  /** Nouns indexed by last word. */
  nounIndex: {[key:string]:Noun[]}

  /** List of all adjectives in the dictionary. */
  adjectives: Adjective[];
  /** Adjectives indexed by last word. */
  adjectiveIndex: {[key: string]: Adjective[]}

  statementSyntaxs: StatementSyntax[];

  constructor() {
    this.nouns = [];
    this.nounIndex = {};

    this.adjectives = [];
    this.adjectiveIndex = {};

    this.statementSyntaxs = [];
  }

  /** Add a noun to the dictionary. */
  addNoun(noun:Noun|string) : this {
    if(typeof noun == 'string') {
      noun = new Noun(noun);
    } 

    // Add noun to the list of all nouns.
    this.nouns.push(noun);

    // Index the noun by its last word
    const lastWord = noun.lastWord;
    if(this.nounIndex[lastWord])
      this.nounIndex[lastWord].push(noun);
    else
      this.nounIndex[lastWord] = [noun];
    
    this.addStatementSyntaxs(...noun.predicate.syntaxs);

    // Chainable
    return this;
  }

  /** Add multiple nouns to the dictionary */
  addNouns(...nouns:(Noun|string)[]) : this {
    for(let noun of nouns)
      this.addNoun(noun);

    return this;
  }

  /** Add an adjective to the dictionary. */
  addAdjective(adj: Adjective|string) : this {
    if(typeof adj == 'string')
      adj = new Adjective(adj);

    // Add adj to the list of adjectives
    this.adjectives.push(adj);

    // Index the adjective by last word.
    const lastWord = adj.lastWord;
    if(this.adjectiveIndex[lastWord])
      this.adjectiveIndex[lastWord].push(adj);
    else
      this.adjectiveIndex[lastWord] = [adj];
    
    this.addStatementSyntaxs(...adj.predicate.syntaxs);

    return this;
  }

  /** Add multiple adjectives to the dictionary. */
  addAdjectives(...adjs: (Adjective|string)[]) : this {
    for(let adj of adjs)
      this.addAdjective(adj);

    return this;
  }

  /** Add a present tense statement syntax to the dictionary. */
  addStatementSyntax(syntax: StatementSyntax) {
    if(!syntax.predicate)
      console.warn("Adding non-logical syntax to the dictionary");

    this.statementSyntaxs.push(syntax);
  }

  /** Add multiple present tense statement syntaxs to the dictionary. */
  addStatementSyntaxs(...syntaxs: StatementSyntax[]) {
    for(let syntax of syntaxs)
      this.addStatementSyntax(syntax);
  }
}