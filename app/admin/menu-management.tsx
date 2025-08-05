import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { useMenu, MenuItem } from '../context/MenuContext';
import { MenuList } from '../../components/admin/MenuList';
import { AddItemModal } from '../../components/admin/AddItemModal';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/DesignTokens';

const MenuManagementScreen = () => {
  const { 
    addItem, 
    updateItem,
    getTotalItems,
    getAvailableItems 
  } = useMenu();

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const handleSaveItem = async (itemData: Omit<MenuItem, 'id'>) => {
    if (selectedItem) {
      // Update existing item
      await updateItem(selectedItem.id, itemData);
    } else {
      // Add new item
      await addItem(itemData);
    }
  };

  const openAddModal = () => {
    setSelectedItem(null);
    setShowModal(true);
  };

  const openEditModal = (item: MenuItem) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🍽️ Menu Management</Text>
        <Text style={styles.headerSubtitle}>
          {getTotalItems()} items • {getAvailableItems()} available
        </Text>
      </View>

      <View style={styles.toolbar}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={openAddModal}
        >
          <Text style={styles.addButtonText}>+ Add New Item</Text>
        </TouchableOpacity>
      </View>

      <MenuList onEditItem={openEditModal} />

      {/* Enhanced Add/Edit Item Modal */}
      <AddItemModal
        visible={showModal}
        onClose={closeModal}
        onSave={handleSaveItem}
        editItem={selectedItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    paddingTop: 50,
    alignItems: 'center',
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSizes.xxl,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.text.onPrimary,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSizes.md,
    color: COLORS.text.onPrimary,
    opacity: 0.9,
  },
  toolbar: {
    padding: SPACING.md,
  },
  addButton: {
    backgroundColor: COLORS.success,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.small,
    shadowColor: COLORS.text.primary,
  },
  addButtonText: {
    color: COLORS.text.onPrimary,
    fontSize: TYPOGRAPHY.fontSizes.md,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
  },
});

export default MenuManagementScreen;