import { IfThenRule } from "./IfThenRule"
import { VariableTable } from "./VariableTable"
import { Variable } from "./Variable"
import { Predicate } from "./Predicate"
import { Sentence } from "./Sentence"
import { Entity } from "./Entity"
import { TruthTable } from "."
import { RuleSet } from "./RuleSet"

test('IfThenRule', () => {
  let P = new Predicate(2);
  let Q = new Predicate(4);
  let [a,b,c,d,e] = Entity.bulk()
  let [x,y,z,x1] = Variable.bulk();
  let myRule = new IfThenRule(
    new VariableTable(x,y,z,x1)
      .assign(new Sentence(P, x, y), 'T')
      .assign(new Sentence(P, y, z), 'T')
      .assign(new Sentence(P, z, x1), 'T'),
    new VariableTable(x,y,z,x1)
      .assign(new Sentence(Q, x,y,z,x1), 'T')
  )
  console.log(myRule.symbol)

  let table = new TruthTable()
    .assign(new Sentence(P, a, b), 'T')
    .assign(new Sentence(P, c, d), 'T')
    .assign(new Sentence(P, b, e), 'T')
    .assign(new Sentence(P, e, d), 'T')

  let addition = new TruthTable()
    .assign(new Sentence(P, b, c), 'T');

  let [...mappings] = myRule.additionMappings(addition, table);

  if(mappings.length) {
    expect(mappings).toStrictEqual([
      [a,b,c,d]
    ])
  } else 
    fail();

  let [...consequences] = myRule.additionConsequences(addition, table);
  expect(consequences[0].lookUp(new Sentence(Q, a,b,c,d))).toBe('T')
})

test('RuleSet',  () => {
  let P = new Predicate(2);
  let Q = new Predicate(2);
  let R = new Predicate(2);
  const [x,y,z,w] = Variable.bulk();

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

  const [a,b,c,d] = Entity.bulk()
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

  expect(mergedConsequences.lookUp(new Sentence(Q, a, b))).toBe('T');
  expect(mergedConsequences.lookUp(new Sentence(R, b, a))).toBe('T')

})