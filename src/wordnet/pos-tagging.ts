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
  const concise = deconjugateConcise(word);
  const filterMap = await Promise.all(
    concise.map(async ({forms, infinitive}) => {
      return (await getPosTags(infinitive)).includes('verb')
    })
  )

  return concise.filter((x, i) => filterMap[i]);
}

export function examineDeconjugation(
  {forms, infinitive}:{forms:string[], infinitive:string}
) {
  const couldBePlural = forms.some(form => /Plural$/.test(form));
  const couldBeSingular = forms.some(form => /Singular$/.test(form));

  const couldBeFirstPerson = forms.some(form => /^firstPerson/.test(form));
  const couldBeSecondPerson = forms.some(form => /^secondPerson/.test(form));
  const couldBeThirdPerson = forms.some(form => /^thirdPerson/.test(form));

  const isPastTense = forms.includes('pastTense');
  const isPastParticiple = forms.includes('pastParticiple');
  const isGerund = forms.includes('gerund');

  const partsOfSpeech = [];
  if(couldBePlural || couldBeSingular)
    partsOfSpeech.push('conjugatedVerb');
  if(isPastTense)
    partsOfSpeech.push('pastTense');
  if(isPastParticiple)
    partsOfSpeech.push('pastParticiple');
  if(isGerund)
    partsOfSpeech.push('gerund');

  return {
    couldBePlural,
    couldBeSingular,
    couldBeFirstPerson,
    couldBeSecondPerson,
    couldBeThirdPerson,
    isPastTense,
    isPastParticiple,
    isGerund,
    partsOfSpeech,
  }
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
        if(forms.includes('gerund'))
          relations.push({form:'gerund', baseForm:'infinitive', base:infinitive});
        if(forms.includes('pastTense'))
          relations.push({form:'pastTense', baseForm:'infinitive', base:infinitive});
        if(forms.includes('pastParticiple'))
          relations.push({form: 'pastParticiple', baseForm:'infinitive', base:infinitive});

        if(forms.some(form => /^(first|second|third)Person(Plural|Singular)$/.test(form)))
          relations.push({form: 'conjugatedVerb', baseForm: 'infinitive', base:infinitive});
        //for(let form of forms) {
          //relations.push({form, baseForm: 'infinitive', base: infinitive});
        //}
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


