export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  baseCost: number; // Cost per unit
  unit: string; // 'oz', 'piece', 'cup', 'tbsp', etc.
  defaultQuantity: number;
  minQuantity: number;
  maxQuantity: number;
  increment: number;
  allergens: string[];
  dietary: DietaryInfo;
  description?: string;
  imageUrl?: string;
  availability: boolean;
  popular: boolean;
  spiceLevel?: number; // 0-5 scale
}

export enum IngredientCategory {
  PROTEINS = 'proteins',
  VEGETABLES = 'vegetables', 
  SAUCES = 'sauces',
  CHEESES = 'cheeses',
  CARBS = 'carbs',
  SEASONINGS = 'seasonings',
  BREAKFAST = 'breakfast',
  EXTRAS = 'extras'
}

export interface DietaryInfo {
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  dairyFree: boolean;
  keto: boolean;
  lowCarb: boolean;
}

export interface PresetCombination {
  id: string;
  name: string;
  description: string;
  category: string;
  ingredients: Array<{
    ingredientId: string;
    quantity: number;
  }>;
  basePrice: number;
  popular: boolean;
  imageUrl?: string;
}

// Comprehensive ingredient database for tacos and breakfast items
export const INGREDIENTS: Ingredient[] = [
  // PROTEINS
  {
    id: 'bacon',
    name: 'Bacon',
    category: IngredientCategory.PROTEINS,
    baseCost: 0.75,
    unit: 'strip',
    defaultQuantity: 2,
    minQuantity: 1,
    maxQuantity: 6,
    increment: 1,
    allergens: [],
    dietary: {
      vegetarian: false,
      vegan: false,
      glutenFree: true,
      dairyFree: true,
      keto: true,
      lowCarb: true
    },
    description: 'Crispy smoked bacon strips',
    availability: true,
    popular: true
  },
  {
    id: 'chorizo',
    name: 'Chorizo',
    category: IngredientCategory.PROTEINS,
    baseCost: 0.85,
    unit: 'oz',
    defaultQuantity: 2,
    minQuantity: 1,
    maxQuantity: 4,
    increment: 0.5,
    allergens: [],
    dietary: {
      vegetarian: false,
      vegan: false,
      glutenFree: true,
      dairyFree: true,
      keto: true,
      lowCarb: true
    },
    description: 'Spicy Mexican sausage',
    availability: true,
    popular: true,
    spiceLevel: 3
  },
  {
    id: 'carnitas',
    name: 'Carnitas',
    category: IngredientCategory.PROTEINS,
    baseCost: 1.25,
    unit: 'oz',
    defaultQuantity: 3,
    minQuantity: 1,
    maxQuantity: 6,
    increment: 0.5,
    allergens: [],
    dietary: {
      vegetarian: false,
      vegan: false,
      glutenFree: true,
      dairyFree: true,
      keto: true,
      lowCarb: true
    },
    description: 'Slow-cooked pulled pork',
    availability: true,
    popular: true
  },
  {
    id: 'carne-asada',
    name: 'Carne Asada',
    category: IngredientCategory.PROTEINS,
    baseCost: 1.50,
    unit: 'oz',
    defaultQuantity: 3,
    minQuantity: 1,
    maxQuantity: 6,
    increment: 0.5,
    allergens: [],
    dietary: {
      vegetarian: false,
      vegan: false,
      glutenFree: true,
      dairyFree: true,
      keto: true,
      lowCarb: true
    },
    description: 'Grilled marinated steak',
    availability: true,
    popular: true
  },
  {
    id: 'al-pastor',
    name: 'Al Pastor',
    category: IngredientCategory.PROTEINS,
    baseCost: 1.35,
    unit: 'oz',
    defaultQuantity: 3,
    minQuantity: 1,
    maxQuantity: 6,
    increment: 0.5,
    allergens: [],
    dietary: {
      vegetarian: false,
      vegan: false,
      glutenFree: true,
      dairyFree: true,
      keto: true,
      lowCarb: true
    },
    description: 'Marinated pork with pineapple',
    availability: true,
    popular: true,
    spiceLevel: 2
  },
  {
    id: 'chicken',
    name: 'Grilled Chicken',
    category: IngredientCategory.PROTEINS,
    baseCost: 1.15,
    unit: 'oz',
    defaultQuantity: 3,
    minQuantity: 1,
    maxQuantity: 6,
    increment: 0.5,
    allergens: [],
    dietary: {
      vegetarian: false,
      vegan: false,
      glutenFree: true,
      dairyFree: true,
      keto: true,
      lowCarb: true
    },
    description: 'Seasoned grilled chicken breast',
    availability: true,
    popular: true
  },
  {
    id: 'fish',
    name: 'Fish (Mahi)',
    category: IngredientCategory.PROTEINS,
    baseCost: 1.75,
    unit: 'oz',
    defaultQuantity: 3,
    minQuantity: 1,
    maxQuantity: 5,
    increment: 0.5,
    allergens: ['fish'],
    dietary: {
      vegetarian: false,
      vegan: false,
      glutenFree: true,
      dairyFree: true,
      keto: true,
      lowCarb: true
    },
    description: 'Grilled or fried mahi mahi',
    availability: true,
    popular: false
  },
  {
    id: 'shrimp',
    name: 'Shrimp',
    category: IngredientCategory.PROTEINS,
    baseCost: 2.25,
    unit: 'piece',
    defaultQuantity: 4,
    minQuantity: 2,
    maxQuantity: 8,
    increment: 1,
    allergens: ['shellfish'],
    dietary: {
      vegetarian: false,
      vegan: false,
      glutenFree: true,
      dairyFree: true,
      keto: true,
      lowCarb: true
    },
    description: 'Grilled or sautéed shrimp',
    availability: true,
    popular: false
  },
  {
    id: 'beans-black',
    name: 'Black Beans',
    category: IngredientCategory.PROTEINS,
    baseCost: 0.35,
    unit: 'oz',
    defaultQuantity: 2,
    minQuantity: 1,
    maxQuantity: 4,
    increment: 0.5,
    allergens: [],
    dietary: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      dairyFree: true,
      keto: false,
      lowCarb: false
    },
    description: 'Seasoned black beans',
    availability: true,
    popular: true
  },
  {
    id: 'beans-refried',
    name: 'Refried Beans',
    category: IngredientCategory.PROTEINS,
    baseCost: 0.40,
    unit: 'oz',
    defaultQuantity: 2,
    minQuantity: 1,
    maxQuantity: 4,
    increment: 0.5,
    allergens: [],
    dietary: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      dairyFree: true,
      keto: false,
      lowCarb: false
    },
    description: 'Creamy refried beans',
    availability: true,
    popular: true
  },

  // BREAKFAST ITEMS
  {
    id: 'eggs-scrambled',
    name: 'Scrambled Eggs',
    category: IngredientCategory.BREAKFAST,
    baseCost: 0.65,
    unit: 'egg',
    defaultQuantity: 2,
    minQuantity: 1,
    maxQuantity: 4,
    increment: 1,
    allergens: ['eggs'],
    dietary: {
      vegetarian: true,
      vegan: false,
      glutenFree: true,
      dairyFree: true,
      keto: true,
      lowCarb: true
    },
    description: 'Fresh scrambled eggs',
    availability: true,
    popular: true
  },
  {
    id: 'sausage',
    name: 'Breakfast Sausage',
    category: IngredientCategory.BREAKFAST,
    baseCost: 0.95,
    unit: 'patty',
    defaultQuantity: 1,
    minQuantity: 1,
    maxQuantity: 3,
    increment: 1,
    allergens: [],
    dietary: {
      vegetarian: false,
      vegan: false,
      glutenFree: true,
      dairyFree: true,
      keto: true,
      lowCarb: true
    },
    description: 'Seasoned breakfast sausage patty',
    availability: true,
    popular: true
  },
  {
    id: 'hash-browns',
    name: 'Hash Browns',
    category: IngredientCategory.BREAKFAST,
    baseCost: 0.45,
    unit: 'oz',
    defaultQuantity: 2,
    minQuantity: 1,
    maxQuantity: 4,
    increment: 0.5,
    allergens: [],
    dietary: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      dairyFree: true,
      keto: false,
      lowCarb: false
    },
    description: 'Crispy shredded potato hash browns',
    availability: true,
    popular: true
  },

  // VEGETABLES
  {
    id: 'onions-white',
    name: 'White Onions',
    category: IngredientCategory.VEGETABLES,
    baseCost: 0.15,
    unit: 'oz',
    defaultQuantity: 1,
    minQuantity: 0.5,
    maxQuantity: 3,
    increment: 0.25,
    allergens: [],
    dietary: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      dairyFree: true,
      keto: true,
      lowCarb: true
    },
    description: 'Diced white onions',
    availability: true,
    popular: true
  },
  {
    id: 'onions-red',
    name: 'Red Onions',
    category: IngredientCategory.VEGETABLES,
    baseCost: 0.20,
    unit: 'oz',
    defaultQuantity: 0.75,
    minQuantity: 0.25,
    maxQuantity: 2,
    increment: 0.25,
    allergens: [],
    dietary: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      dairyFree: true,
      keto: true,
      lowCarb: true
    },
    description: 'Diced red onions',
    availability: true,
    popular: true
  },
  {
    id: 'peppers-bell',
    name: 'Bell Peppers',
    category: IngredientCategory.VEGETABLES,
    baseCost: 0.25,
    unit: 'oz',
    defaultQuantity: 1,
    minQuantity: 0.5,
    maxQuantity: 3,
    increment: 0.25,
    allergens: [],
    dietary: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      dairyFree: true,
      keto: true,
      lowCarb: true
    },
    description: 'Fresh bell pepper strips',
    availability: true,
    popular: true
  },
  {
    id: 'peppers-jalapeno',
    name: 'Jalapeños',
    category: IngredientCategory.VEGETABLES,
    baseCost: 0.30,
    unit: 'oz',
    defaultQuantity: 0.5,
    minQuantity: 0.25,
    maxQuantity: 2,
    increment: 0.25,
    allergens: [],
    dietary: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      dairyFree: true,
      keto: true,
      lowCarb: true
    },
    description: 'Fresh sliced jalapeños',
    availability: true,
    popular: true,
    spiceLevel: 3
  },
  {
    id: 'peppers-serrano',
    name: 'Serrano Peppers',
    category: IngredientCategory.VEGETABLES,
    baseCost: 0.40,
    unit: 'oz',
    defaultQuantity: 0.25,
    minQuantity: 0.125,
    maxQuantity: 1,
    increment: 0.125,
    allergens: [],
    dietary: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      dairyFree: true,
      keto: true,
      lowCarb: true
    },
    description: 'Fresh diced serrano peppers',
    availability: true,
    popular: false,
    spiceLevel: 4
  },
  {
    id: 'tomatoes',
    name: 'Tomatoes',
    category: IngredientCategory.VEGETABLES,
    baseCost: 0.35,
    unit: 'oz',
    defaultQuantity: 1,
    minQuantity: 0.5,
    maxQuantity: 3,
    increment: 0.25,
    allergens: [],
    dietary: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      dairyFree: true,
      keto: true,
      lowCarb: true
    },
    description: 'Fresh diced tomatoes',
    availability: true,
    popular: true
  },
  {
    id: 'lettuce',
    name: 'Lettuce',
    category: IngredientCategory.VEGETABLES,
    baseCost: 0.20,
    unit: 'oz',
    defaultQuantity: 0.5,
    minQuantity: 0.25,
    maxQuantity: 2,
    increment: 0.25,
    allergens: [],
    dietary: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      dairyFree: true,
      keto: true,
      lowCarb: true
    },
    description: 'Fresh shredded lettuce',
    availability: true,
    popular: true
  },
  {
    id: 'cilantro',
    name: 'Cilantro',
    category: IngredientCategory.VEGETABLES,
    baseCost: 0.25,
    unit: 'oz',
    defaultQuantity: 0.25,
    minQuantity: 0.125,
    maxQuantity: 1,
    increment: 0.125,
    allergens: [],
    dietary: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      dairyFree: true,
      keto: true,
      lowCarb: true
    },
    description: 'Fresh chopped cilantro',
    availability: true,
    popular: true
  },
  {
    id: 'avocado',
    name: 'Avocado',
    category: IngredientCategory.VEGETABLES,
    baseCost: 0.75,
    unit: 'oz',
    defaultQuantity: 1,
    minQuantity: 0.5,
    maxQuantity: 3,
    increment: 0.25,
    allergens: [],
    dietary: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      dairyFree: true,
      keto: true,
      lowCarb: true
    },
    description: 'Fresh sliced avocado',
    availability: true,
    popular: true
  },
  {
    id: 'pineapple',
    name: 'Pineapple',
    category: IngredientCategory.VEGETABLES,
    baseCost: 0.45,
    unit: 'oz',
    defaultQuantity: 0.75,
    minQuantity: 0.5,
    maxQuantity: 2,
    increment: 0.25,
    allergens: [],
    dietary: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      dairyFree: true,
      keto: false,
      lowCarb: false
    },
    description: 'Fresh diced pineapple',
    availability: true,
    popular: false
  },

  // CHEESES
  {
    id: 'cheese-cheddar',
    name: 'Cheddar Cheese',
    category: IngredientCategory.CHEESES,
    baseCost: 0.55,
    unit: 'oz',
    defaultQuantity: 1,
    minQuantity: 0.5,
    maxQuantity: 3,
    increment: 0.25,
    allergens: ['dairy'],
    dietary: {
      vegetarian: true,
      vegan: false,
      glutenFree: true,
      dairyFree: false,
      keto: true,
      lowCarb: true
    },
    description: 'Shredded sharp cheddar',
    availability: true,
    popular: true
  },
  {
    id: 'cheese-mexican',
    name: 'Mexican Cheese Blend',
    category: IngredientCategory.CHEESES,
    baseCost: 0.50,
    unit: 'oz',
    defaultQuantity: 1,
    minQuantity: 0.5,
    maxQuantity: 3,
    increment: 0.25,
    allergens: ['dairy'],
    dietary: {
      vegetarian: true,
      vegan: false,
      glutenFree: true,
      dairyFree: false,
      keto: true,
      lowCarb: true
    },
    description: 'Traditional Mexican cheese blend',
    availability: true,
    popular: true
  },
  {
    id: 'cheese-queso-fresco',
    name: 'Queso Fresco',
    category: IngredientCategory.CHEESES,
    baseCost: 0.65,
    unit: 'oz',
    defaultQuantity: 0.75,
    minQuantity: 0.5,
    maxQuantity: 2,
    increment: 0.25,
    allergens: ['dairy'],
    dietary: {
      vegetarian: true,
      vegan: false,
      glutenFree: true,
      dairyFree: false,
      keto: true,
      lowCarb: true
    },
    description: 'Fresh Mexican cheese',
    availability: true,
    popular: false
  },
  {
    id: 'cheese-pepper-jack',
    name: 'Pepper Jack',
    category: IngredientCategory.CHEESES,
    baseCost: 0.60,
    unit: 'oz',
    defaultQuantity: 1,
    minQuantity: 0.5,
    maxQuantity: 2.5,
    increment: 0.25,
    allergens: ['dairy'],
    dietary: {
      vegetarian: true,
      vegan: false,
      glutenFree: true,
      dairyFree: false,
      keto: true,
      lowCarb: true
    },
    description: 'Spicy pepper jack cheese',
    availability: true,
    popular: true,
    spiceLevel: 2
  },

  // CARBS
  {
    id: 'tortilla-flour-small',
    name: 'Small Flour Tortilla',
    category: IngredientCategory.CARBS,
    baseCost: 0.25,
    unit: 'piece',
    defaultQuantity: 1,
    minQuantity: 1,
    maxQuantity: 3,
    increment: 1,
    allergens: ['gluten'],
    dietary: {
      vegetarian: true,
      vegan: true,
      glutenFree: false,
      dairyFree: true,
      keto: false,
      lowCarb: false
    },
    description: '6" soft flour tortilla',
    availability: true,
    popular: true
  },
  {
    id: 'tortilla-flour-large',
    name: 'Large Flour Tortilla',
    category: IngredientCategory.CARBS,
    baseCost: 0.45,
    unit: 'piece',
    defaultQuantity: 1,
    minQuantity: 1,
    maxQuantity: 2,
    increment: 1,
    allergens: ['gluten'],
    dietary: {
      vegetarian: true,
      vegan: true,
      glutenFree: false,
      dairyFree: true,
      keto: false,
      lowCarb: false
    },
    description: '10" soft flour tortilla',
    availability: true,
    popular: true
  },
  {
    id: 'tortilla-corn',
    name: 'Corn Tortilla',
    category: IngredientCategory.CARBS,
    baseCost: 0.20,
    unit: 'piece',
    defaultQuantity: 2,
    minQuantity: 1,
    maxQuantity: 4,
    increment: 1,
    allergens: [],
    dietary: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      dairyFree: true,
      keto: false,
      lowCarb: false
    },
    description: 'Traditional corn tortilla',
    availability: true,
    popular: true
  },
  {
    id: 'tostada-shell',
    name: 'Tostada Shell',
    category: IngredientCategory.CARBS,
    baseCost: 0.35,
    unit: 'piece',
    defaultQuantity: 1,
    minQuantity: 1,
    maxQuantity: 2,
    increment: 1,
    allergens: [],
    dietary: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      dairyFree: true,
      keto: false,
      lowCarb: false
    },
    description: 'Crispy corn tostada shell',
    availability: true,
    popular: false
  },
  {
    id: 'rice-spanish',
    name: 'Spanish Rice',
    category: IngredientCategory.CARBS,
    baseCost: 0.30,
    unit: 'oz',
    defaultQuantity: 2,
    minQuantity: 1,
    maxQuantity: 4,
    increment: 0.5,
    allergens: [],
    dietary: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      dairyFree: true,
      keto: false,
      lowCarb: false
    },
    description: 'Seasoned Spanish rice',
    availability: true,
    popular: true
  },

  // SAUCES
  {
    id: 'salsa-mild',
    name: 'Mild Salsa',
    category: IngredientCategory.SAUCES,
    baseCost: 0.25,
    unit: 'oz',
    defaultQuantity: 1,
    minQuantity: 0.5,
    maxQuantity: 3,
    increment: 0.25,
    allergens: [],
    dietary: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      dairyFree: true,
      keto: true,
      lowCarb: true
    },
    description: 'Fresh mild tomato salsa',
    availability: true,
    popular: true,
    spiceLevel: 1
  },
  {
    id: 'salsa-medium',
    name: 'Medium Salsa',
    category: IngredientCategory.SAUCES,
    baseCost: 0.25,
    unit: 'oz',
    defaultQuantity: 1,
    minQuantity: 0.5,
    maxQuantity: 3,
    increment: 0.25,
    allergens: [],
    dietary: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      dairyFree: true,
      keto: true,
      lowCarb: true
    },
    description: 'Fresh medium heat salsa',
    availability: true,
    popular: true,
    spiceLevel: 2
  },
  {
    id: 'salsa-hot',
    name: 'Hot Salsa',
    category: IngredientCategory.SAUCES,
    baseCost: 0.25,
    unit: 'oz',
    defaultQuantity: 0.75,
    minQuantity: 0.25,
    maxQuantity: 2,
    increment: 0.25,
    allergens: [],
    dietary: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      dairyFree: true,
      keto: true,
      lowCarb: true
    },
    description: 'Fresh hot salsa',
    availability: true,
    popular: true,
    spiceLevel: 4
  },
  {
    id: 'salsa-verde',
    name: 'Salsa Verde',
    category: IngredientCategory.SAUCES,
    baseCost: 0.30,
    unit: 'oz',
    defaultQuantity: 1,
    minQuantity: 0.5,
    maxQuantity: 2.5,
    increment: 0.25,
    allergens: [],
    dietary: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      dairyFree: true,
      keto: true,
      lowCarb: true
    },
    description: 'Green tomatillo salsa',
    availability: true,
    popular: true,
    spiceLevel: 3
  },
  {
    id: 'guacamole',
    name: 'Guacamole',
    category: IngredientCategory.SAUCES,
    baseCost: 0.85,
    unit: 'oz',
    defaultQuantity: 1,
    minQuantity: 0.5,
    maxQuantity: 3,
    increment: 0.25,
    allergens: [],
    dietary: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      dairyFree: true,
      keto: true,
      lowCarb: true
    },
    description: 'Fresh homemade guacamole',
    availability: true,
    popular: true
  },
  {
    id: 'sour-cream',
    name: 'Sour Cream',
    category: IngredientCategory.SAUCES,
    baseCost: 0.35,
    unit: 'oz',
    defaultQuantity: 1,
    minQuantity: 0.5,
    maxQuantity: 2.5,
    increment: 0.25,
    allergens: ['dairy'],
    dietary: {
      vegetarian: true,
      vegan: false,
      glutenFree: true,
      dairyFree: false,
      keto: true,
      lowCarb: true
    },
    description: 'Fresh sour cream',
    availability: true,
    popular: true
  },
  {
    id: 'hot-sauce',
    name: 'Hot Sauce',
    category: IngredientCategory.SAUCES,
    baseCost: 0.15,
    unit: 'dash',
    defaultQuantity: 3,
    minQuantity: 1,
    maxQuantity: 10,
    increment: 1,
    allergens: [],
    dietary: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      dairyFree: true,
      keto: true,
      lowCarb: true
    },
    description: 'Spicy hot sauce',
    availability: true,
    popular: true,
    spiceLevel: 4
  },
  {
    id: 'chipotle-sauce',
    name: 'Chipotle Sauce',
    category: IngredientCategory.SAUCES,
    baseCost: 0.40,
    unit: 'oz',
    defaultQuantity: 0.75,
    minQuantity: 0.25,
    maxQuantity: 2,
    increment: 0.25,
    allergens: [],
    dietary: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      dairyFree: true,
      keto: true,
      lowCarb: true
    },
    description: 'Smoky chipotle sauce',
    availability: true,
    popular: true,
    spiceLevel: 3
  },

  // SEASONINGS
  {
    id: 'salt',
    name: 'Salt',
    category: IngredientCategory.SEASONINGS,
    baseCost: 0.05,
    unit: 'pinch',
    defaultQuantity: 2,
    minQuantity: 1,
    maxQuantity: 5,
    increment: 1,
    allergens: [],
    dietary: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      dairyFree: true,
      keto: true,
      lowCarb: true
    },
    description: 'Sea salt',
    availability: true,
    popular: true
  },
  {
    id: 'pepper',
    name: 'Black Pepper',
    category: IngredientCategory.SEASONINGS,
    baseCost: 0.05,
    unit: 'pinch',
    defaultQuantity: 2,
    minQuantity: 1,
    maxQuantity: 5,
    increment: 1,
    allergens: [],
    dietary: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      dairyFree: true,
      keto: true,
      lowCarb: true
    },
    description: 'Fresh ground black pepper',
    availability: true,
    popular: true
  },
  {
    id: 'cumin',
    name: 'Cumin',
    category: IngredientCategory.SEASONINGS,
    baseCost: 0.10,
    unit: 'pinch',
    defaultQuantity: 1,
    minQuantity: 1,
    maxQuantity: 3,
    increment: 1,
    allergens: [],
    dietary: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      dairyFree: true,
      keto: true,
      lowCarb: true
    },
    description: 'Ground cumin',
    availability: true,
    popular: true
  },
  {
    id: 'paprika',
    name: 'Paprika',
    category: IngredientCategory.SEASONINGS,
    baseCost: 0.10,
    unit: 'pinch',
    defaultQuantity: 1,
    minQuantity: 1,
    maxQuantity: 3,
    increment: 1,
    allergens: [],
    dietary: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      dairyFree: true,
      keto: true,
      lowCarb: true
    },
    description: 'Smoked paprika',
    availability: true,
    popular: true
  },
  {
    id: 'lime',
    name: 'Lime Juice',
    category: IngredientCategory.SEASONINGS,
    baseCost: 0.20,
    unit: 'wedge',
    defaultQuantity: 1,
    minQuantity: 1,
    maxQuantity: 3,
    increment: 1,
    allergens: [],
    dietary: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      dairyFree: true,
      keto: true,
      lowCarb: true
    },
    description: 'Fresh lime wedge',
    availability: true,
    popular: true
  },

  // EXTRAS
  {
    id: 'pickles',
    name: 'Pickled Jalapeños',
    category: IngredientCategory.EXTRAS,
    baseCost: 0.25,
    unit: 'oz',
    defaultQuantity: 0.5,
    minQuantity: 0.25,
    maxQuantity: 1.5,
    increment: 0.25,
    allergens: [],
    dietary: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      dairyFree: true,
      keto: true,
      lowCarb: true
    },
    description: 'Pickled jalapeño slices',
    availability: true,
    popular: false,
    spiceLevel: 2
  },
  {
    id: 'radish',
    name: 'Pickled Radish',
    category: IngredientCategory.EXTRAS,
    baseCost: 0.30,
    unit: 'oz',
    defaultQuantity: 0.5,
    minQuantity: 0.25,
    maxQuantity: 1,
    increment: 0.25,
    allergens: [],
    dietary: {
      vegetarian: true,
      vegan: true,
      glutenFree: true,
      dairyFree: true,
      keto: true,
      lowCarb: true
    },
    description: 'Pickled radish slices',
    availability: true,
    popular: false
  }
];

