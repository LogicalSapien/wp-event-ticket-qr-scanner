import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'base-64';

export const verifyCredentials = async (baseUrl: string, username: string, password: string) => {
    const base64Credentials = base64.encode(`${username}:${password}`);
    const url = `${baseUrl}/wp-json/tribe/events/v1/events`;
    console.log(url);
    try {
        console.log('hiii');
        const response = await axios.get<{ events: Event[] }>('https://staging.seaph.co.uk/wp-json/tribe/events/v1/events', {
                headers: {
                    'Authorization': `Basic ${base64Credentials}`,
                    'accept': 'application/json'
                }
            });
            console.log('hiiiss');
            console.log(response)
        // const response = await axios.get(url, {
        //     headers: {
        //         'Authorization': `Basic ${base64Credentials}`,
        //         'Accept': 'application/json',
        //     },
        // });
        return response.status === 200;
    } catch (error) {
        console.log(error)
        return false;
    }
};

export const storeCredentials = async (baseUrl: string, username: string, password: string) => {
    try {
        await AsyncStorage.setItem('baseUrl', baseUrl);
        await AsyncStorage.setItem('username', username);
        await AsyncStorage.setItem('password', password);
    } catch (error) {
        console.error("Error storing credentials:", error);
    }
};

export const getStoredCredentials = async () => {
    try {
        const baseUrl = await AsyncStorage.getItem('baseUrl');
        const username = await AsyncStorage.getItem('username');
        const password = await AsyncStorage.getItem('password');
        return { baseUrl, username, password };
    } catch (error) {
        console.error("Error retrieving credentials:", error);
        return null;
    }
};
