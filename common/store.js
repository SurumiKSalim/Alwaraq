import { applyMiddleware, combineReducers, compose, createStore } from "redux"
import { persistReducer, persistStore } from 'redux-persist'
import hardSet from 'redux-persist/lib/stateReconciler/hardSet'
import AsyncStorage from '@react-native-community/async-storage';
import thunk from 'redux-thunk'
import logger from 'redux-logger'

import dashboard from '../screens/home/reducers'
import bookpage from '../screens/bookPage/reducers'
import searchpage from '../screens/searchPage/reducers'
import userLogin from '../screens/login/reducers'
import offlinebook from '../screens/detailBuy/reducers'
import forgotPassword from '../screens/forgotPassword/reducers'
import resetPassword from '../screens/resetPassword/reducers'
import favourites from '../screens/favourites/reducers'
import booklist from '../screens/bookList/reducers'
import library from '../screens/libraries/reducers'
import address from '../screens/AddressManager/reducers'
import otp from '../screens/otp/reducers'

const rootReducer = combineReducers({
    dashboard: dashboard, bookpage: bookpage, searchpage: searchpage, userLogin: userLogin, offlinebook: offlinebook, forgotPassword: forgotPassword,
    resetPassword: resetPassword, favourites: favourites, booklist: booklist, library: library,address:address,otp:otp
})

const rootPersistConfig = {
    key: 'root',
    storage: AsyncStorage,
    stateReconciler: hardSet
}

const store = createStore(
    persistReducer(rootPersistConfig, rootReducer),
    compose(applyMiddleware(thunk, logger))
)

const persistor = persistStore(store)

export { store, persistor }