// Pre-defined taco combinations for quick selection
export const PRESET_COMBINATIONS: PresetCombination[] = [
  {
    id: 'breakfast-classic',
    name: 'Classic Breakfast Taco',
    description: 'Scrambled eggs, bacon, cheese, and hash browns',
    category: 'Breakfast',
    ingredients: [
      { ingredientId: 'tortilla-flour-small', quantity: 1 },
      { ingredientId: 'eggs-scrambled', quantity: 2 },
      { ingredientId: 'bacon', quantity: 2 },
      { ingredientId: 'cheese-cheddar', quantity: 1 },
      { ingredientId: 'hash-browns', quantity: 1.5 },
      { ingredientId: 'salt', quantity: 1 },
      { ingredientId: 'pepper', quantity: 1 }
    ],
    basePrice: 4.25,
    popular: true
  },
  {
    id: 'breakfast-chorizo',
    name: 'Chorizo & Egg Taco',
    description: 'Spicy chorizo with scrambled eggs and cheese',
    category: 'Breakfast',
    ingredients: [
      { ingredientId: 'tortilla-flour-small', quantity: 1 },
      { ingredientId: 'chorizo', quantity: 2 },
      { ingredientId: 'eggs-scrambled', quantity: 2 },
      { ingredientId: 'cheese-mexican', quantity: 1 },
      { ingredientId: 'salsa-mild', quantity: 0.5 }
    ],
    basePrice: 3.95,
    popular: true
  },
  {
    id: 'al-pastor-classic',
    name: 'Al Pastor Taco',
    description: 'Traditional al pastor with pineapple and onions',
    category: 'Tacos',
    ingredients: [
      { ingredientId: 'tortilla-corn', quantity: 2 },
      { ingredientId: 'al-pastor', quantity: 3 },
      { ingredientId: 'pineapple', quantity: 0.75 },
      { ingredientId: 'onions-white', quantity: 0.5 },
      { ingredientId: 'cilantro', quantity: 0.25 },
      { ingredientId: 'lime', quantity: 1 }
    ],
    basePrice: 3.50,
    popular: true
  },
  {
    id: 'carnitas-supreme',
    name: 'Carnitas Supreme',
    description: 'Slow-cooked carnitas with all the fixings',
    category: 'Tacos',
    ingredients: [
      { ingredientId: 'tortilla-flour-small', quantity: 1 },
      { ingredientId: 'carnitas', quantity: 3 },
      { ingredientId: 'guacamole', quantity: 1 },
      { ingredientId: 'cheese-mexican', quantity: 1 },
      { ingredientId: 'lettuce', quantity: 0.5 },
      { ingredientId: 'tomatoes', quantity: 0.5 },
      { ingredientId: 'sour-cream', quantity: 0.75 },
      { ingredientId: 'salsa-medium', quantity: 0.75 }
    ],
    basePrice: 4.75,
    popular: true
  },
  {
    id: 'carne-asada-street',
    name: 'Carne Asada Street Style',
    description: 'Simple and authentic street-style carne asada',
    category: 'Tacos',
    ingredients: [
      { ingredientId: 'tortilla-corn', quantity: 2 },
      { ingredientId: 'carne-asada', quantity: 3 },
      { ingredientId: 'onions-white', quantity: 0.75 },
      { ingredientId: 'cilantro', quantity: 0.25 },
      { ingredientId: 'salsa-verde', quantity: 1 },
      { ingredientId: 'lime', quantity: 1 }
    ],
    basePrice: 4.00,
    popular: true
  },
  {
    id: 'veggie-deluxe',
    name: 'Veggie Deluxe',
    description: 'Fresh vegetables with beans and avocado',
    category: 'Vegetarian',
    ingredients: [
      { ingredientId: 'tortilla-flour-large', quantity: 1 },
      { ingredientId: 'beans-black', quantity: 2 },
      { ingredientId: 'avocado', quantity: 1.5 },
      { ingredientId: 'cheese-pepper-jack', quantity: 1 },
      { ingredientId: 'lettuce', quantity: 1 },
      { ingredientId: 'tomatoes', quantity: 1 },
      { ingredientId: 'peppers-bell', quantity: 1 },
      { ingredientId: 'onions-red', quantity: 0.5 },
      { ingredientId: 'salsa-medium', quantity: 1 }
    ],
    basePrice: 3.75,
    popular: false
  },
  {
    id: 'fish-baja',
    name: 'Baja Fish Taco',
    description: 'Grilled fish with citrus slaw and chipotle sauce',
    category: 'Seafood',
    ingredients: [
      { ingredientId: 'tortilla-corn', quantity: 2 },
      { ingredientId: 'fish', quantity: 3 },
      { ingredientId: 'lettuce', quantity: 0.75 },
      { ingredientId: 'tomatoes', quantity: 0.5 },
      { ingredientId: 'chipotle-sauce', quantity: 0.75 },
      { ingredientId: 'lime', quantity: 1 },
      { ingredientId: 'cilantro', quantity: 0.25 }
    ],
    basePrice: 4.50,
    popular: false
  },
  {
    id: 'migas-breakfast',
    name: 'Migas Breakfast Taco',
    description: 'Scrambled eggs with crispy tortilla strips',
    category: 'Breakfast',
    ingredients: [
      { ingredientId: 'tortilla-flour-small', quantity: 1 },
      { ingredientId: 'eggs-scrambled', quantity: 2 },
      { ingredientId: 'cheese-mexican', quantity: 1 },
      { ingredientId: 'peppers-jalapeno', quantity: 0.25 },
      { ingredientId: 'onions-white', quantity: 0.5 },
      { ingredientId: 'salsa-mild', quantity: 0.75 }
    ],
    basePrice: 3.25,
    popular: true
  }
];

