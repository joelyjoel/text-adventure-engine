import {VariableTable} from './';

/**
 * A rule in the form `whenver {condition} then {consequence}`
 * Designed to be used to set up listeners that a triggered every 
 * time a sentence in the `condition` is added to a truth table. 
 * Then the rest of the condition can be evaluated, and if positive 
 * the consequence is implemented.
 */
export interface WheneverRule {
  whenever: VariableTable;
  then: VariableTable;
}

export function isWheneverRule(o:any):o is WheneverRule {
  return typeof o === 'object' &&
    o.whenever instanceof VariableTable &&
    o.then instanceof VariableTable &&
    o.whenever.variables.join(',') == o.then.variables.join(',')
}
