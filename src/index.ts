type DotKey = string | number;
type DotKeys = DotKey[];
type Token = string;
type Tokens = Token[];


/**
 * Utilities
 */
const isObj = require('is-plain-object');
const isArray = (val: any): val is any[] => Array.isArray(val);
const isString = (val: any): val is string => typeof val === 'string';
const isInteger = (val: any): boolean => Number(val) == val && Number(val) % 1 === 0; // tslint:disable-line triple-equals
const isData = (data: any): boolean => isObj(data) || isArray(data);
const hasProp = (obj: any, key: DotKey) => obj && obj.hasOwnProperty(key);
const objKeys = Object.keys;


const regex = {
  dot: /^\./,
  prop: /[^[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,
  escape: /\\(\\)?/g,
};


const each = (obj: any | null, iteratee: (v: any, i: DotKey, a: any) => boolean | void): void => {
  if (!obj) return;

  if (isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (iteratee(obj[i], i, obj) === false) break;
    }
  } else if (isObj(obj)) {
    const keys = objKeys(obj);
    for (let i = 0; i < keys.length; i++) {
      if (iteratee(obj[keys[i]], keys[i], obj) === false) break;
    }
  }
};


const merge = <T>(obj: T, source: T): T => {
  each(source, (value, key) => {
    if (hasProp(obj, key) && isData(obj)) {
      merge(obj[key], value);
    } else {
      obj[key] = value;
    }
  });
  return obj;
};


const splitTokens = (input: string): Tokens => {
  const tokens = `${input}`.split('.');
  let results: Tokens = [];
  let store: Tokens = [];

  tokens.forEach(token => {
    if (/^.*\\$/.test(token)) {
      store.push(token.slice(0, token.length - 1));
    } else if (store.length > 0) {
      results = [...results, `${store.join('.')}.${token}`];
      store = [];
    } else {
      results.push(token);
    }
  });

  return results;
};


const matchToken = (key: DotKey, token: DotKey): boolean => {
  if (token === '*') return true;

  return isInteger(token) ? key == token : key === token; // tslint:disable-line triple-equals
};


const tokenize = (str: string): Tokens => {
  const results: Tokens = [];

  splitTokens(str).forEach(token => {
    token.replace(regex.prop, (m: any, n: number, q: string, s: string): any => {
      results.push(q ? s.replace(regex.escape, '$1') : (n || m));
    });
  });

  return results;
};


/**
 * Getter
 */
export interface DotGetOptions {
  iterateObject?: boolean;
  iterateArray?: boolean;
}

interface InternalDotGetOptions extends DotGetOptions {
  iterateObject: boolean;
  iterateArray: boolean;
}

interface DataWithKeys {
  exist: boolean;
  wildcard: boolean;
  values: [any, any, DotKeys][]; // [value, context, keys]
}

const defaultGetOptions: InternalDotGetOptions = {
  iterateObject: true,
  iterateArray: true,
};

const internalGet = (data: any, path: DotKey, value: any | undefined, options?: DotGetOptions): DataWithKeys => {
  const opts: InternalDotGetOptions = {
    ...defaultGetOptions,
    ...(options || {}),
  };

  if (!path || !isString(path)) {
    return {
      exist: false,
      wildcard: false,
      values: [[value, data, []]],
    };
  }

  const key = '__get_item__';
  const tokens = tokenize(path);
  const length = tokens.length;
  const state: {
    index: number;
    context: { [index: string]: [any, any, DotKeys][] };
    wildcard: boolean;
  } = {
    index: 0,
    context: { [key]: [[data, data, []]] },
    wildcard: false,
  };

  tokens.forEach(token => {
    const next: any[] = [];

    each(state.context[key], ([item, _, p]) => {
      each(item, (v, k) => {
        if (!matchToken(k, token)) return;

        if (token !== '*') {
          next.push([v, item, [...p, k]]);
        } else {
          if (!opts.iterateObject && isObj(item)) return;
          if (!opts.iterateArray && isArray(item)) return;
          state.wildcard = true;
          next.push([v, item, [...p, k]]);
        }
      });
    });

    if (next.length > 0) {
      state.context = { [key]: next };
      state.index++;
    }
  });

  if (state.index !== length) {
    return {
      exist: false,
      wildcard: state.wildcard,
      values: [[value, null, []]],
    };
  }

  return {
    exist: true,
    wildcard: state.wildcard,
    values: state.context[key],
  };
};

export const get = (data: any, path: DotKey, value: any | undefined = undefined, options?: DotGetOptions): any => {
  const { exist, wildcard, values } = internalGet(data, path, value, options);

  if (!exist) return values[0][0];
  if (wildcard) return values.map(v => v[0]);
  return values[0][0] === undefined ? value : values[0][0];
};


/**
 * Executes a provided function once for each element.
 */
export const forEach = (
  data: any,
  path: DotKey,
  iteratee: (value: any, key: DotKey, context: any, path: string, data: any | any[]) => boolean | void,
  options?: DotGetOptions,
): void => {
  const { exist, values } = internalGet(data, path, null, options);
  if (!exist) return;

  each(values, ([v, c, p]) => iteratee(v, p[p.length - 1], c, p.join('.'), data));
};


/**
 * Create a new element
 * with the results of calling a provided function on every element.
 */
export const map = (
  data: any,
  path: DotKey,
  iteratee: (value: any, key: DotKey, context: any, path: string, data: any | any[]) => any,
  options?: DotGetOptions,
): any[] => {
  const { exist, values } = internalGet(data, path, null, options);
  if (!exist) return [];

  return values.map(([v, c, p]) => iteratee(v, p[p.length - 1], c, p.join('.'), data));
};


/**
 * Match key
 */
export const matchPath = (pathA: string, pathB: string): boolean => {
  if (!isString(pathA) || !isString(pathB)) return false;
  if (pathA === pathB) return true;

  const a = tokenize(pathA);
  const b = tokenize(pathB);

  return a.length !== b.length ? false : a.every((t, i) =>
    matchToken(t, b[i]) || matchToken(b[i], t),
  );
};
