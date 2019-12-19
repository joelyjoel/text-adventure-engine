import { Tense } from "./tense";

export function sentenceFormSymbol(options:{
  tense: Tense;
  question: boolean;
  negative: false | 'not';
  nounPhraseFor: string | null
}) {
  const {tense, question, negative, nounPhraseFor} = options

  let result:string = tense;
  if(question)
    result += '?';
  else if(nounPhraseFor)
    result += `:${nounPhraseFor}`;

  if(negative == 'not')
    result = `!${result}`;

  return result
}