import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Button, Text } from 'react-native';
import { Camera } from 'expo-camera';
import { DrawerActions, NavigationProp, RouteProp, useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { NavigationStackParamList } from '../Navigator';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useScanSuccessContext } from './useScanSuccessContext';

type QRScannerRouteProp = RouteProp<NavigationStackParamList, 'QRScanner'>;

// interface Props {
//     onScanSuccess: (data: string) => void;
//   }
  
  const QRScannerScreen: React.FC = () => {

    const onScanSuccessContext = useScanSuccessContext();
    
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const navigation = useNavigation<NavigationProp<NavigationStackParamList, 'QRScanner'>>();
    const route = useRoute<QRScannerRouteProp>();
    const { onScanSuccess, event } = route.params;

    useEffect(() => {
        const getBarCodeScannerPermissions = async () => {
          const { status } = await BarCodeScanner.requestPermissionsAsync();
          setHasPermission(status === 'granted');
        };
    
        getBarCodeScannerPermissions();
    }, []);

    const handleBarCodeScanned = ({ type, data }) => {
        // setScanned(true);
        alert(`Bar code with type ${type} and data ${data} has been scanned!`);

        if (onScanSuccessContext) {
          onScanSuccessContext(data);
          navigation.navigate('Attendees', { event: event });
        }
    };

    if (hasPermission === null) {
        return <View><Text>Requesting for camera permission</Text></View>;
    }

    if (hasPermission === false) {
        return <View><Text>No access to camera</Text></View>;
    }

    return (
        <View style={styles.container}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />

          {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
        </View>
      );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

export default QRScannerScreen;
