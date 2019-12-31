import { Noun } from "./Noun";
import { Adjective } from "./Adjective";
import {StatementSyntax} from './parsing/parseStatement'
import { PredicateSyntax } from "./PredicateSyntax";

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
  predicateSyntaxs: PredicateSyntax[];

  constructor() {
    this.nouns = [];
    this.nounIndex = {};

    this.adjectives = [];
    this.adjectiveIndex = {};

    this.statementSyntaxs = [];
    this.predicateSyntaxs = [];
  }

  /** Add a noun to the dictionary. */
  addNoun(nounOrString:Noun|string) : this {
    // Handle string input.
    const noun = typeof nounOrString == 'string' 
      ? new Noun(nounOrString) 
      : nounOrString

    /** Last word of the noun. */
    const lastWord = noun.lastWord;

    // Exit early if there is a duplicate noun.
    let subIndex = this.nounIndex[lastWord];
    if(subIndex && subIndex.find(dupe => dupe.str == noun.str)) {
      console.warn( `Adding duplicate noun to dictionary: "${noun.str}"`);
      return this;
    }

    // Add noun to the list of all nouns.
    this.nouns.push(noun);

    // Index the noun by its last word
    if(this.nounIndex[lastWord])
      this.nounIndex[lastWord].push(noun);
    else
      this.nounIndex[lastWord] = [noun];
    
    this.addStatementSyntaxs(noun.predicateSyntax);

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
  addAdjective(adjOrString: Adjective|string) : this {
    // Handle string input
    let adj = typeof adjOrString == 'string'
      ? new Adjective(adjOrString)
      : adjOrString

    /** Last word of adjective (they can be phrasal). */
    const lastWord = adj.lastWord;

    // Exit early if adjective already exists in teh dictionary.
    let subIndex = this.adjectiveIndex[lastWord];
    if(subIndex && subIndex.find(dupe => dupe.str == adj.str)) {
      console.warn(`Adding duplicate adjective to dictionary: ${adj.str}`)
      return this
    }

    // Add adj to the list of adjectives
    this.adjectives.push(adj);

    // Index the adjective by last word.
    if(this.adjectiveIndex[lastWord])
      this.adjectiveIndex[lastWord].push(adj);
    else
      this.adjectiveIndex[lastWord] = [adj];
    
    this.addStatementSyntaxs(adj.predicateSyntax);

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
    // Exit early if syntax already exists.
    if(this.statementSyntaxs.includes(syntax)) {
      console.warn(`Adding duplicate syntax to the dictionary:`, syntax)
      return this;
    }

    this.statementSyntaxs.push(syntax);

    if(syntax instanceof PredicateSyntax)
      this.predicateSyntaxs.push(syntax);

    // Chainable
    return this;
  }

  /** Add multiple present tense statement syntaxs to the dictionary. */
  addStatementSyntaxs(...syntaxs: StatementSyntax[]) {
    for(let syntax of syntaxs)
      this.addStatementSyntax(syntax);

    // Chainable
    return this;
  }
}