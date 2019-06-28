import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Action} from 'redux';

export function useFetchFactory<TState, TSelected>(
  selector: (state: TState) => TSelected,
  fetchActionCreator: () => Action,
  emptyArrayAsFalsy: boolean = false
) {
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
