import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useRouter } from 'expo-router';

export default function ContactScreen() {
  const router = useRouter();

  const phoneNumber = '512-945-2750';
  const address = '400 S Main St, Taylor, TX 76574';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📍 Rojas Tacos</Text>
      <Text style={styles.info}>{address}</Text>

      <Text style={styles.title}>📞 Call Us</Text>
      <TouchableOpacity onPress={() => Linking.openURL(`tel:${phoneNumber}`)}>
        <Text style={styles.phone}>{phoneNumber}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/')}>
        <Text style={styles.buttonText}>🏠 Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  info: {
    fontSize: 18,
    color: 'gray',
    marginBottom: 10,
    textAlign: 'center',
  },
  phone: {
    fontSize: 20,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  button: {
    marginTop: 30,
    backgroundColor: '#FF5733',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
