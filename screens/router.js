import SideMenu from '../components/SideMenu'
import {createAppContainer} from 'react-navigation';
import React, { Component } from 'react';
import { createStackNavigator, HeaderBackButton } from 'react-navigation-stack';
import { createBottomTabNavigator, BottomTabBar } from 'react-navigation-tabs';
import { createDrawerNavigator } from 'react-navigation-drawer';
import BottomTab from '../components/BottomTab'
import { SafeAreaView} from 'react-native'
import Feather from "react-native-vector-icons/Feather"
import Entypo from "react-native-vector-icons/Entypo"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons"
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import { PRIMARY_COLOR, SECONDARY_COLOR } from '../assets/color'
import Home from './home'
import { PopularScreen } from './home/components/Home'
import Libraries from './libraries'
import Audio from './audio'
import Favourites from './favourites'
import Publisher from './Publisher'
import Profile from './profile'
import Detailbuy from './detailBuy'
import BookPage from './bookPage'
import Login from './login'
import SignUp from './signUp'
import ForgotPassword from './forgotPassword'
import Otp from './otp'
import Subscribe from './subscribe'
import Downloads from './downloads'
import Purchased from './purchased'
import PaymentPage from './paymentPage'
import PaymentWebView from './paymentWebView'
import AboutUs from './aboutUs'
import ChangeEmail from './changeEmail'
import ContactUs from './contactUs'
import BookMarks from './bookMarks'
import SearchPage from './searchPage'
import ResetPassword from './resetPassword'
import Entry from './entry'
import OnBoard from './onBoard'
import Quran from './quran'
import BookList from './bookList'
import Map from './map'
import TimeLine from './timeLine'
import PromoSubscription from './subscribe'
import RefCodeSubscription from './subscribe'
import PdfViewer from './pdfViewer'
import Author from './Author'
import AuthorList from './authorList'
import AuthorDetail from './authorDetail'
import ShareEarn from './shareEarn'
import AddressManager from './AddressManager'
import Purchase from './purchase'
import Applications from './applications'
import ApplicationDetails from './applicationDetails'
import EtisalatPayment from './etisalatPayment'
import TermsConditions from './termsConditions'
import PublicationsDetails from './publicationsDetails'
import Articles from './articles'
import Cart from './cart'
import ReportPage from './reportPage'
import IbnAwards from './ibnAwards'
import AwardInfo from './ibnAwardInfo'
import ApplyIbnAward from './applyIbnAward'
import IbnAwardBookList from './ibnAwardBookList'
import HelpAndSupport from './helpAndSupport'

const HomeStack = createStackNavigator({
  Home: {
    screen: Home
  },
},
  {
    headerMode: 'screen'
  }
)

const LibrariesStack = createStackNavigator({
  Libraries: {
    screen: Libraries
  },
},
  {
    headerMode: 'screen'
  }
)

const AudioStack = createStackNavigator({
  Audio: {
    screen: Audio
  },
},
  {
    headerMode: 'screen'
  }
)

// const FavouritesStack = createStackNavigator({
//   Favourites: {
//     screen: Favourites
//   },
// },
//   {
//     headerMode: 'screen'
//   }
// )

// const QuranStack = createStackNavigator({
//   Quran: {
//     screen: Quran
//   },
// },
//   {
//     headerMode: 'screen'
//   }
// )

const MapStack = createStackNavigator({
  Map: {
    screen: Map
  },
},
  {
    headerMode: 'screen'
  }
)

const TimeLineStack = createStackNavigator({
  TimeLine: {
    screen: TimeLine
  },
},
  {
    headerMode: 'screen'
  }
)

const DownloadsStack = createStackNavigator({
  Downloads: {
    screen: Downloads
  },
},
  {
    headerMode: 'screen'
  }
)

const PurchasedStack = createStackNavigator({
  Purchased: {
    screen: Purchased
  },
},
  {
    headerMode: 'screen'
  }
)

const AboutUsStack = createStackNavigator({
  AboutUs: {
    screen: AboutUs
  },
},
  {
    headerMode: 'screen'
  }
)

const PublisherStack = createStackNavigator({
  Publisher: {
    screen: Publisher
  },
},
  {
    headerMode: 'screen'
  }
)

const ProfileStack = createStackNavigator({
  Profile: {
    screen: Profile
  },
},
  {
    headerMode: 'screen'
  }
)

