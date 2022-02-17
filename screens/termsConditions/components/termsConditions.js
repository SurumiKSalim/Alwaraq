import React, { useEffect, useState } from 'react';
import { Text, View, SafeAreaView, StyleSheet, Dimensions,ScrollView } from 'react-native';
import Api from '../../../common/api'
import { ALWARAQ_PAGES } from '../../../common/endpoints'
import AutoHeightWebView from 'react-native-autoheight-webview'
import { FONT_PRIMARY, FONT_MEDIUM, FONT_REGULAR, FONT_SEMIBOLD, FONT_BOLD } from '../../../assets/fonts'


const { height, width } = Dimensions.get('screen')

const YourApp = (props) => {

    const [terms, setTerms] = useState('')
    const [title, setTitle] = useState('')

    useEffect(() => {
        console.log('locale', props.locale)
        Api('get', ALWARAQ_PAGES, { language: props.locale == 'ar' ? 1 : 2 }).then((response) => {
            console.log('res', response)
            if (response) {
                console.log('resn', response.page.description)
                setTerms(response.page && response.page.description)
                setTitle(response.page && response.page.name)
            }
        })
    }, [])

    return (
        <SafeAreaView style={styles.safeArea}>

            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.terms}>{title}</Text>
                {terms != '' &&
                    <View style={styles.webViewContainer}>
                        <AutoHeightWebView
                            style={styles.autoWebView}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            scrollEnabled={false}
                            // scalesPageToFit={true}
                            onShouldStartLoadWithRequest={event => {
                                if (event.url.slice(0, 4) === 'http') {
                                    Linking.openURL(event.url)
                                    return false
                                }
                                return true
                            }}
                            customStyle={Platform.OS != 'ios' ? `
                * {
                }
                p {
                  font-size: 20px;
                }
              `: `
              * {
              }
              p {
                font-size: 20px;
              }
            `}
                            mixedContentMode="compatibility"
                            source={{ html: terms }}
                        />
                    </View>}
            </ScrollView>
        </SafeAreaView>
    );
}

export default YourApp;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        marginHorizontal:15
    },
    webViewContainer: {
    },
    autoWebView: {
        width: width - 30,
        marginTop: 10
    },
    terms: {
        textAlign: 'center',
        marginTop: 20,
        fontFamily: FONT_SEMIBOLD,
        fontSize: 18,
    },
})