import { Noun } from "./Noun";

const articleRegex = /the|a|an/;

export class Dictionary {
  nouns: Noun[];
  phrasalNouns: Noun[];
  nounIndex: {[key:string]:Noun[]}

  constructor() {
    this.nouns = [];
    this.nounIndex = {};
  }

  addNoun(noun:Noun|string) {
    if(typeof noun == 'string') {
      this.addNoun(new Noun(noun));
      return this;
    } 
    else if(noun instanceof Noun) {
      this.nouns.push(noun);
      let lastWord = noun.lastWord;
      if(this.nounIndex[lastWord])
        this.nounIndex[lastWord].push(noun);
      else
        this.nounIndex[lastWord] = [noun];
      
      return this;
    }
  }

  addNouns(...nouns:(Noun|string)[]) {
    for(let noun of nouns)
      this.addNoun(noun);
    return this;
  }
}