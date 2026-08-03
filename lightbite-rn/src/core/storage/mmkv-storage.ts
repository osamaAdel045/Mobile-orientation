import * as SecureStore from 'expo-secure-store';

const PREFIX = 'lightbite_';

export const MMKVStorage = {
  async getString(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(PREFIX + key);
  },

  async setString(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(PREFIX + key, value);
  },

  async getBoolean(_key: string): Promise<boolean | null> {
    return null;
  },

  async setBoolean(_key: string, _value: boolean): Promise<void> {
    // Not used currently
  },

  async getNumber(_key: string): Promise<number | null> {
    return null;
  },

  async setNumber(_key: string, _value: number): Promise<void> {
    // Not used currently
  },

  async delete(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(PREFIX + key);
  },

  async clearAll(): Promise<void> {
    // SecureStore doesn't support listing keys, so we can't clear all
    // Individual keys are deleted as needed via delete()
  },
};
