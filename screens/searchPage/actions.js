import Api from '../../common/api'
import { SEARCH_LIBRARY, SEARCH_QURAN, SEARCH_LISAN, SEARCH_BOOK_PAGE, QURAN_SEARCH_PAGE, LISAN_SEARCH_PAGE,BOOKTITLES_SEARCH,AUTHORS_SEARCH } from '../../common/endpoints'
import { store } from '../../common/store'

var locale = store.getState().userLogin.locale == 'ar' ? 1 : 2

export function fetchSearchResult(option1, option2,wordFormRadio, searchText, subRadioValue,period,sortOrder) {
    console.log('dsgfdhg', subRadioValue,option2)
    var SEARCH = []
    if (option1 == 0)
        SEARCH = SEARCH_LIBRARY
    else if (option1 == 1)
        SEARCH = SEARCH_QURAN
    else if (option1 == 2)
        SEARCH = SEARCH_LISAN
    else if (option1 == 3)
        SEARCH = BOOKTITLES_SEARCH
    else
        SEARCH = AUTHORS_SEARCH
    return function (dispatch) {
        dispatch({ type: 'SEARCH_FETCHING' })
        let page = store.getState().searchpage.page != null ? store.getState().searchpage.page : 1
        let params={ WordForm: wordFormRadio, option: option2, offset: 1, searchtext: searchText, searchcolumn: subRadioValue,page:page,period:period,sortOrder:sortOrder,language:locale}
        if (true) {
            Api('get', SEARCH,params )
            .then((response) => {
                if (response)
                    dispatch({ type: 'SEARCH__FETCHING_SUCCESS', response: response, option1: option1 })
                else {
                    console.log('else response', response)
                    dispatch({ type: 'SEARCH__FETCHING_FAILED' })
                }
            })
        }
    }
}

export function fetchSearchBookPage(item, navigation, page, firstRadioValue,pageNo) {
    console.log('hdbshb 111', item)
    var BOOK_PAGE = []
    if (firstRadioValue == 0)
        BOOK_PAGE = SEARCH_BOOK_PAGE
    else if (firstRadioValue == 1)
        BOOK_PAGE = QURAN_SEARCH_PAGE
    else
        BOOK_PAGE = LISAN_SEARCH_PAGE
    return function (dispatch) {
        dispatch({ type: 'SEARCH_BOOK_PAGE_FETCHING' })
        let locale = store.getState().userLogin.locale == 'ar' ? 1 : 2
        Api('get', BOOK_PAGE, { WordForm: 1, option:item&&parseInt(item.searchoption), offset: page ? page : parseInt(item.searchoffset), searchtext: item.searchtext, book: parseInt(item.bookid), totalpages: parseInt(item.totalpages), searchcolumn: parseInt(item.searchcolumn),language:locale }).then((response) => {
            if (response) {
                dispatch({ type: 'SEARCH_BOOK_PAGE_SUCCESS', response: response })
                if (firstRadioValue != 1) {
                    // console.log('pageNo', pageNo,)
                    // console.log('page',response.exsearchpage[0].pageid)
                    navigation.navigate('BookPage', { response: response.exsearchpage[0].pagecontent,pageNo:pageNo, fromSearch: true, totalpages: item.totalpages, page: response.exsearchpage[0].pageid, item: item, itemResponse: response.exsearchpage[0], radioValue: firstRadioValue })
                } else
                    navigation.navigate('Quran', { response: response.quransearchpage[0].pagecontent, fromSearch: true, totalpages: item.totalpages, page: response.quransearchpage[0].offset, item: item, itemResponse: response.quransearchpage[0], radioValue: firstRadioValue })
            }
            else {
                dispatch({ type: 'SEARCH_BOOK_PAGE_FAILED' })
                navigation.navigate('BookPage', { fromSearch: 'failed' })
            }
        })
    }
}

export function resetSearchResult(searchVisible) {
    return { type: 'SEARCH__FETCHING_RESET' }
}