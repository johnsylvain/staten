import { createStore, Store } from '../src';

type TestState = {
  count: number;
};

const promise = <T>(value?: T) =>
  new Promise((resolve) => setTimeout(() => resolve(value)));

describe('createStore', () => {
  let store: Store<TestState>;

  beforeEach(() => {
    store = createStore(
      {
        set: (count) => ({ count }),
        increment: () => (state) => ({ count: state.count + 1 }),
        incrementAsync: () => (_, actions) => {
          promise().then(() => {
            actions.increment();
          });
        },
      },
      { count: 0 }
    );
  });

  it('initializes state', () => {
    expect(store.getState().count).toBe(0);
  });

  it('updates state', () => {
    store.actions.increment();
    expect(store.getState().count).toBe(1);
  });

  it('accepts data in action functions', () => {
    store.actions.set(5);
    expect(store.getState().count).toBe(5);
  });

  it('updates state and notifies subscribers', () => {
    const subscriber = jest.fn();
    store.subscribe(subscriber);

    store.actions.increment();
    expect(subscriber).toHaveBeenCalledWith({ count: 1 }, 'increment');
  });

  it('updates state multiple times and notifies subscribers', () => {
    const subscriber = jest.fn();
    store.subscribe(subscriber);

    store.actions.increment();
    store.actions.increment();

    expect(subscriber).toHaveBeenCalledTimes(2);
    expect(subscriber).toHaveBeenLastCalledWith({ count: 2 }, 'increment');
  });

  it('passes the trigger action to subscribers', () => {
    const subscriber = jest.fn();

    store.subscribe((state, trigger) => {
      if (trigger === 'increment') {
        subscriber(state, trigger);
      }
    });

    store.actions.set(5);
    store.actions.increment();

    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(subscriber).toHaveBeenCalledWith({ count: 6 }, 'increment');
  });

  it('does not extend state when a promise is returned', () => {
    const subscriber = jest.fn();
    store.actions.incrementAsync();
    store.subscribe(subscriber);

    setTimeout(() => {
      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(subscriber).toHaveBeenCalledWith({ count: 1 }, 'increment');
    });
  });
});
