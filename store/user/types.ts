// Describing the shape of the system's slice of state
export interface UserState {
    id: number
    name: string
    age: number
    sex: number
}

// Describing the different ACTION NAMES available
export const UPDATE_SEX = 'UPDATE_SEX'
  
interface UpdateAgeAction {
    type: typeof UPDATE_SEX
    payload: UserState
}
  
export type UserActionTypes = UpdateAgeAction
  