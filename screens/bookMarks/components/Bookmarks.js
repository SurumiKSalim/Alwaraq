import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Dimensions, Image, FlatList, Alert, ScrollView } from 'react-native';
import { connect } from 'react-redux'
import I18n from '../../../i18n'
import { FONT_REGULAR, FONT_BOLD, FONT_SEMIBOLD, FONT_MEDIUM } from '../../../assets/fonts'
import { PRIMARY_COLOR, TITLE_COLOR, SECONDARY_COLOR } from '../../../assets/color'
import LinearGradient from 'react-native-linear-gradient'
import { BOOKMARK } from '../../../common/endpoints'
import Api from '../../../common/api'

const { height, width } = Dimensions.get('screen')

const App = (props) => {

  const [isLoading, setLoading] = useState([])
  const [data, setData] = useState([])

  useEffect(() => {
    dataFetch()
  }, [])

  const dataFetch = (reset) => {
    setLoading(true)
    Api('post', BOOKMARK).then((response) => {
      console.log('hhh', response.bookmarks)
      if (response&&response.bookmarks) {
        const newArrayList = [];
        response.bookmarks.forEach(obj => {
          if (!newArrayList.some(o => o.bookId === obj.bookId)) {
            newArrayList.push({...obj});
          }
        });
        setData(newArrayList)
      }
      setLoading(false)
    })
  }

  const renderdata = ({ item, index }) => {
    console.log('item', item, index)
    return (
      <TouchableOpacity onPress={() => props.navigation.navigate('Detailbuy', { bookId: item.bookId})} style={styles.cardGrid} >
        <LinearGradient style={styles.card} colors={['rgba(0,0,0,.2)', 'rgba(0,0,0,.2)', 'rgba(0,0,0,.2)']}>
          <Image style={styles.card} source={item.coverImage ? { uri: item.coverImage } : Images.default}></Image>
        </LinearGradient>
        <Text style={[styles.nameText, { textAlign: props.locale == 'ar' ? 'right' : 'left' }]} ellipsizeMode={"middle"} numberOfLines={1}>{item.name}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <ScrollView style={styles.SafeAreaViewContainer}>
      {data &&
        <FlatList
          style={styles.flatlistStyle}
          showsHorizontalScrollIndicator={false}
          data={data}
          numColumns={2}
          renderItem={renderdata}
          extraData={data}
          keyExtractor={(item, index) => index}
        />}
    </ScrollView>
  );
}

const mapStateToProps = (state) => {
  return {
    locale: state.userLogin.locale,
  }
}
export default connect(mapStateToProps)(App)

const styles = StyleSheet.create({
  SafeAreaViewContainer: {
    flex: 1,
    margin: 10,
  },

  cardGrid: {
    flex: 1 / 2,
    paddingHorizontal: 5,
  },
  nameText: {
      fontSize: 17,
      fontFamily: FONT_SEMIBOLD,
      flexShrink: 1,
      flexWrap: 'wrap',
      alignItems: 'center',
      width: '100%',
      marginBottom:6
  },
  card: {
      height: height / 4,
      width: '100%',
      borderRadius: 13,
      marginBottom: 4,
  },
})