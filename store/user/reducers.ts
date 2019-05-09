import { UPDATE_SEX, UserState, UserActionTypes } from '~/store/user/types'

const initialState: UserState = {
    id: 123132213,
    name: 'L',
    age: 20,
    sex: 1
}

export function userReducer(
  state = initialState,
  action: UserActionTypes
): UserState {
  switch (action.type) {
    case UPDATE_SEX: {
      return {
        ...state,
        ...action.payload
      }
    }
    default:
      return state
  }
}
