import {Morphology} from './'
import {endsWithOOrX, endsWithE, endsWithShortConsonant, endsWithS, endsWithOesOrXes, endsWithDoubleShortConsonant, endsWithIng, endsWithEd} from './usefulRegex';
import {deconjugateIrregular, getIrregularConjugation} from '../util/irregularConjugations';


export const regularVerbConjugation:Morphology = {
  // Conjugate the infinitive
  infinitive: {
    firstPersonSingular: infinitive => infinitive,

    secondPersonSingular: infinitive => infinitive,

    thirdPersonSingular(infinitive) {
      if(endsWithOOrX.test(infinitive))
        return infinitive+'es';
      else 
        return infinitive+'s';
    },

    firstPersonPlural(infinitive) {
      return infinitive

    },

    secondPersonPlural(infinitive) {
      return infinitive;
    },

    thirdPersonPlural(infinitive) {
      return infinitive;
    },

    gerund(infinitive) {
      if(endsWithE.test(infinitive))
        return `${infinitive.slice(0, infinitive.length-1)}ing`;
      else if(endsWithShortConsonant.test(infinitive))
        return `${infinitive}${infinitive[infinitive.length-1]}ing`;
      else
        return `${infinitive}ing`;
    },

    pastTense(infinitive) {
      if(endsWithShortConsonant.test(infinitive))
        return `${infinitive}${infinitive[infinitive.length-1]}ed`
      else if(endsWithE.test(infinitive))
        return `${infinitive}d`;
      else
        return `${infinitive}ed`;
    },

    pastParticiple(infinitive) {
      if(endsWithShortConsonant.test(infinitive))
        return `${infinitive}${infinitive[infinitive.length-1]}ed`;
      else if(endsWithE.test(infinitive))
        return `${infinitive}d`;
      else
        return `${infinitive}ed`;
    }
  },

  // De-conjugations
  firstPersonSingular: {
    infinitive(firstPersonSingular) {
      return firstPersonSingular;
    },
  },

  secondPersonSingular: {
    infinitive(secondPersonPlural) {
      return secondPersonPlural;
    },
  },

  thirdPersonSingular: {
    infinitive(thirdPersonSingular) {
      if(endsWithS.test(thirdPersonSingular)) {
        if(endsWithOesOrXes.test(thirdPersonSingular))
          return [
            thirdPersonSingular.slice(0, -1),
            thirdPersonSingular.slice(0, -2),
          ]
        else
          return thirdPersonSingular.slice(0, -1)

      } else
        // Either not a match or its irregular
        return null;
    },
  },

  firstPersonPlural: {
    infinitive(firstPersonPlural) {
      return firstPersonPlural;
    },
  },

  secondPersonPlural: {
    infinitive(secondPersonPlural) {
      return secondPersonPlural;
    }
  },

  thirdPersonPlural: {
    infinitive(thirdPersonPlural) {
      return thirdPersonPlural;
    }
  },

  gerund: {
    infinitive(gerund) {
      if(endsWithIng.test(gerund)) {
        let minusIng = gerund.slice(0, -3);
        let plusE = minusIng + 'e';
        if(endsWithDoubleShortConsonant.test(minusIng)) {
          let minusDouble = minusIng.slice(0, -1);
          return [minusDouble, minusIng, plusE];
        } else 
          return [minusIng, plusE];

      } else
        // Must be irregular or non-match for gerund form
        return null;
    }
  },

  pastTense: {
    infinitive(pastTense) {
      if(endsWithEd.test(pastTense)) {
        let minusD = pastTense.slice(0, -1);
        let minusEd = pastTense.slice(0, -2);
        if(endsWithDoubleShortConsonant.test(minusEd)) {
          let minusDouble = minusEd.slice(0, -1);
          return [minusDouble, minusD, minusEd];
        } else
          return [minusD, minusEd];
      } else
        // Not recognised as past tense form of regular verb
        return null
    }
  },

  pastParticiple: {
    infinitive(pastParticiple) {
      if(endsWithEd.test(pastParticiple)) {
        let minusD = pastParticiple.slice(0, -1);
        let minusEd = pastParticiple.slice(0, -2);
        if(endsWithDoubleShortConsonant.test(minusEd)) {
          let minusDouble = minusEd.slice(0, -1);
          return [minusDouble, minusD, minusEd];
        } else
          return [minusD, minusEd];
      } else
        return null;
    }
  }

}

export type VerbForm = string;

export function conjugate(infinitive:string, person:VerbForm) {
  const irreg = getIrregularConjugation(infinitive, formNames.indexOf(person))
  if(irreg)
    return irreg;
  return regularVerbConjugation.infinitive[person](infinitive);
}

export function getConjugationTable(infinitive:string) {
  const table:{[form: string]: string} = {};
  console.log(regularVerbConjugation.infinitive);
  for(let form in regularVerbConjugation.infinitive)
    table[form] = regularVerbConjugation.infinitive[form](infinitive) as string;
  return table;
}

/** Used for compatibility with older code that used numbers instead of strings to represent verb forms */
const formNames = [
  'infinitive', 
  'firstPersonSingular', 'secondPersonSingular', 'thirdPersonSingular',
  'firstPersonPlural', 'secondPersonPlural', 'thirdPersonPlural',
  'gerund', 'pastParticiple', 'pastTense',
]
export function * deconjugate(word: string) {
  // Check for irregular conjugation
  let irreg = deconjugateIrregular(word);
  if(irreg) {
    for(let {infinitive, form} of irreg) {
      yield {form: formNames[form], infinitive}
    }

    // Don't continue regular deconjugation if irregular
    return ;
  }

  // Do irregular de-conjugation  
  for(let form in regularVerbConjugation)
    if(regularVerbConjugation[form].infinitive) {
      let infinitiveHypothesis = regularVerbConjugation[form].infinitive(word);
      if(infinitiveHypothesis != null) {
        if(typeof infinitiveHypothesis == 'string')     
          yield {form, infinitive:infinitiveHypothesis};
        else
          for(let inf of infinitiveHypothesis)
            yield {form, infinitive: inf};
      } 
    }   
}

export function deconjugateConcise(word:string):{forms:VerbForm[], infinitive:string}[] {
  const table:{[infinitive:string]:{forms:string[], infinitive:string}} = {};
  for(let {form, infinitive} of deconjugate(word)) {
    if(table[infinitive])
      table[infinitive].forms.push(form)
    else
      table[infinitive] = {forms: [form], infinitive}
  }
  return Object.values(table);
}
