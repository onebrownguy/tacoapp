import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useCart } from './context/CartContext'; // ✅ Import cart context
import { useRouter } from 'expo-router';

const tacoMenu = [
  { id: '1', name: 'Al Pastor', description: 'Marinated pork with pineapple' },
  { id: '2', name: 'Carne Asada', description: 'Grilled steak with salsa' },
  { id: '3', name: 'Pollo', description: 'Grilled chicken with onions & cilantro' },
  { id: '4', name: 'Veggie', description: 'Grilled vegetables with guacamole' },
];

export default function MenuScreen() {
  const router = useRouter();
  const { addToCart } = useCart(); // ✅ Get cart context function

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌮 Taco Menu 🌮</Text>
      <FlatList
        data={tacoMenu}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.description}>{item.description}</Text>
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
});
