import browser from "webextension-polyfill";

import {
  DEFAULT_SETTINGS,
  type Settings,
} from "../types/settings";

const SETTINGS_STORAGE_KEY = "codevault.settings";

/**
 * Handles persistence of CodeSyncVault settings.
 */
export class SettingsStorage {
  /**
   * Loads settings from browser storage.
   * Returns default settings if none are stored.
   */
  static async load(): Promise<Settings> {
    const result = await browser.storage.local.get(SETTINGS_STORAGE_KEY);

    return (result[SETTINGS_STORAGE_KEY] as Settings | undefined) ?? DEFAULT_SETTINGS;
  }

  /**
   * Saves settings to browser storage.
   */
  static async save(settings: Settings): Promise<void> {
    await browser.storage.local.set({
      [SETTINGS_STORAGE_KEY]: settings,
    });
  }

  /**
   * Removes all saved settings.
   */
  static async reset(): Promise<void> {
    await browser.storage.local.remove(SETTINGS_STORAGE_KEY);
  }
}