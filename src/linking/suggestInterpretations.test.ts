import {suggestInterpretations} from './suggestInterpretations';

test('lalla', async () => {
  let n = 1;
  for await (let interpretations of suggestInterpretations('the cat eats the fish')) {
    //console.log(n++);
  }
});
