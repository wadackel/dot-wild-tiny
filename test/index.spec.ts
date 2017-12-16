import * as assert from 'power-assert';
import dot from '../src/';


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
    assert(dot(t1, '') == null);
    assert(dot(t1, 'bar') == null);
    assert(dot(t1, 'fuga') == null);
    assert.deepStrictEqual(dot(t1, 'foo'), { bar: 'baz' });
    assert.deepStrictEqual(dot(t1, '[\'foo\']'), { bar: 'baz' });
    assert(dot(t1, 'foo.bar') === 'baz');
    assert(dot(t1, '[\'foo\'][\'bar\']') === 'baz');
    assert(dot(t1, 'test', 'default') === 'default');
    assert(dot(t1, '[\'test\']', 'default') === 'default');
    assert(dot(t1, 'foo.bar', 'default') === 'baz');
    assert(dot(t1, '[\'foo\'].bar', 'default') === 'baz');
    assert(dot(t1, '[\'foo\'][\'bar\']', 'default') === 'baz');

    assert(dot({ 'foo.bar.baz': 'hoge' }, 'foo\\.bar\\.baz') === 'hoge');

    const t2 = { 'foo.bar': { baz: { fuga: 'fuge' } } };
    assert.deepStrictEqual(dot(t2, 'foo\\.bar'), { baz: { fuga: 'fuge' } });
    assert.deepStrictEqual(dot(t2, 'foo\\.bar.baz'), { fuga: 'fuge' });
    assert(dot(t2, 'foo\\.bar.baz.fuga') === 'fuge');
    assert(dot(t2, 'foo\\.bar.baz.fuga.fuge') == null);

    const t3 = [null, [{ nested: { deep: { fuga: 'fuge' } } }], false];
    assert(dot(t3, '[0]', 'def') == null);
    assert(dot(t3, '0', 'def') == null);
    assert(dot(t3, '[2]') === false);
    assert(dot(t3, '2') === false);
    assert.deepStrictEqual(dot(t3, '[1][0]'), { nested: { deep: { fuga: 'fuge' } } });
    assert.deepStrictEqual(dot(t3, '1.0'), { nested: { deep: { fuga: 'fuge' } } });
    assert.deepStrictEqual(dot(t3, '[1][0].nested'), { deep: { fuga: 'fuge' } });
    assert.deepStrictEqual(dot(t3, '[1][0][\'nested\']'), { deep: { fuga: 'fuge' } });
    assert.deepStrictEqual(dot(t3, '[1][0].nested.deep'), { fuga: 'fuge' });
    assert.deepStrictEqual(dot(t3, '[1][0].nested[\'deep\']'), { fuga: 'fuge' });
    assert.deepStrictEqual(dot(t3, '[1][0].nested.deep.fuga'), 'fuge');
    assert.deepStrictEqual(dot(t3, '[1][0].nested[\'deep\'][\'fuga\']'), 'fuge');

    const t4 = [
      { k: 'v1' },
      { k: 'v2' },
      { k: 'v3' },
    ];

    assert.deepStrictEqual(dot(t4, '*.k'), ['v1', 'v2', 'v3']);
    assert(dot(t4, '*.k.foo') == null);

    // Real world
    assert.deepStrictEqual(dot(sampleData, 'tags.*'), [
      { id: 1, tag: 'tag1' },
      { id: 2, tag: 'tag2' },
    ]);

    assert.deepStrictEqual(dot(sampleData, 'tags.*.id'), [1, 2]);
    assert(dot(sampleData, 'tags.*.id.test') == null);

    assert.deepStrictEqual(dot(sampleData, 'nested.deep.*.members.*.profile.age'), [
      24, 30, 33,
      19, 33, 40,
    ]);

    assert.deepStrictEqual(dot(sampleData, 'nested.deep.1.members.*.username'), [
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
    assert.deepStrictEqual(dot(value, 'obj.*'), [
      'foo',
      'bar',
      'baz',
    ]);

    assert.deepStrictEqual(dot(value, 'obj.*', null, { iterateObject: false }), null);
    assert.deepStrictEqual(dot(value, 'obj.*', 'default', { iterateObject: false }), 'default');

    assert.deepStrictEqual(dot(obj, '*'), [
      'foo',
      'bar',
      'baz',
    ]);

    assert.deepStrictEqual(dot(obj, '*', null, { iterateObject: false }), null);
    assert.deepStrictEqual(dot(obj, '*', 'default', { iterateObject: false }), 'default');

    // arr
    assert.deepStrictEqual(dot(value, 'arr.*'), [
      'foo',
      'bar',
      'baz',
    ]);

    assert.deepStrictEqual(dot(value, 'arr.*', null, { iterateArray: false }), null);
    assert.deepStrictEqual(dot(value, 'arr.*', 'default', { iterateArray: false }), 'default');

    assert.deepStrictEqual(dot(arr, '*'), [
      'foo',
      'bar',
      'baz',
    ]);

    assert.deepStrictEqual(dot(arr, '*', null, { iterateArray: false }), null);
    assert.deepStrictEqual(dot(arr, '*', 'default', { iterateArray: false }), 'default');
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

    assert(dot(obj, 'a.b') === undefined);
    assert(dot(obj, 'a.c') === null);
    assert(dot(obj, 'a.c.z') === undefined);
    assert(dot(obj, 'd[0]') === 'e');
    assert(dot(obj, 'd[1]') === undefined);
    assert(dot(obj, 'd[2]') === null);
    assert(dot(obj, 'd[3]') === undefined);

    assert(dot(obj, 'a.b', undefined) === undefined);
    assert(dot(obj, 'a.c', undefined) === null);
    assert(dot(obj, 'a.c.z', undefined) === undefined);
    assert(dot(obj, 'd[0]', undefined) === 'e');
    assert(dot(obj, 'd[1]', undefined) === undefined);
    assert(dot(obj, 'd[2]', undefined) === null);
    assert(dot(obj, 'd[3]', undefined) === undefined);

    assert(dot(obj, 'a.b', 'default') === 'default');
    assert(dot(obj, 'a.c', 'default') === null);
    assert(dot(obj, 'a.c.z', 'default') === 'default');
    assert(dot(obj, 'd[0]', 'default') === 'e');
    assert(dot(obj, 'd[1]', 'default') === 'default');
    assert(dot(obj, 'd[2]', 'default') === null);
    assert(dot(obj, 'd[3]', 'default') === 'default');
  });
});
