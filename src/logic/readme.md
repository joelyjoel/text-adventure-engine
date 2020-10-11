# text-adventure-engine/logic

This is the part of the repository responsible for logical/semantic representation and manipulation of game state. Fun stuff.

Disclaimer, I'm writing this guide in order to re-familiarise myself with the code after about half a years break. Its very likely going to need a big review and refactor, possibly even a complete redesign. In which case lets hope I get round to updating this guide!

## Entity class

A better name for this class would have been "Object", but obviously that was already taken by js and would have led to confusion. Entities represent something in the world. Pretty much anything really, but usually the sort of thing that could be referred to using a noun-phrase. For example, "the dog", "the orange square" etc. But importantly there are no linguistic features contained within the `Entity` class. In fact it has no features at all except a unique identifier number (the `id` property). Using the `symbol` accessor you can get a slightly more readable string version of the id using the conventions of predicate logic notation (a, b, c, a1, b1, c1, etc).

Looking back, there is no need for `Entity` to be a class in its own right as it could just as easily be replaced by a function that spits out unique strings. This will probably be a feature of the big refactor.

## Variable
Extension of the Entity class for representing variables. All this class does is use a different scheme for the `symbol` property (xyz instead of abc).

## Predicate class

The predicate class corresponds exactly to eponymous concept in predicate logic. It represents a type of sentence that can be made about some entities. Each predicate accepts a specific number (`numberOfArgs` property) of arguments where each argument is an `Entity`.

Again, using a whole class for this object might be overly fancy when a simple string would suffice. String predicates would need a simple way to encode how many arguments they accept, I think Prolog has a convention for this.

## Sentence class

Again, shouldn't really be a class, the overhead is just not worth the benefit of a few accessor function. A sentence object combines a predicate with a list of arguments. As such, its just like a sentence in predicate logic.

**All of the classes mentioned up until this point could be refactored probably less than 100 lines of typescript interface declarations.**

## TruthTable class
Ok, now we get into the interesting stuff. A truth table represents an assignment of truth-values to zero or more sentences.This is much better than in older versions of this software, where the truth assignments were stored as a property of the Sentence class.

The truth assignments are indexed by predicate symbol, and sub-indexed by the concatenation of the argument symbols. (see `index` property). The `defaultTruthValue` property specifies what truth-value to assume for sentences that are not in the table.

Note that truth values are strings, not booleans. This allows for a more nuanced set of truth values than binary true and false. For example, the default `defaultTruthValue` is `"?"` to indicate indifference.

`TruthTable`s also have an `idMap` for declaring some entities as identical to another. Once a record is added to the idMap (using `makeIdentical` method), that truth-table will automatically substitute the duplicate entities for the original before performing any operations.

`index` and `identityMap` are both private properties, truth-tables can only be accessed with their many helper methods.

This class also provides functions for comparison with another truth-table. `checkCompatible(table)` checks that there are no conflicting truth assignments between the two tables. For a more information, `measureCompatibility` generates a report listing the overlaps (assignments that exist in both), contradictions (assigments that disagree) and introductions (assigments which only exist in the second table).

## VariableTable class

The VariableTable class extends the truth table class by adding the ability to declare a number of variables (using `variables` property). This allows you to represent statements in the form:

  There exists [x, y, z, etc] s.t. P(...) ^ Q(...) ^ R(...) etc

The original design spec that the variables all had to be members of the `Variable` class turned out to be a bit pointless when it came to implmentation. All the class needs to determine if an entity is a variable is to check if it exists in the variables list. I suppose using a special class makes it a little more typesafe, but removing this restriction would probably make it more powerful tbh. This point is moot anyway once both `Entity` and `Variable` become strings with different naming conventions. It might still be a good idea to give a warning when variables aren't named properly, but there might also be cases when you'd want to do this.

One of the most useful bits of this class is the `findMappings` method. A mapping (`CompleteMapping`) is an array of entities each of which substitutes the variable in the corresponding position in the `variables` property. A partial mapping (`PartialMapping`) is a mapping which does not substitute every variable. The `findMappings` method finds the partial mappings of a variable table so that it will agree with a given truth table. Quite a complicated calculus of mappings can be found in `mappings.ts`.

Once a satisfying mapping has been found, the `implement` method can be used to create a truth table with the variables substituted. 

## IfThenRule class

This is an under-developed and probably poorly named class. It attempts to capture the implication connective in predicate logic. I.e "if ... then ...".

Probably start from scratch with rules after the refactor. A better formulation would be "whenever ... then ..." because these rules will be used more like listeners than declarative relationships.

--------

# Planned refactors:
- Replace `Entity`, `Variable`, `Predicate` and `Sentence` with typescript interfaces and type-predicate functions.
- Adapt `TruthTable` to work with the interfaces instead
- Make `TruthTable<TruthValue>` a generic class, for tighter typing of truth-values.
- Allow plain ole `Entity`s to be used as variables (with optional warnings).
- Check it all works
- Introduce `WheneverThenRule` and go from there...
