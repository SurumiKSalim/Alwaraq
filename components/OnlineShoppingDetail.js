import React, { Component } from 'react'
import { View, StyleSheet, Text, StatusBar, TouchableOpacity, FlatList, Dimensions, Image, ScrollView, PixelRatio, Alert, TextInput, ImageBackground, ActivityIndicator, SafeAreaView, Linking } from 'react-native'
import Swiper from 'react-native-swiper'
import { NavigationActions } from 'react-navigation'
import Modal from 'react-native-modal'
// import Slider from '../../../components/react-native-slider'
import { connect } from 'react-redux'
import Icon from 'react-native-vector-icons/Ionicons'
import IconMaterial from 'react-native-vector-icons/MaterialIcons'
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Feather from 'react-native-vector-icons/Feather'
import { COLOR_SECONDARY, NAV_COLOR, COLOR_PRIMARY, BORDER_COLOR, DRAWER_COLOR, COLOR_ERROR, PRIMARY_COLOR, SECONDARY_COLOR } from '../../../assets/color'
import { FONT_PRIMARY, FONT_SECONDARY, FONT_BOLD, FONT_MULI_REGULAR, FONT_MULI_BOLD, FONT_MEDIUM } from '../../../assets/fonts'
import Images from '../../../assets/images'
import Api from '../../../common/api'
import { CART, ADD_ORDER, SHIPPING_INFO_USER, PRODUCT_LISTING } from '../../../common/endpoints'
import { WebView } from 'react-native-webview';


const { height, width } = Dimensions.get('screen')

var FONT_SEARCH = 16

if (PixelRatio.get() <= 2) {
    FONT_SEARCH = 14
}

