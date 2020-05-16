import React from 'react';
import {View, StyleSheet, Dimensions, Text} from 'react-native';
import {BoxShadow} from 'react-native-shadow'
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

export default class Header extends React.Component {
    render() {
        return (
            <BoxShadow setting={headerShadow}>
                <View style= {styles.header} >
                    <View style={styles.headerLeft}>{this.props.leftElement}</View>
                    <View style={styles.headerCenter}><Text style={styles.titleFont}>{this.props.titleElement}</Text></View>
                    <View style={styles.headerRight}>{this.props.rightElement}</View>
                </View>
            </BoxShadow>
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
