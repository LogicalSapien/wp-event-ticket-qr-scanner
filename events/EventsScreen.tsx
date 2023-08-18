import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet, RefreshControl, TextInput } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import he from 'he';
import base64 from 'base-64';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationStackParamList } from '../Navigator';

export type Event = {
  id: number;
  title: string;
};

const EventsScreen: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true); 
  const [error, setError] = useState<string | null>(null);

  const navigation = useNavigation<NavigationProp<NavigationStackParamList, 'Home'>>();

  const [refreshing, setRefreshing] = useState(false); 

  const [nameFilter, setNameFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); 


  const fetchEvents = useCallback(async () => {
    let username: string | null = '';
    let password: string | null = '';
    let baseUrl: string | null = '';

    setLoading(true);
    try {
      username = await AsyncStorage.getItem('username');
      password = await AsyncStorage.getItem('password');
      baseUrl = await AsyncStorage.getItem('baseUrl');

      if (username && password && baseUrl) {
        const base64Credentials = base64.encode(`${username}:${password}`);
        const url = `${baseUrl}/wp-json/tribe/events/v1/events`;

        const response = await axios.get<{ events: Event[] }>(url, {
          headers: {
            'Authorization': `Basic ${base64Credentials}`,
            'accept': 'application/json'
          }
        });

        setEvents(response.data.events);
      } else {
        setError('Required details missing from storage.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents().then(() => setRefreshing(false));
  }, [fetchEvents]);

  const filteredEvents = events.filter(event => {
    return event.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TextInput
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search for events..."
          style={styles.filterInput}
        />
      </View>
      <View style={styles.listContainer}>
        {error && <Text style={styles.title}>Error: {error}</Text>}
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('Attendees', { event: item })}>
              <View style={styles.listItem}>
                <Text style={styles.title}>{he.decode(item.title)}</Text>
              </View>
            </TouchableOpacity>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          } 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9ecef',
    paddingTop: 20,
  },
  listContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  listItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  listItemLast: {
    borderBottomWidth: 0,
  },
  title: {
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  filterInput: {
    fontSize: 16,
    padding: 10,
  },  
});

export default EventsScreen;
