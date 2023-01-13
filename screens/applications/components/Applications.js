import React, { Component, Fragment,useState,useEffect } from 'react'
import { StyleSheet, View, TouchableOpacity, Text, Dimensions, FlatList, Image, TextInput, ScrollView, SafeAreaView,Linking, Platform } from 'react-native'
import { connect } from 'react-redux'
import LinearGradient from 'react-native-linear-gradient'
import Images from '../../../assets/images'
import Api from '../../../common/api'
import I18n from '../../../i18n'
import { APPLICATIONS} from '../../../common/endpoints'
import { HeaderBackButton } from 'react-navigation-stack';
import { BarIndicator } from 'react-native-indicators'
import { PRIMARY_COLOR, SECONDARY_COLOR, TITLE_COLOR } from '../../../assets/color'
import { FONT_SEMIBOLD, FONT_ITALIC, FONT_LIGHT_ITALIC, FONT_LIGHT, FONT_MEDIUM, FONT_REGULAR, FONT_BOLD_ITALIC, FONT_EXTRA_BOLD, FONT_EXTRA_BOLD_ITALIC, FONT_BOLD } from '../../../assets/fonts'

const { height, width } = Dimensions.get('screen')

const App = (props) => {

    const [applications, setApplications] = useState([])
    const [isLoading, setLoading] = useState([])

    const dataFetch=(reset)=> {
        setLoading(true)
        Api('get', APPLICATIONS, { language: props.locale=='ar'?1:2 }).then((response) => {
            if (response) {
                setApplications(response.applications)
            }
            setLoading(false)
        })
    }
    
    useEffect(() => {
        dataFetch()
    }, [])

    const renderApplications=({ item, index })=> {
        return (
            <TouchableOpacity style={styles.cardGrid} onPress={() => props.navigation.navigate('ApplicationDetails', { data: item })}>
                <LinearGradient style={styles.card} colors={['rgba(0,0,0,.2)', 'rgba(0,0,0,.2)', 'rgba(0,0,0,.2)']}>
                    <Image style={styles.card} source={item.applicationIcon ? { uri: item.applicationIcon } : Images.default}
                        imageStyle={styles.imageStyle}>
                    </Image>
                </LinearGradient>
                <View style={styles.cardFooter}>
                    <Text style={styles.title} numberOfLines={2}>{item.application}</Text>
                </View>
            </TouchableOpacity>
        )
    }

        return (
            <Fragment>
                <SafeAreaView style={styles.containerContain} />
                <SafeAreaView style={styles.SafeAreaViewContainer}>
                    <View style={styles.headerContainer}>
                        <HeaderBackButton tintColor={PRIMARY_COLOR} onPress={() => props.navigation.goBack()} />
                        <Text style={styles.textHeader}>{I18n.t("Ev_Apps")}</Text>
                        <View style={styles.emptyContainer}/>
                    </View>
                    <ScrollView contentContainerStyle={styles.scroll}
                        // refreshControl={
                        //     <RefreshControl
                        //         refreshing={this.props.isLoading}
                        //         onRefresh={() => this.dataFetch()}
                        //         colors={["#F47424"]}
                        //     />
                        // }
                        showsVerticalScrollIndicator={false}>
                        <View style={styles.section}>
                            {!isLoading && applications && applications.length > 0 ?
                                <View style={styles.flatlist}>
                                    <FlatList
                                        style={styles.flatlistStyle}
                                        showsHorizontalScrollIndicator={false}
                                        data={applications}
                                        numColumns={3}
                                        renderItem={renderApplications}
                                        extraData={applications}
                                        keyExtractor={(item, index) => index}
                                    />
                                </View>:
                                <BarIndicator  style={{ marginTop:height*.2 }}  color={PRIMARY_COLOR} size={34} />
                                }
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </Fragment>
        )
}

const mapStateToProps = (state) => {
    return {
        applications: state.dashboard.applications,
        isLoading: state.dashboard.isLoading,
        locale: state.userLogin.locale,
    }
}
export default connect(mapStateToProps)(App)

const styles = StyleSheet.create({
    containerContain: {
        flex: 0,
        backgroundColor: PRIMARY_COLOR
    },
    SafeAreaViewContainer: {
        flex: 1,
        margin: 10
    },
    card: {
        height: 100,
        width: 100,
        borderRadius: 50,
        // height: height * .25,
        // width: width * .8,
    },
    linear: {
        flex: 1,
        padding: 15,
        alignSelf: 'center',
        borderRadius: 15,
    },
    cardFooter: {
        marginTop: 4,
    },
    title: {
        textAlign: 'center',
        fontFamily: FONT_REGULAR,
        color: TITLE_COLOR
    },
    cardGrid: {
        flex: 1 / 3,
        margin: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        flexDirection: 'row',
        height: 50,
        width: '100%',
        alignItems: 'center',
        justifyContent:'space-between',
        marginBottom: 5
    },
    textHeader: {
        fontSize: 22,
        fontFamily: FONT_BOLD,
        color: PRIMARY_COLOR,
        flex:1,
        textAlign:'center'
    },
    emptyContainer:{
        height:50,
        width:50
    },
})