import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NavigationProp, useNavigation, useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { NavigationStackParamList } from '../Navigator';

type AttendeesScreenRouteProp = RouteProp<NavigationStackParamList, 'TicketDetail'>;

const TicketDetailScreen: React.FC = () => {
   const route = useRoute<AttendeesScreenRouteProp>();
  const { attendee, event } = route.params;
    
  const navigation = useNavigation<NavigationProp<NavigationStackParamList, 'TicketDetail'>>();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Ticket Details</Text>
        <Text style={styles.label}>Purchaser:</Text>
        <Text style={styles.value}>{attendee.purchaser_name}</Text>

        <Text style={styles.label}>Holder Name:</Text>
        <Text style={styles.value}>{attendee.holder_name}</Text>

        <Text style={styles.label}>Ticket:</Text>
        <Text style={styles.value}>{attendee.ticket_name}</Text>

        <Text style={styles.label}>Checked In:</Text>
        <Text style={styles.value}>{attendee.check_in ? 'Yes' : 'No'}</Text>

        <Text style={styles.label}>Order status:</Text>
        <Text style={styles.value}>{attendee.order_status}</Text>
      </View>
      <Button title="Go Back" onPress={() => navigation.navigate('Attendees', { event: event })} />
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      justifyContent: 'center',
      backgroundColor: '#f4f4f4',
    },
    card: {
      padding: 20,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 8,
      marginBottom: 16,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      color: '#777',
      marginTop: 8,
    },
    value: {
      fontSize: 16,
      color: '#333',
      marginBottom: 8,
    },
});

export default TicketDetailScreen;
