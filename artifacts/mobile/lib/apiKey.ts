import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "openrouter_api_key";

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
