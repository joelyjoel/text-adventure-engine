import {deconjugateWithDictionary, getPosTags} from './pos-tagging';
import {deconjugateConcise} from '../morphology';

test.todo('Write some part-of-speech tagging unit tests');
describe('getPosTags()', () => {
  test.each([
    ['computer', ['noun']],
    ['fish', ['noun','verb']],
    ['pope', ['noun']],
    ['seduce', ['verb']],
    ['seduces', []],
    ['lived', []],
    ['hoover', ['noun', 'verb']],
    ['love', ['verb', 'noun']],
    ['orange', ['adjective', 'noun']],
    ['melon', ['noun']],
  ])('%s has POS tags: %j', async (word:string, expectedTags) => {
    const tags = await getPosTags(word);
    for(let tag of expectedTags)
      expect(tags).toContain(tag);

    for(let tag of tags)
      if(!expectedTags.includes(tag))
        fail(`has extra tag: ${tag}`);
  });
});


