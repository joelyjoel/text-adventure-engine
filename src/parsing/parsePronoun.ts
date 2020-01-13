import { wholeWord, caseInsensitive } from "../util/regops.extended";
import { Parse } from "./Parse";

export const pronounRegex = /I|me|you|he|him|she|her|it|they|them|us|we/i;
const wholePronounRegex =   caseInsensitive(wholeWord(pronounRegex))

export interface PronounParse extends Parse {
  pos: 'pronoun';
  pronoun: string;
  person: 1|2|3;
  /** true if pronoun COULD be plural */
  plural: boolean;
  /** true if pronoun COULD be singular */
  singular: boolean;
  gender?: 'male'|'female';
  /** true if pronoun COULD be a subject */
  subject: boolean;
  /** true if pronoun COULD be an object */
  object: boolean;
}

export function parsePronoun(str:string):PronounParse|null {
  const basicInfo = {
    pronoun: str,
    str, from: 0, to:str.length
  }

  switch(str.toLowerCase()) {
    case 'i':
      return {
        pos: 'pronoun',
        person: 1,
        plural: false,
        singular: true,
        ...basicInfo,
        subject: true,
        object: false
      }

    case 'me':
      return {
        pos: 'pronoun',
        person: 1,
        plural: false,
        singular: true,
        subject: false,
        object: true,
        ...basicInfo
      }

    case 'you':
      return {
        pos: 'pronoun',
        person: 2,
        plural: true,
        singular: true,
        subject: true,
        object: true,
        ...basicInfo
      }

    case 'he':
      return {
        pos:'pronoun',
        person:3,
        plural:false,
        singular:true,
        gender:'male',
        subject: true,
        object: false,
        ...basicInfo
      }

    case 'him':
      return {
        pos: 'pronoun',
        person: 3,
        gender: 'male',
        plural: false,
        singular: true,
        subject: false,
        object: true,
        ...basicInfo
      }

    case 'she':
      return {
        pos: 'pronoun',
        person: 3,
        gender: 'female',
        plural: false,
        singular: true,
        object: false,
        subject: true,
        ...basicInfo
      }

    case 'her':
      return {
        pos: 'pronoun',
        person: 3,
        gender: 'female',
        plural: false,
        singular: true,
        object: true,
        subject: false,
        ...basicInfo
      }

    case 'it':
      return {
        pos: 'pronoun',
        person: 3,
        gender: undefined,
        plural: false,
        singular: true,
        object: true,
        subject: true,
        ...basicInfo
      }

    case 'they':
      return {
        pos: 'pronoun',
        person: 3, // third person
        gender: undefined,
        plural: true,
        singular: true,
        subject: true,
        object:false,
        ...basicInfo
      }

    case 'them':
      return {
        pos: 'pronoun',
        person: 3, // third person
        gender: undefined,
        plural: true,
        singular: true,
        subject: false,
        object: true,
        ...basicInfo
      }

    case 'we':
      return {
        pos:'pronoun',
        person: 1,
        gender: undefined,
        plural: true,
        singular: false,
        subject: true,
        object: true,
        ...basicInfo,
      }

    case 'us':
      return {
        pos: 'pronoun',
        person: 1,
        gender: undefined,
        plural: true,
        singular: false,
        subject: false,
        object: true,
        ...basicInfo
      }

    default:
      return null;
  }
}