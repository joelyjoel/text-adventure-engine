import { Template } from "../Template";
import { getAuxiliaryVerb } from "./getAuxiliaryVerb";
import { Tense } from "./tense";

const specialNames = ['infinitive', 'tense', 'object', 'subject'];

type SentenceArguments = {
  infinitive: string,
  tense: Tense,
  [key: string]: string
}

export function constructSentence(args:SentenceArguments):string {
  switch(args.tense) {
    case 'simple_present':
      return compose_simple_present(args);

    case 'simple_question':
      return compose_simple_question(args);

    default:
      throw `Unexpected tense ${args.tense}`;
  }
}

function compose_simple_present(args:SentenceArguments) {
  const {infinitive, subject, object} = args
  const prepositions = destructurePrepositions(args);

  if(!subject)
    throw "Cannot construct sentence in simple_present tense without subject."

  // Add a conjugator to the last word of the verb.
  let verb = addConjugator(infinitive);

  let toConcat = [new Template("_ "+verb).str([subject])];
  if(object)
    toConcat.push(object);

  for(let prep in prepositions)
    toConcat.push(prep, prepositions[prep])

  return toConcat.join(' ');
}

function compose_simple_question(args:SentenceArguments):string {
  const {infinitive, subject, object} = args
  const prepositions = destructurePrepositions(args);

  if(!subject)
    throw "Cannot construct a sentence in simple_question tense without a subject.";
  
  // Find or choose the auxilliar verb.
  let {aux, remainder} = getAuxiliaryVerb(infinitive);

  // Add conjugator symbol to auxiliary verb in place.
  aux = addLookaheadConjugator(aux)

  // Assemble the sentence
  let toConcat = [ new Template(aux+' _').str([subject]) ]
  if(remainder)
    toConcat.push(remainder);

  if(object)
    toConcat.push(object);

  for(let prep in prepositions)
    toConcat.push(prep, prepositions[prep]);

  return toConcat.join(' ')
}

export function makeNegative(infinitive:string) {
  let {aux, remainder} = getAuxiliaryVerb(infinitive);

  return remainder ? `${aux} not ${remainder}` : `${aux} not`;
}

/** De-structrue the prepositions from associative sentence arguments */
function destructurePrepositions(args:SentenceArguments) {
  let prepositions:{[key:string]:string} = {};
  for(let name in args)
    if(!specialNames.includes(name))
      prepositions[name] = args[name];
  return prepositions
}

/**  Insert a look-behind conjugator symbol on the last word of a verb. */
export function addConjugator(infinitive: string) {
  // let verbWords = infinitive.split(/\s/);  
  // return verbWords.slice(0, -1).map(str => str + ' ') + '<' + verbWords.pop();
  return `<${infinitive}`
}

/**  Insert a look-ahead conjugator symbol on the last word of a verb. */
export function addLookaheadConjugator(infinitive: string) {
  let verbWords = infinitive.split(/\s/);  
  return verbWords.slice(0, -1).map(str => str + ' ') + '>' + verbWords.pop();
}