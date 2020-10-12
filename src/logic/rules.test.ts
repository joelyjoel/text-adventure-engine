import { IfThenRule } from "./IfThenRule"
import { VariableTable } from "./VariableTable"
import {Variable, Predicate, Sentence, Entity, createPredicate, createEntities, createVariables} from './basics';
import { TruthTable } from "."
import { RuleSet } from "./RuleSet"

test('IfThenRule', () => {
  let P = createPredicate(2);
  let Q = createPredicate(4);
  let [a,b,c,d,e] = createEntities()
  let [x,y,z,x1] = createVariables();
  let myRule = new IfThenRule(
    new VariableTable(x,y,z,x1)
      .assign({predicate:P, args:[x, y]}, 'T')
      .assign({predicate:P, args:[y, z]}, 'T')
      .assign({predicate:P, args:[z, x1]}, 'T'),
    new VariableTable(x,y,z,x1)
      .assign({predicate:Q, args:[x,y,z,x1]}, 'T')
  )
  console.log(myRule.symbol)

  let table = new TruthTable()
    .assign({predicate:P, args:[a, b]}, 'T')
    .assign({predicate:P, args:[c, d]}, 'T')
    .assign({predicate:P, args:[b, e]}, 'T')
    .assign({predicate:P, args:[e, d]}, 'T')

  let addition = new TruthTable()
    .assign({predicate:P, args:[b, c]}, 'T');

  let [...mappings] = myRule.additionMappings(addition, table);

  if(mappings.length) {
    expect(mappings).toStrictEqual([
      [a,b,c,d]
    ])
  } else 
    fail();

  let [...consequences] = myRule.additionConsequences(addition, table);
  expect(consequences[0].lookUp({predicate:Q, args:[a,b,c,d]})).toBe('T')
})

test('RuleSet',  () => {
  let P = createPredicate(2);
  let Q = createPredicate(2);
  let R = createPredicate(2);
  const [x,y,z,w] = createVariables();

  let rules = new RuleSet(
    new IfThenRule(
      new VariableTable(x,y).T(P, x, y),
      new VariableTable(x,y).T(Q, x, y),
    ),
    new IfThenRule(
      new VariableTable(z,w).T(R,z,w),
      new VariableTable(z,w).T(R, w, z)
    )
  )

  const [a,b,c,d] = createEntities()
  let table = new TruthTable()
    .T(P,c,d)
    .T(R,c,d)

  const addition = new TruthTable()
    .T(P, a,b)
    .T(R, a,b)

  let [...consequences] = rules.additionConsequences(
    addition,
    table
  )

  let mergedConsequences = TruthTable.merge(...consequences);

  

  console.log(`Rules: ${rules.symbol}\nStandard: ${table.symbol}\nAddition: ${addition.symbol}\nConsequences: ${consequences.map(c=>c.symbol).join('\nor\n')}\nMerged: ${mergedConsequences.symbol}`);

  expect(mergedConsequences.lookUp({predicate:Q, args:[a, b]})).toBe('T');
  expect(mergedConsequences.lookUp({predicate:R, args:[b, a]})).toBe('T')

})
