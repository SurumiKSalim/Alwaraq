
import Api from '../../common/api'
import { MODULES, MODULES_LIST, AUDIO_LIST } from '../../common/endpoints'
import { store } from '../../App'

export function fetchModules() {
    return function (dispatch) {
        dispatch({ type: 'MODULES_FETCHING' })
        Api('get', MODULES).then((response) => {
            if (response)
                dispatch({ type: 'MODULES_FETCHING_SUCCESS', response: response })
            else {
                dispatch({ type: 'MODULES_FETCHING_FAILED' })
            }
        })
    }
}

export function resetModules() {
    return { type: 'MODULES_RESET' }
}

export function fetchModulesList(moduleId) {
    return function (dispatch) {
        if (!store.getState().library.isModuleListLoading) {
            dispatch({ type: 'MODULES_LIST_FETCHING' })
            let  locale = store.getState().userLogin.locale
            let page = store.getState().library.page != null ? store.getState().library.page : 1
            Api('get', MODULES_LIST, { moduleId: moduleId, page: page,language:locale == 'ar' ? 1 : 2 }).then((response) => {
                if (response)
                    dispatch({ type: 'MODULES_LIST_FETCHING_SUCCESS', response: response })
                else {
                    dispatch({ type: 'MODULES_LIST_FETCHING_FAILED' })
                }
            })
        }
    }
}

export function resetModulesList() {
    return { type: 'MODULES_LIST_RESET' }
}