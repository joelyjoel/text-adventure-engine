import { Tense, verbToTense } from "../util/tense";
import { Template } from "../Template";
import { getAuxiliaryVerb } from "../util/getAuxiliaryVerb";
import { questionTemplate, simplePastQuestionTemplate } from "../util/verbOperations";
import { getFirstWord } from "../util/getFirstWord";

/** Extra keys with string values interpretted as prepositional phrases. */
type Composable = {
  infinitive: string;
  tense?: Tense;
  subject?: string;
  object?: string;
  negative?: false | 'not';
  question?: true|false;
  nounPhraseFor?: string|null,
  [key: string]: string|boolean|undefined|null;
}

/** Special argument names, not to be treated as prepositional arguments */
const specialNames = [
  'infinitive', 'tense', 'object', 'subject', 'negative', 'question', 'nounPhraseFor'
];

/** Destructure the arguments passed to compose. */
function destructurePrepositions(args:Composable) {
  let prepositions:{[key:string]:string} = {};
  for(let name in args) {
    let val = args[name]
    if(typeof val == 'string' && !specialNames.includes(name))
      prepositions[name] = val;
  }
  return prepositions
}

export function compose(args:Composable):string {
  // Destructure the arguments
  const {
    infinitive, 
    subject, 
    object, 
    tense = 'simple_present', 
    negative = false,
    question = false,
    /** Name of argument for which to compose a noun phrase */
    nounPhraseFor = null,
  } = args

  const prepositions = destructurePrepositions(args);

  if(!subject)
    throw "Cannot construct sentence without subject.";
  if(nounPhraseFor && typeof args[nounPhraseFor] != 'string')
    throw `Cannot compose a nounphrase for an argument which does not exist (${nounPhraseFor})`
  if(nounPhraseFor && question)
    throw 'arguments `nounPhraseFor` and `question` are incompatible.'

  // Apply the tense to the verb
  let verb = verbToTense(infinitive, tense);

  // Add negative
  if(negative == 'not')
    verb = makeNegative(verb);

  // Attach the subject to the verb
  let verbPhrase 
  if(question && tense == 'simple_past') {
    verbPhrase = simplePastQuestionTemplate(infinitive, negative)
      .str([subject])
  } else if(tense == 'simple_past' && getFirstWord(verb) != 'were') {
    // Simple past is a special case because it doesn't require conjugation.
    if(nounPhraseFor == 'subject')
      verbPhrase = `${subject} which ${verb}`;
    else if(nounPhraseFor == 'object' && object)
      verbPhrase = `${object} which ${subject} ${verb}`;
    else if(nounPhraseFor)
      verbPhrase = `${args[nounPhraseFor]} ${nounPhraseFor} which ${subject} ${verb}`
    else
      verbPhrase = `${subject} ${verb}`;
  } 
  
  else if(question)
    verbPhrase = questionTemplate(verb).str([subject]);
  
  else if(nounPhraseFor == 'subject')
    verbPhrase = new Template(`_ which <${verb}`).str([subject]);

  else if(nounPhraseFor == 'object' && object)
    verbPhrase = new Template(`_ which _ <${verb}`).str([object, subject]);

  else if(nounPhraseFor)
    verbPhrase = new Template(`_ ${nounPhraseFor} which _ <${verb}`)
      .str([args[nounPhraseFor] as string, subject])

  else 
    verbPhrase = new Template(`_ <${verb}`).str([subject]);

  let toConcat = [verbPhrase];

  // Append object, if exists.
  if(object && nounPhraseFor != 'object')
    toConcat.push(object);

  // Append any prepositional phrases.
  for(let prep in prepositions)
    if(prep != nounPhraseFor)
      toConcat.push(prep, prepositions[prep])

  return toConcat.join(' ');
}


export function makeNegative(infinitive:string) {
  let {aux, remainder} = getAuxiliaryVerb(infinitive);

  return remainder ? `${aux} not ${remainder}` : `${aux} not`;
}