// Helper function to get ingredient by ID
export const getIngredientById = (id: string): Ingredient | undefined => {
  return INGREDIENTS.find(ingredient => ingredient.id === id);
};

// Helper function to get ingredients by category
export const getIngredientsByCategory = (category: IngredientCategory): Ingredient[] => {
  return INGREDIENTS.filter(ingredient => ingredient.category === category);
};

// Helper function to calculate total cost of ingredients
export const calculateIngredientsCost = (ingredients: Array<{ ingredientId: string; quantity: number }>): number => {
  return ingredients.reduce((total, item) => {
    const ingredient = getIngredientById(item.ingredientId);
    if (ingredient) {
      return total + (ingredient.baseCost * item.quantity);
    }
    return total;
  }, 0);
};

// Helper function to get popular ingredients
export const getPopularIngredients = (): Ingredient[] => {
  return INGREDIENTS.filter(ingredient => ingredient.popular);
};

// Helper function to get ingredients by dietary restrictions
export const getIngredientsByDietary = (dietaryFilter: Partial<DietaryInfo>): Ingredient[] => {
  return INGREDIENTS.filter(ingredient => {
    return Object.entries(dietaryFilter).every(([key, value]) => {
      if (value === true) {
        return ingredient.dietary[key as keyof DietaryInfo] === true;
      }
      return true;
    });
  });
};

// Helper function to check for allergens in ingredients
export const checkAllergens = (ingredients: Array<{ ingredientId: string; quantity: number }>): string[] => {
  const allergens = new Set<string>();
  
  ingredients.forEach(item => {
    const ingredient = getIngredientById(item.ingredientId);
    if (ingredient) {
      ingredient.allergens.forEach(allergen => allergens.add(allergen));
    }
  });
  
  return Array.from(allergens);
};

// Helper function to get spice level of a combination
export const getSpiceLevel = (ingredients: Array<{ ingredientId: string; quantity: number }>): number => {
  let maxSpiceLevel = 0;
  
  ingredients.forEach(item => {
    const ingredient = getIngredientById(item.ingredientId);
    if (ingredient && ingredient.spiceLevel) {
      maxSpiceLevel = Math.max(maxSpiceLevel, ingredient.spiceLevel);
    }
  });
  
  return maxSpiceLevel;
};