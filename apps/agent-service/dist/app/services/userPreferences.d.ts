/**
 * User Preferences Service
 *
 * Manages user preferences for dashboard settings, appearance, notifications, and integrations.
 * Stores preferences in Supabase user_preferences table.
 */
export interface UserPreferences {
    id?: string;
    shop_domain: string;
    operator_email: string;
    visible_tiles: string[];
    theme: "light" | "dark" | "auto";
    default_view: "grid" | "list";
    auto_refresh: boolean;
    refresh_interval: number;
    desktop_notifications: boolean;
    notification_sound: boolean;
    toast_notifications: boolean;
    created_at?: string;
    updated_at?: string;
}
export interface PreferencesUpdate {
    visible_tiles?: string[];
    theme?: "light" | "dark" | "auto";
    default_view?: "grid" | "list";
    auto_refresh?: boolean;
    refresh_interval?: number;
    desktop_notifications?: boolean;
    notification_sound?: boolean;
    toast_notifications?: boolean;
}
/**
 * Get user preferences by shop domain and operator email
 */
export declare function getUserPreferences(shopDomain: string, operatorEmail: string): Promise<UserPreferences | null>;
/**
 * Create or update user preferences
 */
export declare function saveUserPreferences(shopDomain: string, operatorEmail: string, preferences: PreferencesUpdate): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Get default preferences
 */
export declare function getDefaultPreferences(): UserPreferences;
/**
 * Validate preferences data
 */
export declare function validatePreferences(preferences: Partial<UserPreferences>): {
    valid: boolean;
    errors: string[];
};
/**
 * Merge preferences with defaults
 */
export declare function mergeWithDefaults(preferences: Partial<UserPreferences>): UserPreferences;
//# sourceMappingURL=userPreferences.d.ts.map