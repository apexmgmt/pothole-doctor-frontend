import React, { useMemo } from "react";

const CustomTable = () => {
  // Memoized filtered and sorted data
  const processedData = useMemo(() => {
    // Apply search filter
    let searchFilteredData = data;
    if (searchTerm && onSearch) {
      searchFilteredData = onSearch(data, searchTerm);
    } else if (searchTerm) {
      searchFilteredData = data.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (sortConfig.column && onSort) {
      return onSort(
        searchFilteredData,
        sortConfig.column,
        sortConfig.direction
      );
    } else if (sortConfig.column) {
      return [...searchFilteredData].sort((a, b) => {
        const aVal = a[sortConfig.column];
        const bVal = b[sortConfig.column];

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return searchFilteredData;
  }, [data, searchTerm, sortConfig, onSearch, onSort]);

  return <div>CustomTable</div>;
};

export default CustomTable;
