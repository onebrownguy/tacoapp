import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { 
  INGREDIENTS, 
  Ingredient, 
  IngredientCategory,
  getIngredientsByCategory
} from '../../data/ingredients';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/DesignTokens';

export interface IngredientCostUpdate {
  ingredientId: string;
  newCost: number;
  newAvailability?: boolean;
}

export interface IngredientCostManagerProps {
  onCostUpdate?: (updates: IngredientCostUpdate[]) => void;
  showAvailabilityToggle?: boolean;
  allowBulkOperations?: boolean;
}

export const IngredientCostManager: React.FC<IngredientCostManagerProps> = ({
  onCostUpdate,
  showAvailabilityToggle = true,
  allowBulkOperations = true,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<IngredientCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCosts, setEditingCosts] = useState<Record<string, string>>({});
  const [bulkMarkup, setBulkMarkup] = useState('');
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, IngredientCostUpdate>>({});

  // Filter ingredients based on category and search
  const filteredIngredients = useMemo(() => {
    let filtered = selectedCategory === 'all' 
      ? INGREDIENTS 
      : getIngredientsByCategory(selectedCategory);

    if (searchQuery) {
      filtered = filtered.filter(ingredient =>
        ingredient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ingredient.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedCategory, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalIngredients = filteredIngredients.length;
    const availableIngredients = filteredIngredients.filter(i => i.availability).length;
    const averageCost = filteredIngredients.reduce((sum, i) => sum + i.baseCost, 0) / totalIngredients;
    const totalPendingUpdates = Object.keys(pendingUpdates).length;

    return {
      totalIngredients,
      availableIngredients,
      averageCost: isNaN(averageCost) ? 0 : averageCost,
      totalPendingUpdates
    };
  }, [filteredIngredients, pendingUpdates]);

  // Update ingredient cost
  const updateIngredientCost = (ingredientId: string, newCost: string) => {
    setEditingCosts(prev => ({ ...prev, [ingredientId]: newCost }));
    
    const cost = parseFloat(newCost);
    if (!isNaN(cost) && cost >= 0) {
      setPendingUpdates(prev => ({
        ...prev,
        [ingredientId]: {
          ...prev[ingredientId],
          ingredientId,
          newCost: cost
        }
      }));
    } else if (pendingUpdates[ingredientId]) {
      setPendingUpdates(prev => {
        const updated = { ...prev };
        delete updated[ingredientId];
        return updated;
      });
    }
  };

  // Update ingredient availability
  const updateIngredientAvailability = (ingredientId: string, availability: boolean) => {
    setPendingUpdates(prev => ({
      ...prev,
      [ingredientId]: {
        ...prev[ingredientId],
        ingredientId,
        newCost: prev[ingredientId]?.newCost || 
          INGREDIENTS.find(i => i.id === ingredientId)?.baseCost || 0,
        newAvailability: availability
      }
    }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Apply bulk markup
  const applyBulkMarkup = () => {
    const markup = parseFloat(bulkMarkup);
    if (isNaN(markup)) {
      Alert.alert('Invalid Markup', 'Please enter a valid percentage.');
      return;
    }

    Alert.alert(
      'Apply Bulk Markup',
      `Apply ${markup > 0 ? '+' : ''}${markup}% markup to ${filteredIngredients.length} ingredients?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: () => {
            const updates: Record<string, IngredientCostUpdate> = {};
            
            filteredIngredients.forEach(ingredient => {
              const currentCost = pendingUpdates[ingredient.id]?.newCost || ingredient.baseCost;
              const newCost = currentCost * (1 + markup / 100);
              
              updates[ingredient.id] = {
                ingredientId: ingredient.id,
                newCost: Math.max(0.01, Math.round(newCost * 100) / 100), // Minimum $0.01, round to cents
                newAvailability: pendingUpdates[ingredient.id]?.newAvailability
              };

              setEditingCosts(prev => ({
                ...prev,
                [ingredient.id]: updates[ingredient.id].newCost.toString()
              }));
            });

            setPendingUpdates(prev => ({ ...prev, ...updates }));
            setBulkMarkup('');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      ]
    );
  };

  // Save all pending updates
  const savePendingUpdates = () => {
    const updates = Object.values(pendingUpdates);
    if (updates.length === 0) {
      Alert.alert('No Changes', 'No pending cost changes to save.');
      return;
    }

    Alert.alert(
      'Save Changes',
      `Save ${updates.length} ingredient cost changes?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: () => {
            onCostUpdate?.(updates);
            setPendingUpdates({});
            setEditingCosts({});
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      ]
    );
  };

  // Clear pending updates
  const clearPendingUpdates = () => {
    setPendingUpdates({});
    setEditingCosts({});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Render ingredient item
  const renderIngredientItem = ({ item }: { item: Ingredient }) => {
    const currentCost = editingCosts[item.id] || item.baseCost.toString();
    const hasUpdate = pendingUpdates[item.id];
    const originalCost = item.baseCost;
    const newCost = hasUpdate?.newCost || originalCost;
    const costChange = ((newCost - originalCost) / originalCost) * 100;

    return (
      <View style={[styles.ingredientItem, hasUpdate && styles.ingredientItemUpdated]}>
        <View style={styles.ingredientInfo}>
          <View style={styles.ingredientHeader}>
            <Text style={styles.ingredientName}>{item.name}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category}</Text>
            </View>
          </View>

          {item.description && (
            <Text style={styles.ingredientDescription}>{item.description}</Text>
          )}

          <Text style={styles.ingredientUnit}>Per {item.unit}</Text>
        </View>

        <View style={styles.costControls}>
          <View style={styles.costInputContainer}>
            <Text style={styles.costLabel}>$</Text>
            <TextInput
              style={[styles.costInput, hasUpdate && styles.costInputUpdated]}
              value={currentCost}
              onChangeText={(text) => updateIngredientCost(item.id, text)}
              keyboardType="decimal-pad"
              selectTextOnFocus
            />
          </View>

          {hasUpdate && Math.abs(costChange) > 0.01 && (
            <Text style={[
              styles.changeIndicator,
              { color: costChange > 0 ? COLORS.error : COLORS.success }
            ]}>
              {costChange > 0 ? '+' : ''}{costChange.toFixed(1)}%
            </Text>
          )}

          {showAvailabilityToggle && (
            <View style={styles.availabilityToggle}>
              <Switch
                value={hasUpdate?.newAvailability ?? item.availability}
                onValueChange={(value) => updateIngredientAvailability(item.id, value)}
                trackColor={{ false: COLORS.border.medium, true: COLORS.success + '50' }}
                thumbColor={
                  (hasUpdate?.newAvailability ?? item.availability) 
                    ? COLORS.success 
                    : COLORS.border.dark
                }
                scale={0.8}
              />
            </View>
          )}
        </View>
      </View>
    );
  };

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
      {/* Header Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalIngredients}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.success }]}>
            {stats.availableIngredients}
          </Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>${stats.averageCost.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Avg Cost</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: stats.totalPendingUpdates > 0 ? COLORS.warning : COLORS.text.secondary }]}>
            {stats.totalPendingUpdates}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      {/* Search */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search ingredients..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor={COLORS.text.secondary}
      />

      {/* Category Filter */}
      <FlatList
        horizontal
        data={categories}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === item.key && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(item.key)}
          >
            <Text style={styles.categoryChipIcon}>{item.icon}</Text>
            <Text style={[
              styles.categoryChipText,
              selectedCategory === item.key && styles.categoryChipTextActive
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      />

      {/* Bulk Operations */}
      {allowBulkOperations && (
        <View style={styles.bulkOperations}>
          <View style={styles.bulkMarkupContainer}>
            <TextInput
              style={styles.bulkMarkupInput}
              placeholder="% markup"
              value={bulkMarkup}
              onChangeText={setBulkMarkup}
              keyboardType="numeric"
              placeholderTextColor={COLORS.text.secondary}
            />
            <TouchableOpacity
              style={styles.bulkMarkupButton}
              onPress={applyBulkMarkup}
              disabled={!bulkMarkup}
            >
              <Text style={styles.bulkMarkupButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>

          {stats.totalPendingUpdates > 0 && (
            <View style={styles.pendingActions}>
              <TouchableOpacity style={styles.clearButton} onPress={clearPendingUpdates}>
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={savePendingUpdates}>
                <Text style={styles.saveButtonText}>Save {stats.totalPendingUpdates}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Ingredients List */}
      <FlatList
        data={filteredIngredients}
        renderItem={renderIngredientItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.ingredientsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSizes.lg,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.text.primary,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    fontSize: TYPOGRAPHY.fontSizes.md,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  categoryList: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  categoryChipText: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
  },
  categoryChipTextActive: {
    color: COLORS.text.onPrimary,
  },
  bulkOperations: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    gap: SPACING.sm,
  },
  bulkMarkupContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  bulkMarkupInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  bulkMarkupButton: {
    backgroundColor: COLORS.info,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  bulkMarkupButtonText: {
    color: COLORS.text.onPrimary,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
  },
  pendingActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  clearButton: {
    flex: 1,
    backgroundColor: COLORS.border.medium,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  clearButtonText: {
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
  },
  saveButton: {
    flex: 2,
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.text.onPrimary,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
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
  ingredientItemUpdated: {
    borderColor: COLORS.warning,
    backgroundColor: COLORS.warning + '10',
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
  categoryBadge: {
    backgroundColor: COLORS.info + '20',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  categoryBadgeText: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    color: COLORS.info,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
  },
  ingredientDescription: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  ingredientUnit: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    color: COLORS.text.secondary,
  },
  costControls: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 100,
  },
  costInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  costLabel: {
    fontSize: TYPOGRAPHY.fontSizes.md,
    color: COLORS.text.primary,
    marginRight: 2,
  },
  costInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.xs,
    fontSize: TYPOGRAPHY.fontSizes.md,
    color: COLORS.text.primary,
    minWidth: 60,
    textAlign: 'center',
  },
  costInputUpdated: {
    borderColor: COLORS.warning,
    backgroundColor: COLORS.warning + '10',
  },
  changeIndicator: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    marginBottom: SPACING.xs,
  },
  availabilityToggle: {
    alignItems: 'center',
  },
});

export default IngredientCostManager;