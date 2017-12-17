# dot-wild-tiny

[![Build Status](http://img.shields.io/travis/tsuyoshiwada/dot-wild-tiny.svg?style=flat-square)](https://travis-ci.org/tsuyoshiwada/dot-wild-tiny)
[![npm version](https://img.shields.io/npm/v/dot-wild-tiny.svg?style=flat-square)](http://badge.fury.io/js/dot-wild-tiny)

> Use powerful dot notation (dot path + wildcard) to access properties of JSON.  
> If you need to do set or delete, use [dot-wild](https://github.com/tsuyoshiwada/dot-wild) which has all functions.




## Table of Contents

* [Install](#install)
* [Usage](#usage)
* [Contribute](#contribute)
* [Related projects](#related-projects)
* [License](#license)




## Install

```bash
$ npm install dot-wild-tiny --save

# or

$ yarn add dot-wild-tiny
```




## Usage

```javascript
import * as dot from 'dot-wild-tiny';


/**
 * Getter
 */
dot.get({ foo: { bar: 'baz' } }, 'foo.bar');
// => 'baz'

dot.get({ 'foo.bar': 'baz' }, 'foo\\.bar');
// => 'baz'

dot.get({ 'foo.bar': 'baz' }, 'notfound', 'default');
// => 'default'

const authorData = {
  authors: [
    { username: 'tsuyoshiwada', profile: { age: 24 } },
    { username: 'sampleuser', profile: { age: 30 } },
    { username: 'foobarbaz', profile: { age: 33 } }
  ]
};

dot.get(authorData, 'authors.*.username');
// => ['tsuyoshiwada', 'sampleuser', 'foobarbaz']

dot.get(authorData, 'authors.*.profile.age');
// => [24, 30, 33]


/**
 * Collection helpers (forEach, map)
 */
dot.forEach(postData, 'data.posts.*.id', (value, key, context, path, data) => {
  // value   => 1, 2
  // key     => 'id', 'id'
  // context => { id: 1, title: 'post 1' }, { id: 2, title: 'post 2' }
  // path    => 'data.posts.0.id', 'data.posts.1.id'
  // data    => postData...
});

dot.map(postData, 'data.tags.*.name', (value, key, context, path, data) => {
  return `${dot.get(data, path)} === ${value} (${key})`;
});
// => ['tag 1 === tag 1 (name)', 'tag 2 === tag 2 (name)']
```




## Contribute

1. Fork it!
1. Create your feature branch: git checkout -b my-new-feature
1. Commit your changes: git commit -am 'Add some feature'
1. Push to the branch: git push origin my-new-feature
1. Submit a pull request :D

Bugs, feature requests and comments are more than welcome in the [issues](https://github.com/tsuyoshiwada/dot-wild-tiny/issues).




## Related projects

* [dot-wild](https://github.com/tsuyoshiwada/dot-wild)




## License

[MIT © tsuyoshiwada](./LICENSE)

