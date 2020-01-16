import {Dictionary} from '../Dictionary'
import { PredicateSyntax } from '../PredicateSyntax'

export const barge_world_dict = new Dictionary()
  .addNouns(
    'boat',
    'barge', 
    'dutch barge', 
    'cabin cruiser',
    'narrowboat',
    'kayak',
    'dhingy',
    'tow path',
    'nauticus 27',
    'solid fuel stove',
    'bank',
    'river',
    'canal',
    'rabbit',
  )
  .addAdjectives(
    'narrowbeam', 
    'widebeam', 
    'grp', 
    'steel', 
    'wooden', 
    'peanut butter',
    'warm',
    'cold',
    'damp',
    'wet',
  )
  .addStatementSyntaxs(
    new PredicateSyntax('float', ['subject']),
    new PredicateSyntax('sink', ['subject']),
    new PredicateSyntax('be moored', ['subject', 'beside']),
    new PredicateSyntax('be', ['subject', 'inside']),
    new PredicateSyntax('live', ['subject', 'aboard'])
  )