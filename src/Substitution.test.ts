import { Substitution } from "./Substitution"

test("Substitution Test 1: Simple", () => {
  expect(
    new Substitution("_ <have a friend in me", 'you').str()
  ).toBe('you have a friend in me')
})

test("Substitution Test 2: Nested", () => {
  let sub1 = new Substitution("_'s _", 'I', 'cat')
  let sub2 = new Substitution('_ <love to be petted', sub1);

  expect(sub2.str()).toBe("my cat loves to be petted");
})