/**
 * User Preferences Service
 *
 * Manages user preferences for dashboard settings, appearance, notifications, and integrations.
 * Stores preferences in Supabase user_preferences table.
 */
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
/**
 * Get user preferences by shop domain and operator email
 */
export async function getUserPreferences(shopDomain, operatorEmail) {
    try {
        const { data, error } = await supabase
            .from("user_preferences")
            .select("*")
            .eq("shop_domain", shopDomain)
            .eq("operator_email", operatorEmail)
            .single();
        if (error && error.code !== "PGRST116") {
            console.error("Error fetching user preferences:", error);
            return null;
        }
        return data;
    }
    catch (error) {
        console.error("Error fetching user preferences:", error);
        return null;
    }
}
/**
 * Create or update user preferences
 */
export async function saveUserPreferences(shopDomain, operatorEmail, preferences) {
    try {
        // Check if preferences exist
        const existing = await getUserPreferences(shopDomain, operatorEmail);
        if (existing) {
            // Update existing preferences
            const { error } = await supabase
                .from("user_preferences")
                .update({
                ...preferences,
                updated_at: new Date().toISOString(),
            })
                .eq("shop_domain", shopDomain)
                .eq("operator_email", operatorEmail);
            if (error) {
                console.error("Error updating user preferences:", error);
                return { success: false, error: error.message };
            }
        }
        else {
            // Create new preferences
            const { error } = await supabase
                .from("user_preferences")
                .insert({
                shop_domain: shopDomain,
                operator_email: operatorEmail,
                visible_tiles: preferences.visible_tiles || [],
                theme: preferences.theme || "auto",
                default_view: preferences.default_view || "grid",
                auto_refresh: preferences.auto_refresh ?? true,
                refresh_interval: preferences.refresh_interval || 60,
                desktop_notifications: preferences.desktop_notifications ?? true,
                notification_sound: preferences.notification_sound ?? true,
                toast_notifications: preferences.toast_notifications ?? true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });
            if (error) {
                console.error("Error creating user preferences:", error);
                return { success: false, error: error.message };
            }
        }
        return { success: true };
    }
    catch (error) {
        console.error("Error saving user preferences:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}
/**
 * Get default preferences
 */
export function getDefaultPreferences() {
    return {
        shop_domain: "",
        operator_email: "",
        visible_tiles: [
            "ops-metrics",
            "sales-pulse",
            "fulfillment",
            "inventory",
            "cx-escalations",
            "seo-content",
            "idea-pool",
            "approvals-queue",
            "ceo-agent",
            "unread-messages",
            "social-performance",
            "seo-impact",
            "ads-roas",
            "growth-metrics",
            "growth-engine-analytics",
        ],
        theme: "auto",
        default_view: "grid",
        auto_refresh: true,
        refresh_interval: 60,
        desktop_notifications: true,
        notification_sound: true,
        toast_notifications: true,
    };
}
/**
 * Validate preferences data
 */
export function validatePreferences(preferences) {
    const errors = [];
    if (preferences.theme && !["light", "dark", "auto"].includes(preferences.theme)) {
        errors.push("Theme must be 'light', 'dark', or 'auto'");
    }
    if (preferences.default_view && !["grid", "list"].includes(preferences.default_view)) {
        errors.push("Default view must be 'grid' or 'list'");
    }
    if (preferences.refresh_interval && (preferences.refresh_interval < 10 || preferences.refresh_interval > 3600)) {
        errors.push("Refresh interval must be between 10 and 3600 seconds");
    }
    if (preferences.visible_tiles && !Array.isArray(preferences.visible_tiles)) {
        errors.push("Visible tiles must be an array");
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
/**
 * Merge preferences with defaults
 */
export function mergeWithDefaults(preferences) {
    const defaults = getDefaultPreferences();
    return {
        ...defaults,
        ...preferences,
        visible_tiles: preferences.visible_tiles || defaults.visible_tiles,
    };
}
//# sourceMappingURL=userPreferences.js.map