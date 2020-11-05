import {Entity, TruthTable, AdditionTable} from '../logic';
import {NounPhraseParse} from '../grammar/parseTypings';

export interface Mention {
  parse: NounPhraseParse;
  returns: Entity;
}

/**
 * A `Context` object encapsulates all ambient information surrounding the
 * parsing/interpretation or the composition of a statement. For convenience
 * I'll use the term 'speech' to refer to either both parsing and composition.
 */
export class Context {
  parent: Context|null;

  /**
   * Truth table containing all facts at the time of speech
   */
  present: TruthTable;

  /**
   * List of noun-phrases previously used within the context along with the
   * entities each resolved to. Ordered chronologically.
   */
  anaphora: Mention[];

  /**
   * List of noun-phrases subsequently used within the context alongside the
   * entities each resolved to. Ordered chronologically.
   */
  cataphora: Mention[];

  constructor(parent?: Context) {
    if(parent) {
      this.parent = parent;
      this.present = new AdditionTable(parent.present);
      this.anaphora = parent.anaphora.slice();
      this.cataphora = parent.cataphora.slice();
    } else {
      this.present = new TruthTable();
      this.parent = null;
      this.anaphora = [];
      this.cataphora = [];
    }
  }

  addMention(parse: NounPhraseParse, returns: Entity) {
    this.anaphora.push({parse, returns});
  }

  rewind(n=1): void {
    for(let i=0; i < n; ++i) {
      let mention = this.anaphora.pop();
      if(mention != undefined)
        this.cataphora.unshift(mention);
    }
  }

  /**
   * Iterate the anaphora mentions in reverse order. I.e. starting with the most recent.
   */
  *iterateAnaphora():Generator<Mention> {
    for(let i=this.anaphora.length-1; i>=0; --i) {
      yield this.anaphora[i];
    }
  }


}
