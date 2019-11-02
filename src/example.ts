import { Sentence, Predicate, Entity } from "./logic";
import { Template } from "./Template";

let mySentence = new Sentence(
  new Predicate('Drinks'),
  new Entity('cat'),
  new Entity('milk'),
)



console.log(mySentence.symbol);


