/**
 * Mock Mode Utilities
 *
 * Provides utilities for running the application in mock/dev mode
 * without real external service calls.
 */
export const isMockMode = () => {
    return process.env.NODE_ENV === 'development' || process.env.MOCK_MODE === 'true';
};
export const isProductionMode = () => {
    return process.env.NODE_ENV === 'production' && process.env.MOCK_MODE !== 'true';
};
export const getMockData = (mockData, realDataFn) => {
    if (isMockMode()) {
        return Promise.resolve(mockData);
    }
    return realDataFn();
};
//# sourceMappingURL=mock-mode.js.map