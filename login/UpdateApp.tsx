import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navigator from './Navigator';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const username = await AsyncStorage.getItem('username');
      const password = await AsyncStorage.getItem('password');
      if (username && password) {
        setIsAuthenticated(true);
      }
    };

    checkAuthStatus();
  }, []);

  return (
    <NavigationContainer>
      <Navigator isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
    </NavigationContainer>
  );
};

export default App;
