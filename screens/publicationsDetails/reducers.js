let initialStage = {
    totalLikes: 0,
    isLoading: true,
    isLiked: false,
    modalAction:false
}

const commentboard = (state = initialStage, actions) => {
    switch (actions.type) {
        case "LIKE_FORM_FETCHING":
            return { ...state, isLoading: true }
        case "LIKE_FORM_FETCHING_SUCCESS":
            return { ...state, isLoading: false, isLiked: actions.response.isLiked, totalLikes: actions.response.totalLikes }
        case "LIKE_FORM_FETCHING_FAILED":
            return { ...state, isLoading: false }
        case "FETCH_COMMENT_MODAL":
            return { ...state, modalAction: actions.response }
        default:
            return state
    }
}

export default commentboard

