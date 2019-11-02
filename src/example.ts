import { Sentence, Predicate, Entity } from "./logic";
import { Template } from "./Template";

let mySentence = new Sentence(
  new Predicate('Drinks'),
  new Entity('cat'),
  new Entity('milk'),
)



console.log(mySentence.symbol);


console.log(
  new Template("_'s cat has #_ friends")
//    .regex()
    .parse('My cat has 10 friends')
)