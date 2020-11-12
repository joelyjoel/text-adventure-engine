import {definitionToLogic, wordnetInterpretSimpleNounPhrase} from './interpret';
import {getDefinitions} from './words';
import {parseNounPhrase} from '../parsing';


// Tests are unfinished
//test.skip('wordnetInterpretSimpleNounPhrase()', async () => {
  //for await(let parse of parseNounPhrase('a hairy dog')) {
    //if(parse.kind == 'simpleNounPhrase')
      //for await(let claim of wordnetInterpretSimpleNounPhrase(parse, 'x'))
        //console.log(claim.symbol);
  //}
//});
test.todo('wordnetInterpretSimpleNounPhrase()');
