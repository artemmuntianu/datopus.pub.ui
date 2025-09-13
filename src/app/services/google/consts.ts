// NOTE:
// These constants represent the current Google Analytics limits for a single request.
// - GA_MAX_DIMENSIONS and GA_MAX_METRICS define the maximum allowed dimensions and metrics per request.
// - GA_MIN_DATE and GA_MAX_DATE define the valid date range for queries.
// 
// If a reliable and convenient method to dynamically retrieve these limits from the API becomes available, 
// refactor this code to eliminate hardcoded values and ensure maintainability.

export const GA_MAX_DIMENSIONS = 9;
export const GA_MAX_METRICS = 10;

export const GA_MIN_DATE = new Date('2015-08-14');
export const GA_MAX_DATE = new Date('2999-12-31');