# staten

> Vanilla state management (633 bytes!)

## Why?

Some state management libraries are complex and opinionated, while others are tightly coupled to a specific framework. Staten is simple and familiar. It uses functional concepts to manage state and is extremely light-weight (633 bytes).

## Basic Usage

```ts
import { createStore } from 'staten';

const actions = {
  set: count => ({ count }),
  increment: () => state => ({ count: state.count + 1 })
};

const initialState = { count: 1 }

const store = createStore(actions, initialState);

store.subscribe(state => {
  console.log('State change!', state);
})

store.actions.increment();

store.getState(); //=> { count: 1 }
```

## Actions

Actions are at the root of Staten. An action is a function that returns a copy of the updated state. Notice how we only have to return the properties we want to update in the new state object.

```ts
const initialState = {
  count: 0,
  name: 'John'
};

const actions = {
  set: newCount => {
    return { count: newCount };
  }
}
```

Some actions need access to the current state. For this we add another function that takes `state` as an argument.

```ts
const initialState = {
  count: 0
};

const actions = {
  increment: () => (state) => {
    return { count: state.count + 1 };
  }
}
```

## Async actions

To handle async data fetching, use the `actions` argument to call another action.

```ts
const initialState = {
  user: null
};

const actions = {
  setUser: (user) => ({ user }),
  getUser: (id) => (state, actions) => {
    fetch(`/api/user/${id}`)
      .then(blob => blob.json())
      .then(res => {
        actions.setUser(res.data)
      })
  }
}
```

## Subscriptions

When state changes, your app needs to know about it. Using the `subscribe` method, you can attach as many subscriptions as you'd like.

```ts
const store = createStore({/* actions and initial state */});

store.subscribe(state => console.log(state));
store.subscribe((state, trigger) => {
  if (trigger === 'increment') {
    console.log('increment action was called');
  }
})
```