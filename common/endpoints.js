const HOST                      = 'https://alwaraq.net'
const USER_HOST                 = 'https://evusers.electronicvillage.org'

const SIGNUP                    = USER_HOST + '/json_userRegistration.php'
const CHANGE_PASSWORD           = USER_HOST + '/json_user_changePassword'
const CHANGE_PROFILE_PIC        = USER_HOST + '/json_user_changeProfilePic'
const USER_NOTIFICATION_STATUS  = USER_HOST + '/json_user_changeNotification'
const CHANGELANGUAGE            = USER_HOST + '/json_user_changeLanguage'
const LOGIN                     = USER_HOST + '/json_login.php'
const OTPVERIFY                 = USER_HOST + '/json_otpverify'
const FORGOT_PASSWORD           = USER_HOST + '/json_forgotPassword'
const RESET_PASSWORD            = USER_HOST + '/json_user_resetPassword'
const CHANGE_NAME               = USER_HOST + "/json_user_changeUsername.php"
const NOTIFICATION              = USER_HOST + '/json_appTokenInsert.php'
const PREMIUM_SUBSCRIPTION      = USER_HOST + '/json_subscriptions.php'
const PROMO_COUNTER             = USER_HOST + '/json_subscription_form.php'
const WALLET                    = USER_HOST + '/wallet.php'
const COUNTRY_LIST              = USER_HOST + '/countryinfos.php'
const SHIPPING_INFOS            = USER_HOST + '/user_shippingInfos.php'
const CONTACT_US                = USER_HOST + '/json_contactus.php'
const CHANGE_EMAIL              = USER_HOST + '/json_user_changeEmail'
const SEND_OTP                  = USER_HOST + '/json_sendOtp'
const USER_DELETE               = USER_HOST + '/json_user_deleteUser'
const BAD_COMMENTS              = USER_HOST + '/json_register_badcomments.php'
const APP_HELP_SUPPORT          = USER_HOST + '/json_appHelpSupport.php'


const QURAN                     = HOST + '/json_quranpage.php'
const QURAN_CONTENTS            = HOST + '/json_surainfos'
const BOOKMARK                  = HOST + '/bookmark_form.php'
const ENCRYPTION                = HOST + '/Core/SearchServlet/etisalat'
const IB_AWARDS_BY_TYPE         = HOST + '/json_ibAwards_byType.php'
const IB_AWARDS_LOCATION        = HOST + '/json_ibawards_locations.php'
const IB_AWARDS                 = HOST + '/json_ibAwards.php'


const DASHBOARD_CATEGORY        = HOST + '/json_subjectinfos.php'
const DOCUMENT_INFOS            = HOST + '/json_booklist.php'
const NEW_BOOK_PAGE             = HOST + '/json_bookpage.php'
const BOOK_PAGE                 = HOST + '/Core/mobi/json_bookpage'
const BOOK_READ                 = HOST + '/json_bookpage.php'
const BOOK_PAGE_CONTENT         = HOST + '/Core/mobi/json_booktree'
const SEARCH_LIBRARY            = HOST + '/Core/SearchServlet/json_searchall'
const SEARCH_INTERMEDIATE       = HOST + '/Core/SearchServlet/json_searchabsone'
const SEARCH_QURAN              = HOST + '/Core/SearchServlet/json_quransearchall'
const SEARCH_LISAN              = HOST + '/Core/SearchServlet/json_searchlisan'
const SEARCH_BOOK_PAGE          = HOST + '/Core/SearchServlet/json_mxsearchpage' 
const QURAN_SEARCH_PAGE         = HOST + '/Core/SearchServlet/json_quransearchpage' 
const LISAN_SEARCH_PAGE         = HOST + '/Core/SearchServlet/json_searchlisanpage' 
const OFFLINE_DOWNLOAD          = HOST + '/Core/mobi/jsonh_book'
const MODULES                   = HOST + '/json_modules.php'
const MODULES_LIST              = HOST + '/json_moduleListing.php'
const AUDIO                     = HOST + '/json_audio_modules.php'
const MAP                       = HOST + '/json_locations.php'
const PERIOD_LIST               = HOST + '/json_periodList.php'
const AUTHORS_LIST              = HOST + '/json_authorsList.php'
const BOOKTITLES_SEARCH         = HOST + '/json_searchBooks.php'
const AUTHORS_SEARCH            = HOST + '/json_searchAuthors.php'
const PUBLISHER                 = HOST + '/json_publisherList.php'
const BUY_NOW                   = HOST + '/json_order_form.php'
const COMMENTS_FORM             = HOST + '/book_comment_form.php'
const LIKE_FORM                 = HOST + '/book_like_form.php'
const HOME_NOTIFICATION         = HOST + '/json_home_notification.php'

