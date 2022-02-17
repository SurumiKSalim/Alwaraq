import I18n from 'react-native-i18n'
import en from './components/en'
import ar from './components/ar'

I18n.fallbacks = true;
I18n.translations = {
    ar,
    en,
}

export default I18n