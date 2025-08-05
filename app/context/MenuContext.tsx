import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  available: boolean;
  imageUrl?: string;
  popularity?: number;
  revenue?: number;
  createdAt?: Date;
  updatedAt?: Date;
  // Ingredient system fields
  ingredientBased?: boolean;
  ingredients?: Array<{
    ingredientId: string;
    quantity: number;
  }>;
  allergens?: string[];
  spiceLevel?: number;
  nutritionInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
};

type MenuAction = {
  type: 'ADD' | 'UPDATE' | 'DELETE' | 'BULK_UPDATE' | 'BULK_DELETE' | 'BULK_PRICE_UPDATE' | 'BULK_CATEGORY_CHANGE' | 'BULK_AVAILABILITY_TOGGLE' | 'REORDER' | 'BATCH_OPERATION';
  payload: any;
  timestamp: Date;
  batchId?: string; // For grouping related actions
};

interface MenuContextType {
  // Data
  items: MenuItem[];
  loading: boolean;
  error: string | null;
  
  // CRUD operations
  addItem: (item: Omit<MenuItem, 'id'>) => Promise<void>;
  updateItem: (id: string, updates: Partial<MenuItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  duplicateItem: (id: string) => Promise<void>;
  
  // Bulk operations
  updateMultipleItems: (ids: string[], updates: Partial<MenuItem>) => Promise<void>;
  deleteMultipleItems: (ids: string[]) => Promise<void>;
  
  // Advanced bulk operations
  bulkPriceUpdate: (ids: string[], priceData: { newPrice?: number; increaseType?: 'percentage' | 'fixed'; increaseValue?: number; decreaseType?: 'percentage' | 'fixed'; decreaseValue?: number; minimumPrice?: number; roundToNearest?: number }) => Promise<void>;
  bulkCategoryChange: (ids: string[], newCategory: string) => Promise<void>;
  bulkAvailabilityToggle: (ids: string[], availability: boolean | 'toggle') => Promise<void>;
  bulkDescriptionUpdate: (ids: string[], updateType: 'replace' | 'append' | 'prepend', text: string) => Promise<void>;
  
  // Batch operations with progress tracking
  executeBatchOperation: (operations: Array<{ type: string; itemIds: string[]; data: any }>, onProgress?: (completed: number, total: number) => void) => Promise<void>;
  
  // Export/Import operations
  exportItems: (ids: string[], format: 'json' | 'csv') => Promise<string>;
  importItems: (data: string, format: 'json' | 'csv', options?: { mergeStrategy: 'replace' | 'merge' | 'skip' }) => Promise<{ success: number; errors: string[] }>;
  
  // UI state
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedItems: string[];
  setSelectedItems: (items: string[]) => void;
  isMultiSelectMode: boolean;
  setIsMultiSelectMode: (enabled: boolean) => void;
  
  // Filtering and sorting
  filteredItems: MenuItem[];
  sortBy: 'name' | 'price' | 'category' | 'popularity' | 'created';
  setSortBy: (sort: 'name' | 'price' | 'category' | 'popularity' | 'created') => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (direction: 'asc' | 'desc') => void;
  
  // Undo/Redo
  undoStack: MenuAction[];
  redoStack: MenuAction[];
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  
  // Utilities
  refreshItems: () => Promise<void>;
  toggleItemAvailability: (id: string) => Promise<void>;
  getItemsByCategory: (category: string) => MenuItem[];
  getTotalItems: () => number;
  getAvailableItems: () => number;
  
  // Ingredient-based utilities
  getIngredientBasedItems: () => MenuItem[];
  getItemsByAllergen: (allergen: string) => MenuItem[];
  getItemsBySpiceLevel: (minLevel: number, maxLevel?: number) => MenuItem[];
  getItemsWithIngredient: (ingredientId: string) => MenuItem[];
  calculateIngredientUsage: () => Record<string, { count: number; totalQuantity: number }>;
}

const MenuContext = createContext<MenuContextType>({} as MenuContextType);

const MENU_STORAGE_KEY = '@taco_admin_menu';
const UNDO_STORAGE_KEY = '@taco_admin_undo';

const categories = ['All', 'Tacos', 'Burritos', 'Quesadillas', 'Sides', 'Drinks', 'Desserts'];

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'category' | 'popularity' | 'created'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Undo/Redo
  const [undoStack, setUndoStack] = useState<MenuAction[]>([]);
  const [redoStack, setRedoStack] = useState<MenuAction[]>([]);

