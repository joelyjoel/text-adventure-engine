import { Noun } from "./Noun";

export class Dictionary {
  nouns: Noun[];
  nounIndex: {[key:string]:Noun}

  constructor() {
    this.nouns = [];
  }

  addNoun(noun:Noun|string) {
    if(typeof noun == 'string') {
      this.addNoun(new Noun(noun));
      return this;
    } 
    else if(noun instanceof Noun) {
      this.nouns.push(noun);
      this.nounIndex[noun.str] = noun;
      return this;
    }
  }

  parseNoun(str:string) {
    if(this.nounIndex[str])
      return {
        noun: this.nounIndex[str],
        form: 'singular',
        str
      }
  }

  parseNounPhrase(str: string) {
    /a|an|the/
  }
}