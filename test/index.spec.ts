import * as assert from 'power-assert';
import * as dot from '../src/';


const sampleData = {
  tags: [
    { id: 1, tag: 'tag1' },
    { id: 2, tag: 'tag2' },
  ],
  nested: {
    deep: [
      {
        members: [
          { username: 'tsuyoshiwada', profile: { age: 24 } },
          { username: 'nestuser', profile: { age: 30 } },
          { username: 'foobarbaz', profile: { age: 33 } },
        ],
      },
      {
        members: [
          { username: 'testuser', profile: { age: 19 } },
          { username: 'sample', profile: { age: 33 } },
          { username: 'hogefuga', profile: { age: 40 } },
        ],
      },
    ],
  },
};


describe('dot-wild-tiny', () => {
  it('get()', () => {
    const t1 = { foo: { bar: 'baz' } };
    assert(dot.get(t1, '') == null);
    assert(dot.get(t1, 'bar') == null);
    assert(dot.get(t1, 'fuga') == null);
    assert.deepStrictEqual(dot.get(t1, 'foo'), { bar: 'baz' });
    assert.deepStrictEqual(dot.get(t1, '[\'foo\']'), { bar: 'baz' });
    assert(dot.get(t1, 'foo.bar') === 'baz');
    assert(dot.get(t1, '[\'foo\'][\'bar\']') === 'baz');
    assert(dot.get(t1, 'test', 'default') === 'default');
    assert(dot.get(t1, '[\'test\']', 'default') === 'default');
    assert(dot.get(t1, 'foo.bar', 'default') === 'baz');
    assert(dot.get(t1, '[\'foo\'].bar', 'default') === 'baz');
    assert(dot.get(t1, '[\'foo\'][\'bar\']', 'default') === 'baz');

    assert(dot.get({ 'foo.bar.baz': 'hoge' }, 'foo\\.bar\\.baz') === 'hoge');

    const t2 = { 'foo.bar': { baz: { fuga: 'fuge' } } };
    assert.deepStrictEqual(dot.get(t2, 'foo\\.bar'), { baz: { fuga: 'fuge' } });
    assert.deepStrictEqual(dot.get(t2, 'foo\\.bar.baz'), { fuga: 'fuge' });
    assert(dot.get(t2, 'foo\\.bar.baz.fuga') === 'fuge');
    assert(dot.get(t2, 'foo\\.bar.baz.fuga.fuge') == null);

    const t3 = [null, [{ nested: { deep: { fuga: 'fuge' } } }], false];
    assert(dot.get(t3, '[0]', 'def') == null);
    assert(dot.get(t3, '0', 'def') == null);
    assert(dot.get(t3, '[2]') === false);
    assert(dot.get(t3, '2') === false);
    assert.deepStrictEqual(dot.get(t3, '[1][0]'), { nested: { deep: { fuga: 'fuge' } } });
    assert.deepStrictEqual(dot.get(t3, '1.0'), { nested: { deep: { fuga: 'fuge' } } });
    assert.deepStrictEqual(dot.get(t3, '[1][0].nested'), { deep: { fuga: 'fuge' } });
    assert.deepStrictEqual(dot.get(t3, '[1][0][\'nested\']'), { deep: { fuga: 'fuge' } });
    assert.deepStrictEqual(dot.get(t3, '[1][0].nested.deep'), { fuga: 'fuge' });
    assert.deepStrictEqual(dot.get(t3, '[1][0].nested[\'deep\']'), { fuga: 'fuge' });
    assert.deepStrictEqual(dot.get(t3, '[1][0].nested.deep.fuga'), 'fuge');
    assert.deepStrictEqual(dot.get(t3, '[1][0].nested[\'deep\'][\'fuga\']'), 'fuge');

    const t4 = [
      { k: 'v1' },
      { k: 'v2' },
      { k: 'v3' },
    ];

    assert.deepStrictEqual(dot.get(t4, '*.k'), ['v1', 'v2', 'v3']);
    assert(dot.get(t4, '*.k.foo') == null);

    // Real world
    assert.deepStrictEqual(dot.get(sampleData, 'tags.*'), [
      { id: 1, tag: 'tag1' },
      { id: 2, tag: 'tag2' },
    ]);

    assert.deepStrictEqual(dot.get(sampleData, 'tags.*.id'), [1, 2]);
    assert(dot.get(sampleData, 'tags.*.id.test') == null);

    assert.deepStrictEqual(dot.get(sampleData, 'nested.deep.*.members.*.profile.age'), [
      24, 30, 33,
      19, 33, 40,
    ]);

    assert.deepStrictEqual(dot.get(sampleData, 'nested.deep.1.members.*.username'), [
      'testuser',
      'sample',
      'hogefuga',
    ]);
  });


  it('get() with options', () => {
    const value = {
      obj: {
        kfoo: 'foo',
        kbar: 'bar',
        kbaz: 'baz',
      },
      arr: [
        'foo',
        'bar',
        'baz',
      ],
    };

    const obj = {
      kfoo: 'foo',
      kbar: 'bar',
      kbaz: 'baz',
    };

    const arr = [
      'foo',
      'bar',
      'baz',
    ];

    // obj
    assert.deepStrictEqual(dot.get(value, 'obj.*'), [
      'foo',
      'bar',
      'baz',
    ]);

    assert.deepStrictEqual(dot.get(value, 'obj.*', null, { iterateObject: false }), null);
    assert.deepStrictEqual(dot.get(value, 'obj.*', 'default', { iterateObject: false }), 'default');

    assert.deepStrictEqual(dot.get(obj, '*'), [
      'foo',
      'bar',
      'baz',
    ]);

    assert.deepStrictEqual(dot.get(obj, '*', null, { iterateObject: false }), null);
    assert.deepStrictEqual(dot.get(obj, '*', 'default', { iterateObject: false }), 'default');

    // arr
    assert.deepStrictEqual(dot.get(value, 'arr.*'), [
      'foo',
      'bar',
      'baz',
    ]);

    assert.deepStrictEqual(dot.get(value, 'arr.*', null, { iterateArray: false }), null);
    assert.deepStrictEqual(dot.get(value, 'arr.*', 'default', { iterateArray: false }), 'default');

    assert.deepStrictEqual(dot.get(arr, '*'), [
      'foo',
      'bar',
      'baz',
    ]);

    assert.deepStrictEqual(dot.get(arr, '*', null, { iterateArray: false }), null);
    assert.deepStrictEqual(dot.get(arr, '*', 'default', { iterateArray: false }), 'default');
  });


  it('get() with undefined and null value', () => {
    const obj = {
      a: {
        b: undefined,
        c: null,
      },
      d: [
        'e',
        undefined,
        null,
      ],
    };

    assert(dot.get(obj, 'a.b') === undefined);
    assert(dot.get(obj, 'a.c') === null);
    assert(dot.get(obj, 'a.c.z') === undefined);
    assert(dot.get(obj, 'd[0]') === 'e');
    assert(dot.get(obj, 'd[1]') === undefined);
    assert(dot.get(obj, 'd[2]') === null);
    assert(dot.get(obj, 'd[3]') === undefined);

    assert(dot.get(obj, 'a.b', undefined) === undefined);
    assert(dot.get(obj, 'a.c', undefined) === null);
    assert(dot.get(obj, 'a.c.z', undefined) === undefined);
    assert(dot.get(obj, 'd[0]', undefined) === 'e');
    assert(dot.get(obj, 'd[1]', undefined) === undefined);
    assert(dot.get(obj, 'd[2]', undefined) === null);
    assert(dot.get(obj, 'd[3]', undefined) === undefined);

    assert(dot.get(obj, 'a.b', 'default') === 'default');
    assert(dot.get(obj, 'a.c', 'default') === null);
    assert(dot.get(obj, 'a.c.z', 'default') === 'default');
    assert(dot.get(obj, 'd[0]', 'default') === 'e');
    assert(dot.get(obj, 'd[1]', 'default') === 'default');
    assert(dot.get(obj, 'd[2]', 'default') === null);
    assert(dot.get(obj, 'd[3]', 'default') === 'default');
  });


  it('forEach()', () => {
    let results: any[] = [];

    // Not found
    dot.forEach(sampleData, 'hoge.fuga', () => {
      throw new Error('error');
    });

    // Normal path
    dot.forEach(sampleData, 'nested', (value: any, key: any, context: any, path: string, data: any) => {
      assert(context[key] === value);
      assert(dot.get(data, path) === value);
      results.push([value, key, path]);
    });

    assert(results.length === 1);
    assert.deepStrictEqual(results[0][0], sampleData.nested);
    assert(results[0][1] === 'nested');
    assert(results[0][2] === 'nested');

    // Use wildcard
    results = [];

    dot.forEach(sampleData, 'tags.*.*', (value: any, key: any, context: any, path: string, data: any) => {
      assert(context[key] === value);
      assert.deepStrictEqual(dot.get(data, path), value);
      results.push([value, key, path]);
    });

    assert(results.length === 4);

    assert(results[0][0] === 1);
    assert(results[0][1] === 'id');
    assert(results[0][2] === 'tags.0.id');

    assert(results[1][0] === 'tag1');
    assert(results[1][1] === 'tag');
    assert(results[1][2] === 'tags.0.tag');

    assert(results[2][0] === 2);
    assert(results[2][1] === 'id');
    assert(results[2][2] === 'tags.1.id');

    assert(results[3][0] === 'tag2');
    assert(results[3][1] === 'tag');
    assert(results[3][2] === 'tags.1.tag');
  });


  it('forEach() with options', () => {
    const sampleData = {
      obj: {
        kfoo: 'foo',
        kbar: 'bar',
        kbaz: 'baz',
      },
      arr: [
        'foo',
        'bar',
        'baz',
      ],
    };

    let results: any[] = [];

    dot.forEach(sampleData, 'obj.*', (value: any, key: any, _: any, path: string) => {
      results.push([value, key, path]);
    });

    assert.deepStrictEqual(results, [
      ['foo', 'kfoo', 'obj.kfoo'],
      ['bar', 'kbar', 'obj.kbar'],
      ['baz', 'kbaz', 'obj.kbaz'],
    ]);

    results = [];

    dot.forEach(sampleData, 'obj.*', (value: any, key: any, _: any, path: string) => {
      results.push([value, key, path]);
    }, { iterateObject: false });

    assert.deepStrictEqual(results, []);

    dot.forEach(sampleData, 'arr.*', (value: any, key: any, _: any, path: string) => {
      results.push([value, key, path]);
    });

    assert.deepStrictEqual(results, [
      ['foo', 0, 'arr.0'],
      ['bar', 1, 'arr.1'],
      ['baz', 2, 'arr.2'],
    ]);

    results = [];

    dot.forEach(sampleData, 'arr.*', (value: any, key: any, _: any, path: string) => {
      results.push([value, key, path]);
    }, { iterateArray: false });

    assert.deepStrictEqual(results, []);
  });


  it('map()', () => {
    let results: any[] = [];

    // Not found
    results = dot.map(sampleData, 'foo.bar', () => {
      throw new Error('error');
    });

    // Normal path
    results = dot.map(sampleData, 'tags', (value: any, key: any, context: any, path: string, data: any) => {
      assert(context[key] === value);
      assert.deepStrictEqual(dot.get(data, path), value);
      return [value, key, path];
    });

    assert(results.length === 1);
    assert.deepStrictEqual(results[0][0], sampleData.tags);
    assert(results[0][1] === 'tags');
    assert(results[0][2] === 'tags');

    // Use wildcard
    results = dot.map(sampleData, 'nested.deep.*.members.*.profile.age', (value: any, key: any, context: any, path: string, data: any) => {
      assert(context[key] === value);
      assert.deepStrictEqual(dot.get(data, path), value);
      return [value, key, path];
    });

    assert(results.length === 6);

    assert(results[0][0] === 24);
    assert(results[0][1] === 'age');
    assert(results[0][2] === 'nested.deep.0.members.0.profile.age');

    assert(results[1][0] === 30);
    assert(results[1][1] === 'age');
    assert(results[1][2] === 'nested.deep.0.members.1.profile.age');

    assert(results[2][0] === 33);
    assert(results[2][1] === 'age');
    assert(results[2][2] === 'nested.deep.0.members.2.profile.age');

    assert(results[3][0] === 19);
    assert(results[3][1] === 'age');
    assert(results[3][2] === 'nested.deep.1.members.0.profile.age');

    assert(results[4][0] === 33);
    assert(results[4][1] === 'age');
    assert(results[4][2] === 'nested.deep.1.members.1.profile.age');

    assert(results[5][0] === 40);
    assert(results[5][1] === 'age');
    assert(results[5][2] === 'nested.deep.1.members.2.profile.age');
  });


  it('map() with options', () => {
    const sampleData = {
      obj: {
        kfoo: 'foo',
        kbar: 'bar',
        kbaz: 'baz',
      },
      arr: [
        'foo',
        'bar',
        'baz',
      ],
    };

    let results: any[] = [];

    results = dot.map(sampleData, 'obj.*', (value: any, key: any, _: any, path: string) => [value, key, path]);

    assert.deepStrictEqual(results, [
      ['foo', 'kfoo', 'obj.kfoo'],
      ['bar', 'kbar', 'obj.kbar'],
      ['baz', 'kbaz', 'obj.kbaz'],
    ]);

    results = dot.map(sampleData, 'obj.*', (value: any, key: any, _: any, path: string) => [value, key, path], { iterateObject: false });

    assert.deepStrictEqual(results, []);

    results = dot.map(sampleData, 'arr.*', (value: any, key: any, _: any, path: string) => [value, key, path]);

    assert.deepStrictEqual(results, [
      ['foo', 0, 'arr.0'],
      ['bar', 1, 'arr.1'],
      ['baz', 2, 'arr.2'],
    ]);

    results = dot.map(sampleData, 'arr.*', (value: any, key: any, _: any, path: string) => [value, key, path], { iterateArray: false });

    assert.deepStrictEqual(results, []);
  });
});
