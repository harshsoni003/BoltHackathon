// Screenshot service for generating website preview screenshots
// Uses Microlink as primary and Thum.io as fallback

export interface ScreenshotConfig {
    width?: number;
    height?: number;
    fullPage?: boolean;
    type?: 'png' | 'jpeg';
}

// Microlink API configuration
const MICROLINK_BASE = 'https://api.microlink.io';

// Thum.io fallback configuration  
const THUMIO_BASE = 'https://image.thum.io/get';

/**
 * Generate a Microlink screenshot URL for the given website
 * This is the primary screenshot service - high quality, fast
 * Free tier: 50 requests/day
 */
export const getMicrolinkScreenshotUrl = (
    url: string,
    config: ScreenshotConfig = {}
): string => {
    const {
        width = 1280,
        height = 800,
        fullPage = true,  // CHANGED: Full page by default for scrollable previews
        type = 'png'
    } = config;

    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;

    const params = new URLSearchParams({
        url: cleanUrl,
        screenshot: 'true',
        meta: 'false',
        embed: 'screenshot.url',
        'screenshot.width': width.toString(),
        'screenshot.height': height.toString(),
        'screenshot.fullPage': fullPage.toString(),
        'screenshot.type': type
    });

    return `${MICROLINK_BASE}?${params.toString()}`;
};

/**
 * Generate a Thum.io screenshot URL as fallback
 * This is the fallback service - unlimited but may have watermark
 */
export const getThumioScreenshotUrl = (
    url: string,
    config: ScreenshotConfig = {}
): string => {
    const { width = 1280, fullPage = true } = config;
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;

    // Thum.io uses /fullpage/ modifier for full page screenshots
    const fullPageModifier = fullPage ? '/noanimate/fullpage' : '/noanimate';
    return `${THUMIO_BASE}${fullPageModifier}/width/${width}/${cleanUrl}`;
};

/**
 * Get the primary screenshot URL (Microlink)
 */
export const getScreenshotUrl = (
    url: string,
    config?: ScreenshotConfig
): string => {
    return getMicrolinkScreenshotUrl(url, config);
};

/**
 * Get the fallback screenshot URL (Thum.io)
 */
export const getFallbackScreenshotUrl = (
    url: string,
    config?: ScreenshotConfig
): string => {
    return getThumioScreenshotUrl(url, config);
};

/**
 * Preload a screenshot image and return a promise
 * Useful for checking if the screenshot service is working
 */
export const preloadScreenshot = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject(new Error('Failed to load screenshot'));
        img.src = url;
    });
};

/**
 * Try to load screenshot with fallback
 * First tries Microlink, then falls back to Thum.io
 */
export const getScreenshotWithFallback = async (
    websiteUrl: string,
    config?: ScreenshotConfig
): Promise<{ url: string; source: 'microlink' | 'thumio' }> => {
    const microlinkUrl = getMicrolinkScreenshotUrl(websiteUrl, config);

    try {
        await preloadScreenshot(microlinkUrl);
        return { url: microlinkUrl, source: 'microlink' };
    } catch {
        // Microlink failed, try Thum.io
        const thumioUrl = getThumioScreenshotUrl(websiteUrl, config);

        try {
            await preloadScreenshot(thumioUrl);
            return { url: thumioUrl, source: 'thumio' };
        } catch {
            // Both failed, return Microlink URL anyway (might work on retry)
            return { url: microlinkUrl, source: 'microlink' };
        }
    }
};
