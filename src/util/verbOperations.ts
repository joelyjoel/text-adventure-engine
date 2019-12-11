import { shiftWord } from "./getFirstWord";
import { conjugate, GERUND, PAST_PARTICIPLE, PAST_TENSE } from "./conjugate";
import { getAuxiliaryVerb } from "./getAuxiliaryVerb";
import { Template } from "../Template";

export function gerundify(verb:string) {
  let [first, rest] = shiftWord(verb);
  let gerund = conjugate(first, GERUND)

  return rest ? `${gerund} ${rest}` : gerund;
}

export function participly(verb:string) {

  let [first, rest] = shiftWord(verb);
  let participle = conjugate(first, PAST_PARTICIPLE)

  return rest ? `${participle} ${rest}` : participle;
}


export function pastify(verb: string) {
  let [first, rest] = shiftWord(verb);
  let participle = conjugate(first, PAST_TENSE)

  return rest ? `${participle} ${rest}` : participle;
}

export function questionTemplate(verb: string) {
  let {aux, remainder} = getAuxiliaryVerb(verb);

  if(remainder)
    return new Template(`>${aux} _ ${remainder}`);
  else
    return new Template(`>${aux} _`);
}

export function questionRegex(verb: string) {
  return questionTemplate(verb).regex();
}