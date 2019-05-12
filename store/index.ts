import { Store, Reducer, createStore, combineReducers, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'

import { userReducer } from '~/store/user/reducers'
import { UserState } from './user/types'

interface ReducerState {
    user: UserState
}

const rootReducer: Reducer<ReducerState> = combineReducers<ReducerState>({
    user: userReducer,
})

export type StoreState = ReturnType<typeof rootReducer>

export const storeKey = '__STORE__'

export default function configureStore(initialStoreState?: StoreState): Store {
    const middlewares = [thunkMiddleware]
    const middleWareEnhancer = applyMiddleware(...middlewares)
  
    return createStore(
        rootReducer,
        initialStoreState,
        composeWithDevTools(middleWareEnhancer)
    )
}
  
/*
* 挂载 Window
*/
declare global {
    interface Window {
        __STORE__: Store
    }
}