const BOOK_BOUGHT               = HOST + '/json_book_bought.php'
const IS_BOOK_BOUGHT            = HOST + '/json_isBought_book.php'
const BOOK_BOUGHT_LIST          = HOST + '/json_bought_books.php'
const CHECK_FAVOURITES          = HOST + '/json_isfavourite_book.php'
const FAVOURITES                = HOST + '/json_favourite_alwaraq.php'
const FAVOURITES_ADD_DELETE     = HOST + '/json_fav_book_form.php'

const SHOPPING_CART             = HOST + '/json_shoppingCart_form.php'
const CART_LIST                 = HOST + '/json_carts.php'

const APP_INFO                  = 'https://www.electronicvillage.org/json_appInfo.php'
const SHARE_EARN                = 'https://www.electronicvillage.org/json_page.php?pageId=39'
const PRIVACY_POLICY            = 'https://www.electronicvillage.org/mohammedsuwaidi.php?pageid=27&languageid=2'
const PURCHASE                  = 'https://reacthub.org/createBookOrder.php'
const SIMBILLING                = 'https://alwaraq.net/etisalatsimbilling.php'
const ALWARAQ_PAGES             = 'http://alwaraq.net/json_alwaraqPages.php?id=1'
const HELP_AND_SUPPORT          = 'https://www.electronicvillage.org/mohammedsuwaidi.php?pageid=40&languageid='
const APPLICATIONS              = 'https://www.electronicvillage.org/ev_json_applications.php'
const NEWS_ARTICLE              = 'https://www.electronicvillage.org/ev_json_publicationlist.php?articleapplicationid=1'
const ARTICLE                   = 'https://www.electronicvillage.org/ev_json_article.php'
const ASTRO                     = 'http://watch.electronicvillage.org/json_astro_indetail.php'
const EMAIL_VALIDATE            = 'https://open.kickbox.com/v1/disposable/'
const HIJIRI_CONVERTER          = 'https://alwaraq.net/json_hijri_converter.php'
const IB_AWARDS_ABOUT           = 'https://www.electronicvillage.org/json_evPages.php?pageId=57'
const IB_AWARDS_CONDITIONS      = 'https://www.electronicvillage.org/json_evPages.php?pageId=56'
const IB_AWARDS_STATEMENTS      = 'https://www.electronicvillage.org/json_evPages.php?pageId=58'



export { 
    HOST,
    USER_HOST,

    SIGNUP,
    CHANGE_PASSWORD,
    CHANGE_PROFILE_PIC,
    USER_NOTIFICATION_STATUS,
    CHANGELANGUAGE,
    LOGIN,
    OTPVERIFY,
    FORGOT_PASSWORD,
    RESET_PASSWORD,
    CHANGE_NAME,
    NOTIFICATION,
    PREMIUM_SUBSCRIPTION,
    PROMO_COUNTER,
    WALLET,
    COUNTRY_LIST,
    SHIPPING_INFOS,
    CONTACT_US,
    CHANGE_EMAIL,
    SEND_OTP,
    USER_DELETE,
    BAD_COMMENTS,
    APP_HELP_SUPPORT,
    
    QURAN,
    QURAN_CONTENTS,
    BOOKMARK,
    ENCRYPTION,
    IB_AWARDS_BY_TYPE,
    IB_AWARDS_LOCATION,
    IB_AWARDS,

    DASHBOARD_CATEGORY,
    DOCUMENT_INFOS,
    NEW_BOOK_PAGE,
    BOOK_PAGE,
    BOOK_READ,
    BOOK_PAGE_CONTENT,
    SEARCH_LIBRARY,
    SEARCH_INTERMEDIATE,
    SEARCH_QURAN,
    SEARCH_LISAN,
    SEARCH_BOOK_PAGE,
    QURAN_SEARCH_PAGE,
    LISAN_SEARCH_PAGE,
    OFFLINE_DOWNLOAD,
    MODULES,
    MODULES_LIST,
    AUDIO,
    MAP,
    PERIOD_LIST,
    AUTHORS_LIST,
    BOOKTITLES_SEARCH,
    AUTHORS_SEARCH,
    PUBLISHER,
    BUY_NOW,
    COMMENTS_FORM,
    LIKE_FORM,
    HOME_NOTIFICATION,

    BOOK_BOUGHT,
    IS_BOOK_BOUGHT,
    BOOK_BOUGHT_LIST,
    CHECK_FAVOURITES,
    FAVOURITES,
    FAVOURITES_ADD_DELETE,

    SHOPPING_CART,
    CART_LIST,

    APP_INFO,
    SHARE_EARN,
    PRIVACY_POLICY,
    PURCHASE,
    SIMBILLING,
    ALWARAQ_PAGES,
    HELP_AND_SUPPORT,
    APPLICATIONS,
    NEWS_ARTICLE,
    ARTICLE,
    ASTRO,
    EMAIL_VALIDATE,
    HIJIRI_CONVERTER,
    IB_AWARDS_ABOUT,
    IB_AWARDS_CONDITIONS,
    IB_AWARDS_STATEMENTS
}


