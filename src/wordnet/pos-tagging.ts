import {deconjugateConcise, singularise, MorphologyRelation} from '../morphology';
import {firstLetterCapital} from '../morphology/usefulRegex';

// @ts-ignore
const wordnet = require('wordnet');

const posTagCache:{[key:string]: string[]} = {};

export function getPosTags(word:string):Promise<string[]> {
  let cached = posTagCache[word];
  if(cached)
    return new Promise(f => f(cached));

  // Otherwise
  return new Promise((fulfil, reject) => {
    // @ts-ignore
    wordnet.lookup(word, (err, definitions) => {
      if(err)
          fulfil([]);
      else {
        // @ts-ignore
        const tags = definitions.map(def => def.meta.synsetType)
        fulfil(tags);
        posTagCache[word] = tags;
      }
    });
  })
}

export async function deconjugateWithDictionary(word:string) {
  return deconjugateConcise(word).filter(async ({forms, infinitive}) => {
    const tags = await getPosTags(infinitive);
    return tags.includes('verb');
  });
}

export async function deluxePosTags(word: string):Promise<(string|MorphologyRelation)[]> {
  // First do a vanilla pos tag search
  const vanilla = getPosTags(word)
    .then(tags => tags.map(tag => tag == 'verb' ? 'infinitive' : tag));

  const promises = []

  // Next deconjugate
  const deconjugationTags:Promise<MorphologyRelation[]> = deconjugateWithDictionary(word)
    .then(concise => {
      let relations = [];
      for(let {forms, infinitive} of concise) {
        for(let form of forms) {
          relations.push({form, baseForm: 'infinitive', base: infinitive});
        }
      }

      return relations;
    });

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
    ...(await deconjugationTags), 
    ...(isPlural ? ['pluralNoun'] : []),
    ...(firstLetterCapital.test(word) ? ['properNoun'] : [])
  ];
}

export async function posTagString(str:string[]):Promise<{word:string, posTags:(string|MorphologyRelation)[]}[]> {
  let taggedString:{word:string, posTags:(string|MorphologyRelation)[]}[] = [];
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