const BottomTabNavigator = createBottomTabNavigator(
  {
    Home: {
      screen: HomeStack,
      navigationOptions: {

        tabBarIcon: ({ focused }) => (
          focused ? <MaterialCommunityIcons name='home' color={PRIMARY_COLOR} size={34} style={{ width: 34 }} /> :
            <MaterialCommunityIcons name='home-outline' style={{ width: 34 }} color={SECONDARY_COLOR} size={30} />
        ),
        title: 'Events'
      },
    },

    Libraries: {
      screen: LibrariesStack,
      navigationOptions: {

        tabBarIcon: ({ focused }) => (
          focused ? <Feather name='grid' color={PRIMARY_COLOR} size={30} style={{ width: 34 }} /> :
            <Feather name='grid' style={{ width: 34 }} color={SECONDARY_COLOR} size={26} />
        ),
        title: 'Events',
      },
    },

    Audio: {
      screen: AudioStack,
      navigationOptions: {

        tabBarIcon: ({ focused }) => (
          focused ? <MaterialIcons name='audiotrack' color={PRIMARY_COLOR} size={30} style={{ width: 34 }} /> :
            <MaterialIcons name='audiotrack' style={{ width: 34 }} color={SECONDARY_COLOR} size={26} />
        ),
        title: 'Events',
      },
    },

    // Favourites: {
    //   screen:FavouritesStack,
    //   navigationOptions: {

    //     tabBarIcon: ({ focused }) => (
    //       focused ? <MaterialIcons name='favorite' color={PRIMARY_COLOR} size={34} style={{ width: 34 }} /> :
    //         <MaterialIcons name='favorite-border' style={{ width: 34 }} color={SECONDARY_COLOR} size={30} />
    //     ),
    //     title: 'Events'
    //   },
    // },

    Publisher: {
      screen: PublisherStack,
      navigationOptions: {

        tabBarIcon: ({ focused }) => (
          focused ? <MaterialCommunityIcons name='bookshelf' color={PRIMARY_COLOR} size={34} style={{ width: 34 }} /> :
            <MaterialCommunityIcons name='bookshelf' style={{ width: 34 }} color={SECONDARY_COLOR} size={30} />
        ),
        title: 'Events'
      },
    },

    Profile: {
      screen: ProfileStack,
      navigationOptions: {

        tabBarIcon: ({ focused }) => (
          focused ? <MaterialIcons name='person' color={PRIMARY_COLOR} size={34} style={{ width: 34 }} /> :
            <MaterialIcons name='person' style={{ width: 34 }} color={SECONDARY_COLOR} size={30} />
        ),
        title: 'Events'
      },
    },
  },
  {
    tabBarComponent: (props, state) => <SafeAreaView style={{ position: 'absolute', height: 70, bottom: 0, left: 0, right: 0,backgroundColor:'#fff' }}><BottomTab {...props} {...state} /></SafeAreaView>,
    tabBarOptions: {
      activeTintColor: 'red',
      showLabel: false,
      style: {
      },
    }
  }
)

const DrawerContent = (props) => (
  <SideMenu {...props} />
)

const DrawerNavigator = createDrawerNavigator({
  Home: {
    screen: BottomTabNavigator,
  },
  Libraries: {
    screen: LibrariesStack
  },
  Audio: {
    screen: AudioStack
  },
  Profile: {
    screen: ProfileStack
  },
  // Detailbuy: {
  //   screen: DetailbuyStack
  // },
  // Shared: {
  //   screen: SharedStack
  // },
},
  {
    contentComponent: DrawerContent,
    drawerWidth:260,
    contentOptions: {
      activeBackgroundColor: 'red',
      backBehavior: 'none',
      drawerType: 'slide',
    },
    initialRouteName: 'Home'
  },
)

