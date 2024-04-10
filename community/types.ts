export type LowercaseFirstLetter<T extends string> = T extends `${infer FirstLetter}${infer Rest}`
  ? `${Lowercase<FirstLetter>}${Rest}`
  : T;
