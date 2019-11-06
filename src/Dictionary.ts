import { Noun } from "./Noun";
import { Adjective } from "./Adjective";

const articleRegex = /the|a|an/;

export class Dictionary {
  /** List of all nouns in the dictionary. */
  nouns: Noun[];
  /** Nouns indexed by last word. */
  nounIndex: {[key:string]:Noun[]}

  /** List of all adjectives in the dictionary. */
  adjectives: Adjective[];
  /** Adjectives indexed by last word. */
  adjectiveIndex: {[key: string]: Adjective[]}

  constructor() {
    this.nouns = [];
    this.nounIndex = {};

    this.adjectives = [];
    this.adjectiveIndex = {};
  }

  /** Add a noun to the dictionary. */
  addNoun(noun:Noun|string) : this {
    if(typeof noun == 'string') {
      this.addNoun(new Noun(noun));
    } 
    else if(noun instanceof Noun) {
      this.nouns.push(noun);

      const lastWord = noun.lastWord;
      if(this.nounIndex[lastWord])
        this.nounIndex[lastWord].push(noun);
      else
        this.nounIndex[lastWord] = [noun];
    }

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
      this.addAdjective(new Adjective(adj));
    else if(adj instanceof Adjective) {
      this.adjectives.push(adj);

      const lastWord = adj.lastWord;
      if(this.adjectiveIndex[lastWord])
        this.adjectiveIndex[lastWord].push(adj);
      else
        this.adjectiveIndex[lastWord] = [adj];
    }

    return this;
  }

  /** Add multiple adjectives to the dictionary. */
  addAdjectives(...adjs: (Adjective|string)[]) : this {
    for(let adj of adjs)
      this.addAdjective(adj);

    return this;
  }
}