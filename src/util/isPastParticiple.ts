import { deconjugateIrregular } from "./irregularConjugations";
import { PAST_PARTICIPLE } from "./conjugate";

/** Detect whether a string is a past participle. */
export function isPastParticiple(str:string) {
  // Return true if it ends in -ed
  if(/ed$/.test(str))
    return true;
  else {
    // Try de-conjugating as an irregular verb
    let decon = deconjugateIrregular(str);
    if(decon && decon.some(({form}) => form == PAST_PARTICIPLE))
      return true;
    else
      return false
  }
}