import { Template } from "../Template";

export function constructSentence(
  verb: string,
  tense: 'simple_present',
  subject?: string,
  object?: string,
  prepositions?: {[argument:string]: string},
) {
  if(tense == 'simple_present') {
    if(!subject)
      throw "Cannot construct sentence in simple present tense without subject."

    // Add a conjugator to the last word of the verb.
    verb = addConjugator(verb);

    let toConcat = [new Template("_ "+verb).str([subject])];
    if(object)
      toConcat.push(object);

    for(let prep in prepositions)
      toConcat.push(prep, prepositions[prep])

    return toConcat.join(' ');
  }
}

/**  Insert a conjugator symbol on the last word of a verb. */
export function addConjugator(verb: string) {
  let verbWords = verb.split(/\s/);  
  return verbWords.slice(0, -1).map(str => str + ' ') + '<' + verbWords.pop();
}