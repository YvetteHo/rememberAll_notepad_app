import React from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    Text,
    TouchableOpacity,
    ScrollView,
    FlatList,
    SafeAreaView,
    AsyncStorage
} from 'react-native';
import {BoxShadow} from 'react-native-shadow'
import IIcon from "react-native-vector-icons/dist/Ionicons";
import {Drawer, Card, SwipeAction, Modal, Button} from 'antd-mobile-rn';
import {deleteRealm, queryAudios, queryImages, queryVideos} from "../database/schemas";
import Icon from "react-native-vector-icons/dist/MaterialIcons";
import {postData} from "./http";
import {NavigationActions, StackActions} from "react-navigation";
import {DocumentDirectoryPath} from "react-native-fs";
import RNFetchBlob from 'react-native-fetch-blob';
import Uploader from "../components/upload";

const { width, height } = Dimensions.get('window');
const headerShadow = {
    width: width,
    height: 45,
    color:"#000",
    border: 1.5,
    radius: 0,
    opacity: 0.2,
    x: 0,
    y: 1.5,
};

export default class SideBar extends React.Component {

    _keyExtractorForSideBar = (item, index) => item.type;

    selectType = (type) => {
        this.props.selectType(type);
    };
    selectByMedia = (type) => {
        this.props.selectByMedia(type);
    };
    uploadData = () => {
        AsyncStorage.getItem('isUploading').then((isUploading) => {
            console.log('正在上传吗', isUploading);
            if (isUploading === 'false') {
                AsyncStorage.setItem('isUploading', 'true');
                AsyncStorage.getItem('operations').then((response) => {
                    console.log('开始上传');
                    const operations = JSON.parse(response);
                    console.log(operations);
                    const uploader = new Uploader(operations);
                    uploader.upload();
                });
            }
        });
    };
    logout = () => {
        AsyncStorage.getItem('userName').then((userName) => {
            postData('users/' + userName + '/logout/', {
                "username": userName,
            }, null, 'users').then((response) => {
                if (response.status === 200) {
                    // console.log(response._bodyText)
                    response.json().then((response) => {
                        console.log(response);
                        if (response.status === "success") {
                            RNFetchBlob.fs.unlink(DocumentDirectoryPath + '/' + 'images').catch((error) => {
                                console.log(error)
                            });
                            RNFetchBlob.fs.unlink(DocumentDirectoryPath + '/' + 'audios').catch((error) => {
                                console.log(error)
                            });
                            RNFetchBlob.fs.unlink(DocumentDirectoryPath + '/' + 'videos').catch((error) => {
                                console.log(error)
                            });
                            deleteRealm().then(() => {

                                console.log('清空realm')
                            }).catch((error) => {
                                console.log('清空', error)
                            });
                            console.log('成功登出');
                            AsyncStorage.clear().then(() => {
                                console.log('清空AsyncStorage了')
                                AsyncStorage.getItem('token').then(response => {
                                    console.log('token', response)
                                })
                            }).then(() => {
                                this.props.logout();
                            });

                            }
                        // if (response === "fail"){
                        //     console.log('登陆失败');
                        //     this.setState({
                        //         errorText: '用户名或密码错误'
                        //     })
                        // }
                    })

                }
            }).catch((error) => {
                console.log(error);
                this.setState({
                    errorText: '服务器错误，请重试'
                })
            })
        })


    };

    renderSideItem = (item, index) => {
        let colors = ['#f44336', '#ff9800', '#ffeb3b', '#8bc34a', '#03a9f4'];

        return (
            <TouchableOpacity onPress={() => this.selectType(item)}>
                <View style={styles.typesContainer}>
                    <IIcon name="ios-bookmark" size={45} color={colors[index]}/>
                    <Text style={{flex: 1, marginLeft: 10}}>{item.type}</Text>
                    <Text style={{justifyContent: 'flex-end'}}>{item.notes.length}</Text>
                </View>
            </TouchableOpacity>
        )
    };

    render() {

        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
                <ScrollView style={{backgroundColor: 'white', marginTop: 20}}>
                    <View>
                        <TouchableOpacity onPress={() => this.selectByMedia('audio')}>

                        <View style={styles.typesContainer}>
                            <Icon name="mic" size={35} color="#FF5722"/>
                            <Text style={{flex: 1, marginLeft: 10}}>Voices notes</Text>
                        </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.selectByMedia('image')}>

                        <View style={styles.typesContainer}>
                            <Icon name="camera" size={35} color="#FF5722"/>
                            <Text style={{flex: 1, marginLeft: 10}}>Photo notes</Text>
                        </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.selectByMedia('video')}>

                        <View style={styles.typesContainer}>
                            <Icon name="videocam" size={35} color="#FF5722"/>
                            <Text style={{flex: 1, marginLeft: 10}}>Video notes</Text>
                        </View>
                        </TouchableOpacity>
                    </View>
                    <View
                        style={{
                            borderBottomColor: '#e0e0e0',
                            borderBottomWidth: 1,
                        }}
                    />
                    <FlatList
                        data={this.props.types}
                        renderItem={({item, index}) => this.renderSideItem(item, index)}
                        keyExtractor={this._keyExtractorForSideBar}
                    />

                    <View style={styles.rowContainer}>
                        <Button
                            style={{width: '90%', backgroundColor: '#FF5722'}}
                            onClick={this.logout}
                        ><Text style={{color: 'white'}}>Logout</Text></Button>
                    </View>
                    <TouchableOpacity onPress={() => this.uploadData()}>
                        <View style={styles.rowContainer}>
                            <Icon name="sync" size={35} color="#FF5722"/>
                        </View>
                    </TouchableOpacity>

                </ScrollView>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    header: {
        flex: 1,
        height: 45,
        width: width,
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: 'white',
    },
    typesContainer: {
        // justifyContent: 'space-between',
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
        marginRight: 30,
        marginTop: 10,
        marginBottom: 10,
        // backgroundColor: '#f5f5f5'
    },
    rowContainer: {
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonCenter: {
        alignItems: 'center',
        flex: 1,
        marginLeft: 5,
        marginRight: 5,
        backgroundColor: '#FF5722',
    },
    buttonLeft: {
        alignItems: 'center',
        flex: 1,
        backgroundColor: '#FF5722'

    },
    buttonRight: {
        // marginRight: 5,
        alignItems: 'center',
        flex: 1,
        backgroundColor: '#FF5722'

    },
    headerCenter: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    headerLeft: {
        marginLeft: 5,
        flex: 1,
    },
    headerRight: {
        marginRight: 5,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleFont: {
        fontSize: 20,
    }
});
