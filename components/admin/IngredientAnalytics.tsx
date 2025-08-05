import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useMenu } from '../../app/context/MenuContext';
import { 
  INGREDIENTS, 
  getIngredientById,
  IngredientCategory 
} from '../../data/ingredients';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/DesignTokens';

interface IngredientUsageStats {
  ingredientId: string;
  name: string;
  category: IngredientCategory;
  usageCount: number;
  totalQuantity: number;
  averageQuantity: number;
  revenue: number;
  popularityScore: number;
  cost: number;
  profitability: number;
}

interface CategoryStats {
  category: IngredientCategory;
  totalIngredients: number;
  usedIngredients: number;
  utilizationRate: number;
  totalRevenue: number;
  totalCost: number;
  profitMargin: number;
}

export interface IngredientAnalyticsProps {
  showDetailedView?: boolean;
  selectedCategory?: IngredientCategory | 'all';
  onCategoryChange?: (category: IngredientCategory | 'all') => void;
}

export const IngredientAnalytics: React.FC<IngredientAnalyticsProps> = ({
  showDetailedView = true,
  selectedCategory = 'all',
  onCategoryChange,
}) => {
  const { 
    items, 
    calculateIngredientUsage, 
    getIngredientBasedItems 
  } = useMenu();

  // Calculate comprehensive ingredient analytics
  const analytics = useMemo(() => {
    const ingredientUsage = calculateIngredientUsage();
    const ingredientBasedItems = getIngredientBasedItems();
    
    // Calculate usage stats for each ingredient
    const usageStats: IngredientUsageStats[] = INGREDIENTS.map(ingredient => {
      const usage = ingredientUsage[ingredient.id] || { count: 0, totalQuantity: 0 };
      const averageQuantity = usage.count > 0 ? usage.totalQuantity / usage.count : 0;
      
      // Estimate revenue contribution (simplified)
      const itemsWithIngredient = ingredientBasedItems.filter(item =>
        item.ingredients?.some(ing => ing.ingredientId === ingredient.id)
      );
      const estimatedRevenue = itemsWithIngredient.reduce((sum, item) => 
        sum + ((item.revenue || 0) * 0.1), 0 // Assume 10% attribution per ingredient
      );
      
      // Calculate popularity score based on usage frequency
      const maxUsage = Math.max(...Object.values(ingredientUsage).map(u => u.count));
      const popularityScore = maxUsage > 0 ? (usage.count / maxUsage) * 100 : 0;
      
      // Calculate cost and profitability
      const totalCost = usage.totalQuantity * ingredient.baseCost;
      const profitability = estimatedRevenue > 0 ? ((estimatedRevenue - totalCost) / estimatedRevenue) * 100 : 0;

      return {
        ingredientId: ingredient.id,
        name: ingredient.name,
        category: ingredient.category,
        usageCount: usage.count,
        totalQuantity: usage.totalQuantity,
        averageQuantity,
        revenue: estimatedRevenue,
        popularityScore,
        cost: totalCost,
        profitability
      };
    });

    // Calculate category statistics
    const categoryStats: CategoryStats[] = Object.values(IngredientCategory).map(category => {
      const categoryIngredients = INGREDIENTS.filter(ing => ing.category === category);
      const categoryUsageStats = usageStats.filter(stat => stat.category === category);
      const usedIngredients = categoryUsageStats.filter(stat => stat.usageCount > 0);
      
      const utilizationRate = categoryIngredients.length > 0 
        ? (usedIngredients.length / categoryIngredients.length) * 100 
        : 0;
      
      const totalRevenue = categoryUsageStats.reduce((sum, stat) => sum + stat.revenue, 0);
      const totalCost = categoryUsageStats.reduce((sum, stat) => sum + stat.cost, 0);
      const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;

      return {
        category,
        totalIngredients: categoryIngredients.length,
        usedIngredients: usedIngredients.length,
        utilizationRate,
        totalRevenue,
        totalCost,
        profitMargin
      };
    });

    // Overall statistics
    const overallStats = {
      totalIngredients: INGREDIENTS.length,
      usedIngredients: usageStats.filter(stat => stat.usageCount > 0).length,
      totalMenuItems: items.length,
      ingredientBasedItems: ingredientBasedItems.length,
      averageIngredientsPerItem: ingredientBasedItems.length > 0 
        ? ingredientBasedItems.reduce((sum, item) => sum + (item.ingredients?.length || 0), 0) / ingredientBasedItems.length 
        : 0,
      totalRevenue: usageStats.reduce((sum, stat) => sum + stat.revenue, 0),
      totalCost: usageStats.reduce((sum, stat) => sum + stat.cost, 0),
    };

    return {
      usageStats: usageStats.sort((a, b) => b.popularityScore - a.popularityScore),
      categoryStats: categoryStats.sort((a, b) => b.totalRevenue - a.totalRevenue),
      overallStats
    };
  }, [items, calculateIngredientUsage, getIngredientBasedItems]);

  // Filter data based on selected category
  const filteredUsageStats = useMemo(() => {
    if (selectedCategory === 'all') {
      return analytics.usageStats;
    }
    return analytics.usageStats.filter(stat => stat.category === selectedCategory);
  }, [analytics.usageStats, selectedCategory]);

  // Get top performing ingredients
  const topIngredients = useMemo(() => {
    return {
      mostUsed: [...analytics.usageStats].sort((a, b) => b.usageCount - a.usageCount).slice(0, 5),
      mostProfitable: [...analytics.usageStats].sort((a, b) => b.profitability - a.profitability).slice(0, 5),
      highestRevenue: [...analytics.usageStats].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
      leastUsed: [...analytics.usageStats].filter(stat => stat.usageCount === 0).slice(0, 10)
    };
  }, [analytics.usageStats]);

  const renderOverallStats = () => (
    <View style={styles.statsGrid}>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{analytics.overallStats.usedIngredients}</Text>
        <Text style={styles.statLabel}>Used Ingredients</Text>
        <Text style={styles.statSubLabel}>of {analytics.overallStats.totalIngredients} total</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{analytics.overallStats.ingredientBasedItems}</Text>
        <Text style={styles.statLabel}>Built Items</Text>
        <Text style={styles.statSubLabel}>using ingredients</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{analytics.overallStats.averageIngredientsPerItem.toFixed(1)}</Text>
        <Text style={styles.statLabel}>Avg Ingredients</Text>
        <Text style={styles.statSubLabel}>per item</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={[styles.statValue, { color: COLORS.success }]}>
          ${(analytics.overallStats.totalRevenue - analytics.overallStats.totalCost).toFixed(0)}
        </Text>
        <Text style={styles.statLabel}>Est. Profit</Text>
        <Text style={styles.statSubLabel}>from ingredients</Text>
      </View>
    </View>
  );

  const renderCategoryStats = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Category Performance</Text>
      <FlatList
        horizontal
        data={analytics.categoryStats}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryCard,
              selectedCategory === item.category && styles.categoryCardSelected
            ]}
            onPress={() => onCategoryChange?.(item.category)}
          >
            <Text style={styles.categoryName}>{item.category}</Text>
            <Text style={styles.categoryUtilization}>
              {item.utilizationRate.toFixed(0)}% utilized
            </Text>
            <Text style={styles.categoryUsage}>
              {item.usedIngredients}/{item.totalIngredients} used
            </Text>
            <Text style={[styles.categoryRevenue, { color: COLORS.success }]}>
              ${item.totalRevenue.toFixed(0)}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.category}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      />
    </View>
  );

  const renderTopIngredients = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Top Performers</Text>
      
      <View style={styles.topListsContainer}>
        <View style={styles.topList}>
          <Text style={styles.topListTitle}>Most Used</Text>
          {topIngredients.mostUsed.map((item, index) => (
            <View key={item.ingredientId} style={styles.topListItem}>
              <Text style={styles.topListRank}>#{index + 1}</Text>
              <Text style={styles.topListName}>{item.name}</Text>
              <Text style={styles.topListValue}>{item.usageCount}</Text>
            </View>
          ))}
        </View>

        <View style={styles.topList}>
          <Text style={styles.topListTitle}>Most Profitable</Text>
          {topIngredients.mostProfitable.map((item, index) => (
            <View key={item.ingredientId} style={styles.topListItem}>
              <Text style={styles.topListRank}>#{index + 1}</Text>
              <Text style={styles.topListName}>{item.name}</Text>
              <Text style={[styles.topListValue, { color: COLORS.success }]}>
                {item.profitability.toFixed(0)}%
              </Text>
            </View>
          ))}
        </View>
      </View>

      {topIngredients.leastUsed.length > 0 && (
        <View style={styles.unusedIngredients}>
          <Text style={styles.unusedTitle}>Unused Ingredients ({topIngredients.leastUsed.length})</Text>
          <View style={styles.unusedList}>
            {topIngredients.leastUsed.map(item => (
              <View key={item.ingredientId} style={styles.unusedItem}>
                <Text style={styles.unusedName}>{item.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderDetailedList = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        Detailed Usage {selectedCategory !== 'all' && `(${selectedCategory})`}
      </Text>
      <FlatList
        data={filteredUsageStats}
        renderItem={({ item }) => (
          <View style={styles.detailItem}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailName}>{item.name}</Text>
              <View style={styles.detailBadges}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{item.category}</Text>
                </View>
                {item.popularityScore > 70 && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>Popular</Text>
                  </View>
                )}
              </View>
            </View>
            
            <View style={styles.detailStats}>
              <View style={styles.detailStat}>
                <Text style={styles.detailStatLabel}>Usage</Text>
                <Text style={styles.detailStatValue}>{item.usageCount} items</Text>
              </View>
              <View style={styles.detailStat}>
                <Text style={styles.detailStatLabel}>Quantity</Text>
                <Text style={styles.detailStatValue}>{item.totalQuantity.toFixed(1)}</Text>
              </View>
              <View style={styles.detailStat}>
                <Text style={styles.detailStatLabel}>Revenue</Text>
                <Text style={[styles.detailStatValue, { color: COLORS.success }]}>
                  ${item.revenue.toFixed(0)}
                </Text>
              </View>
              <View style={styles.detailStat}>
                <Text style={styles.detailStatLabel}>Profit</Text>
                <Text style={[
                  styles.detailStatValue, 
                  { color: item.profitability > 0 ? COLORS.success : COLORS.error }
                ]}>
                  {item.profitability.toFixed(0)}%
                </Text>
              </View>
            </View>

            {item.usageCount > 0 && (
              <View style={styles.popularityBar}>
                <View 
                  style={[
                    styles.popularityFill, 
                    { width: `${item.popularityScore}%` }
                  ]} 
                />
              </View>
            )}
          </View>
        )}
        keyExtractor={item => item.ingredientId}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderOverallStats()}
      {renderCategoryStats()}
      {renderTopIngredients()}
      {showDetailedView && renderDetailedList()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSizes.xl,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.text.primary,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.text.primary,
    marginTop: SPACING.xs,
  },
  statSubLabel: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    color: COLORS.text.secondary,
  },
  section: {
    margin: SPACING.md,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSizes.lg,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  categoryList: {
    gap: SPACING.sm,
  },
  categoryCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    minWidth: 120,
    alignItems: 'center',
  },
  categoryCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  categoryName: {
    fontSize: TYPOGRAPHY.fontSizes.md,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.text.primary,
    textTransform: 'capitalize',
  },
  categoryUtilization: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.info,
    marginTop: SPACING.xs,
  },
  categoryUsage: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    color: COLORS.text.secondary,
  },
  categoryRevenue: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    marginTop: SPACING.xs,
  },
  topListsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  topList: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  topListTitle: {
    fontSize: TYPOGRAPHY.fontSizes.md,
    fontWeight: TYPOGRAPHY.fontWeights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  topListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  topListRank: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    color: COLORS.text.secondary,
    minWidth: 24,
  },
  topListName: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.text.primary,
    marginHorizontal: SPACING.xs,
  },
  topListValue: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.text.primary,
  },
  unusedIngredients: {
    backgroundColor: COLORS.warning + '10',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  unusedTitle: {
    fontSize: TYPOGRAPHY.fontSizes.md,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.warning,
    marginBottom: SPACING.sm,
  },
  unusedList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  unusedItem: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  unusedName: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    color: COLORS.text.secondary,
  },
  detailItem: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  detailName: {
    fontSize: TYPOGRAPHY.fontSizes.md,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.text.primary,
    flex: 1,
  },
  detailBadges: {
    flexDirection: 'row',
    gap: SPACING.xs,
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
  popularBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  popularBadgeText: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
  },
  detailStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  detailStat: {
    alignItems: 'center',
  },
  detailStatLabel: {
    fontSize: TYPOGRAPHY.fontSizes.xs,
    color: COLORS.text.secondary,
  },
  detailStatValue: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    fontWeight: TYPOGRAPHY.fontWeights.semibold,
    color: COLORS.text.primary,
    marginTop: 2,
  },
  popularityBar: {
    height: 4,
    backgroundColor: COLORS.border.light,
    borderRadius: 2,
    overflow: 'hidden',
  },
  popularityFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
});

export default IngredientAnalytics;