import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'base-64';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { NavigationStackParamList } from '../Navigator';

interface LoginScreenProps {
    setIsAuthenticated: (value: boolean) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ setIsAuthenticated }) => {
    const navigation = useNavigation<NavigationProp<NavigationStackParamList, 'Login'>>();
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [baseUrl, setBaseUrl] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setPassword('');
        });
    
        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        const fetchStoredValues = async () => {
            try {
                const storedUsername = await AsyncStorage.getItem('username');
                const storedBaseUrl = await AsyncStorage.getItem('baseUrl');
    
                if (storedUsername) {
                    setUsername(storedUsername);
                }
    
                if (storedBaseUrl) {
                    setBaseUrl(storedBaseUrl);
                }
            } catch (error) {
                console.error("Error fetching data from storage", error);
            }
        };
    
        fetchStoredValues();
    }, []);
    

    const handleLogin = async () => {
        setIsLoading(true);
        try {        
            let url = `${baseUrl}/wp-json/ls/api/v1/login`;
            const base64Credentials = base64.encode(`${username}:${password}`);
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Basic ${base64Credentials}`,
                    'accept': 'application/json'
                }            
            });        
            
            if (response.status == 200) {            
                await AsyncStorage.setItem('username', username);
                await AsyncStorage.setItem('password', password);
                await AsyncStorage.setItem('baseUrl', baseUrl);            
                setIsAuthenticated(true);             
                navigation.navigate('Home');
            }
        } catch (err) {
            setError('Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    if(isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" /> 
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TextInput style={styles.input} placeholder="Username" value={username}  onChangeText={setUsername} />
            <TextInput style={styles.input} placeholder="Password" value={password} secureTextEntry onChangeText={setPassword} />
            <TextInput style={styles.input} placeholder="Base URL" value={baseUrl} onChangeText={setBaseUrl} />
            {error && <Text style={styles.errorText}>{error}</Text>}
            <Button disabled={isLoading} title="Login" onPress={handleLogin} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,           // <-- Added
        padding: 16,
        backgroundColor: '#fff',
        justifyContent: 'center', // <-- Added
    },
    input: {
        padding: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 16,
        borderRadius: 5,
    },
    errorText: {
        color: 'red',
        marginBottom: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});


export default LoginScreen;