const RootStack = createStackNavigator({
  Entry: {
    screen: Entry
  },
  HomePage: {
    screen: DrawerNavigator,
    navigationOptions: ({ navigation }) => ({
      header: null,
      headerBackTitle: null,
      headerTintColor:PRIMARY_COLOR
    })
  },
  Home: {
    screen: BottomTabNavigator,
  },
  Libraries: {
    screen: Libraries
  },
  Audio: {
    screen: Audio
  },
  Favourites: {
    screen: Favourites,
  },
  Profile: {
    screen: ProfileStack,
  },
  PopularScreen: {
    screen: PopularScreen,
  },
  Detailbuy: {
    screen: Detailbuy,
    path: 'bookId/:bookId',
    navigationOptions: ({ navigation }) => ({
      headerBackTitle: null,
      headerTintColor:PRIMARY_COLOR
    })
  },
  HelpAndSupport: {
    screen: HelpAndSupport,
    navigationOptions: ({ navigation }) => ({
      header: null,
    })
  },
  BookList: {
    screen: BookList,
  },
  BookPage: {
    screen: BookPage,
  },
  Login: {
    screen: Login
  },
  SignUp: {
    screen: SignUp
  },
  ForgotPassword: {
    screen: ForgotPassword
  },
  Otp: {
    screen: Otp
  },
  ResetPassword: {
    screen: ResetPassword
  },
  OnBoard: {
    screen: OnBoard
  },
  Subscribe: {
    screen: Subscribe
  },
  TimeLine:{
    screen:TimeLine
  },
  Downloads:{
    screen:Downloads
  },
  Purchased:{
    screen:Purchased
  },
  Publisher: {
    screen: PublisherStack,
  },
  Quran:{
    screen:Quran
  },
  Map:{
    screen:Map
  },
  AboutUs: {
    screen: AboutUs,
  },
  ReportPage: {
    screen: ReportPage,
    navigationOptions: ({ navigation }) => ({
      headerTintColor:PRIMARY_COLOR
    })
  },
  IbnAwards: {
    screen: IbnAwards,
    navigationOptions: ({ navigation }) => ({
      header: null,
      headerBackTitle: null,
    })
  },
  IbnAwardBookList: {
    screen: IbnAwardBookList,
    navigationOptions: ({ navigation }) => ({
      header: null,
      headerBackTitle: null,
    })
  },
  AwardInfo: {
    screen: AwardInfo,
    navigationOptions: ({ navigation }) => ({
      header: null,
    })
  },
  ApplyIbnAward: {
    screen: ApplyIbnAward,
    navigationOptions: ({ navigation }) => ({
      headerBackTitle: null,
      header: null,
      headerTintColor:PRIMARY_COLOR
    })
  },
  SearchPage: {
    screen: SearchPage
  },
  PdfViewer: {
    screen: PdfViewer
  },
  Author: {
    screen: Author
  },
  AuthorList: {
    screen: AuthorList,
    navigationOptions: ({ navigation }) => ({
      headerBackTitle: null,
      headerTintColor:PRIMARY_COLOR
    })
  },
  AuthorDetail: {
    screen: AuthorDetail,
    navigationOptions: ({ navigation }) => ({
      headerBackTitle: null,
      headerTintColor:PRIMARY_COLOR
    })
  },
  ShareEarn: {
    screen: ShareEarn,
  },
  AddressManager: {
    screen: AddressManager
  },
  Purchase: {
    screen: Purchase,
    navigationOptions: ({ navigation }) => ({
      headerBackTitle: null,
      headerTintColor:PRIMARY_COLOR
    })
  },
  Cart: {
    screen: Cart,
    navigationOptions: ({ navigation }) => ({
      headerBackTitle: null,
      headerTintColor:PRIMARY_COLOR
    })
  },
  PaymentPage: {
    screen: PaymentPage
  },
  PaymentWebView: {
    screen: PaymentWebView,
    navigationOptions: ({ navigation }) => ({
      headerBackTitle: null,
      headerTintColor:PRIMARY_COLOR
    })
  },
  BookMarks: {
    screen: BookMarks
  },
  Articles: {
    screen: Articles,
    navigationOptions: ({ navigation }) => ({
      headerBackTitle: null,
      headerTintColor:PRIMARY_COLOR
    })
  },
  PublicationsDetails: {
    screen: PublicationsDetails,
    navigationOptions: ({ navigation }) => ({
      headerBackTitle: null,
      headerTintColor:PRIMARY_COLOR
    })
  },
  TermsConditions: {
    screen: TermsConditions
  },
  EtisalatPayment: {
    screen: EtisalatPayment,
    navigationOptions: ({ navigation }) => ({
      header: null,
      headerBackTitle: null,
      headerTintColor:PRIMARY_COLOR
    })
  },
  Applications: {
    screen: Applications,
    navigationOptions: ({ navigation }) => ({
      header: null,
      headerBackTitle: null,
    })
  },
  ApplicationDetails: {
    screen: ApplicationDetails,
    navigationOptions: ({ navigation }) => ({
      header: null,
      headerBackTitle: null,
    })
  },
  ContactUs: {
    screen: ContactUs,
    navigationOptions: ({ navigation }) => ({
      headerBackTitle: null,
      headerTintColor:PRIMARY_COLOR
    })
  },
  ChangeEmail: {
    screen: ChangeEmail,
    navigationOptions: ({ navigation }) => ({
      headerBackTitle: null,
      headerTintColor:PRIMARY_COLOR
    })
  },
  PromoSubscription: {
    screen: PromoSubscription,
    path: 'PromoSubscription/:Promo',
    headerTintColor:PRIMARY_COLOR
  },
  RefCodeSubscription: {
    screen: RefCodeSubscription,
    path: 'RefCode/:Ref',
    headerTintColor:PRIMARY_COLOR
  },
});

const App = createAppContainer(RootStack);

export default App;