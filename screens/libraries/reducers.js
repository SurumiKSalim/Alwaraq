let initialStage = {
    modules: [],
    moduleList: [],
    audio:[],
    isLoading: false,
    isModuleListLoading: false,
    isAudioLoading:false,
    page: 1,
    isLastPage: false,
}

const library = (state = initialStage, actions) => {
    switch (actions.type) {
        case "MODULES_FETCHING":
            return { ...state, isLoading: true }
            break;
        case "MODULES_FETCHING_SUCCESS":
            return { ...state, isLoading: false, modules: actions.response.otherModules,audio:actions.response.audioModules}
            break;
        case "MODULES_FETCHING_FAILED":
            return { ...state, isLoading: false }
            break;
        case "MODULES_RESET":
            return { ...state, isLoading: false, modules: [],audio:[] }
            break;
        case "MODULES_LIST_FETCHING":
            return { ...state, isModuleListLoading:true}
            break;
        case "MODULES_LIST_FETCHING_SUCCESS":
            return { ...state, isModuleListLoading: false, moduleList:state.moduleList.concat(actions.response.articles), page: state.page + 1,isLastPage: actions.response.isLastPage }
            break;
        case "MODULES_LIST_FETCHING_FAILED":
            return { ...state, isModuleListLoading: false,isLastPage: actions.response.isLastPage }
            break;
        case "MODULES_LIST_RESET":
            return { ...state, isModuleListLoading: false,isLastPage: false,page:1, moduleList: [] }
            break;
        default:
            return state
    }
}
export default library