class App extends Component {

    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props)
        this.state = {
            isModalVisible: false,
            isSplitVisible: false,
            toggle: false,
            option: null,
            selectedMonth: [],
            numQuantity: 1,
            cartCount: 0,
            isFavourite: false,
            cartType: this.props.navigation.getParam('offerType', 'Standard'),
            value: 0,
            data: [],
            brandCredit: [],
            buyLoading: false,
            cartLoading: false,
            isLoading: true,
            offerDetail: null,
            cartAdded: false,
            cartItems: [],
            error: false,
            products: [],
            productData: this.props.navigation.getParam('products', null),
            buyModel: false,
            buyDetails: [],
            shippingInfo: [],
            confirm: [],
            orderData: [],
            payModel: false,
            addressModel: false,
            itemAddress: '',
            faildModel: false,
            isVisibleLogin: false,
            isVisibleCart: false,
            declineModel: false,
            pictures: []
        }
        // PRIMARY_COLOR = select(store.getState())
        this.toggleQuantity = this.toggleQuantity.bind(this)
        this.remove = this.remove.bind(this)
        this.add = this.add.bind(this)
        this.addToCart = this.addToCart.bind(this)
        this.gotoCart = this.gotoCart.bind(this)
        this.renderHeader = this.renderHeader.bind(this)
        this.getSplitMonth = this.getSplitMonth.bind(this)
        this.renderSplit = this.renderSplit.bind(this)
        this.sendDetails = this.sendDetails.bind(this)
        this.buyNow = this.buyNow.bind(this)
        this.isSelected = this.isSelected.bind(this)
        this.renderAddress = this.renderAddress.bind(this)
    }

    componentDidMount() {
        var language = this.props.lang == 'ar' ? 1 : 2
        var productData = this.props.navigation.getParam('products', null)
        Api('get', PRODUCT_LISTING + `?language=${language}&productId=${productData.productId}`)
            .then((response) => {
                if (response) {
                    console.log('daaaaaaaaaaaaatttttttttttaaaaa', response[0])
                    this.setState({ products: response[0], pictures: response[0].pictures })
                }
            })
    }

    toggleQuantity() {
        this.setState({ toggle: !this.state.toggle })
    }

    remove() {
        if (this.state.numQuantity > 1) {
            this.setState({ numQuantity: this.state.numQuantity - 1 })
        }
    }

    add() {
        this.setState({ numQuantity: this.state.numQuantity + 1 })
    }

    renderHeader() {
        return (
            <View style={styles.header} >
                <Text style={styles.textHeader}>{this.state.data[0].configurableOptionType}</Text>
                <Text style={styles.textHeader}>Quantity</Text>
            </View>
        )
    }

    addToCart() {
        let productId = this.state.products.productId
        let quantity = this.state.numQuantity
        if (this.state.numQuantity > 0) {
            this.sendDetails({ productId, quantity })
        }
    }

    gotoCart() {
        if ((this.props.user)) {

            this.setState({ isModalVisible: false })
            this.props.navigation.dispatch(NavigationActions.navigate({ routeName: 'Cart' }))
        }
        else {
            this.setState({ isVisibleCart: true })
        }
    }

    sendDetails(body) {

        let productId = body.productId
        let quantity = body.quantity
        let formData = new FormData()
        formData.append('productId', productId);
        formData.append('quantity', quantity);
        formData.append('action', 'add');
        Api('post', CART, formData)
            .then((response) => {
                console.log('respppppppppoooooooooooonsssssssssssseeeeeeeeee', response)
                if (response) {
                    console.log('succcccceesssssssss')
                    this.setState({ cartLoading: false })
                }
                else {
                    this.setState({ cartLoading: false, buyLoading: false })
                }
            }
            )
    }

    onPressBuy() {
        if ((this.props.user)) {
            this.shippingInfo()
        }
        else {
            this.setState({ isVisibleLogin: true })
        }
    }

    shippingInfo() {
        Api('post', SHIPPING_INFO_USER)
            .then((response) => {
                console.log('shipping inffffffffffffooo', response)
                if (response) {
                    this.setState({ shippingInfo: response, addressModel: true, itemAddress: response[0] })
                }
            }
            )

    }

    buyNow() {

        let productId = this.state.products.productId
        let quantity = this.state.numQuantity
        let formData = new FormData()
        let shippingId = this.state.itemAddress.shippingId
        formData.append('productId', productId);
        formData.append('quantity', quantity);
        formData.append('action', 'buyNow');
        formData.append('language', 2);
        formData.append('shippingId', shippingId);
        Api('post', ADD_ORDER, formData)
            .then((response) => {
                console.log('byyyyyyyyyyyyyyyyynnwwwwwwwwwww', response)
                if (response.statusCode === 200) {
                    this.setState({ buyModel: true, buyLoading: false, buyDetails: response })
                }
                else {
                    this.setState({ buyLoading: false })
                }
            }
            )

    }

    confirmOrder() {

        let productId = this.state.products.productId
        let quantity = this.state.numQuantity
        let shippingId = this.state.itemAddress.shippingId
        let formData = new FormData()
        formData.append('productId', productId);
        formData.append('quantity', quantity);
        formData.append('action', 'orderNow');
        formData.append('shippingId', shippingId);
        Api('post', ADD_ORDER, formData)
            .then((response) => {
                console.log('confirmmmmmmmmmmmmmmmmmmmm', response)
                if (response.statusCode === 200) {
                    this.setState({ confirm: response })
                    this.createOrder()
                }
                else {
                    this.setState({ buyLoading: false })
                }
            }
            )
    }

    createOrder() {

        let productId = this.state.products.productId
        let productName = this.state.products.productName
        let amount = this.state.buyDetails.totalPrice
        let orderId = this.state.confirm.orderId
        let quantity = this.state.numQuantity
        let formData = new FormData()
        formData.append('productId', productId);
        formData.append('productName', productName);
        formData.append('amount', amount);
        formData.append('unique', Date.now().toString());
        formData.append('quantity', quantity);
        formData.append('returnUrl', `https://www.khawlafoundation.com/product/${productId}/0`);
        formData.append('orderId', orderId);
        Api('post', 'https://reacthub.org/createOrder.php', formData)
            .then((response) => {
                console.log('reeeeeeeeeeeeecattttt', response)
                if (response.statusCode === 200) {
                    this.setState({ orderData: response })
                    this.orderUpdate()
                }
            }
            )

    }

    orderUpdate() {

        let orderId = this.state.confirm.orderId
        let reference = this.state.orderData.orderReference
        let formData = new FormData()
        formData.append('orderId', orderId);
        formData.append('orderReference', reference);
        formData.append('action', 'orderUpdate');
        Api('post', ADD_ORDER, formData)
            .then((response) => {
                if (response.statusCode === 200) {
                    console.log('order updated')
                    this.setState({ buyModel: false, payModel: true })
                    // Linking.openURL(this.state.orderData.secureUrlPayment)
                }
            }
            )

    }
    orderInfo() {

        let orderId = this.state.confirm.orderId
        let formData = new FormData()
        formData.append('orderId', orderId);
        Api('post', ADD_ORDER, formData)
            .then((response) => {
                if (response.statusCode === 200) {
                    console.log('order infof')
                }
            }
            )

    }


    formatNumber(num) {
        let price = num.toFixed(2)
        return price.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
    }

    renderHeaderColor() {
        return (
            <View style={styles.headerColor}>
                <Text style={styles.textHeaderQuantity}>{this.state.data[0].configurableOptionType}</Text>
                <Text style={styles.textHeaderQuantity}>Delivery Month</Text>
                <Text style={styles.textHeaderQuantity}>Your QTY.</Text>
            </View>
        )
    }

    renderSplit = (item) => (
        <SplitOptions
            item={item}
            month={this.state.selectedMonth}
            selectMonth={this.getSplitMonth}
            getQuantity={this.getQuantity}
            minQuantity={this.state.offerDetail.minimumQuantity}
            maxQuantity={this.state.offerDetail.maximumQuantity}
            remainingMaximumQuantity={this.state.offerDetail.remainingMaximumQuantity}
            remainingQuantity={this.state.offerDetail.remainingQuantity}
            incrementQuantity={this.state.offerDetail.incrementQuantity}
        />
    )

    getSplitMonth(month, year, quantity) {
        if (this.state.selectedMonth.length > 0) {
            let obj = this.state.selectedMonth.find(x => x.month === month)
            if (this.state.selectedMonth.indexOf(obj) > -1) {
                this.state.selectedMonth.splice(this.state.selectedMonth.indexOf(obj), 1)
                this.setState({ selectedMonth: this.state.selectedMonth })
            }
            else {
                this.state.selectedMonth.push({ month: month, year: year, quantity: quantity })
                this.setState({ selectedMonth: this.state.selectedMonth })
            }
        }
        else {
            this.state.selectedMonth.push({ month: month, year: year, quantity: quantity })
            this.setState({ selectedMonth: this.state.selectedMonth })
        }
    }


    onSelect(value) {
        if (this.state.itemAddress != null) {
            this.setState({ itemAddress: value, })
        }
    }
    isSelected(name) {
        let status = false
        if (this.state.itemAddress.shippingId === name.shippingId)
            status = true
        return status
    }

    renderAddress({ item }) {
        return (
            <TouchableOpacity onPress={() => this.onSelect(item)} style={styles.categoryList}>
                {this.isSelected(item) ?
                    <IconMaterial name="radio-button-checked" size={19} color={PRIMARY_COLOR} style={{ marginTop: 3 }} />
                    :
                    <IconMaterial name="radio-button-unchecked" size={19} color={PRIMARY_COLOR} style={{ marginTop: 3 }} />
                }
                <View style={{ marginLeft: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={[styles.categoryText, { lineHeight: null }]}>{item.shippingAddress1}  </Text>
                        <View style={{ width: 1, height: 12, backgroundColor: SECONDARY_COLOR, opacity: .5 }}></View>
                        <Text style={[styles.categoryText, { lineHeight: null }]}>  {item.shippingAddress2}</Text>
                    </View>
                    <Text style={styles.categoryText}><Text style={{ color: SECONDARY_COLOR, fontSize: 14 }}>Email:</Text> {item.email}</Text>
                    <Text style={styles.categoryText}><Text style={{ color: SECONDARY_COLOR, fontSize: 14 }}>Mobile:</Text> {item.mobile}</Text>
                    <Text style={styles.categoryText}><Text style={{ color: SECONDARY_COLOR, fontSize: 14 }}>Telephone:</Text> {item.telephone}</Text>
                </View>
            </TouchableOpacity>
        );
    }
    _onNavigationStateChange(webViewState) {
        console.log('linkkkkkkkkkeeeeeed', webViewState)
    }

    render() {
        const product = this.state.products
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle='default' translucent={false} />
                <View style={styles.headerStrip}>
                    <TouchableOpacity onPress={() => this.props.navigation.goBack()} style={styles.backArrow}>
                        <Icon name='ios-arrow-back' size={24} color={NAV_COLOR} />
                    </TouchableOpacity>
                    <View style={styles.cart}>
                        <TouchableOpacity style={styles.goCart} onPress={this.gotoCart} >
                            <IconMaterial name='shopping-cart' size={28} color={NAV_COLOR} />
                            {/* <Badge style={[styles.absoluteBadge, { backgroundColor: PRIMARY_COLOR }]}>
                                    <View style={styles.badge}>
                                        <Text style={styles.textBadge}>{this.state.cartCount}</Text>
                                    </View>
                                </Badge> */}
                        </TouchableOpacity>
                    </View>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.swiper}>
                        <Swiper
                            showsPagination={true}
                            activeDotColor={PRIMARY_COLOR}
                            loop={false}
                            dotStyle={{ borderWidth: 1, borderColor: '#FFFFFF' }}
                            paginationStyle={{ position: 'absolute', top: height * .28 }}
                        >
                            {this.state.pictures.map((item, index) => {
                                return (
                                    <TouchableOpacity key={index} >
                                        <Image source={{ uri: item }} style={styles.sliderImage} />
                                    </TouchableOpacity>
                                )
                            }
                            )}
                        </Swiper>
                    </View>
                    <View style={styles.content}>
                        <TouchableOpacity style={styles.absolute}>
                            <IconMaterial name='favorite' size={24} color={BORDER_COLOR} />
                        </TouchableOpacity>
                        <Text style={styles.brand}>{product.productName}</Text>
                        <Text style={styles.title2}>{product.categoryName}</Text>
                        <Text numberOfLines={3} style={styles.title}>{product.productShortDescription}</Text>
                        <Text style={[styles.aud, { color: PRIMARY_COLOR }]}>{product.productPrice} USD</Text>
                        <View style={styles.row}>
                            <View style={styles.details}>
                                <Text style={styles.textDetails}>Category</Text>
                                <Text style={styles.textDetails}>Units</Text>
                                <Text style={styles.textDetails}>Weigth</Text>
                                <Text style={styles.textDetails}>Manufacturing Date</Text>
                            </View>
                            <View style={styles.details}>
                                <Text style={styles.detailCount}>{product.categoryName}</Text>
                                <Text style={styles.detailCount}>{product.productStock} Units Available</Text>
                                <Text style={styles.detailCount}>{product.productWeight} {product.productWeightUnit}</Text>
                                <Text style={styles.detailCount}>{product.productCreateDate}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.viewQuantity}>
                        <View style={styles.orderQuantity}>
                            <Text style={styles.textOrderQuantity}>Order Quantity</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity style={{ paddingLeft: 15, paddingRight: 15 }} onPress={this.remove}>
                                    <IconMaterial name='remove' size={24} color={BORDER_COLOR} />
                                </TouchableOpacity>
                                <View style={[styles.box, { borderColor: PRIMARY_COLOR }]}>
                                    <TextInput
                                        keyboardType='number-pad'
                                        maxLength={4}
                                        style={styles.number}
                                        value={this.state.numQuantity.toString()}
                                        onChangeText={(text) => this.setState({ numQuantity: text })}
                                    // onEndEditing={this.changeQuantity}
                                    />
                                </View>
                                <TouchableOpacity style={{ paddingLeft: 15, paddingRight: 15 }} onPress={this.add}>
                                    <IconMaterial name='add' size={24} color={BORDER_COLOR} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View style={styles.description}>
                        <Text style={styles.suggestedPrice}>{product.productLongDescription}</Text>
                    </View>
                    <View style={styles.button}>
                        <TouchableOpacity style={styles.add} onPress={() => this.setState({ isModalVisible: true, cartLoading: true }, () => this.addToCart())}>

                            <Text style={styles.textBuy}>Add to Cart</Text>

                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.buy, { backgroundColor: PRIMARY_COLOR }]} onPress={() => this.onPressBuy()}>
                            <Text style={styles.textBuy}>Buy Now</Text>

                        </TouchableOpacity>
                    </View>
                </ScrollView>
                <Modal
                    isVisible={this.state.isModalVisible}
                    hideModalContentWhileAnimating={true}
                    animationIn='zoomIn'
                    animationOut='zoomOut'
                    backdropTransitionOutTiming={0}
                    animationInTiming={1000}
                    animationOutTiming={1000}
                    onBackButtonPress={() => this.setState({ isModalVisible: false })}
                    onBackdropPress={() => this.setState({ isModalVisible: false })}
                    style={styles.modal}>
                    {!this.state.cartLoading &&
                        <View style={styles.containerModal}>
                            <View style={styles.modalClose}>
                                <IconMaterial name='close' size={24} color='#AAAAAA' onPress={() => this.setState({ isModalVisible: false })} />
                            </View>
                            <Feather name='check-circle' size={50} color='green' style={{ marginTop: 25 }} />
                            <Text style={styles.modalText}>Offer successfully added to cart</Text>
                            <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                <TouchableOpacity style={styles.searchCategory} onPress={this.gotoCart}>
                                    <Text style={styles.buttonText2}>View Cart</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.searchBrand2} onPress={() => this.setState({ isModalVisible: false })}>
                                    <Text style={styles.buttonText2}>Continue Shopping</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    }
                    {this.state.cartLoading &&
                        <View style={styles.containerModal}>
                            <ActivityIndicator size="small" color={PRIMARY_COLOR}></ActivityIndicator>
                        </View>
                    }
                </Modal>
                <Modal
                    isVisible={this.state.buyModel}
                    hasBackdrop={true}
                    backdropOpacity={0.5}
                    // onBackButtonPress={() => this.setState({ isVisible: false })}
                    // onBackdropPress={() => this.setState({ isVisible: false })}
                    useNativeDriver={true}
                    hideModalContentWhileAnimating={true}
                    backdropTransitionOutTiming={0}
                    animationInTiming={500}
                    animationOutTiming={500}
                    style={styles.bottomModal}
                >
                    <View style={{ backgroundColor: '#fff', padding: 10, borderTopRightRadius: 30, paddingTop: 0 }}>
                        <View style={[styles.titleBar, { marginBottom: 0 }]}>
                            <Text style={styles.addressTitle}>Confirm your order</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 30 }}>
                            <Image resizeMode="contain" source={{ uri: product.productPicture }} style={{ height: 120, width: 120, marginTop: 10 }} />
                            <View style={{ marginLeft: 20 }}>
                                <Text numberOfLines={2} style={{ fontSize: 20, fontFamily: FONT_MULI_BOLD, color: PRIMARY_COLOR }}>{product.productName}</Text>
                                <Text style={{ fontSize: 13, fontFamily: FONT_MULI_REGULAR, lineHeight: 20 }}>Shipping cost: {this.state.buyDetails.shippingCost}</Text>
                                <Text style={{ fontSize: 13, fontFamily: FONT_MULI_REGULAR }}>Tax: {this.state.buyDetails.tax}</Text>
                                <Text style={{ fontSize: 15, fontFamily: FONT_MULI_BOLD, color: PRIMARY_COLOR }}><Text style={{ fontSize: 13, color: '#000' }}>Total price: </Text>{this.state.buyDetails.totalPrice} USD</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginLeft: 5, marginRight: 10 }}>
                            <Text style={[styles.categoryText, { fontFamily: FONT_MULI_BOLD }]}>Address  </Text>
                            <TouchableOpacity onPress={() => this.setState({ buyModel: false, addressModel: true })}>
                                <Text style={[styles.categoryText, { color: 'blue', fontFamily: FONT_MULI_BOLD }]}>  Change</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.addAddress2}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={[styles.categoryText, { lineHeight: null }]}>{this.state.itemAddress && this.state.itemAddress.shippingAddress1}  </Text>
                                <View style={{ width: 1, height: 12, backgroundColor: SECONDARY_COLOR, opacity: .5 }}></View>
                                <Text style={[styles.categoryText, { lineHeight: null }]}>  {this.state.itemAddress && this.state.itemAddress.shippingAddress2}</Text>
                            </View>
                            <Text style={styles.categoryText}><Text style={{ color: SECONDARY_COLOR, fontSize: 14 }}>Email:</Text> {this.state.itemAddress && this.state.itemAddress.email}</Text>
                            <Text style={styles.categoryText}><Text style={{ color: SECONDARY_COLOR, fontSize: 14 }}>Mobile:</Text> {this.state.itemAddress && this.state.itemAddress.mobile}</Text>
                            <Text style={styles.categoryText}><Text style={{ color: SECONDARY_COLOR, fontSize: 14 }}>Telephone:</Text> {this.state.itemAddress && this.state.itemAddress.telephone}</Text>
                        </View>
                        <View style={styles.nextButton}>
                            <TouchableOpacity onPress={() => this.setState({ buyModel: false })} style={styles.nextbuttonbox}>
                                <Text style={styles.addAddressTitle}>CANCEL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.confirmOrder()} style={[styles.nextbuttonbox, { width: 180 }]}>
                                <Text style={styles.addAddressTitle}>CONFIRM ORDER</Text>
                                <AntDesign name="doubleright" size={16} color="#ffff" style={{ marginLeft: 5 }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <Modal
                    isVisible={this.state.addressModel}
                    hasBackdrop={true}
                    backdropOpacity={0.5}
                    onBackButtonPress={() => this.setState({ addressModel: false })}
                    onBackdropPress={() => this.setState({ addressModel: false })}
                    useNativeDriver={true}
                    hideModalContentWhileAnimating={true}
                    backdropTransitionOutTiming={0}
                    animationInTiming={500}
                    animationOutTiming={500}
                    style={styles.bottomModal}
                >
                    <View style={{ backgroundColor: '#fff', padding: 10, borderTopRightRadius: 30, paddingTop: 0 }}>
                        <View style={styles.titleBar}>
                            <Text style={styles.addressTitle}>Select Address</Text>
                        </View>
                        <View>
                            {this.state.shippingInfo != "" ?
                                <FlatList
                                    data={this.state.shippingInfo}
                                    renderItem={this.renderAddress}
                                    keyExtractor={(item, index) => index.toString()}
                                    ListHeaderComponent={this.renderFirst}
                                />
                                :
                                <Text style={{ marginTop: 20, marginBottom: 20, marginLeft: 5, fontFamily: FONT_MULI_REGULAR, color: SECONDARY_COLOR, fontSize: 16 }}>No address found !  please add your address</Text>
                            }
                        </View>
                        <TouchableOpacity style={styles.addAddress}>
                            <AntDesign name="pluscircleo" size={17} color={PRIMARY_COLOR} />
                            <Text style={styles.addAddressTitle1}> Add new address</Text>
                        </TouchableOpacity>
                        <View style={styles.nextButton}>
                            <TouchableOpacity onPress={() => this.setState({ addressModel: false })} style={styles.nextbuttonbox}>
                                <Text style={styles.addAddressTitle}>CANCEL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity disabled={this.state.shippingInfo == "" ? true : false} onPress={() => this.setState({ addressModel: false }, this.buyNow())} style={[this.state.shippingInfo != ''?styles.nextbuttonbox: styles.nextbuttonboxInactive]}>
                                <Text style={styles.addAddressTitle}>NEXT</Text>
                                <AntDesign name="doubleright" size={16} color="#ffff" style={{ marginLeft: 5 }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <Modal
                    isVisible={this.state.payModel}
                    backdropOpacity={0.5}
                    useNativeDriver={true}
                    hideModalContentWhileAnimating={true}
                    backdropTransitionOutTiming={0}
                    animationInTiming={100}
                    animationOutTiming={100}
                    style={{ height: height, width: width, margin: 0 }}
                >
                    <WebView
                        style={{ flex: 1 }}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        // onNavigationStateChange={this._onNavigationStateChange.bind(this)}
                        onShouldStartLoadWithRequest={event => {
                            if (event.url.slice(0, 33) === 'https://www.khawlafoundation.com/') {
                                // Linking.openURL(event.url)
                                console.log('link...........................', event.url)
                                if (event.url.includes('transactionStatus=0')) {
                                    this.setState({ payModel: false, faildModel: true })
                                    setTimeout(() => {
                                        this.setState({
                                            faildModel: false
                                        })
                                    }, 2000)
                                    this.orderInfo()
                                }
                                else if (event.url.includes('transactionStatus=1')) {
                                    this.setState({ payModel: false, successModel: true })
                                    setTimeout(() => {
                                        this.setState({
                                            successModel: false
                                        })
                                    }, 2000)
                                    this.orderInfo()
                                } else if (event.url.includes('transactionStatus=-1')) {
                                    this.setState({ payModel: false, declineModel: true })
                                    setTimeout(() => {
                                        this.setState({
                                            declineModel: false
                                        })
                                    }, 2000)
                                    this.orderInfo()
                                }
                                return false
                            }
                            return true
                        }}
                        source={{ uri: this.state.orderData.secureUrlPayment }}
                    />
                </Modal>
                <Modal
                    isVisible={this.state.faildModel}
                    hideModalContentWhileAnimating={true}
                    animationIn='zoomIn'
                    animationOut='slideOutRight'
                    animationInTiming={800}
                    animationOutTiming={500}
                    style={styles.modal}>
                    {!this.state.cartLoading &&
                        <View style={styles.fullModel}>
                            <IconMaterial name='cancel' size={80} color='red' />
                            <Text style={styles.modalTextFaild}>Payment Cancelled!</Text>
                        </View>
                    }
                    {this.state.cartLoading &&
                        <View style={styles.containerModal}>
                            <ActivityIndicator size="small" color={PRIMARY_COLOR}></ActivityIndicator>
                        </View>
                    }
                </Modal>
                <Modal
                    isVisible={this.state.successModel}
                    hideModalContentWhileAnimating={true}
                    animationIn='zoomIn'
                    animationOut='slideOutRight'
                    animationInTiming={800}
                    animationOutTiming={500}
                    style={styles.modal}>
                    {!this.state.cartLoading &&
                        <View style={styles.fullModel}>
                            <Feather name='check-circle' size={60} color='green' />
                            <Text style={styles.modalTextSuccess}>{I18n.t("Payment_success")}</Text>
                        </View>
                    }
                    {this.state.cartLoading &&
                        <View style={styles.containerModal}>
                            <ActivityIndicator size="small" color={PRIMARY_COLOR}></ActivityIndicator>
                        </View>
                    }
                </Modal>
                <Modal
                    isVisible={this.state.declineModel}
                    hideModalContentWhileAnimating={true}
                    animationIn='zoomIn'
                    animationOut='slideOutRight'
                    animationInTiming={800}
                    animationOutTiming={500}
                    style={styles.modal}>
                    {!this.state.cartLoading &&
                        <View style={styles.fullModel}>
                            <IconMaterial name='error-outline' size={80} color='red' />
                            <Text style={styles.modalTextFaild}>{I18n.t("Payment_Declined")}</Text>
                        </View>
                    }
                    {this.state.cartLoading &&
                        <View style={styles.containerModal}>
                            <ActivityIndicator size="small" color={PRIMARY_COLOR}></ActivityIndicator>
                        </View>
                    }
                </Modal>
                <Modal
                    isVisible={this.state.isVisibleLogin}
                    hideModalContentWhileAnimating={true}
                    animationIn='zoomIn'
                    animationOut='zoomOut'
                    useNativeDriver={true}
                    hideModalContentWhileAnimating={true}
                    animationOutTiming={300}
                    onBackButtonPress={() => this.setState({ isVisibleLogin: false })}
                    onBackdropPress={() => this.setState({ isVisibleLogin: false })}
                    style={styles.modal}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalText}>Please Login to continue</Text>
                        </View>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.buttonCancel} onPress={() => this.setState({ isVisibleLogin: false })}>
                                <Text style={styles.cancel}>CANCEL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.setState({ isVisibleLogin: false }, () => this.props.navigation.navigate('Login', { page: 'OnlineShopping', data: this.state.products }))} style={styles.button2}>
                                <Text style={styles.subscribe}>LOGIN</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <Modal
                    isVisible={this.state.isVisibleCart}
                    hideModalContentWhileAnimating={true}
                    animationIn='zoomIn'
                    animationOut='zoomOut'
                    useNativeDriver={true}
                    hideModalContentWhileAnimating={true}
                    animationOutTiming={300}
                    onBackButtonPress={() => this.setState({ isVisibleCart: false })}
                    onBackdropPress={() => this.setState({ isVisibleCart: false })}
                    style={styles.modal}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalText}>Please Login to continue</Text>
                        </View>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.buttonCancel} onPress={() => this.setState({ isVisibleCart: false })}>
                                <Text style={styles.cancel}>CANCEL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.setState({ isVisibleCart: false }, () => this.props.navigation.navigate('Login', { page: 'OnlineShopping', data: this.state.products }))} style={styles.button2}>
                                <Text style={styles.subscribe}>LOGIN</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView >
        )
    }
}

