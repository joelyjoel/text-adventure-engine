import {deconjugateConcise, singularise} from '../morphology';
import {firstLetterCapital} from '../morphology/usefulRegex';
//
// @ts-ignore
const wordnet = require('wordnet');

export function getPosTags(word:string):Promise<string[]> {
  return new Promise((fulfil, reject) => {
    // @ts-ignore
    wordnet.lookup(word, (err, definitions) => {
      if(err)
          fulfil([]);
      else {
        // @ts-ignore
        fulfil(definitions.map(def => def.meta.synsetType));
      }
    });
  })
}

export async function deluxePosTags(word: string):Promise<string[]> {
  // First do a vanilla pos tag search
  const vanilla = getPosTags(word)
    .then(tags => tags.filter(tag => tag != 'verb'));

  // Next deconjugate
  const promises = []
  const deconjugationTags:string[] = []
  for(let {forms, infinitive} of deconjugateConcise(word)) {
    promises.push(getPosTags(infinitive).then(tags => {
      if(tags.includes('verb'))
        // @ts-ignore
        deconjugationTags.push(...forms);
    }));
  }

  // De pluralise,
  let isPlural = false;
  let singularised = singularise(word);
  for(let singular of singularised) {
    promises.push(getPosTags(singular).then(tags => {
      if(tags.includes('noun'))
        isPlural = true;
    }));
  }

  
  
  await Promise.all(promises);

  return [
    ...(await vanilla), 
    ...deconjugationTags, 
    ...(isPlural ? ['pluralNoun'] : []),
    ...(firstLetterCapital.test(word) ? ['properNoun'] : [])
  ];
}

export async function posTagString(str:string[]) {
  let taggedString:{word:string, posTags:string[]}[] = [];
  let promises = [];
  for(let i in str) {
    let word = str[i];
    promises.push(deluxePosTags(word).then(posTags => {
      taggedString[i] = {word, posTags};
    }))
  }

  await Promise.all(promises);

  return taggedString;
}


