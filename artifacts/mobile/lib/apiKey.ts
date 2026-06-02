import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "openrouter_api_key";
const MODEL_KEY = "openrouter_model";
export const DEFAULT_MODEL = "moonshotai/kimi-k2";

export async function getModel(): Promise<string> {
  try {
    const m = await AsyncStorage.getItem(MODEL_KEY);
    return m ?? DEFAULT_MODEL;
  } catch {
    return DEFAULT_MODEL;
  }
}

export async function saveModel(model: string): Promise<void> {
  await AsyncStorage.setItem(MODEL_KEY, model.trim());
}

export async function clearModel(): Promise<void> {
  await AsyncStorage.removeItem(MODEL_KEY);
}

export async function getApiKey(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export async function saveApiKey(key: string): Promise<void> {
  await AsyncStorage.setItem(KEY, key.trim());
}

export async function clearApiKey(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
