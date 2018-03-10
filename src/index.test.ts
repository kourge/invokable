import {Invokable} from '.';

describe('Invokable.create', () => {
  const oldValue = {_: 'oldValue'};
  const newValue = {_: 'newValue'};
  const randomName = () => `randomName_${new Date().valueOf().toString(36)}`;

  function hasOwnProperty(o: any, name: string): boolean {
    return Object.prototype.hasOwnProperty.call(o, name);
  }

  describe('when given a plain object', () => {
    it('throws given a non-conforming target', () => {
      expect(() => {
        Invokable.create({} as Invokable);
      }).toThrow(TypeError);
    });

    it('re-resolves [Invokable.call]', () => {
      const target = {
        [Invokable.call]() {
          return oldValue;
        },
      };
      const f = Invokable.create(target);

      expect(f()).toBe(oldValue);

      f[Invokable.call] = () => newValue;
      expect(f()).toBe(newValue);
    });

    it('binds to the result', () => {
      const target = {
        [Invokable.call]() {
          return this.value;
        },
        value: oldValue,
      };
      const f = Invokable.create(target);

      expect(f()).toBe(oldValue);
      f.value = newValue;
      expect(f()).toBe(newValue);
    });

    it('leaves `name` non-writable if not defined', () => {
      const target = {
        [Invokable.call]() {},
      };
      const f = Invokable.create(target);

      expect(() => {
        (f as any).name = randomName();
      }).toThrow();
    });

    it('makes `name` enumerable if defined', () => {
      const target = {
        [Invokable.call]() {},
        name: randomName(),
      };
      const f = Invokable.create(target);

      expect(hasOwnProperty(f, 'name')).toBe(true);
    });

    it('makes `name` writable if defined', () => {
      const target = {
        [Invokable.call]() {},
        name: 'foo',
      };
      const f = Invokable.create(target);

      const newName = randomName();
      (f as any).name = newName;

      expect(f.name).toBe(newName);
    });

    it("defaults `name` to the function's original name", () => {
      function foo() {}
      const target = {
        [Invokable.call]: foo,
      };
      const f = Invokable.create(target);

      expect(f.name).toBe(foo.name);
    });

    it('replicates a value', () => {
      const target = {
        [Invokable.call]() {},
        v: oldValue,
      };
      const f = Invokable.create(target);

      expect(f.v).toBe(oldValue);
    });

    it('replicates a getter', () => {
      let value = oldValue;
      const target = {
        [Invokable.call]() {},
        get v() {
          return value;
        },
      };
      const f = Invokable.create(target);

      expect(f.v).toBe(oldValue);
      value = newValue;
      expect(f.v).toBe(newValue);
    });

    it('replicates a setter', () => {
      let value = oldValue;
      const target = {
        [Invokable.call]() {},
        set v(x) {
          value = x;
        },
      };
      const f = Invokable.create(target);

      expect(value).toBe(oldValue);
      f.v = newValue;
      expect(value).toBe(newValue);
    });
  });

  describe('when given a class instance', () => {
    it('throws given a non-conforming target', () => {
      expect(() => {
        Invokable.create(new class {}() as Invokable);
      }).toThrow(TypeError);
    });

    it('re-resolves [Invokable.call] when overwritten with own property', () => {
      class C {
        [Invokable.call]() {
          return oldValue;
        }
      }
      const target = new C();
      const f = Invokable.create(target);

      expect(f()).toBe(oldValue);

      f[Invokable.call] = () => newValue;
      expect(f()).toBe(newValue);
    });

    it('re-resolves [Invokable.call] when overwritten on prototype', () => {
      class C {
        [Invokable.call]() {
          return oldValue;
        }
      }
      const target = new C();
      const f = Invokable.create(target);

      expect(f()).toBe(oldValue);

      C.prototype[Invokable.call] = () => newValue;
      expect(f()).toBe(newValue);
    });

    it('binds to the result', () => {
      class C {
        [Invokable.call]() {
          return this.value;
        }
        value = oldValue;
      }
      const target = new C();
      const f = Invokable.create(target);

      expect(f()).toBe(oldValue);
      f.value = newValue;
      expect(f()).toBe(newValue);
    });

    it('leaves `name` non-writable if not defined', () => {
      class C {
        [Invokable.call]() {}
      }
      const target = new C();
      const f = Invokable.create(target);

      expect(() => {
        (f as any).name = randomName();
      }).toThrow();
    });

    it('makes `name` enumerable if defined', () => {
      class Foo {
        [Invokable.call]() {}
        name = randomName();
      }
      const target = new Foo();
      const f = Invokable.create(target);

      expect(hasOwnProperty(f, 'name')).toBe(true);
    });

    it('makes `name` writable if defined', () => {
      class C {
        [Invokable.call]() {}
        name = 'foo';
      }
      const target = new C();
      const f = Invokable.create(target);

      const newName = randomName();
      (f as any).name = newName;

      expect(f.name).toBe(newName);
    });

    it("defaults `name` to the class's original name", () => {
      class Foo {
        [Invokable.call]() {}
      }
      const target = new Foo();
      const f = Invokable.create(target);

      expect(f.name).toBe(Foo.name);
    });

    it('replicates a value', () => {
      class C {
        [Invokable.call]() {}
        v = oldValue;
      }
      const target = new C();
      const f = Invokable.create(target);

      expect(f.v).toBe(oldValue);
    });

    it('replicates a getter', () => {
      let value = oldValue;
      class C {
        [Invokable.call]() {}
        get v() {
          return value;
        }
      }
      const target = new C();
      const f = Invokable.create(target);

      expect(f.v).toBe(oldValue);
      value = newValue;
      expect(f.v).toBe(newValue);
    });

    it('replicates a setter', () => {
      let value = oldValue;
      class C {
        [Invokable.call]() {}
        set v(x) {
          value = x;
        }
      }
      const target = new C();
      const f = Invokable.create(target);

      expect(value).toBe(oldValue);
      f.v = newValue;
      expect(value).toBe(newValue);
    });

    it('chains the prototype correctly', () => {
      class C {
        [Invokable.call]() {}

        foo() {
          return newValue;
        }
      }
      const target = new C();
      const f = Invokable.create(target);

      expect(f.foo()).toBe(newValue);
    });

    it('preserves `constructor` property behavior', () => {
      class C {
        [Invokable.call]() {}
      }
      const target = new C();
      const f = Invokable.create(target);

      expect(f.constructor).toBe(C);
    });

    it('preserves `instanceof` behavior', () => {
      class C {
        [Invokable.call]() {}
      }
      const target = new C();
      const f = Invokable.create(target);

      expect(f instanceof C).toBe(true);
    });
  });
});
