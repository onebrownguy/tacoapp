import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  Switch,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { MenuItem } from '../../app/context/MenuContext';
import { IngredientSelector, SelectedIngredient } from './IngredientSelector';
import { 
  calculateIngredientsCost, 
  checkAllergens, 
  getSpiceLevel,
  getIngredientById
} from '../../data/ingredients';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/DesignTokens';

export interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (item: Omit<MenuItem, 'id'>) => Promise<void>;
  editItem?: MenuItem | null;
  title?: string;
}

type BuildMode = 'traditional' | 'ingredient-builder';

export const AddItemModal: React.FC<AddItemModalProps> = ({
  visible,
  onClose,
  onSave,
  editItem = null,
  title,
}) => {
  const [buildMode, setBuildMode] = useState<BuildMode>('traditional');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Tacos',
    available: true
  });
  const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([]);
  const [autoPrice, setAutoPrice] = useState(0);
  const [useAutoPricing, setUseAutoPricing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const categories = ['Tacos', 'Burritos', 'Quesadillas', 'Sides', 'Drinks', 'Desserts', 'Breakfast'];

  // Reset form when modal opens/closes or edit item changes
  useEffect(() => {
    if (visible) {
      if (editItem) {
        setFormData({
          name: editItem.name,
          price: editItem.price.toString(),
          description: editItem.description,
          category: editItem.category,
          available: editItem.available
        });
        // TODO: Parse ingredients from description or metadata if available
        setSelectedIngredients([]);
        setBuildMode('traditional');
        setUseAutoPricing(false);
      } else {
        resetForm();
      }
    }
  }, [visible, editItem]);

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      category: 'Tacos',
      available: true
    });
    setSelectedIngredients([]);
    setBuildMode('traditional');
    setUseAutoPricing(true);
    setAutoPrice(0);
  };

  // Update form when ingredients change (ingredient builder mode)
  useEffect(() => {
    if (buildMode === 'ingredient-builder' && selectedIngredients.length > 0) {
      // Auto-generate name if empty
      if (!formData.name) {
        const mainIngredients = selectedIngredients
          .slice(0, 2)
          .map(item => {
            const ingredient = getIngredientById(item.ingredientId);
            return ingredient?.name;
          })
          .filter(Boolean);
        
        if (mainIngredients.length > 0) {
          const generatedName = mainIngredients.join(' & ') + 
            (formData.category === 'Breakfast' ? ' Breakfast Taco' : ' Taco');
          setFormData(prev => ({ ...prev, name: generatedName }));
        }
      }

      // Auto-generate description
      const ingredientNames = selectedIngredients
        .map(item => {
          const ingredient = getIngredientById(item.ingredientId);
          return ingredient?.name;
        })
        .filter(Boolean);

      if (ingredientNames.length > 0) {
        const description = `Fresh ${ingredientNames.slice(0, 3).join(', ')}${
          ingredientNames.length > 3 ? ` and ${ingredientNames.length - 3} more ingredients` : ''
        }`;
        setFormData(prev => ({ ...prev, description }));
      }

      // Auto-set price if using auto-pricing
      if (useAutoPricing) {
        setFormData(prev => ({ ...prev, price: autoPrice.toString() }));
      }
    }
  }, [selectedIngredients, buildMode, autoPrice, useAutoPricing, formData.category, formData.name]);

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.description) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price.');
      return;
    }

    // Validate ingredient builder requirements
    if (buildMode === 'ingredient-builder' && selectedIngredients.length === 0) {
      Alert.alert('No Ingredients', 'Please select at least one ingredient.');
      return;
    }

    try {
      setIsLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      let finalDescription = formData.description;

      // Prepare ingredient data for ingredient-built items
      let ingredientData = {};
      if (buildMode === 'ingredient-builder' && selectedIngredients.length > 0) {
        const allergens = checkAllergens(selectedIngredients);
        const spiceLevel = getSpiceLevel(selectedIngredients);
        
        // Add allergen and spice info to description
        const metaInfo = [];
        if (spiceLevel > 0) metaInfo.push(`Spice Level: ${spiceLevel}/5`);
        if (allergens.length > 0) metaInfo.push(`Contains: ${allergens.join(', ')}`);
        
        if (metaInfo.length > 0) {
          finalDescription += `\n\n${metaInfo.join(' • ')}`;
        }

        // Prepare ingredient-based data
        ingredientData = {
          ingredientBased: true,
          ingredients: selectedIngredients,
          allergens,
          spiceLevel: spiceLevel > 0 ? spiceLevel : undefined,
        };
      }

      await onSave({
        name: formData.name,
        price,
        description: finalDescription,
        category: formData.category,
        available: formData.available,
        ...ingredientData
      });

      Alert.alert(
        'Success', 
        `Menu item ${editItem ? 'updated' : 'added'} successfully!`,
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      Alert.alert('Error', `Failed to ${editItem ? 'update' : 'add'} menu item. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (selectedIngredients.length > 0 || formData.name || formData.description) {
      Alert.alert(
        'Discard Changes',
        'You have unsaved changes. Are you sure you want to close?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: onClose }
        ]
      );
    } else {
      onClose();
    }
  };

  const switchToBuildMode = (mode: BuildMode) => {
    if (selectedIngredients.length > 0 || formData.name || formData.description) {
      Alert.alert(
        'Switch Mode',
        'Switching modes will reset your current progress. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Switch',
            onPress: () => {
              resetForm();
              setBuildMode(mode);
            }
          }
        ]
      );
    } else {
      setBuildMode(mode);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {title || (editItem ? 'Edit Menu Item' : 'Add New Menu Item')}
            </Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Build Mode Selector */}
          {!editItem && (
            <View style={styles.modeSelector}>
              <TouchableOpacity
                style={[styles.modeButton, buildMode === 'traditional' && styles.modeButtonActive]}
                onPress={() => switchToBuildMode('traditional')}
              >
                <Text style={[styles.modeButtonText, buildMode === 'traditional' && styles.modeButtonTextActive]}>
                  📝 Traditional
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, buildMode === 'ingredient-builder' && styles.modeButtonActive]}
                onPress={() => switchToBuildMode('ingredient-builder')}
              >
                <Text style={[styles.modeButtonText, buildMode === 'ingredient-builder' && styles.modeButtonTextActive]}>
                  🔧 Ingredient Builder
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {buildMode === 'ingredient-builder' ? (
            /* Ingredient Builder Mode */
            <View style={styles.builderContainer}>
              {/* Quick Form Header */}
              <View style={styles.quickForm}>
                <View style={styles.quickFormRow}>
                  <View style={styles.quickFormField}>
                    <Text style={styles.fieldLabel}>Item Name</Text>
                    <TextInput
                      style={styles.quickInput}
                      placeholder="Auto-generated or custom"
                      value={formData.name}
                      onChangeText={(text) => setFormData({ ...formData, name: text })}
                    />
                  </View>
                  <View style={styles.quickFormField}>
                    <Text style={styles.fieldLabel}>Category</Text>
                    <TouchableOpacity
                      style={styles.categoryPicker}
                      onPress={() => {
                        Alert.alert(
                          'Select Category',
                          '',
                          categories.map(cat => ({
                            text: cat,
                            onPress: () => setFormData({ ...formData, category: cat })
                          }))
                        );
                      }}
                    >
                      <Text style={styles.categoryPickerText}>{formData.category}</Text>
                      <Text style={styles.categoryPickerArrow}>⏷</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.pricingContainer}>
                  <View style={styles.pricingRow}>
                    <Text style={styles.fieldLabel}>Auto-Pricing</Text>
                    <Switch
                      value={useAutoPricing}
                      onValueChange={setUseAutoPricing}
                      trackColor={{ false: COLORS.border.medium, true: COLORS.primary + '50' }}
                      thumbColor={useAutoPricing ? COLORS.primary : COLORS.border.dark}
                    />
                  </View>
                  {!useAutoPricing && (
                    <TextInput
                      style={styles.priceInput}
                      placeholder="Custom price"
                      value={formData.price}
                      onChangeText={(text) => setFormData({ ...formData, price: text })}
                      keyboardType="decimal-pad"
                    />
                  )}
                  {useAutoPricing && autoPrice > 0 && (
                    <Text style={styles.autoPriceDisplay}>
                      Auto Price: ${autoPrice.toFixed(2)}
                    </Text>
                  )}
                </View>
              </View>

              {/* Ingredient Selector */}
              <IngredientSelector
                selectedIngredients={selectedIngredients}
                onIngredientsChange={setSelectedIngredients}
                onPriceChange={setAutoPrice}
                showPresets={true}
                showDietaryInfo={true}
                maxIngredients={15}
              />
            </View>
          ) : (
            /* Traditional Mode */
            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Item Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Al Pastor Taco"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />

              <Text style={styles.fieldLabel}>Price *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 3.50"
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                keyboardType="decimal-pad"
              />

              <Text style={styles.fieldLabel}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your delicious item..."
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline={true}
                numberOfLines={3}
              />

              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.categoryButtons}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      formData.category === category && styles.categoryButtonActive
                    ]}
                    onPress={() => setFormData({ ...formData, category })}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      formData.category === category && styles.categoryButtonTextActive
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.availabilityContainer}>
                <Text style={styles.fieldLabel}>Available for Order</Text>
                <TouchableOpacity
                  style={[styles.toggleButton, formData.available && styles.toggleButtonActive]}
                  onPress={() => setFormData({ ...formData, available: !formData.available })}
                >
                  <Text style={[styles.toggleButtonText, formData.available && styles.toggleButtonTextActive]}>
                    {formData.available ? 'Available' : 'Unavailable'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Saving...' : (editItem ? 'Update Item' : 'Add Item')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: 50,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSizes.xl,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.text.onPrimary,
  },
  closeButton: {
    fontSize: TYPOGRAPHY.fontSizes.xxl,
    color: COLORS.text.onPrimary,
    padding: SPACING.xs,
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  modeButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modeButtonText: {
    fontSize: TYPOGRAPHY.fontSizes.md,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.text.secondary,
  },
  modeButtonTextActive: {
    color: COLORS.text.onPrimary,
  },
  builderContainer: {
    flex: 1,
  },
  quickForm: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  quickFormRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  quickFormField: {
    flex: 1,
  },
  quickInput: {
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    fontSize: TYPOGRAPHY.fontSizes.sm,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  categoryPicker: {
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryPickerText: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.text.primary,
  },
  categoryPickerArrow: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.text.secondary,
  },
  pricingContainer: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  priceInput: {
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    fontSize: TYPOGRAPHY.fontSizes.sm,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  autoPriceDisplay: {
    fontSize: TYPOGRAPHY.fontSizes.md,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.success,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    padding: SPACING.lg,
  },
  fieldLabel: {
    fontSize: TYPOGRAPHY.fontSizes.md,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    fontSize: TYPOGRAPHY.fontSizes.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  categoryButton: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  categoryButtonText: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
  },
  categoryButtonTextActive: {
    color: COLORS.text.onPrimary,
  },
  availabilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  toggleButton: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  toggleButtonText: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
  },
  toggleButtonTextActive: {
    color: COLORS.text.onPrimary,
  },
  saveButton: {
    backgroundColor: COLORS.success,
    padding: SPACING.lg,
    alignItems: 'center',
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.medium,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: COLORS.text.onPrimary,
    fontSize: TYPOGRAPHY.fontSizes.lg,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
  },
});

export default AddItemModal;