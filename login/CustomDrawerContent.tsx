import React from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LogoutButton from './LogoutButton';

interface CustomDrawerContentProps extends DrawerContentComponentProps {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
}

const CustomDrawerContent: React.FC<CustomDrawerContentProps> = (props) => {
  const { isAuthenticated, setIsAuthenticated } = props;
  const handleLogout = async () => {
    try {
      // await AsyncStorage.removeItem('username');
      await AsyncStorage.removeItem('password');
      // await AsyncStorage.removeItem('baseUrl');

      setIsAuthenticated(false); 
      props.navigation.navigate('Login');
    } catch (error) {
      console.log(error)
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  if (!isAuthenticated) {
    // no drawer is not authenticated
    return null;
  }

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} style={styles.drawerList}>
        {props.state.routes.map((route, index) => {
          if (route.name !== 'Login') {
            return (
              <DrawerItem
                key={index}
                label={route.name}
                onPress={() => props.navigation.navigate(route.name)}
              />
            );
          }
        })}
      </DrawerContentScrollView>
      <View style={styles.logoutButtonContainer}>
        <LogoutButton onPress={handleLogout} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  drawerList: {
    flex: 1,
  },
  logoutButtonContainer: {    
    width: '100%',
    height: 50,  // Adjust the height as per your requirement
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomDrawerContent;
