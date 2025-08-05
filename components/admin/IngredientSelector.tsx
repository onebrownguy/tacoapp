import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { 
  INGREDIENTS, 
  PRESET_COMBINATIONS,
  Ingredient, 
  IngredientCategory, 
  PresetCombination,
  getIngredientById,
  getIngredientsByCategory,
  calculateIngredientsCost,
  checkAllergens,
  getSpiceLevel
} from '../../data/ingredients';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/DesignTokens';

export interface SelectedIngredient {
  ingredientId: string;
  quantity: number;
}

export interface IngredientSelectorProps {
  selectedIngredients: SelectedIngredient[];
  onIngredientsChange: (ingredients: SelectedIngredient[]) => void;
  onPriceChange: (price: number) => void;
  showPresets?: boolean;
  showDietaryInfo?: boolean;
  maxIngredients?: number;
}

export const IngredientSelector: React.FC<IngredientSelectorProps> = ({
  selectedIngredients,
  onIngredientsChange,
  onPriceChange,
  showPresets = true,
  showDietaryInfo = true,
  maxIngredients = 20,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<IngredientCategory | 'all'>('all');
  const [showingPresets, setShowingPresets] = useState(false);

  // Calculate current totals
  const totals = useMemo(() => {
    const cost = calculateIngredientsCost(selectedIngredients);
    const allergens = checkAllergens(selectedIngredients);
    const spiceLevel = getSpiceLevel(selectedIngredients);
    const ingredientCount = selectedIngredients.length;
    
    return {
      cost,
      allergens,
      spiceLevel,
      ingredientCount
    };
  }, [selectedIngredients]);

  // Update price when cost changes
  React.useEffect(() => {
    const markup = 2.2; // 120% markup
    const finalPrice = Math.ceil(totals.cost * markup * 20) / 20; // Round to nearest $0.05
    onPriceChange(finalPrice);
  }, [totals.cost, onPriceChange]);

  // Get filtered ingredients
  const filteredIngredients = useMemo(() => {
    if (selectedCategory === 'all') {
      return INGREDIENTS.filter(ingredient => ingredient.availability);
    }
    return getIngredientsByCategory(selectedCategory).filter(ingredient => ingredient.availability);
  }, [selectedCategory]);

  // Get quantity for specific ingredient
  const getIngredientQuantity = (ingredientId: string): number => {
    const found = selectedIngredients.find(item => item.ingredientId === ingredientId);
    return found ? found.quantity : 0;
  };

  // Update ingredient quantity
  const updateIngredientQuantity = (ingredientId: string, newQuantity: number) => {
    const ingredient = getIngredientById(ingredientId);
    if (!ingredient) return;

    // Clamp quantity to valid range
    const clampedQuantity = Math.max(
      ingredient.minQuantity,
      Math.min(ingredient.maxQuantity, newQuantity)
    );

    if (clampedQuantity === 0) {
      // Remove ingredient
      const updated = selectedIngredients.filter(item => item.ingredientId !== ingredientId);
      onIngredientsChange(updated);
    } else {
      // Update or add ingredient
      const existingIndex = selectedIngredients.findIndex(item => item.ingredientId === ingredientId);
      
      if (existingIndex >= 0) {
        // Update existing
        const updated = [...selectedIngredients];
        updated[existingIndex] = { ingredientId, quantity: clampedQuantity };
        onIngredientsChange(updated);
      } else {
        // Add new (check max ingredients limit)
        if (selectedIngredients.length >= maxIngredients) {
          Alert.alert('Limit Reached', `Maximum ${maxIngredients} ingredients allowed`);
          return;
        }
        const updated = [...selectedIngredients, { ingredientId, quantity: clampedQuantity }];
        onIngredientsChange(updated);
      }
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Increase ingredient quantity
  const increaseQuantity = (ingredientId: string) => {
    const ingredient = getIngredientById(ingredientId);
    if (!ingredient) return;
    
    const currentQuantity = getIngredientQuantity(ingredientId);
    const newQuantity = currentQuantity + ingredient.increment;
    
    if (newQuantity <= ingredient.maxQuantity) {
      updateIngredientQuantity(ingredientId, newQuantity);
    }
  };

  // Decrease ingredient quantity
  const decreaseQuantity = (ingredientId: string) => {
    const ingredient = getIngredientById(ingredientId);
    if (!ingredient) return;
    
    const currentQuantity = getIngredientQuantity(ingredientId);
    const newQuantity = currentQuantity - ingredient.increment;
    
    if (newQuantity >= 0) {
      updateIngredientQuantity(ingredientId, newQuantity);
    }
  };

  // Apply preset combination
  const applyPreset = (preset: PresetCombination) => {
    if (preset.ingredients.length > maxIngredients) {
      Alert.alert('Too Many Ingredients', `This preset has ${preset.ingredients.length} ingredients, but the limit is ${maxIngredients}`);
      return;
    }

    Alert.alert(
      'Apply Preset',
      `This will replace your current selection with "${preset.name}". Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: () => {
            onIngredientsChange(preset.ingredients);
            setShowingPresets(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      ]
    );
  };

  // Clear all ingredients
  const clearAll = () => {
    Alert.alert(
      'Clear All',
      'Remove all selected ingredients?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            onIngredientsChange([]);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
        }
      ]
    );
  };

  // Render ingredient item
  const renderIngredientItem = ({ item }: { item: Ingredient }) => {
    const quantity = getIngredientQuantity(item.id);
    const isSelected = quantity > 0;
    const canIncrease = quantity < item.maxQuantity && (quantity > 0 || selectedIngredients.length < maxIngredients);
    const canDecrease = quantity > 0;

    return (
      <View style={[styles.ingredientItem, isSelected && styles.ingredientItemSelected]}>
        {/* Ingredient Info */}
        <View style={styles.ingredientInfo}>
          <View style={styles.ingredientHeader}>
            <Text style={styles.ingredientName}>{item.name}</Text>
            <Text style={styles.ingredientPrice}>${(item.baseCost * (quantity || item.defaultQuantity)).toFixed(2)}</Text>
          </View>
          
          {item.description && (
            <Text style={styles.ingredientDescription}>{item.description}</Text>
          )}
          
          <View style={styles.ingredientMeta}>
            <Text style={styles.ingredientUnit}>
              ${item.baseCost.toFixed(2)} per {item.unit}
            </Text>
            {item.spiceLevel && (
              <View style={styles.spiceIndicator}>
                <Text style={styles.spiceText}>🌶️ {item.spiceLevel}</Text>
              </View>
            )}
            {item.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>Popular</Text>
              </View>
            )}
          </View>

          {/* Allergens */}
          {item.allergens.length > 0 && (
            <View style={styles.allergenContainer}>
              {item.allergens.map(allergen => (
                <View key={allergen} style={styles.allergenBadge}>
                  <Text style={styles.allergenText}>{allergen}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Dietary Info */}
          {showDietaryInfo && (
            <View style={styles.dietaryContainer}>
              {item.dietary.vegetarian && <Text style={styles.dietaryBadge}>🥬 Vegetarian</Text>}
              {item.dietary.vegan && <Text style={styles.dietaryBadge}>🌱 Vegan</Text>}
              {item.dietary.glutenFree && <Text style={styles.dietaryBadge}>🌾 Gluten-Free</Text>}
              {item.dietary.keto && <Text style={styles.dietaryBadge}>🥑 Keto</Text>}
            </View>
          )}
        </View>

        {/* Quantity Controls */}
        <View style={styles.quantityControls}>
          {isSelected && (
            <Text style={styles.quantityDisplay}>
              {quantity} {item.unit}{quantity !== 1 ? 's' : ''}
            </Text>
          )}
          
          <View style={styles.quantityButtons}>
            <TouchableOpacity
              style={[styles.quantityButton, !canDecrease && styles.quantityButtonDisabled]}
              onPress={() => decreaseQuantity(item.id)}
              disabled={!canDecrease}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.quantityButtonText, !canDecrease && styles.quantityButtonTextDisabled]}>
                −
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quantityButton, !canIncrease && styles.quantityButtonDisabled]}
              onPress={() => increaseQuantity(item.id)}
              disabled={!canIncrease}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.quantityButtonText, !canIncrease && styles.quantityButtonTextDisabled]}>
                +
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Render preset item
  const renderPresetItem = ({ item }: { item: PresetCombination }) => (
    <TouchableOpacity
      style={styles.presetItem}
      onPress={() => applyPreset(item)}
      activeOpacity={0.7}
    >
      <View style={styles.presetHeader}>
        <Text style={styles.presetName}>{item.name}</Text>
        <Text style={styles.presetPrice}>${item.basePrice.toFixed(2)}</Text>
      </View>
      <Text style={styles.presetDescription}>{item.description}</Text>
      <Text style={styles.presetIngredients}>
        {item.ingredients.length} ingredients • {item.category}
        {item.popular && ' • Popular'}
      </Text>
    </TouchableOpacity>
  );

  const categories = [
    { key: 'all' as const, label: 'All', icon: '🍽️' },
    { key: IngredientCategory.PROTEINS, label: 'Proteins', icon: '🥩' },
    { key: IngredientCategory.BREAKFAST, label: 'Breakfast', icon: '🍳' },
    { key: IngredientCategory.VEGETABLES, label: 'Vegetables', icon: '🥬' },
    { key: IngredientCategory.CHEESES, label: 'Cheeses', icon: '🧀' },
    { key: IngredientCategory.CARBS, label: 'Carbs', icon: '🌮' },
    { key: IngredientCategory.SAUCES, label: 'Sauces', icon: '🫙' },
    { key: IngredientCategory.SEASONINGS, label: 'Seasonings', icon: '🧂' },
    { key: IngredientCategory.EXTRAS, label: 'Extras', icon: '✨' },
  ];

  return (
    <View style={styles.container}>
      {/* Header with Summary */}
      <View style={styles.header}>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ingredients:</Text>
            <Text style={styles.summaryValue}>{totals.ingredientCount}/{maxIngredients}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Cost:</Text>
            <Text style={styles.summaryValue}>${totals.cost.toFixed(2)}</Text>
          </View>
          {totals.spiceLevel > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Spice:</Text>
              <Text style={styles.summaryValue}>🌶️ {totals.spiceLevel}/5</Text>
            </View>
          )}
        </View>

        <View style={styles.headerActions}>
          {showPresets && (
            <TouchableOpacity
              style={[styles.headerButton, showingPresets && styles.headerButtonActive]}
              onPress={() => setShowingPresets(!showingPresets)}
            >
              <Text style={[styles.headerButtonText, showingPresets && styles.headerButtonTextActive]}>
                Presets
              </Text>
            </TouchableOpacity>
          )}
          
          {selectedIngredients.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearAll}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Allergen Warning */}
      {totals.allergens.length > 0 && (
        <View style={styles.allergenWarning}>
          <Text style={styles.allergenWarningText}>
            ⚠️ Contains: {totals.allergens.join(', ')}
          </Text>
        </View>
      )}

      {showingPresets ? (
        /* Preset View */
        <View style={styles.presetsContainer}>
          <Text style={styles.sectionTitle}>Quick Combinations</Text>
          <FlatList
            data={PRESET_COMBINATIONS}
            renderItem={renderPresetItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.presetsList}
          />
        </View>
      ) : (
        /* Ingredient Builder View */
        <>
          {/* Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryTabs}
            contentContainerStyle={styles.categoryTabsContent}
          >
            {categories.map(category => (
              <TouchableOpacity
                key={category.key}
                style={[
                  styles.categoryTab,
                  selectedCategory === category.key && styles.categoryTabActive
                ]}
                onPress={() => setSelectedCategory(category.key)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[
                  styles.categoryLabel,
                  selectedCategory === category.key && styles.categoryLabelActive
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Ingredients List */}
          <FlatList
            data={filteredIngredients}
            renderItem={renderIngredientItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.ingredientsList}
            getItemLayout={(data, index) => ({
              length: 120,
              offset: 120 * index,
              index,
            })}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  summaryContainer: {
    flex: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs / 2,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.text.secondary,
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.border.light,
  },
  headerButtonActive: {
    backgroundColor: COLORS.primary,
  },
  headerButtonText: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.text.secondary,
  },
  headerButtonTextActive: {
    color: COLORS.text.onPrimary,
  },
  clearButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.error,
  },
  clearButtonText: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.text.onPrimary,
  },
  allergenWarning: {
    backgroundColor: COLORS.warning + '20',
    padding: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  allergenWarningText: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.warning,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
  },
  categoryTabs: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  categoryTabsContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  categoryTab: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
    minWidth: 80,
  },
  categoryTabActive: {
    backgroundColor: COLORS.primary,
  },
  categoryIcon: {
    fontSize: 18,
    marginBottom: SPACING.xs / 2,
  },
  categoryLabel: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
  },
  categoryLabelActive: {
    color: COLORS.text.onPrimary,
  },
  ingredientsList: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  ingredientItem: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  ingredientItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '05',
  },
  ingredientInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  ingredientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  ingredientName: {
    fontSize: TYPOGRAPHY.fontSizes.md,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.text.primary,
    flex: 1,
  },
  ingredientPrice: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.success,
  },
  ingredientDescription: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  ingredientMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  ingredientUnit: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    color: COLORS.text.secondary,
  },
  spiceIndicator: {
    backgroundColor: COLORS.error + '20',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  spiceText: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    color: COLORS.error,
  },
  popularBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  popularText: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
  },
  allergenContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs / 2,
    marginBottom: SPACING.xs,
  },
  allergenBadge: {
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  allergenText: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    color: COLORS.warning,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
  },
  dietaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  dietaryBadge: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    color: COLORS.success,
  },
  quantityControls: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  quantityDisplay: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  quantityButtons: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: COLORS.border.medium,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.text.onPrimary,
  },
  quantityButtonTextDisabled: {
    color: COLORS.text.secondary,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSizes.lg,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  presetsContainer: {
    flex: 1,
    padding: SPACING.md,
  },
  presetsList: {
    gap: SPACING.sm,
  },
  presetItem: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  presetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  presetName: {
    fontSize: TYPOGRAPHY.fontSizes.md,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.text.primary,
    flex: 1,
  },
  presetPrice: {
    fontSize: TYPOGRAPHY.fontSizes.md,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.success,
  },
  presetDescription: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  presetIngredients: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    color: COLORS.text.secondary,
  },
});