const mapStateToProps = (state) => ({
    user: state.userLogin.user,
    lang: state.programmes.lang,
})

export default connect(mapStateToProps)(App)

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        flex: 1,
        backgroundColor: DRAWER_COLOR
    },
    headerStrip: {
        paddingRight: 15,
        paddingBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: .5,
        borderBottomColor: BORDER_COLOR
    },
    backArrow: {
        paddingRight: 15,
        paddingLeft: 15,
        paddingTop: 15
    },
    cart: {
        flex: 1,
        alignItems: 'flex-end'
    },
    goCart: {
        paddingTop: 15,
        justifyContent: 'center',
        alignItems: 'center'
    },
    absoluteBadge: {
        position: 'absolute',
        right: -11,
        top: 0,
        zIndex: 10,
        borderWidth: 4,
        borderColor: DRAWER_COLOR,
        justifyContent: 'center',
        alignItems: 'center'
    },
    badge: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    textBadge: {
        color: 'white',
        fontSize: 11,
        textAlign: 'center'
    },
    modalHeader: {
        height: 50,
        backgroundColor: COLOR_PRIMARY,
        alignItems: 'center',
        justifyContent: 'center'
    },
    split: {
        fontSize: 18,
        fontFamily: FONT_PRIMARY,
        color: DRAWER_COLOR
    },
    splitAvailable: {
        backgroundColor: '#333333',
        flexDirection: 'row',
        padding: 15,
        alignItems: 'center',
        marginHorizontal: 15,
        marginTop: 15
    },
    available: {
        paddingLeft: 15,
        fontSize: 14,
        fontFamily: FONT_PRIMARY,
        color: DRAWER_COLOR
    },
    modalFlatlist: {
        paddingTop: 15
    },
    splitCard: {
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15
    },
    colorContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    color: {
        paddingLeft: 5,
        fontSize: 14,
        fontFamily: FONT_PRIMARY,
        color: COLOR_SECONDARY,
        lineHeight: 20
    },
    subContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    remove: {
        backgroundColor: '#333333',
        borderWidth: 3,
        borderColor: '#333333'
    },
    boxSplit: {
        height: 30,
        width: 60,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        alignItems: 'center',
        justifyContent: 'center'
    },
    boxSplitActive: {
        height: 30,
        width: 60,
        borderWidth: 1,
        borderColor: COLOR_PRIMARY,
        alignItems: 'center',
        justifyContent: 'center'
    },
    addContainer: {
        backgroundColor: COLOR_PRIMARY,
        borderWidth: 3,
        borderColor: COLOR_PRIMARY
    },
    error: {
        textAlign: 'center',
        fontSize: 14,
        color: COLOR_ERROR,
        paddingBottom: 10,
        fontFamily: FONT_SECONDARY
    },
    splitFooter: {
        backgroundColor: '#333333',
        padding: 15
    },
    done: {
        backgroundColor: COLOR_PRIMARY,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center'
    },
    doneSplit: {
        fontSize: 16,
        fontFamily: FONT_PRIMARY,
        color: DRAWER_COLOR
    },
    swiper: {
        height: height * .3,
        borderBottomWidth: 1,
        borderBottomColor: BORDER_COLOR,
        justifyContent: 'center',
        alignItems: 'center'
    },
    sliderImage: {
        height: '90%',
        width: width,
        resizeMode: 'contain',
    },
    textSecure: {
        fontSize: 30,
        fontFamily: FONT_BOLD,
        color: COLOR_PRIMARY,
        transform: [{ rotate: '320deg' }],
    },
    content: {
        paddingTop: 24,
        paddingLeft: 15,
        paddingLeft: 15,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: BORDER_COLOR
    },
    absolute: {
        height: 48,
        width: 48,
        borderRadius: 24,
        position: 'absolute',
        right: 30,
        top: -24,
        zIndex: 10,
        elevation: 3,
        backgroundColor: DRAWER_COLOR,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 1, height: 1 },
        shadowColor: 'black',
        shadowOpacity: .3,
    },
    brand: {
        fontSize: 16,
        fontFamily: FONT_PRIMARY,
        color: NAV_COLOR,
        lineHeight: 23,
        textTransform: 'uppercase'
    },
    title: {
        fontSize: 15,
        fontFamily: FONT_PRIMARY,
        color: NAV_COLOR,
    },
    title2: {
        fontSize: 15,
        fontFamily: FONT_PRIMARY,
        color: '#AAAAAA',
    },
    suggestedPrice: {
        fontSize: 16,
        fontFamily: FONT_PRIMARY,
        color: '#AAAAAA',
        paddingBottom: 10
    },
    aud: {
        fontSize: 22,
        fontFamily: FONT_SECONDARY,
        color: COLOR_PRIMARY,
        paddingBottom: 15
    },
    brandCredit: {
        paddingBottom: 15,
        alignItems: 'flex-start',
        paddingRight: 15
    },
    creditAvailable: {
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 8,
        paddingBottom: 8,
        backgroundColor: COLOR_PRIMARY,
        borderRadius: 20,
    },
    textCredit: {
        fontSize: 16,
        fontFamily: FONT_PRIMARY,
        color: DRAWER_COLOR
    },
    useCredit: {
        fontSize: 16,
        fontFamily: FONT_SECONDARY,
        color: NAV_COLOR,
        paddingTop: 15,
        paddingBottom: 5
    },
    slider: {
        width: '100%'
    },
    sliderThumb: {
        height: 30,
        width: 30,
        borderRadius: 25,
        elevation: 3,
        backgroundColor: DRAWER_COLOR,
        shadowOffset: { width: 1, height: 1 },
        shadowColor: 'black',
        shadowOpacity: .3,
    },
    value: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 15
    },
    minValue: {
        fontSize: 15,
        fontFamily: FONT_SECONDARY,
        color: COLOR_PRIMARY
    },
    maxValue: {
        flex: 1,
        fontSize: 15,
        fontFamily: FONT_SECONDARY,
        color: COLOR_PRIMARY,
        textAlign: 'right'
    },
    row: {
        flexDirection: 'row'
    },
    details: {
        flex: 1
    },
    textDetails: {
        fontSize: 16,
        fontFamily: FONT_PRIMARY,
        color: '#AAAAAA',
        lineHeight: 22
    },
    detailCount: {
        fontSize: 16,
        fontFamily: FONT_PRIMARY,
        color: COLOR_SECONDARY,
        lineHeight: 22
    },
    viewQuantity: {
        borderBottomWidth: 1,
        borderBottomColor: BORDER_COLOR
    },
    orderQuantity: {
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    orderQty: {
        padding: 15,
    },
    headerQuantity: {
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#EEEEEE',
        paddingHorizontal: 15,
        marginBottom: 15,
    },
    textHeaderQuantity: {
        fontSize: 14,
        fontFamily: FONT_SECONDARY,
        color: COLOR_SECONDARY
    },
    cardQuantity: {
        flexDirection: 'row',
        paddingBottom: 15,
        paddingHorizontal: 15,
        justifyContent: 'space-between'
    },
    contentQty: {
        flex: 1,
        justifyContent: 'center'
    },
    textQty: {
        fontSize: 14,
        fontFamily: FONT_PRIMARY,
        color: COLOR_SECONDARY
    },
    contentBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    boxCalender: {
        height: 40,
        width: 40,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: '#DDDDDD',
        alignItems: 'center',
        justifyContent: 'center'
    },
    contentPrice: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center'
    },
    textPrice: {
        fontSize: 16,
        fontFamily: FONT_PRIMARY,
        color: COLOR_PRIMARY
    },
    gst: {
        fontSize: 12,
        fontFamily: FONT_PRIMARY,
        color: COLOR_PRIMARY
    },
    textOrderQuantity: {
        fontSize: 16,
        fontFamily: FONT_SECONDARY,
        color: NAV_COLOR
    },
    quantity: {
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textQuantity: {
        fontSize: 16,
        fontFamily: FONT_SECONDARY,
        color: NAV_COLOR,
        marginBottom: 5
    },
    textSelect: {
        fontSize: 14,
        fontFamily: FONT_PRIMARY,
        color: '#AAAAAA',
    },
    flatlist: {
        paddingLeft: 15,
        paddingRight: 15
    },
    headerColor: {
        padding: 15,
        flexDirection: 'row',
        height: 50,
        borderBottomWidth: 1,
        borderTopWidth: 1,
        borderColor: BORDER_COLOR,
        justifyContent: 'space-between'
    },
    header: {
        flexDirection: 'row',
        padding: 15,
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: BORDER_COLOR
    },
    textHeader: {
        fontSize: 16,
        fontFamily: FONT_PRIMARY,
        color: '#AAAAAA'
    },
    box: {
        height: 30,
        width: 60,
        borderWidth: 1,
        borderRadius: 4,
        borderColor: COLOR_PRIMARY,
        alignItems: 'center',
        justifyContent: 'center'
    },
    number: {
        fontSize: 16,
        fontFamily: FONT_PRIMARY,
        color: NAV_COLOR,
        paddingBottom: 0,
        paddingTop: 0,
        marginBottom: 0,
        marginTop: 0,
    },
    supplierName: {
        fontSize: 14,
        fontFamily: FONT_PRIMARY,
        color: '#AAAAAA',
        paddingBottom: 10,
        paddingTop: 10,
        textAlign: 'left',
        paddingLeft: 15,
    },
    shipping: {
        padding: 15,
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: BORDER_COLOR
    },
    description: {
        padding: 15
    },
    textDescription: {
        flex: 1,
        fontSize: 16,
        fontFamily: FONT_PRIMARY,
        color: COLOR_SECONDARY,
        lineHeight: 20
    },
    button: {
        padding: 15,
        flexDirection: 'row',
    },
    add: {
        flex: 1,
        padding: 15,
        backgroundColor: '#333333',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        margin: 4
    },
    textAdd: {
        fontSize: 18,
        fontFamily: FONT_PRIMARY,
        color: DRAWER_COLOR
    },
    buy: {
        flex: 1,
        padding: 15,
        backgroundColor: COLOR_PRIMARY,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        margin: 4
    },
    textBuy: {
        fontSize: 18,
        fontFamily: FONT_PRIMARY,
        color: DRAWER_COLOR
    },
    containerModal: {
        width: '80%',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center'
    },
    modalClose: {
        position: 'absolute',
        top: 10,
        right: 15,
        zIndex: 1
    },
    modalText: {
        fontSize: 16,
        fontFamily: FONT_PRIMARY,
        color: COLOR_SECONDARY,
        lineHeight: 22,
        textAlign: 'center',
        paddingTop: 25,
        paddingBottom: 10
    },
    modalTextFaild: {
        fontSize: 20,
        fontFamily: FONT_PRIMARY,
        color: 'red',
        lineHeight: 22,
        textAlign: 'center',
        paddingTop: 25,
        paddingBottom: 10
    },
    modalTextSuccess: {
        fontSize: 20,
        fontFamily: FONT_PRIMARY,
        color: 'green',
        lineHeight: 22,
        textAlign: 'center',
        paddingTop: 25,
        paddingBottom: 10
    },
    buttonText2: {
        fontSize: 13,
        fontFamily: FONT_MEDIUM,
        color: '#FFFFFF',
        textAlign: 'center'
    },
    buttonText: {
        fontSize: FONT_SEARCH,
        fontFamily: FONT_PRIMARY,
        color: '#FFFFFF',
    },
    searchBrand: {
        backgroundColor: '#AAAAAA',
        padding: 5,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: '20%',
        marginTop: 10
    },
    searchBrand2: {
        backgroundColor: '#AAAAAA',
        width: '50%',
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
        padding: 5,
    },
    searchCategory: {
        backgroundColor: PRIMARY_COLOR,
        width: '50%',
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 5,
    },
    bottomModal: {
        margin: 0,
        justifyContent: 'flex-end',
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
    },
    categoryList: {
        width: '100%',
        marginBottom: 10,
        flexDirection: 'row',
        backgroundColor: '#fff',
    },
    addressTitle: {
        fontFamily: FONT_MULI_BOLD,
        fontSize: 14,
        color: '#fff',
        marginLeft: 10
    },
    addAddressTitle: {
        fontFamily: FONT_MULI_REGULAR,
        fontSize: 15,
        color: '#fff'
    },
    addAddressTitle1: {
        fontFamily: FONT_MULI_REGULAR,
        fontSize: 14,
        marginLeft: 5,
        color: SECONDARY_COLOR
    },
    addAddress: {
        flexDirection: 'row',
        padding: 5,
        borderRadius: 8,
        alignSelf: 'flex-end',
        width: width - 18,
        alignSelf: 'center',
        height: 30,
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 10,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#ebeced',
    },
    addAddress2: {
        padding: 5,
        borderRadius: 8,
        alignSelf: 'flex-end',
        width: width - 18,
        alignSelf: 'center',
        marginBottom: 10,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#ebeced',
    },
    nextButton: {
        flexDirection: 'row',
        alignSelf: 'flex-end',
        width: width - 20,
        alignSelf: 'center',
        height: 40,
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 10
    },
    modal: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    modalContainer: {
        width: '80%',
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
    },
    modalHeader: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#DDDDDD'
    },
    modalFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    buttonCancel: {
        flex: 1,
        padding: 15,
        alignItems: 'center',
        borderRightWidth: 1,
        borderColor: '#DDDDDD'
    },
    button2: {
        flex: 1,
        padding: 15,
        alignItems: 'center'
    },
    cancel: {
        paddingRight: 25,
        fontSize: 18,
        color: PRIMARY_COLOR,
        fontFamily: FONT_PRIMARY,
    },
    subscribe: {
        color: PRIMARY_COLOR,
        fontSize: 18,
        fontFamily: FONT_PRIMARY
    },
    fullModel: {
        height: height,
        width: width,
        margin: 0,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center'
    },
    categoryText: {
        fontFamily: FONT_MULI_REGULAR,
        fontSize: 15,
        lineHeight: 20
    },
    nextbuttonbox: {
        backgroundColor: PRIMARY_COLOR,
        height: '100%',
        width: 100,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        marginLeft: 7,
        flexDirection: 'row',
        shadowOffset: { width: 2, height: 2 },
        shadowColor: 'black',
        shadowOpacity: 2,
        shadowRadius: 2,
        elevation: 2
    },
    nextbuttonboxInactive: {
        backgroundColor: PRIMARY_COLOR,
        height: '100%',
        width: 100,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        marginLeft: 7,
        flexDirection: 'row',
        shadowOffset: { width: 2, height: 2 },
        shadowColor: 'black',
        shadowOpacity: 2,
        shadowRadius: 2,
        elevation: 2,
        opacity: .5
    },
    titleBar: {
        height: 32,
        backgroundColor: PRIMARY_COLOR,
        width: width,
        borderTopRightRadius: 30,
        marginLeft: -10,
        justifyContent: 'center',
        marginBottom: 20,
        shadowOffset: { width: 2, height: 2 },
        shadowColor: 'black',
        shadowOpacity: 2,
        shadowRadius: 2,
        elevation: 2
    }
})