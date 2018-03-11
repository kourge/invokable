import Benchmark from 'benchmark';

import {Invokable} from '../src';

interface Suite extends Benchmark.Suite {
  on(type?: string, callback?: (this: Suite) => any): this;
  on(types: string[]): this;
  [_: number]: Benchmark;
}

function bench(name?: string, options?: Benchmark.Options): Suite {
  const s = new Benchmark.Suite(name, options) as Suite;
  return s.on('complete', () => {
    const best = (s.filter('fastest') as Suite)[0];

    console.log(`### ${name}

| Test description       | Throughput | Error  | Percent of best |
| ---------------------- | ---------: | -----: | --------------: |`);
    for (let i = 0; i < s.length; i++) {
      const test = s[i];
      console.log(
        '| ' +
          [
            (test as any).name,
            test.hz.toFixed(0),
            `±${test.stats.rme.toFixed(2)}%`,
            (100 * test.hz / best.hz).toFixed(2) + '%',
          ].join(' | ') +
          ' |',
      );
    }
    console.log();
  });
}

class Plain {
  foo = 'bar';
  args: any[];

  constructor(...args: any[]) {
    this.args = args;
  }

  [Invokable.call](...args: any[]) {
    this.args = args;
    return 1 + 1;
  }

  getFoo() {
    return this.foo;
  }

  get value() {
    return this.foo;
  }

  set value(foo) {
    this.foo = foo;
  }
}

class Callable {
  foo = 'bar';
  args: any[];

  constructor(...args: any[]) {
    this.args = args;
    return Invokable.create(this);
  }

  [Invokable.call](...args: any[]) {
    this.args = args;
    return 1 + 1;
  }

  getFoo() {
    return this.foo;
  }

  get value() {
    return this.foo;
  }

  set value(foo) {
    this.foo = foo;
  }
}

interface Callable {
  (...args: any[]): number;
}

const PlainObject = (...args: any[]) => ({
  args: [...args],
  foo: 'bar',

  [Invokable.call](...args: any[]) {
    this.args = args;
  },

  getFoo() {
    return this.foo;
  },

  get value() {
    return this.foo;
  },

  set value(foo) {
    this.foo = foo;
  },
});

const plain = new Plain();
const callable = new Callable();
const plainObject = PlainObject();
const plainObjectCallable = Invokable.create(PlainObject());

bench('Class instantiation, no args')
  .add('plain', () => {
    new Plain();
  })
  .add('invokable', () => {
    new Callable();
  })
  .run();

bench('Class instantiation, 5 args')
  .add('plain', () => {
    new Plain('a', 'b', 'c', 'd', 'e');
  })
  .add('invokable', () => {
    new Callable('a', 'b', 'c', 'd', 'e');
  })
  .run();

bench('Class instantiation, 10 args')
  .add('plain', () => {
    new Plain('a', 'b', 'c', 'd', 'e', 1, 2, 3, 4, 5);
  })
  .add('invokable', () => {
    new Callable('a', 'b', 'c', 'd', 'e', 1, 2, 3, 4, 5);
  })
  .run();

bench('Class instance: own property access')
  .add('plain', () => {
    plain.foo;
  })
  .add('invokable', () => {
    callable.foo;
  })
  .run();

bench('Class instance: method call on prototype')
  .add('plain', () => {
    plain.getFoo();
  })
  .add('invokable', () => {
    callable.getFoo();
  })
  .run();

bench('Class instance: getter on prototype')
  .add('plain', () => {
    plain.value;
  })
  .add('invokable', () => {
    callable.value;
  })
  .run();

bench('Class instance: setter on prototype')
  .add('plain', () => {
    plain.value = 'baz';
  })
  .add('invokable', () => {
    callable.value = 'baz';
  })
  .run();

bench('Object creation, no args')
  .add('plain', () => {
    PlainObject();
  })
  .add('invokable', () => {
    Invokable.create(PlainObject());
  })
  .run();

bench('Object creation, 5 args')
  .add('plain', () => {
    PlainObject('a', 'b', 'c', 'd', 'e');
  })
  .add('invokable', () => {
    Invokable.create(PlainObject('a', 'b', 'c', 'd', 'e'));
  })
  .run();

bench('Object creation, 10 args')
  .add('plain', () => {
    PlainObject('a', 'b', 'c', 'd', 'e', 1, 2, 3, 4, 5);
  })
  .add('invokable', () => {
    Invokable.create(PlainObject('a', 'b', 'c', 'd', 'e', 1, 2, 3, 4, 5));
  })
  .run();

bench('Object: own property access')
  .add('plain', () => {
    plainObject.foo;
  })
  .add('invokable', () => {
    plainObjectCallable.foo;
  })
  .run();

bench('Object: own property call')
  .add('plain', () => {
    plainObject.getFoo();
  })
  .add('invokable', () => {
    plainObjectCallable.getFoo();
  })
  .run();

bench('Object: own property getter')
  .add('plain', () => {
    plainObject.value;
  })
  .add('invokable', () => {
    plainObjectCallable.value;
  })
  .run();

bench('Object: own property setter')
  .add('plain', () => {
    plainObject.value = 'baz';
  })
  .add('invokable', () => {
    plainObjectCallable.value = 'baz';
  })
  .run();

bench('Invocation, no args')
  .add('`instance.__call__()`', () => {
    callable.__call__();
  })
  .add('`instance[Invokable.call]()`', () => {
    callable[Invokable.call]();
  })
  .add('`instance()`', () => {
    callable();
  })
  .run();

bench('Invocation, 5 args')
  .add('`instance.__call__()`', () => {
    callable.__call__('a', 'b', 'c', 'd', 'e');
  })
  .add('`instance[Invokable.call]()`', () => {
    callable[Invokable.call]('a', 'b', 'c', 'd', 'e');
  })
  .add('`instance()`', () => {
    callable('a', 'b', 'c', 'd', 'e');
  })
  .run();

bench('Invocation, 10 args')
  .add('`instance.__call__()`', () => {
    callable.__call__('a', 'b', 'c', 'd', 'e', 1, 2, 3, 4, 5);
  })
  .add('`instance[Invokable.call]()`', () => {
    callable[Invokable.call]('a', 'b', 'c', 'd', 'e', 1, 2, 3, 4, 5);
  })
  .add('`instance()`', () => {
    callable('a', 'b', 'c', 'd', 'e', 1, 2, 3, 4, 5);
  })
  .run();
