/** Convert a noun-phrase, proper-noun or pronoun to a possessive adjective. */

export const possessiveAdjectiveRegex = /my|your|his|her|its|their|(?:[\w ]*\w(?:\'s|s\'))/

export function toPossessiveAdjective(nounPhrase:string) {
  // handle pronouns:
  switch(nounPhrase.toLowerCase()) {
    case 'i':
    case 'me':
    case 'my':
      return 'my';

    case 'you':
    case 'your':
      return 'your';

    case 'he':
    case 'him':
    case 'his':
      return 'his';

    case 'she':
    case 'her':
      return 'her';

    case 'it':
    case 'its':
      return 'its'

    case 'we':
    case 'us':
    case 'our':
      return 'our';

    case 'they':
    case 'them':
    case 'their':
      return 'their';
  }

  // regular cases
  let lastWord = nounPhrase.slice(nounPhrase.lastIndexOf(' ')+1)
  if(lastWord[lastWord.length-1] == 's') {
    // Assume that words beginning with a capital letter are proper nouns
    if(/^[A-Z]/.test(lastWord))
      return nounPhrase + "\'s"
    else
      return nounPhrase + "\'"
  } else {
    return nounPhrase + "\'s"
  }
}


