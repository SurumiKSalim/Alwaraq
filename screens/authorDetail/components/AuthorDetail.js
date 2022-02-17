import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, Dimensions, FlatList, ScrollView, TouchableOpacity,SafeAreaView } from "react-native";
import { AUTHORS_LIST, DOCUMENT_INFOS } from '../../../common/endpoints'
import Api from '../../../common/api'
import { connect } from 'react-redux'
import LinearGradient from 'react-native-linear-gradient'
import Images from '../../../assets/images'
import I18n from '../../../i18n'
import { FONT_REGULAR, FONT_BOLD, FONT_SEMIBOLD, FONT_MEDIUM } from '../../../assets/fonts'
import { PRIMARY_COLOR } from '../../../assets/color'
import { Placeholder, PlaceholderMedia, Shine } from "rn-placeholder"
import { BarIndicator } from 'react-native-indicators';

const { height, width } = Dimensions.get('screen')

const App = (props) => {

  const [author, setAuthor] = useState([])
  const [books, setBooks] = useState([])
  const [authorId, setAuthorId] = useState(props.navigation.getParam('authorId'))
  const [isLoading, setLoading] = useState(true)
  const [bookisLoading, setBookLoading] = useState(true)

  useEffect(() => {
    dataFetch()
    fetchBook()
  }, [])

  const dataFetch = (reset) => {
    let language = props.locale == 'ar' ? 1 : 2
    setLoading(true)
    Api('get', AUTHORS_LIST, { language: language, authorId: authorId }).then((response) => {
      if (response) {
        setAuthor(response.authors && response.authors[0])
      }
      setLoading(false)
    })
  }

  const fetchBook = () => {
    let language = props.locale == 'ar' ? 1 : 2
    setBookLoading(true)
    Api('get', DOCUMENT_INFOS, { authorId: authorId, language: language }).then(async (response) => {
      if (response) {
        setBooks(response.books)
      }
      setBookLoading(false)
    })
  }

  const renderItem = ({ item }) => {
    console.log('item', item)
    return (
      <TouchableOpacity style={[styles.cardRelated, { marginHorizontal: 5 }]}
        onPress={() => props.navigation.navigate('Detailbuy', { data: item })}>
        {/* onPress={() => this.setState({ popularDocumentList: _.without(this.state.popularDocumentList, item), data: item, videoBook: item && item.bookVideos, isBookBought: null })}> */}
        <LinearGradient style={styles.cardImage} colors={['rgba(0,0,0,.2)', 'rgba(0,0,0,.2)', 'rgba(0,0,0,.2)']}>
          <Image style={styles.cardImage} source={item.coverImage ? { uri: item.coverImage } : Images.default} />
        </LinearGradient>
        <Text style={[styles.nameText, { textAlign: props.locale == 'ar' ? 'right' : 'left' }]} ellipsizeMode={"middle"} numberOfLines={2}>{item.name}</Text>
        <View style={styles.prizeContainer}>
          <Text style={[styles.authorText, { textAlign: props.locale == 'ar' ? 'right' : 'left' }]} numberOfLines={2}>{item.author}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  const onPressMethod = () => {
    props.navigation.navigate('BookList', { authorId: authorId, authorName: author.authorName })
  }

  const loader = () => {
    return (
      <View style={styles.loaderContainer}>
        <Placeholder
          Animation={Shine}
          Left={props => (<PlaceholderMedia style={[styles.cardImage, { marginRight: 10 }]} />)}
          Right={props => (<PlaceholderMedia style={styles.loaderRight} />)}>
          <PlaceholderMedia style={styles.cardImage} />
        </Placeholder>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {!isLoading ?
        <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
          <LinearGradient style={styles.card} colors={['rgba(0,0,0,.2)', 'rgba(0,0,0,.2)', 'rgba(0,0,0,.2)']}>
            <Image style={styles.card} resizeMode='stretch' source={author.picture ? { uri: author.picture } : Images.default}></Image>
          </LinearGradient>
          <View style={styles.dateContainer}>
            <Text style={[styles.authorText, { textAlign: props.locale == 'ar' ? 'right' : 'left' }]} numberOfLines={1}>{author.birthDate} - {author.deathDate}</Text>
            {/* <Text style={[styles.authorText, { textAlign: 'right' }]} numberOfLines={1}>deathDate : {author.deathDate}</Text> */}
          </View>
          <Text style={[styles.nameText, { textAlign: props.locale == 'ar' ? 'right' : 'left' }]}>{author.authorName}</Text>
          <Text style={[styles.relatedBooks, { textAlign: props.locale == 'ar' ? 'right' : 'left' }]}>{I18n.t("Book")}</Text>
          <View style={[styles.emptyContainer, { alignSelf: props.locale == 'ar' ? 'flex-end' : 'flex-start' }]} />
          {!bookisLoading && books && books.length > 0 ?
            <FlatList
              horizontal={true}
              style={styles.flatlistStyle}
              showsHorizontalScrollIndicator={false}
              data={books}
              renderItem={renderItem}
              inverted={props.locale == 'ar' ? true : false}
              extraData={books}
              ListFooterComponent={
                <TouchableOpacity style={[styles.cardImage, { backgroundColor: '#ECECEC', marginLeft: 5 }]}
                  onPress={() => props.navigation.navigate('BookList', { authorId: authorId, authorName: author.authorName })}>
                  <Text style={styles.nameText} numberOfLines={2}>{I18n.t("see_more")}</Text>
                </TouchableOpacity>}
              keyExtractor={(item, index) => index.toString()}
            /> :
            <View style={{ flexDirection: props.locale == 'ar' ? 'row-reverse' : 'row' }}>
              {loader()}
            </View>
          }
        </ScrollView> :
        <BarIndicator style={styles.loaderContainer} color={PRIMARY_COLOR} size={34} />}
    </SafeAreaView>
  );
}

const mapStateToProps = (state) => {
  return {
    locale: state.userLogin.locale,
  }
}
export default connect(mapStateToProps)(App)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  card: {
    height: height / 2.5,
    width: '100%',
    borderRadius: 13,
    marginBottom: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10
  },
  authorText: {
    fontSize: 12,
    opacity: .6,
    fontSize: 14,
    fontFamily: FONT_REGULAR,
    flex: 1,
    marginBottom: 2
  },
  nameText: {
    fontSize: 17,
    fontFamily: FONT_SEMIBOLD,
    flexShrink: 1,
    flexWrap: 'wrap',
    alignItems: 'center',
    width: '100%',
    marginBottom: 6,
    textAlign: 'center'
  },
  relatedBooks: {
    fontSize: 18,
    fontFamily: FONT_MEDIUM,
    marginTop: 10
  },
  emptyContainer: {
    backgroundColor: PRIMARY_COLOR,
    height: 3,
    width: 55,
    marginBottom: 10,
  },
  cardRelated: {
    width: 130,
    borderRadius: 0,
    marginBottom: 4,
  },
  cardImage: {
    height: 160,
    width: 130,
    borderRadius: 4,
    marginBottom: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
