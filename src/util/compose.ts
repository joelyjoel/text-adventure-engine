import { Tense, verbToTense } from "./tense";
import { Template } from "../Template";
import { getAuxiliaryVerb } from "./getAuxiliaryVerb";
import { questionTemplate } from "./verbOperations";

/** Extra keys with string values interpretted as prepositional phrases. */
type SentenceArguments = {
  infinitive: string;
  tense?: Tense;
  subject?: string;
  object?: string;
  negative: false | 'not';
  question?: true|false;
  [key: string]: string|boolean|undefined;
}

/** Special argument names, not to be treated as prepositional arguments */
const specialNames = [
  'infinitive', 'tense', 'object', 'subject', 'negative', 'question'
];

/** Destructure the arguments passed to compose. */
function destructurePrepositions(args:SentenceArguments) {
  let prepositions:{[key:string]:string} = {};
  for(let name in args) {
    let val = args[name]
    if(typeof val == 'string' && !specialNames.includes(name))
      prepositions[name] = val;
  }
  return prepositions
}

export function compose(args:SentenceArguments):string {
  // Destructure the arguments
  const {
    infinitive, 
    subject, 
    object, 
    tense = 'simple_present', 
    negative,
    question = false,
  } = args
  const prepositions = destructurePrepositions(args);

  if(!subject)
    throw "Cannot construct sentence without subject.";

  // Apply the tense to the verb
  let verb = verbToTense(infinitive, tense)

  // Add negative
  if(negative == 'not')
    verb = makeNegative(verb);

  let verbPhrase 
  if(question)
    verbPhrase = questionTemplate(verb).str([subject]);
  else 
    verbPhrase = new Template(`_ <${verb}`).str([subject]);

  let toConcat = [verbPhrase];

  // Append object, if exists.
  if(object)
    toConcat.push(object);

  // Append any prepositional phrases.
  for(let prep in prepositions)
    toConcat.push(prep, prepositions[prep])

  return toConcat.join(' ');
}


export function makeNegative(infinitive:string) {
  let {aux, remainder} = getAuxiliaryVerb(infinitive);

  return remainder ? `${aux} not ${remainder}` : `${aux} not`;
}
