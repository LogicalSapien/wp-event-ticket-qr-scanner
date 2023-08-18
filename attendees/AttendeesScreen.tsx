import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import base64 from 'base-64';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { NavigationStackParamList } from '../Navigator';

export interface Attendee {
    attendee_id: number;
    holder_name: string;
    order_status: string;
    check_in: string;
    purchaser_name: string;
    ticket_name: string;
}

type AttendeesScreenRouteProp = RouteProp<NavigationStackParamList, 'Attendees'>;

const AttendeesScreen: React.FC = () => {
  const route = useRoute<AttendeesScreenRouteProp>();
  const event = route.params?.event;
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    baseUrl: '',
  });
  const [refreshing, setRefreshing] = useState(false);
  const [prevEventId, setPrevEventId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string | null>(null);
  const [checkInFilter, setCheckInFilter] = useState<string | null>(null);


  const navigation = useNavigation<NavigationProp<NavigationStackParamList, 'Attendees'>>();

  useEffect(() => {
    // Fetch credentials from storage
    const fetchCredentials = async () => {
      const storedUsername = await AsyncStorage.getItem('username');
      const storedPassword = await AsyncStorage.getItem('password');
      const storedBaseUrl = await AsyncStorage.getItem('baseUrl');
      if (storedUsername && storedPassword && storedBaseUrl) {
        setCredentials({
          username: storedUsername,
          password: storedPassword,
          baseUrl: storedBaseUrl,
        });
      }
    };

    fetchCredentials();

  }, []);

  useEffect(() => {
    if (event.id !== prevEventId) {
      setLoading(true);
      // Only fetch attendees if credentials are set
      if (credentials.username && credentials.password && credentials.baseUrl) {
        fetchAttendees();
      }
    }
    setPrevEventId(event.id);
  }, [event.id, credentials]);

  const fetchAttendees = async () => {
    const base64Credentials = base64.encode(`${credentials.username}:${credentials.password}`);
    try {
      const response = await fetch(`${credentials.baseUrl}/wp-json/ls/api/v1/attendees/${event.id}`, {
        headers: {
          'Authorization': `Basic ${base64Credentials}`,
          'accept': 'application/json',
        },
      });
      const data = await response.json();
      setAttendees(data.attendees);
      setLoading(false);
      setRefreshing(false); // Stop the refresh loader
    } catch (error) {
      console.log(error)
      console.error("Error fetching attendees:", error);
      setLoading(false);
      setRefreshing(false); // Stop the refresh loader
    }
  };  

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAttendees(); // Reload attendees on refresh
  };

  const filteredAttendees = attendees.filter(attendee => {
    const nameMatch = attendee.holder_name.toLowerCase().includes(searchTerm.toLowerCase());
    const orderStatusMatch = selectedOrderStatus ? attendee.order_status === selectedOrderStatus : true;
    let checkInMatch = true;

    if (checkInFilter === "1") {
        checkInMatch = attendee.check_in === "1";
    } else if (checkInFilter === "0") {
        checkInMatch = !attendee.check_in || attendee.check_in === "0";
    }

    return nameMatch && orderStatusMatch && checkInMatch;
  });

  const getStatusColor = (orderStatus: string) => {
    switch (orderStatus) {
      case 'completed': return 'green';
      case 'processing': return 'blue';
      default: return 'orange';
    }
  };

  const handleQRScanSuccess = (data: string) => {
    console.log("scanned data " + data)
    const attendee = attendees.find((att) => att.attendee_id === parseInt(data, 10));
    if (attendee) {
      navigation.navigate('TicketDetail', { attendee: attendee, event: event });
    } else {
      console.log('No matching attendee found for scanned ticket_id');
      // Handle any error messages or alerts here.
    }
  };

  return (
    <View style={styles.container}>
        <Ionicons
        name="camera-outline"
        size={32}
        color="black"
        style={styles.cameraIcon}
        onPress={() => navigation.navigate('QRScanner', {
            onScanSuccess: handleQRScanSuccess, event
        })}
      />

      <View style={styles.filterContainer}>
      <TextInput
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder="Search for attendees..."
        style={styles.filterInput}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text>Status:</Text>
          <Picker
            selectedValue={selectedOrderStatus}
            onValueChange={(value) => setSelectedOrderStatus(value)}
            style={{ height: 50, width: 150 }}>
            <Picker.Item label="All" value={null} />
            <Picker.Item label="Completed" value="completed" />
            <Picker.Item label="Processing" value="processing" />
            {/* Add more statuses if needed */}
          </Picker>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text>Check-in:</Text>
          <Picker
            selectedValue={checkInFilter}
            onValueChange={(value) => setCheckInFilter(value)}
            style={{ height: 50, width: 150 }}>
            <Picker.Item label="All" value={null} />
            <Picker.Item label="Checked In" value="1" />
            <Picker.Item label="Not Checked In" value="0" />
           </Picker>
        </View>
      </View>
    </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Loading attendees...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAttendees}
          keyExtractor={(item: Attendee) => item.attendee_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => navigation.navigate('TicketDetail', { attendee: item, event: event })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={[
                    styles.statusIcon,
                    { backgroundColor: getStatusColor(item.order_status) },
                  ]}
                />
                {item.check_in && <View style={styles.checkInIcon} />}
                <Text>{item.holder_name}</Text>
              </View>
            </TouchableOpacity>
          )}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  checkInIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'purple',
    marginRight: 8,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 10,
    padding: 5,
  },
  filterInput: {
    fontSize: 16,
    padding: 10,
  },
  cameraIcon: {
    alignSelf: 'flex-end', // To align the icon to the right
    marginBottom: 10, // Margin for spacing
  },
});

export default AttendeesScreen;