  // Initialize with sample data
  useEffect(() => {
    loadMenuItems();
  }, []);

  // Save items when they change
  useEffect(() => {
    if (!loading) {
      saveMenuItems(items);
    }
  }, [items, loading]);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const savedItems = await AsyncStorage.getItem(MENU_STORAGE_KEY);
      
      if (savedItems) {
        setItems(JSON.parse(savedItems));
      } else {
        // Initialize with sample data
        const sampleItems: MenuItem[] = [
          {
            id: '1',
            name: 'Al Pastor Taco',
            price: 3.50,
            description: 'Succulent marinated pork with pineapple',
            category: 'Tacos',
            available: true,
            popularity: 127,
            revenue: 444.50,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: '2',
            name: 'Carne Asada Taco',
            price: 4.00,
            description: 'Grilled steak with citrus salsa',
            category: 'Tacos',
            available: true,
            popularity: 98,
            revenue: 392.00,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: '3',
            name: 'Fish Taco',
            price: 4.50,
            description: 'Crispy fish with citrus slaw',
            category: 'Tacos',
            available: false,
            popularity: 76,
            revenue: 342.00,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
        setItems(sampleItems);
      }
    } catch (err) {
      setError('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const saveMenuItems = async (menuItems: MenuItem[]) => {
    try {
      await AsyncStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(menuItems));
    } catch (err) {
      console.error('Failed to save menu items:', err);
    }
  };

  const addAction = (action: MenuAction) => {
    setUndoStack(prev => [...prev.slice(-19), action]); // Keep last 20 actions
    setRedoStack([]); // Clear redo stack when new action is performed
  };

  // Generate unique batch ID for grouping related actions
  const generateBatchId = () => `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addItem = useCallback(async (item: Omit<MenuItem, 'id'>) => {
    try {
      const newItem: MenuItem = {
        ...item,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        popularity: 0,
        revenue: 0
      };

      setItems(prev => {
        const updated = [...prev, newItem];
        addAction({
          type: 'ADD',
          payload: { item: newItem },
          timestamp: new Date()
        });
        return updated;
      });
    } catch (err) {
      setError('Failed to add item');
    }
  }, []);

  const updateItem = useCallback(async (id: string, updates: Partial<MenuItem>) => {
    try {
      const oldItem = items.find(item => item.id === id);
      if (!oldItem) return;

      setItems(prev => {
        const updated = prev.map(item =>
          item.id === id
            ? { ...item, ...updates, updatedAt: new Date() }
            : item
        );
        
        addAction({
          type: 'UPDATE',
          payload: { id, oldItem, updates },
          timestamp: new Date()
        });
        
        return updated;
      });
    } catch (err) {
      setError('Failed to update item');
    }
  }, [items]);

  const deleteItem = useCallback(async (id: string) => {
    try {
      const itemToDelete = items.find(item => item.id === id);
      if (!itemToDelete) return;

      setItems(prev => {
        const updated = prev.filter(item => item.id !== id);
        
        addAction({
          type: 'DELETE',
          payload: { item: itemToDelete },
          timestamp: new Date()
        });
        
        return updated;
      });
    } catch (err) {
      setError('Failed to delete item');
    }
  }, [items]);

  const duplicateItem = useCallback(async (id: string) => {
    try {
      const originalItem = items.find(item => item.id === id);
      if (!originalItem) return;

      const duplicatedItem: MenuItem = {
        ...originalItem,
        id: Date.now().toString(),
        name: `${originalItem.name} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date(),
        popularity: 0,
        revenue: 0
      };

