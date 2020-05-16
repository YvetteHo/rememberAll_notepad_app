/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
// import MainNavigation from "./src/router/routerSetting";
import AppRouter from './src/router/routerSetting';

console.disableYellowBox = true;
const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

export default class App extends Component<Props> {

    constructor(props) {
        super(props);

    }

    render() {
        return (
            <AppRouter/>
        );
    }
}

