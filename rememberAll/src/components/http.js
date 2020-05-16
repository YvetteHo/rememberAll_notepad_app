import {rememberAllRealm} from "../database/schemas";
import {AsyncStorage} from "react-native";

// for iOS
const baseURL = 'http://127.0.0.1:8000/';
// for Android
// const baseURL = 'http://10.0.2.2:8000/';

export const postData = (url, data, header, type) => new Promise( (resolve) => {
    AsyncStorage.getItem('token').then((response) => {
        if (!header || header === {}) {
            header = {
                'content-type': 'application/json',
                "connection": "close"
            };
            data = JSON.stringify(data);
            console.log(header);
        }
        console.log(data);
        // if (type !== 'users') {
        //     header['Authorization'] = 'Token ' + response;
        // }
        console.log(baseURL + url)

        fetch(baseURL + url, {
            body: data, // must match 'Content-Type' header
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, same-origin, *omit
            headers: header,
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, cors, *same-origin
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // *client, no-referrer

        }).then((response) => {
            resolve(response)
        }).catch((error) => {
            console.log('error', error)
        })
    });

});

export const putData = (url, data, type) => new Promise((resolve, reject) => {
    AsyncStorage.getItem('token').then((response) => {
        let headers = {'content-type': 'application/json'};
        // if (type !== 'users') {
        //     headers['Authorization'] = 'Token ' + response;
        // }

        fetch(baseURL + url, {
            body: JSON.stringify(data), // must match 'Content-Type' header
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, same-origin, *omit
            headers: headers,
            method: 'PUT', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, cors, *same-origin
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // *client, no-referrer
        }).then((response) => {
            resolve(response)
        })
    });


});

export const deleteData = (url, type) => new Promise(resolve => {
    AsyncStorage.getItem('token').then((response) => {
        let headers = {'content-type': 'application/json'};
        console.log(type);
        // if (type !== 'users') {
        //     headers['Authorization'] = 'Token ' + response;
        // }
        console.log(headers);

        fetch(baseURL + url, {
            // body: JSON.stringify(data), // must match 'Content-Type' header
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, same-origin, *omit
            headers: headers,
            method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, cors, *same-origin
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // *client, no-referrer
        }).then((response) => {
            resolve(response)
        })
    });
    // Default options are marked with *

});

export const getData = (url, header, type) => new Promise( (resolve) => {
    AsyncStorage.getItem('token').then((response) => {
        console.log('token', response);
        // if (type !== 'users') {
        //     header['Authorization'] = 'Token ' + response;
        // }
        fetch(baseURL + url, {
            method: 'GET',
            headers: header
        }).then((response)=> resolve(response))
    });

});