      setItems(prev => [...prev, duplicatedItem]);
    } catch (err) {
      setError('Failed to duplicate item');
    }
  }, [items]);

  const updateMultipleItems = useCallback(async (ids: string[], updates: Partial<MenuItem>) => {
    try {
      const oldItems = items.filter(item => ids.includes(item.id));
      
      setItems(prev => {
        const updated = prev.map(item =>
          ids.includes(item.id)
            ? { ...item, ...updates, updatedAt: new Date() }
            : item
        );
        
        addAction({
          type: 'BULK_UPDATE',
          payload: { ids, oldItems, updates },
          timestamp: new Date()
        });
        
        return updated;
      });
    } catch (err) {
      setError('Failed to update items');
    }
  }, [items]);

  const deleteMultipleItems = useCallback(async (ids: string[]) => {
    try {
      const itemsToDelete = items.filter(item => ids.includes(item.id));
      
      setItems(prev => {
        const updated = prev.filter(item => !ids.includes(item.id));
        
        addAction({
          type: 'BULK_DELETE',
          payload: { items: itemsToDelete },
          timestamp: new Date()
        });
        
        return updated;
      });
      
      setSelectedItems([]);
      setIsMultiSelectMode(false);
    } catch (err) {
      setError('Failed to delete items');
    }
  }, [items]);

  // Advanced bulk price update with multiple strategies
  const bulkPriceUpdate = useCallback(async (
    ids: string[],
    priceData: {
      newPrice?: number;
      increaseType?: 'percentage' | 'fixed';
      increaseValue?: number;
      decreaseType?: 'percentage' | 'fixed';
      decreaseValue?: number;
      minimumPrice?: number;
      roundToNearest?: number;
    }
  ) => {
    try {
      const batchId = generateBatchId();
      const oldItems = items.filter(item => ids.includes(item.id));

      setItems(prev => {
        const updated = prev.map(item => {
          if (!ids.includes(item.id)) return item;

          let newPrice = item.price;

          // Handle direct price setting
          if (priceData.newPrice !== undefined) {
            newPrice = priceData.newPrice;
          }
          // Handle price increase
          else if (priceData.increaseType && priceData.increaseValue !== undefined) {
            if (priceData.increaseType === 'percentage') {
              newPrice = item.price * (1 + priceData.increaseValue / 100);
            } else {
              newPrice = item.price + priceData.increaseValue;
            }
          }
          // Handle price decrease
          else if (priceData.decreaseType && priceData.decreaseValue !== undefined) {
            if (priceData.decreaseType === 'percentage') {
              newPrice = item.price * (1 - priceData.decreaseValue / 100);
            } else {
              newPrice = item.price - priceData.decreaseValue;
            }
          }

          // Apply minimum price constraint
          if (priceData.minimumPrice !== undefined) {
            newPrice = Math.max(newPrice, priceData.minimumPrice);
          }

          // Round to nearest value
          if (priceData.roundToNearest !== undefined) {
            newPrice = Math.round(newPrice / priceData.roundToNearest) * priceData.roundToNearest;
          }

          // Ensure price is never negative
          newPrice = Math.max(0, newPrice);

          return {
            ...item,
            price: parseFloat(newPrice.toFixed(2)),
            updatedAt: new Date(),
          };
        });

        addAction({
          type: 'BULK_PRICE_UPDATE',
          payload: { ids, oldItems, priceData },
          timestamp: new Date(),
          batchId,
        });

        return updated;
      });
    } catch (err) {
      setError('Failed to update prices');
    }
  }, [items]);

  // Bulk category change
  const bulkCategoryChange = useCallback(async (ids: string[], newCategory: string) => {
    try {
      const batchId = generateBatchId();
      const oldItems = items.filter(item => ids.includes(item.id));

      setItems(prev => {
        const updated = prev.map(item =>
          ids.includes(item.id)
            ? { ...item, category: newCategory, updatedAt: new Date() }
            : item
        );

        addAction({
          type: 'BULK_CATEGORY_CHANGE',
          payload: { ids, oldItems, newCategory },
          timestamp: new Date(),
          batchId,
        });

        return updated;
      });
    } catch (err) {
      setError('Failed to change categories');
    }
  }, [items]);

  // Bulk availability toggle
  const bulkAvailabilityToggle = useCallback(async (ids: string[], availability: boolean | 'toggle') => {
    try {
      const batchId = generateBatchId();
      const oldItems = items.filter(item => ids.includes(item.id));

      setItems(prev => {
        const updated = prev.map(item => {
          if (!ids.includes(item.id)) return item;

          const newAvailability = availability === 'toggle' ? !item.available : availability;
          return {
            ...item,
            available: newAvailability,
            updatedAt: new Date(),
          };
        });

        addAction({
          type: 'BULK_AVAILABILITY_TOGGLE',
          payload: { ids, oldItems, availability },
          timestamp: new Date(),
          batchId,
        });

        return updated;
      });
    } catch (err) {
      setError('Failed to update availability');
    }
  }, [items]);

  // Bulk description update
  const bulkDescriptionUpdate = useCallback(async (
    ids: string[],
    updateType: 'replace' | 'append' | 'prepend',
    text: string
  ) => {
    try {
      const batchId = generateBatchId();
      const oldItems = items.filter(item => ids.includes(item.id));

      setItems(prev => {
        const updated = prev.map(item => {
          if (!ids.includes(item.id)) return item;

          let newDescription = item.description;
          switch (updateType) {
            case 'replace':
              newDescription = text;
              break;
            case 'append':
              newDescription = item.description + ' ' + text;
              break;
            case 'prepend':
              newDescription = text + ' ' + item.description;
              break;
          }

          return {
            ...item,
            description: newDescription.trim(),
            updatedAt: new Date(),
          };
        });

        addAction({
          type: 'BULK_UPDATE',
          payload: { ids, oldItems, updates: { description: text }, updateType },
          timestamp: new Date(),
          batchId,
        });

        return updated;
      });
    } catch (err) {
      setError('Failed to update descriptions');
    }
  }, [items]);

  // Execute batch operations with progress tracking
  const executeBatchOperation = useCallback(async (
    operations: Array<{ type: string; itemIds: string[]; data: any }>,
    onProgress?: (completed: number, total: number) => void
  ) => {
    try {
      const batchId = generateBatchId();
      let completed = 0;
      const total = operations.length;

      for (const operation of operations) {
        switch (operation.type) {
          case 'price-update':
            await bulkPriceUpdate(operation.itemIds, operation.data);
            break;
          case 'category-change':
            await bulkCategoryChange(operation.itemIds, operation.data.newCategory);
            break;
          case 'availability-toggle':
            await bulkAvailabilityToggle(operation.itemIds, operation.data.availability);
            break;
          case 'description-update':
            await bulkDescriptionUpdate(operation.itemIds, operation.data.updateType, operation.data.text);
            break;
          case 'delete':
            await deleteMultipleItems(operation.itemIds);
            break;
          default:
            console.warn('Unknown batch operation type:', operation.type);
        }

        completed++;
        onProgress?.(completed, total);

        // Add small delay to prevent UI blocking
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      addAction({
        type: 'BATCH_OPERATION',
        payload: { operations, batchId },
        timestamp: new Date(),
        batchId,
      });
    } catch (err) {
      setError('Failed to execute batch operation');
      throw err;
    }
  }, [bulkPriceUpdate, bulkCategoryChange, bulkAvailabilityToggle, bulkDescriptionUpdate, deleteMultipleItems]);

  // Export items in different formats
  const exportItems = useCallback(async (ids: string[], format: 'json' | 'csv'): Promise<string> => {
    try {
      const itemsToExport = items.filter(item => ids.includes(item.id));
      
      if (format === 'json') {
        return JSON.stringify(itemsToExport, null, 2);
      } else if (format === 'csv') {
        const headers = ['id', 'name', 'price', 'description', 'category', 'available', 'popularity', 'revenue'];
        const rows = itemsToExport.map(item => [
          item.id,
          `"${item.name.replace(/"/g, '""')}"`, // Escape quotes in CSV
          item.price,
          `"${item.description.replace(/"/g, '""')}"`,
          item.category,
          item.available,
          item.popularity || 0,
          item.revenue || 0,
        ]);
        
        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      }
      
      throw new Error('Unsupported export format');
    } catch (err) {
      setError('Failed to export items');
      throw err;
    }
  }, [items]);

  // Import items from different formats
  const importItems = useCallback(async (
    data: string,
    format: 'json' | 'csv',
    options: { mergeStrategy: 'replace' | 'merge' | 'skip' } = { mergeStrategy: 'merge' }
  ): Promise<{ success: number; errors: string[] }> => {
    try {
      let itemsToImport: Partial<MenuItem>[] = [];
      const errors: string[] = [];

      if (format === 'json') {
        try {
          const parsed = JSON.parse(data);
          itemsToImport = Array.isArray(parsed) ? parsed : [parsed];
        } catch (parseError) {
          errors.push('Invalid JSON format');
          return { success: 0, errors };
        }
      } else if (format === 'csv') {
        const lines = data.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          errors.push('CSV must have at least header and one data row');
          return { success: 0, errors };
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const dataLines = lines.slice(1);

        itemsToImport = dataLines.map((line, index) => {
          const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const item: Partial<MenuItem> = {};

          headers.forEach((header, i) => {
            const value = values[i];
            switch (header) {
              case 'name':
                item.name = value;
                break;
              case 'price':
                item.price = parseFloat(value) || 0;
                break;
              case 'description':
                item.description = value;
                break;
              case 'category':
                item.category = value;
                break;
              case 'available':
                item.available = value.toLowerCase() === 'true';
                break;
              case 'popularity':
                item.popularity = parseInt(value) || 0;
                break;
              case 'revenue':
                item.revenue = parseFloat(value) || 0;
                break;
            }
          });

          return item;
        });
      }

      let successCount = 0;
      const batchId = generateBatchId();

      setItems(prev => {
        const updated = [...prev];

        itemsToImport.forEach((importItem, index) => {
          try {
            // Validate required fields
            if (!importItem.name || !importItem.category) {
              errors.push(`Row ${index + 2}: Missing required fields (name, category)`);
              return;
            }

            // Check if item already exists
            const existingIndex = updated.findIndex(item => item.name === importItem.name);

            if (existingIndex >= 0) {
              // Handle existing item based on merge strategy
              switch (options.mergeStrategy) {
                case 'replace':
                  updated[existingIndex] = {
                    ...updated[existingIndex],
                    ...importItem,
                    updatedAt: new Date(),
                  } as MenuItem;
                  successCount++;
                  break;
                case 'merge':
                  updated[existingIndex] = {
                    ...updated[existingIndex],
                    ...importItem,
                    updatedAt: new Date(),
                  } as MenuItem;
                  successCount++;
                  break;
                case 'skip':
                  // Skip existing items
                  break;
              }
            } else {
              // Add new item
              const newItem: MenuItem = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                name: importItem.name!,
                price: importItem.price || 0,
                description: importItem.description || '',
                category: importItem.category!,
                available: importItem.available !== undefined ? importItem.available : true,
                popularity: importItem.popularity || 0,
                revenue: importItem.revenue || 0,
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              updated.push(newItem);
              successCount++;
            }
          } catch (itemError) {
            errors.push(`Row ${index + 2}: ${itemError}`);
          }
        });

        addAction({
          type: 'BULK_UPDATE',
          payload: { importedCount: successCount, errors },
          timestamp: new Date(),
          batchId,
        });

        return updated;
      });

      return { success: successCount, errors };
    } catch (err) {
      setError('Failed to import items');
      return { success: 0, errors: ['Import failed: ' + err] };
    }
  }, [items]);

  const toggleItemAvailability = useCallback(async (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      await updateItem(id, { available: !item.available });
    }
  }, [items, updateItem]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;

    const lastAction = undoStack[undoStack.length - 1];
    
    switch (lastAction.type) {
      case 'ADD':
        setItems(prev => prev.filter(item => item.id !== lastAction.payload.item.id));
        break;
      case 'DELETE':
        setItems(prev => [...prev, lastAction.payload.item]);
        break;
      case 'UPDATE':
        setItems(prev => prev.map(item =>
          item.id === lastAction.payload.id ? lastAction.payload.oldItem : item
        ));
        break;
      case 'BULK_DELETE':
        setItems(prev => [...prev, ...lastAction.payload.items]);
        break;
      case 'BULK_UPDATE':
        if (lastAction.payload.oldItems) {
          setItems(prev => prev.map(item => {
            const oldItem = lastAction.payload.oldItems.find((old: MenuItem) => old.id === item.id);
            return oldItem || item;
          }));
        }
        break;
      case 'BULK_PRICE_UPDATE':
        setItems(prev => prev.map(item => {
          const oldItem = lastAction.payload.oldItems.find((old: MenuItem) => old.id === item.id);
          return oldItem || item;
        }));
        break;
      case 'BULK_CATEGORY_CHANGE':
        setItems(prev => prev.map(item => {
          const oldItem = lastAction.payload.oldItems.find((old: MenuItem) => old.id === item.id);
          return oldItem || item;
        }));
        break;
      case 'BULK_AVAILABILITY_TOGGLE':
        setItems(prev => prev.map(item => {
          const oldItem = lastAction.payload.oldItems.find((old: MenuItem) => old.id === item.id);
          return oldItem || item;
        }));
        break;
      case 'BATCH_OPERATION':
        // For batch operations, we need to reverse each operation in reverse order
        if (lastAction.payload.operations) {
          const operations = [...lastAction.payload.operations].reverse();
          operations.forEach((operation: any) => {
            // Find the corresponding action in the undo stack to get the old values
            const correspondingAction = undoStack.find(action => 
              action.batchId === lastAction.batchId && 
              action.type.includes(operation.type.toUpperCase().replace('-', '_'))
            );
            
            if (correspondingAction?.payload.oldItems) {
              setItems(prev => prev.map(item => {
                const oldItem = correspondingAction.payload.oldItems.find((old: MenuItem) => old.id === item.id);
                return oldItem || item;
              }));
            }
          });
        }
        break;
    }

    setRedoStack(prev => [...prev, lastAction]);
    setUndoStack(prev => prev.slice(0, -1));
  }, [undoStack]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;

    const actionToRedo = redoStack[redoStack.length - 1];
    
    switch (actionToRedo.type) {
      case 'ADD':
        setItems(prev => [...prev, actionToRedo.payload.item]);
        break;
      case 'DELETE':
        setItems(prev => prev.filter(item => item.id !== actionToRedo.payload.item.id));
        break;
      case 'UPDATE':
        setItems(prev => prev.map(item =>
          item.id === actionToRedo.payload.id
            ? { ...item, ...actionToRedo.payload.updates }
            : item
        ));
        break;
      case 'BULK_DELETE':
        setItems(prev => prev.filter(item => 
          !actionToRedo.payload.items.some((deletedItem: MenuItem) => deletedItem.id === item.id)
        ));
        break;
      case 'BULK_UPDATE':
        if (actionToRedo.payload.updates && actionToRedo.payload.ids) {
          setItems(prev => prev.map(item =>
            actionToRedo.payload.ids.includes(item.id)
              ? { ...item, ...actionToRedo.payload.updates, updatedAt: new Date() }
              : item
          ));
        }
        break;
      case 'BULK_PRICE_UPDATE':
        if (actionToRedo.payload.priceData && actionToRedo.payload.ids) {
          // Re-apply the price update logic
          setItems(prev => prev.map(item => {
            if (!actionToRedo.payload.ids.includes(item.id)) return item;

            let newPrice = item.price;
            const priceData = actionToRedo.payload.priceData;

            if (priceData.newPrice !== undefined) {
              newPrice = priceData.newPrice;
            } else if (priceData.increaseType && priceData.increaseValue !== undefined) {
              if (priceData.increaseType === 'percentage') {
                newPrice = item.price * (1 + priceData.increaseValue / 100);
              } else {
                newPrice = item.price + priceData.increaseValue;
              }
            } else if (priceData.decreaseType && priceData.decreaseValue !== undefined) {
              if (priceData.decreaseType === 'percentage') {
                newPrice = item.price * (1 - priceData.decreaseValue / 100);
              } else {
                newPrice = item.price - priceData.decreaseValue;
              }
            }

            if (priceData.minimumPrice !== undefined) {
              newPrice = Math.max(newPrice, priceData.minimumPrice);
            }

            if (priceData.roundToNearest !== undefined) {
              newPrice = Math.round(newPrice / priceData.roundToNearest) * priceData.roundToNearest;
            }

            newPrice = Math.max(0, newPrice);

            return {
              ...item,
              price: parseFloat(newPrice.toFixed(2)),
              updatedAt: new Date(),
            };
          }));
        }
        break;
      case 'BULK_CATEGORY_CHANGE':
        if (actionToRedo.payload.ids && actionToRedo.payload.newCategory) {
          setItems(prev => prev.map(item =>
            actionToRedo.payload.ids.includes(item.id)
              ? { ...item, category: actionToRedo.payload.newCategory, updatedAt: new Date() }
              : item
          ));
        }
        break;
      case 'BULK_AVAILABILITY_TOGGLE':
        if (actionToRedo.payload.ids && actionToRedo.payload.availability !== undefined) {
          setItems(prev => prev.map(item => {
            if (!actionToRedo.payload.ids.includes(item.id)) return item;

            const newAvailability = actionToRedo.payload.availability === 'toggle' 
              ? !item.available 
              : actionToRedo.payload.availability;
            
            return {
              ...item,
              available: newAvailability,
              updatedAt: new Date(),
            };
          }));
        }
        break;
      case 'BATCH_OPERATION':
        // For batch operations, re-execute each operation in order
        if (actionToRedo.payload.operations) {
          actionToRedo.payload.operations.forEach((operation: any) => {
            // Re-execute the operation based on its type
            switch (operation.type) {
              case 'price-update':
                // Re-apply price updates
                break;
              case 'category-change':
                // Re-apply category changes
                break;
              case 'availability-toggle':
                // Re-apply availability changes
                break;
              case 'delete':
                setItems(prev => prev.filter(item => !operation.itemIds.includes(item.id)));
                break;
            }
          });
        }
        break;
    }

    setUndoStack(prev => [...prev, actionToRedo]);
    setRedoStack(prev => prev.slice(0, -1));
  }, [redoStack]);

  // Computed values
  const filteredItems = React.useMemo(() => {
    let filtered = items;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Sort items
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'popularity':
          comparison = (a.popularity || 0) - (b.popularity || 0);
          break;
        case 'created':
          comparison = (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [items, searchQuery, selectedCategory, sortBy, sortDirection]);

  const refreshItems = useCallback(async () => {
    await loadMenuItems();
  }, []);

  const getItemsByCategory = useCallback((category: string) => {
    return items.filter(item => item.category === category);
  }, [items]);

  const getTotalItems = useCallback(() => items.length, [items]);
  const getAvailableItems = useCallback(() => items.filter(item => item.available).length, [items]);

  // Ingredient-based utility functions
  const getIngredientBasedItems = useCallback(() => {
    return items.filter(item => item.ingredientBased && item.ingredients);
  }, [items]);

  const getItemsByAllergen = useCallback((allergen: string) => {
    return items.filter(item => item.allergens?.includes(allergen));
  }, [items]);

  const getItemsBySpiceLevel = useCallback((minLevel: number, maxLevel?: number) => {
    return items.filter(item => {
      if (item.spiceLevel === undefined) return false;
      if (maxLevel !== undefined) {
        return item.spiceLevel >= minLevel && item.spiceLevel <= maxLevel;
      }
      return item.spiceLevel >= minLevel;
    });
  }, [items]);

  const getItemsWithIngredient = useCallback((ingredientId: string) => {
    return items.filter(item => 
      item.ingredients?.some(ingredient => ingredient.ingredientId === ingredientId)
    );
  }, [items]);

  const calculateIngredientUsage = useCallback(() => {
    const usage: Record<string, { count: number; totalQuantity: number }> = {};
    
    items.forEach(item => {
      if (item.ingredients) {
        item.ingredients.forEach(ingredient => {
          if (!usage[ingredient.ingredientId]) {
            usage[ingredient.ingredientId] = { count: 0, totalQuantity: 0 };
          }
          usage[ingredient.ingredientId].count += 1;
          usage[ingredient.ingredientId].totalQuantity += ingredient.quantity;
        });
      }
    });
    
    return usage;
  }, [items]);

  const value: MenuContextType = {
    // Data
    items,
    loading,
    error,
    
    // CRUD operations
    addItem,
    updateItem,
    deleteItem,
    duplicateItem,
    
    // Bulk operations
    updateMultipleItems,
    deleteMultipleItems,
    
    // Advanced bulk operations
    bulkPriceUpdate,
    bulkCategoryChange,
    bulkAvailabilityToggle,
    bulkDescriptionUpdate,
    
    // Batch operations
    executeBatchOperation,
    
    // Export/Import
    exportItems,
    importItems,
    
    // UI state
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedItems,
    setSelectedItems,
    isMultiSelectMode,
    setIsMultiSelectMode,
    
    // Filtering and sorting
    filteredItems,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    
    // Undo/Redo
    undoStack,
    redoStack,
    undo,
    redo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    
    // Utilities
    refreshItems,
    toggleItemAvailability,
    getItemsByCategory,
    getTotalItems,
    getAvailableItems,
    
    // Ingredient-based utilities
    getIngredientBasedItems,
    getItemsByAllergen,
    getItemsBySpiceLevel,
    getItemsWithIngredient,
    calculateIngredientUsage
  };

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};

export default MenuProvider;