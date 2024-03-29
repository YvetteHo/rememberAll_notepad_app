import React from 'react';
import {Fragment} from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, AsyncStorage} from 'react-native';
import {Button, List, WhiteSpace} from 'antd-mobile-rn';
import {NavigationActions, StackActions} from "react-navigation";
import Header from '../../components/header';
import Icon from "react-native-vector-icons/dist/MaterialIcons";
import {postData} from '../../components/http';

const brandColor = '#FF5722';
const icon = <Icon name="list" size={45} color="#FF5722"/>;
export default class Register extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            userName: '',
            password: '',
            errorText: '',
        };

    }
    componentDidMount() {
        // this.props.navigation.dispatch(StackActions.reset({
        //     index: 0,
        //     actions: [
        //         NavigationActions.navigate({routeName: 'Home'})
        //     ],
        // }))
    }

    register = () => {
        postData('users/', {
            "username": this.state.userName,
            "password": this.state.password,
        }, null, 'users').then((response) => {
            if (response.status === 200) {
                // console.log(response._bodyText)
                response.json().then((response) => {
                    console.log(response);
                    if (response.status === "success") {
                        console.log('成功');
                        console.log(response);

                        AsyncStorage.setItem('token', response.token);
                        AsyncStorage.setItem('pk', JSON.stringify(response.pk));
                        AsyncStorage.setItem('userName', this.state.userName);
                        AsyncStorage.setItem('operations', '[]');
                        AsyncStorage.setItem('isUploading', 'false');
                        this.props.navigation.navigate('Home');
                    }
                    if (response.status === "fail"){
                        this.setState({
                            errorText: response.message
                        });
                    }
                })
            }
        }).catch((error) => {
            this.setState({
                errorText: 'sever error, please retry'
            });
            console.log(error)
        })
    };

    render() {

        return (

                <SafeAreaView style={{ flex:0, backgroundColor: 'white' }} >
                {/*<SafeAreaView style={{backgroundColor: '#FF5722', height: '100%'}}>*/}
                <View style={{alignItems: 'center'}}>
                    <Header leftElement={
                            <TouchableOpacity
                                onPress={() => {
                                    this.props.navigation.navigate('Login');
                                }}
                                style={{width: 45, marginLeft: 10}}>
                                <Icon name="keyboard-arrow-left" size={45} color="#FF5722"/>
                            </TouchableOpacity> }
                        titleElement='Register'/>
                    <TextInput
                        style={{width: '90%', height: 50, borderBottomWidth: 0.5, backgroundColor: 'white',
                            marginBottom: 20, marginTop: 100, fontSize: 25, borderBottomColor:'#FF5722' }}
                        placeholder='Username'
                        onChangeText={(text) => {
                            if (text.length <= 10) {
                                this.setState({
                                    userName: text,
                                    errorText: ''
                                })
                            } else {
                                this.setState({
                                    errorText: 'Please enter a name less than 10 chars'
                                })
                            }
                        }}
                        value={this.state.userName}
                    />
                    <TextInput
                        style={{width: '90%', height: 50, borderBottomWidth: 0.5, backgroundColor: 'white',
                            marginBottom: 20, fontSize: 25, borderBottomColor:'#FF5722' }}
                        placeholder='Password'
                        maxLenth={10}
                        secureTextEntry={true}
                        onChangeText={(text) => {
                            if (text.length <= 15) {
                                this.setState({
                                    password: text,
                                    errorText: ''
                                })
                            } else {
                                this.setState({
                                    errorText: 'Please enter a name less than 15 chars'
                                })
                            }
                        }}
                        value={this.state.password}

                    />
                    <Button
                        style={{width: '90%', backgroundColor: '#FF5722'}}
                        onClick={this.register}
                    ><Text style={{color: 'white'}}>Register</Text></Button>


                </View>
                    <View style={styles.rowContainer}>
                        <Text style={{marginLeft: 10, color: 'red', marginTop: 10}}>{this.state.errorText}</Text>
                    </View>


                </SafeAreaView>


        );
    }
}

const styles = StyleSheet.create({
    countryPicker: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    container: {
        flex: 1
    },
    header: {
        textAlign: 'center',
        marginTop: 60,
        fontSize: 22,
        margin: 20,
        color: '#4A4A4A',
    },
    form: {
        margin: 20
    },
    textInput: {
        padding: 0,
        margin: 0,
        flex: 1,
        fontSize: 20,
        color: brandColor
    },
    button: {
        marginTop: 20,
        height: 50,
        backgroundColor: brandColor,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontFamily: 'Helvetica',
        fontSize: 16,
        fontWeight: 'bold'
    },
    wrongNumberText: {
        margin: 10,
        fontSize: 14,
        textAlign: 'center'
    },
    disclaimerText: {
        marginTop: 30,
        fontSize: 12,
        color: 'grey'
    },
    callingCodeView: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    callingCodeText: {
        fontSize: 20,
        color: brandColor,
        fontFamily: 'Helvetica',
        fontWeight: 'bold',
        paddingRight: 10
    },
    rowContainer: {
        width: '90%',
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
        marginRight: 10,
        marginTop: 10,
    },
});