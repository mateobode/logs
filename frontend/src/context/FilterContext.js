import React, { createContext, useState, useContext } from 'react';

// Create the context
const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  /**
   * Get default date range (last 7 days)
   */
  const getDefaultDates = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  // Initialize state with empty values
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    severity: '',
    source: ''
  });

  // Track validation errors
  const [errors, setErrors] = useState({});

  /**
   * Validate filters based on backend requirements
   * @param {string} name - Field name
   * @param {any} value - Field value
   * @param {object} allFilters - All current filters
   * @returns {boolean} - True if validation passed
   */
  const validateFilters = (name, value, allFilters) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'startDate':
        if (allFilters.endDate && value && new Date(value) > new Date(allFilters.endDate)) {
          newErrors.startDate = 'Start date cannot be later than end date';
        } else {
          delete newErrors.startDate;
          // Also clear endDate error if it was related to date range
          if (newErrors.endDate === 'End date cannot be earlier than start date') {
            delete newErrors.endDate;
          }
        }
        break;

      case 'endDate':
        if (allFilters.startDate && value && new Date(value) < new Date(allFilters.startDate)) {
          newErrors.endDate = 'End date cannot be earlier than start date';
        } else {
          delete newErrors.endDate;
          // Also clear startDate error if it was related to date range
          if (newErrors.startDate === 'Start date cannot be later than end date') {
            delete newErrors.startDate;
          }
        }
        break;

      case 'severity':
        if (value && !/^[A-Z]+$/.test(value)) {
          newErrors.severity = 'Severity must be uppercase';
        } else {
          delete newErrors.severity;
        }
        break;

      case 'source':
        if (value && !/^[a-z]+$/.test(value)) {
          newErrors.source = 'Source must be lowercase';
        } else {
          delete newErrors.source;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Update a specific filter
   * @param {string} name - Filter name
   * @param {any} value - Filter value
   */
  const updateFilter = (name, value) => {
    // Apply transformations based on backend requirements
    let transformedValue = value;

    if (name === 'severity' && value) {
      transformedValue = value.toUpperCase();
    } else if (name === 'source' && value) {
      transformedValue = value.toLowerCase();
    }

    const updatedFilters = {
      ...filters,
      [name]: transformedValue
    };

    // Validate the updated value
    validateFilters(name, transformedValue, updatedFilters);

    // Update filters regardless of validation (we'll handle errors in UI)
    setFilters(updatedFilters);
  };

  /**
   * Reset all filters to empty values
   */
  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      severity: '',
      source: ''
    });
    setErrors({});
  };

  /**
   * Generate query params object from filters
   * @returns {object} - Object with query parameters
   */
  const getQueryParams = () => {
    const params = {};

    if (filters.startDate) params.start_date = filters.startDate;
    if (filters.endDate) params.end_date = filters.endDate;
    if (filters.severity) params.severity = filters.severity;
    if (filters.source) params.source = filters.source;

    return params;
  };

  // Context value
  const contextValue = {
    filters,
    errors,
    updateFilter,
    resetFilters,
    getQueryParams,
    validateFilters
  };

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
};

/**
 * Custom hook to use the filter context
 * @returns {object} - Filter context
 */
export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

export default FilterContext;