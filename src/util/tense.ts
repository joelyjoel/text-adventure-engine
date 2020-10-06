/*
Tenses: [source ef.co.uk]
  - Simple Present ("They walk home.")
  - Present Continuous ("They are walking home.")
  - Simple Past ("Peter lived in China in 1965")
  - Past Continuous ("I was reading when she arrived.")
  - Present Perfect ("I have lived here since 1987.")
  - Present Perfect Continuous ("I have been living here for years.")
  - Past Perfect ("We had been to see her several times before she visited us")
  - Past Perfect continuous ("He had been watching her for some time when she
    turned and smiled.")
  - Future Perfect ("We will have arrived in the states by the time you get this
    letter.")
  - Future Perfect Continuous ("By the end of your course, you will have been
    studying for five years")
  - Simple Future ("They will go to Italy next week.")
  - Future Continuous ("I will be travelling by train.")


  (Maybe also include:
  - Zero conditional ("If ice gets hot it melts.")
  - Type 1 Conditional ("If he is late I will be angry.")
  - Type 2 Conditional ("If he was in Australia he would be getting up now.")
  - Type 3 Conditional ("She would have visited me if she had had time")
  - Mixed Conditional ("I would be playing tennis if I hadn't broken my arm.")
  - Gerund
  - Present participle)
*/

import { gerundify, pastify, participly } from "./verbOperations";

export const allTenses:Tense[] = [
  'simple_present',
  'present_continuous',
  'simple_past',
  'past_continuous',
  'past_perfect',
  'past_perfect_continuous',
  'present_perfect',
  'present_perfect_continuous',
  'future_perfect',
  'future_perfect_continuous',
  'simple_future',
  'future_continuous'
]

export type Tense = (
  'simple_present' | 'present_continuous' 
  | 'present_perfect' | 'present_perfect_continuous' 
  | 'simple_past' | 'past_continuous' | 'past_perfect'
  | 'past_perfect_continuous'
  | 'future_perfect' | 'future_perfect_continuous' | 'simple_future' 
  | 'future_continuous'
);

export function isTense(o:any):o is Tense {
  return typeof o == 'string' && (allTenses as string[]).includes(o)
}

export function verbToTense(
  /** verb in infinitive form */ inf:string, 
  tense:Tense
):string {
  switch(tense) {
    case 'simple_present':
      return inf;

    case 'present_continuous':
      return `be ${gerundify(inf)}`;

    case 'simple_past':
      return pastify(inf);

    case 'past_continuous':
      return `were ${gerundify(inf)}`;

    case 'present_perfect':
      return `have ${participly(inf)}`;

    case 'present_perfect_continuous':
      return `have been ${gerundify(inf)}`;

    case 'past_perfect':
      return `had ${participly(inf)}`;

    case 'past_perfect_continuous':
      return `had been ${gerundify(inf)}`;

    case 'future_perfect':
      return `will have ${participly(inf)}`;

    case 'future_perfect_continuous':
      return `will have been ${gerundify(inf)}`;

    case 'simple_future':
      return `will ${inf}`;

    case 'future_continuous':
      return `will be ${gerundify(inf)}`;

    default: 
      throw `Unexpected or unsupported tense: ${tense}`
  }
}

/** A tense that is not syntactically exact, to simplify logical interpretations. */
export type CoarseTense = 'past'|'present'|'future';

export function toCoarseTense(tense:Tense):CoarseTense {
  switch(tense) {
    case 'past_perfect':
    case 'past_perfect_continuous':
    case 'past_continuous':
    case 'present_perfect':
    case 'present_perfect_continuous':
    case 'simple_past':
      return 'past';

    case 'simple_present':
    case 'present_continuous':
      return 'present'

    case 'future_continuous':
    case 'future_perfect':
    case 'future_perfect_continuous':
    case 'simple_future':
      return 'future';
  }
}
