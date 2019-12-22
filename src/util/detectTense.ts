import { concatSpaced } from "regops";
import { anyPersonRegex } from "./conjugate";
import { Tense } from "./tense";

const tenseRegexs:{[key:string]: RegExp|null} = { 
  simple_present: null,
  present_continuous: /(?:are|am|is) (?:\w+ing)/,
  simple_past: null,
  past_continuous: /(?:were|was) (?:\w+ing)/,
  present_perfect: /(?:have w+)|(?:has w+)/,
  present_perfect_continous: /(?:have|has) been (?:\w+ing)/,
  past_perfect: /had \w+/,
  past_perfect_continuous: /had been \w+ing/,
  future_perfect: /will have \w+/,
  future_perfect_continous: /will have been \w+ing/,
  simple_future: /will \w+/,
  future_continuous: /will be \w+ing/ 
}

console.log(tenseRegexs)

export function getPossibleTenses(str:string):Tense[] {
  let possibilities:Tense[] = [];
  for(let tense in tenseRegexs) {
    let reg = tenseRegexs[tense];
    if(!reg || reg.test(str))
      possibilities.push(tense as Tense);
  }
  return possibilities;
}