import "@testing-library/jest-dom";

// Set up environment variables for logger tests
// Must be set BEFORE logger module is imported by any test
process.env.SUPABASE_URL = "http://localhost:54321";
process.env.SUPABASE_SERVICE_KEY = "test-service-key-for-unit-tests";
