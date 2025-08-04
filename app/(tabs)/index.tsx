import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '../context/CartContext';

const featuredItems = [
  { id: '1', name: 'Al Pastor Taco', price: 3.50, emoji: '🌮' },
  { id: '9', name: 'Birria Taco', price: 4.50, emoji: '🌮' },
  { id: '7', name: 'Fish Taco', price: 4.50, emoji: '🐟' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { addToCart, cart } = useCart();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🌮 Welcome to TacoApp! 🌮</Text>
        <Text style={styles.subtitle}>Fresh tacos made with love</Text>
        {cart.length > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cart.length} items in cart</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Tacos</Text>
        {featuredItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.featuredItem}
            onPress={() => addToCart({ id: item.id, name: item.name, price: item.price })}
          >
            <Text style={styles.featuredEmoji}>{item.emoji}</Text>
            <View style={styles.featuredInfo}>
              <Text style={styles.featuredName}>{item.name}</Text>
              <Text style={styles.featuredPrice}>${item.price.toFixed(2)}</Text>
            </View>
            <Text style={styles.addButton}>+</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => router.push('/menu')}
      >
        <Text style={styles.menuButtonText}>📝 View Full Menu</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  cartBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 10,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  featuredItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuredEmoji: {
    fontSize: 40,
    marginRight: 15,
  },
  featuredInfo: {
    flex: 1,
  },
  featuredName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  featuredPrice: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#007AFF',
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    width: 36,
    height: 36,
    borderRadius: 18,
    textAlign: 'center',
    lineHeight: 36,
  },
  menuButton: {
    backgroundColor: '#FF5733',
    margin: 20,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
