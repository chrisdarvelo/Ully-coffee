import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from '../types';

const KEY_PREFIX = '@ully_recipes_';
const ART_STYLES = ['lam', 'rothko', 'picasso'] as const;

function recipeKey(uid: string): string {
  return `${KEY_PREFIX}${uid}`;
}

const STARTER_RECIPES: Recipe[] = [
  {
    id: 'starter_1',
    name: 'Blossoms',
    method: 'Pour Over',
    description: 'Light floral notes with a citrus finish. 15g coffee, 250ml water, 93°C.',
    artSeed: 1001,
    artStyle: 'lam',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'starter_2',
    name: 'Aroma',
    method: 'French Press',
    description: 'Rich and full-bodied with chocolate undertones. 30g coarse grind, 500ml, 4 min steep.',
    artSeed: 2002,
    artStyle: 'rothko',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'starter_3',
    name: 'Funky Way',
    method: 'AeroPress',
    description: 'Experimental inverted method. 17g fine grind, 200ml at 85°C, 1:30 steep.',
    artSeed: 3003,
    artStyle: 'picasso',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'starter_4',
    name: 'E27',
    method: 'Espresso',
    description: 'Classic double shot. 18g in, 36g out, 25-30 seconds, 93.5°C.',
    artSeed: 4004,
    artStyle: 'lam',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function getRecipes(uid: string): Promise<Recipe[]> {
  try {
    const json = await AsyncStorage.getItem(recipeKey(uid));
    if (json) {
      return JSON.parse(json) as Recipe[];
    }
    // First load: seed starter recipes
    await AsyncStorage.setItem(recipeKey(uid), JSON.stringify(STARTER_RECIPES));
    return STARTER_RECIPES;
  } catch {
    return [];
  }
}

export async function saveRecipe(uid: string, recipe: Partial<Recipe> & { id?: string }): Promise<Recipe[]> {
  const recipes = await getRecipes(uid);
  const index = recipes.findIndex((r) => r.id === recipe.id);
  const now = new Date().toISOString();
  if (index >= 0) {
    recipes[index] = { ...recipes[index], ...recipe, updatedAt: now };
  } else {
    recipes.push({
      id: recipe.id || `recipe_${Date.now()}`,
      name: recipe.name || 'New Recipe',
      method: recipe.method || 'Unknown',
      description: recipe.description || '',
      artSeed: recipe.artSeed || Math.floor(Math.random() * 10000),
      artStyle: recipe.artStyle || ART_STYLES[Math.floor(Math.random() * ART_STYLES.length)],
      createdAt: now,
      updatedAt: now,
    } as Recipe);
  }
  await AsyncStorage.setItem(recipeKey(uid), JSON.stringify(recipes));
  return recipes;
}

export async function deleteRecipe(uid: string, recipeId: string): Promise<Recipe[]> {
  const recipes = await getRecipes(uid);
  const filtered = recipes.filter((r) => r.id !== recipeId);
  await AsyncStorage.setItem(recipeKey(uid), JSON.stringify(filtered));
  return filtered;
}
