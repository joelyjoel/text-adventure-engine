import { Sentence, Predicate, Entity } from "./logic";
import { Template } from "./Template";
import { Dictionary } from "./Dictionary";
import { parseNoun } from "./parsing/parseNoun";
import { parseArticle, parsePossessive, parseDemonstrative } from "./parsing/parseIdentifier";
import { parseNounPhrase } from "./parsing/parseNounPhrase";
import { interpretNounPhrase } from "./linking/interpretNounPhrase";



const dict = new Dictionary()
  .addNouns(
    "cat", "dog", "mullet", "buzz cut"
  )
  .addAdjectives('hairy');

console.log(
  parseNoun("my hairy buzz cut", dict)
)

console.log(parseNounPhrase('the mullet', dict))


const str = "the hairy dog";
console.log(str)
let interpretation = interpretNounPhrase(str, dict)
if(interpretation)
  console.log(
    interpretation.symbol
  )
else
    console.log('failed')