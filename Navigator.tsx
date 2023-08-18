import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

import EventsScreen from './events/EventsScreen';
import AttendeesScreen, { Attendee } from './attendees/AttendeesScreen';
import TicketDetailScreen from './tickets/TicketDetailScreen';
import LoginScreen from './login/LoginScreen';
import CustomDrawerContent from './login/CustomDrawerContent';
import QRScannerScreen from './attendees/QRScannerScreen';
import { Event } from './events/EventsScreen';
import { ScanSuccessContext } from './attendees/useScanSuccessContext';

export type   NavigationStackParamList = {
  Home: undefined;
  Attendees: { event: Event };
  TicketDetail: { attendee: Attendee, event: Event };
  Login: undefined;
  QRScanner: {
    onScanSuccess: (data: string) => void,
    event: Event
  };
}

const Drawer = createDrawerNavigator();

const handleScanSuccess = (data: string) => {
  console.log(data)
};

const AppNavigator: React.FC<{ isAuthenticated: boolean; setIsAuthenticated: (value: boolean) => void }> = 
({ isAuthenticated, setIsAuthenticated }) => (
  <ScanSuccessContext.Provider value={handleScanSuccess}>
    <Drawer.Navigator 
        initialRouteName={isAuthenticated ? "Home" : "Login"} 
        drawerContent={props => <CustomDrawerContent {...props} isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />}
        screenOptions={{
          headerShown: isAuthenticated
        }}
    >
        {isAuthenticated && (
          <>
            <Drawer.Screen name="Home" component={EventsScreen} />
            <Drawer.Screen name="Attendees" component={AttendeesScreen} />
            <Drawer.Screen name="TicketDetail" component={TicketDetailScreen} />
            <Drawer.Screen name="QRScanner" component={QRScannerScreen} />
          </>
        )}
        <Drawer.Screen name="Login" >
            {props => <LoginScreen {...props} setIsAuthenticated={setIsAuthenticated} />}
        </Drawer.Screen>
        {/* Other screens can go here */}
    </Drawer.Navigator>
  </ScanSuccessContext.Provider>
);

const Navigator: React.FC<{ isAuthenticated: boolean; setIsAuthenticated: (value: boolean) => void }> = 
({ isAuthenticated, setIsAuthenticated }) => {
    return <AppNavigator isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />;
};

export default Navigator;
