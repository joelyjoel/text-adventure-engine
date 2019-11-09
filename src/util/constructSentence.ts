import { Template } from "../Template";

export type Tense = 'simple_present';

const specialNames = ['infinitive', 'tense', 'object', 'subject'];

export function constructSentence(
  args:{
    infinitive: string,
    tense: Tense,
    [key: string]: string
  }
):string {
  const {infinitive, tense, subject, object} = args

  let prepositions:{[key:string]:string} = {};
  for(let name in args)
    if(!specialNames.includes(name))
      prepositions[name] = args[name];

  if(tense == 'simple_present') {
    if(!subject)
      throw "Cannot construct sentence in simple present tense without subject."

    // Add a conjugator to the last word of the verb.
    let verb = addConjugator(infinitive);

    let toConcat = [new Template("_ "+verb).str([subject])];
    if(object)
      toConcat.push(object);

    for(let prep in prepositions)
      toConcat.push(prep, prepositions[prep])

    return toConcat.join(' ');
  } else
    throw 'Unexpected tense: ' + tense;
}

/**  Insert a conjugator symbol on the last word of a verb. */
export function addConjugator(verb: string) {
  let verbWords = verb.split(/\s/);  
  return verbWords.slice(0, -1).map(str => str + ' ') + '<' + verbWords.pop();
}