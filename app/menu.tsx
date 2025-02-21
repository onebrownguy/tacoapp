import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useCart } from './context/CartContext'; // ✅ Import cart context
import { useRouter } from 'expo-router';

const menuItems = [
  { id: '1', name: 'Al Pastor Taco', price: 3.50 },
  { id: '2', name: 'Carne Asada Taco', price: 4.00 },
  { id: '3', name: 'Pollo Taco (Chicken)', price: 3.75 },
  { id: '4', name: 'Barbacoa Taco', price: 4.25 },
  { id: '5', name: 'Vegetarian Taco', price: 3.50 },
  { id: '6', name: 'Chorizo Taco', price: 4.00 },
  { id: '7', name: 'Fish Taco', price: 4.50 },
  { id: '8', name: 'Shrimp Taco', price: 4.75 },
  { id: '9', name: 'Birria Taco', price: 4.50 },
  { id: '10', name: 'Mushroom Taco', price: 3.75 },
];

export default function MenuScreen() {
  const router = useRouter();
  const { addToCart } = useCart(); // ✅ Get cart context function

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌮 Taco Menu 🌮</Text>
      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text> {/* ✅ Add this line */}
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={() => addToCart({ id: item.id, name: item.name, quantity: 1 })}
            >
              <Text style={styles.buttonText}>➕ Add to Cart</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
        <Text style={styles.buttonText}>🏠 Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: 'gray',
  },
  button: {
    backgroundColor: '#FF5733',
    padding: 8,
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27AE60', // Green color for better visibility
    marginTop: 2,
  },
  
});
