import { UPDATE_SEX } from '~/store/user/types'

export function updateSex(sex: number) {
    return {
        type: UPDATE_SEX,
        payload: { sex }
    }
}
