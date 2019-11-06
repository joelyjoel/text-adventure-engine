import { Sentence, Predicate, Entity } from "./logic";
import { Template } from "./Template";
import { Dictionary } from "./Dictionary";
import { parseNoun } from "./parsing/parseNoun";
import { parseArticle, parsePossessive, parseDemonstrative } from "./parsing/parseIdentifier";
import { parseNounPhrase } from "./parsing/parseNounPhrase";

let mySentence = new Sentence(
  new Predicate('Drinks'),
  new Entity('cat'),
  new Entity('milk'),
)



console.log(mySentence.symbol);


const dict = new Dictionary()
  .addNouns(
    "cat", "dog", "mullet", "buzz cut"
  )
  .addAdjectives('hairy');

console.log(
    parseNoun("my hairy buzz cut", dict)
)

console.log(parseNounPhrase('the hairy mullet', dict))