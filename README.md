# react-use-fetch-factory
A factory pattern for react hooks to abstract away your tedious data fetching and selecting
logic.

## Install
```
npm i react-use-fetch-factory
```
or
```
yarn add react-use-fetch-factory
```

## API
The Hook takes three parameters.
* `selector` The selector you are using to retrieve your data from the redux state.
* `fetchActionCreator` An action creator that returns an action to trigger a fetch inside
a saga, thunk, etc.
* `emptyArrayAsFalsy` The Hook will check if there is data in the redux store. If there is
data found, the fetch will not be executed. Only if the selector returns `null` or
`undefined` the fetch action will be triggered. Setting this parameter to `true` will
include an empty array as `falsy` and trigger the fetch action.

## Usage
The best usage is to build your own custom Hook which uses the `useFetchFactory` Hook, like so:

```js
import {useFetchFactory} from 'react-use-fetch-factory';
import {getProducts, fetchProducts} from '../ducks/products';

export default function useProducts(ids) {
  return useFetchFactory(
    getProducts,
    () => fetchProducts(ids),
    true
  );
}
```

With you custom hook you can then import your selecting and fetching logic with one line:
```jsx harmony
import * as React from 'react';
import {useProducts} from '../hooks/fetching';

export function ProductsList(props) {
  const products = useProducts(props.productIds);

  return (
    <List>
      {products.map((product) => {
        <ProductView key={product.id} {...product}/>
      })}
    </List>
  );
}
```

Pretty neat, eh?

## What this is not
This hook is just an abstraction for the data selecting and fetching logic you need to build
inside your components. This is not handling the fetching and selecting logic itself. You need
to provide that yourself via selectors and redux middleware with sagas, thunks, etc.

## Motivation & How it works
Hooks are a great way to make our components leaner. With the release of react-redux 7 we
can finally use Hooks to provide our store to components. Previously we had to use `connect` to
bind our components to the redux store which ended in a complicated boilerplate looking higher
order component. This became particular annoying when dealing with selectors and data from
the server, because all of this check, fetching and selecting usually happened inside the component
code:

```jsx harmony
import * as React from 'react';
import {connect} from 'react-redux';
import {fetchTodos, toggleTodo, getTodosSelector} from '../ducks/todos';

class TodoApp extends React.Component {
  componentDidMount() {
    if(this.props.todos.length === 0) {
      this.props.fetchTodos();
    }
  }
  
  render() {
    return (
      <List>
        {this.props.todos.map((todo) => {
          <Todo key={todo.id} onToggle={() => toggleTodo(todo.id)}/>
        })}
      </List>
    );
  }
}

function mapStateToProps(state) {
  return {
    todos: getTodosSelector(state)
  }
}

function mapDispatchToProps() {
  return {
    fetchTodos,
    addTodo,
    toggleTodo,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TodoApp)
```

This is a lot of code for just displaying a list of Todos. We want to check if there are
todos when the component mounts and if not, we fetch them (e.g. via a saga, thunk or whatever you like)
And not only is this a lot of code, but we'll also repeat ourselves over and over again the
more components we have that just fetch some kind of data and display it.

With hooks we can get leaner:

```jsx harmony
import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {fetchTodos, toggleTodo, getTodosSelector} from '../ducks/todos';

export function TodoApp() {
  const dispatch = useDispatch();
  const todos = useSelector(getTodosSelector);

  useEffect(() => {
    if (todos.length === 0) {
      dispatch(fetchTodos());
    }
  }, [dispatch, fetchTodos]);

  return (
    <List>
      {todos.map((todo) => {
        <Todo key={todo.id} onToggle={() => dispatch(toggleTodo(todo.id))}/>
      })}
    </List>
  );
}
```

Way cleaner. But we also will repeat ourselves in this case. The only thing that will change
if we fetch different data is the selector, the dispatched fetching action and the ui
representation.
But wait. We can build our own Hooks! So let's abstract all this away:

```jsx harmony
import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';

export default function useFetchFactory(selector, fetchActionCreator, emptyArrayAsFalsy) {
  const dispatch = useDispatch();
  const data = useSelector(selector);

  useEffect(() => {
    if (
      !data ||
      (emptyArrayAsFalsy && data instanceof Array && data.length === 0)
    ) {
      dispatch(fetchActionCreator());
    }
  }, [dispatch]);

  return data;
}
```

And there it is! Our own custom data fetching and selecting Hook!

## Found an issue or bug?
Please open a pull request or an issue and contribute.