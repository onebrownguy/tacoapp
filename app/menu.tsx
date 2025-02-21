import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useCart } from '@/app/context/CartContext'; 
import { useRouter } from 'expo-router';

const menuItems = [
  { id: '1', name: 'Al Pastor Taco', price: 3.50, description: 'Succulent marinated pork, slow-roasted to perfection, complemented by a touch of caramelized pineapple.' },
  { id: '2', name: 'Carne Asada Taco', price: 4.00, description: 'Juicy, fire-grilled steak, delicately seasoned and finished with a hint of citrus-infused salsa.' },
  { id: '3', name: 'Pollo Taco (Chicken)', price: 3.75, description: 'Tender, charred chicken, infused with smoky spices and garnished with fresh cilantro and pickled onions.' },
  { id: '4', name: 'Barbacoa Taco', price: 4.25, description: 'Melt-in-your-mouth braised beef, slow-cooked in a rich adobo sauce, wrapped in a warm tortilla.' },
  { id: '5', name: 'Vegetarian Taco', price: 3.50, description: 'A symphony of grilled seasonal vegetables, enhanced by creamy avocado purée and a whisper of lime.' },
  { id: '6', name: 'Chorizo Taco', price: 4.00, description: 'Bold, smoky chorizo, perfectly balanced with crispy diced potatoes and a drizzle of tangy crema.' },
  { id: '7', name: 'Fish Taco', price: 4.50, description: 'Crispy golden fish, elegantly nestled in a bed of citrus slaw and topped with a velvety lime crema.' },
  { id: '8', name: 'Shrimp Taco', price: 4.75, description: 'Plump, grilled shrimp, kissed with chili-lime seasoning and paired with a refreshing mango salsa.' },
  { id: '9', name: 'Birria Taco', price: 4.50, description: 'Rich, slow-braised beef, deeply marinated in fragrant spices, served with a side of indulgent consommé.' },
  { id: '10', name: 'Mushroom Taco', price: 3.75, description: 'Earthy, umami-packed mushrooms, sautéed to perfection, crowned with crumbled queso fresco.' },
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
            <View style={styles.textContainer}> {/* ✅ Text is properly aligned */}
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.price}>${item.price.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={() => addToCart({ id: item.id, name: item.name, quantity: 1 })}
            >
              <Text style={styles.buttonText}>➕</Text>
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
    flexDirection: 'row', // ✅ Keeps row layout for larger screens
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexWrap: 'wrap', // ✅ Ensures text wraps properly
  },
  textContainer: { // ✅ New container for text elements
    flex: 1, // ✅ Takes up available space
    marginRight: 10, // ✅ Adds spacing between text and button
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    fontStyle: 'italic', // ✅ Michelin-style italics
    color: '#7B7B7B',
    lineHeight: 20, // ✅ Improved readability
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'green',
    marginTop: 2,
  },
  button: {
    backgroundColor: '#FF5733',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40, // ✅ Ensures button doesn’t shrink too much
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
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
