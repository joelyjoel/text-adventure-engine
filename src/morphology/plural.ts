import {Morphology} from './';

export const regularPluralisation:Morphology = {
  singular: {
    /** singular --> plural */
    plural(singular) {
      // If the singular noun ends in -o, ‑s, -ss, -sh, -ch, -x, or -z, add ‑es
      if(/(o|s|ss|sh|ch|x|z)$/i.test(singular))
        return singular + 'es'

      // If the noun ends with ‑f or ‑fe, the f is often changed to ‑ve before
      // adding the -s to form the plural version.
      // -- FOR NOW, TREATING THESE AS IRREGULAR.

      // If a singular noun ends in ‑y and the letter before the -y is a consonant,
      // change the ending to ‑ies to make the noun plural.
      if(/[bcdfghjklmnpqrstvwxyz]y$/i.test(singular))
        return singular.slice(0, -1) + 'ies'

      // If the singular noun ends in ‑us, the plural ending is frequently ‑i.
      if(/us$/.test(singular))
        return singular.slice(0, -1) + 'i'

      // If the singular noun ends in ‑is, the plural ending is ‑es.
      // -- IGNORING BECAUSE HARD IT INTRODUCES AMBIGUITY IN INVERSION. TREATING
      //    THESE WORDS AS IRREGULAR.

      // If the singular noun ends in ‑on, the plural ending is ‑a.
      if(/on$/.test(singular))
        return singular.slice(0, -2) + 'a'

      // otherwise add -s on the end
      return singular+'s'

    }
  },

  plural: {
    /** plural --> singular */
    singular(plural) {
      // If the plural noun ends -ies, replace with -y
      if(/ies$/.test(plural))
        return plural.slice(0, -3) + 'y'

      // If the plural noun ends with a consonant followed by -les, remove -s
      if(/[bcdfghjklmnpqrstvwxyz]les$/.test(plural))
        return plural.slice(0, -1)

      // If the plural noun ends with a vowell followed by a consonant followed by
      // -es, remove -s
      if(/[aeiou][bcdfghjklmnpqrstvwxyz]es$/.test(plural))
        return plural.slice(0, -1)

      // If the plural noun ends -es, remove -es
      if(/es$/.test(plural))
        return plural.slice(0, -2)

      // If the plural noun ends -s, remove -s
      if(/s$/.test(plural))
        return plural.slice(0, -1)

      // If the plural noun ends -i, replace with -us
      if(/i$/.test(plural))
        return plural.slice(0, -1) + 'us'

      // If the plural noun ends -a, replace with -on
      if(/a$/.test(plural))
        return plural.slice(0, -1) + 'on'

      // If the plural noun ends -s, remove -s
      if(/s$/.test(plural))
        return plural.slice(0, -1)

      // Otherwise return null, this is not recognised as a plural noun
      return null
    }
  }
}

export function pluralise(singularNoun:string) {
  let plural = regularPluralisation.singular.plural(singularNoun);
  if(!plural)
    return [];
  else if(typeof plural == 'string')
    return [plural];
  else
    return plural;

  // ^^ All this iffy nonsense to future proof for ambiguous morphology transformations
}

export function singularise(pluralNoun:string) {
  let singular = regularPluralisation.plural.singular(pluralNoun);
  if(!singular)
    return [];
  else if(typeof singular == 'string')
    return [singular];
  else
    return singular;

  // ^^ All this iffy nonsense to future proof for ambiguous morphology transformations
}
