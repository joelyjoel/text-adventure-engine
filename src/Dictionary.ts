import { Noun } from "./Noun";
import { Adjective } from "./Adjective";

const articleRegex = /the|a|an/;

export class Dictionary {
  nouns: Noun[];
  nounIndex: {[key:string]:Noun[]}

  adjectives: Adjective[];
  adjectiveIndex: {[key: string]: Adjective[]}

  constructor() {
    this.nouns = [];
    this.nounIndex = {};
  }

  addNoun(noun:Noun|string) {
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

  addNouns(...nouns:(Noun|string)[]) {
    for(let noun of nouns)
      this.addNoun(noun);
      
    return this;
  }

  addAdjective(adj: Adjective|string) {
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

  addAdjectives(adjs: (Adjective|string)[]) {
    for(let adj of adjs)
      this.addAdjective(adj);

    return this;
  }
}