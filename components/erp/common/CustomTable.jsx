"use client";

import React, { useState, useMemo } from "react";
// import Button from "@/components/common/CustomButton";
import {
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  PlusIcon,
  ChevronUpDownIcon,
} from "@heroicons/react/24/outline";
import CustomButton from "./CustomButton";

/**
 * Comprehensive, professional table component with full control over all functionality
 *
 * @example
 * // Basic usage
 * <CustomTable
 *   data={customers}
 *   columns={[
 *     { key: 'name', label: 'Name', sortable: true },
 *     { key: 'email', label: 'Email', sortable: true },
 *     { key: 'company', label: 'Company' }
 *   ]}
 *   actionButtons={[
 *     { label: 'Add Customer', action: 'add', variant: 'primary' }
 *   ]}
 *   onActionButtonClick={(action) => console.log(action)}
 * />
 *
 * @example
 * // Advanced usage with custom renderers
 * <CustomTable
 *   data={jobs}
 *   columns={[
 *     { key: 'wo', label: 'WO', sortable: true },
 *     { key: 'jobName', label: 'Job Name', sortable: true },
 *     { key: 'status', label: 'Status' }
 *   ]}
 *   renderCell={(row, column, value) => {
 *     if (column.key === 'status') {
 *       return <span className={`px-2 py-1 rounded text-xs ${value === 'Active' ? 'bg-green-500' : 'bg-gray-500'}`}>
 *         {value}
 *       </span>
 *     }
 *     return value
 *   }}
 *   renderActions={(row) => (
 *     <div className="flex gap-2">
 *       <button onClick={() => editRow(row)}>Edit</button>
 *       <button onClick={() => deleteRow(row)}>Delete</button>
 *     </div>
 *   )}
 *   onRowClick={(row) => console.log('Row clicked:', row)}
 *   showRowNumbers={true}
 *   stickyHeader={true}
 *   maxHeight={600}
 * />
 */

const CustomTable = ({
  // Data and columns
  data = [],
  columns = [],

  // Search and filtering
  showSearch = true,
  searchPlaceholder = "Search...",
  onSearch,

  // Export options
  showExport = true,
  exportOptions = ["Excel", "PDF"],
  onExport,

  // Action buttons
  actionButtons = [],
  onActionButtonClick,

  // Pagination
  showPagination = true,
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,

  // Row selection
  showRowSelection = true,
  onRowSelectionChange,
  selectedRows = [],

  // Sorting
  showSorting = true,
  onSort,
  defaultSort = { column: null, direction: "asc" },

  // Styling
  className = "",
  tableClassName = "",
  headerClassName = "",
  rowClassName = "",

  // Loading and empty states
  loading = false,
  emptyMessage = "No data available",

  // Custom renderers
  renderCell,
  renderActions,

  // Additional features
  showRowNumbers = false,
  stickyHeader = false,
  maxHeight,
  onRowClick,
  rowKey = "id",
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState(defaultSort);
  const [localSelectedRows, setLocalSelectedRows] = useState(selectedRows);

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

  // Pagination calculations
  const totalPages = Math.ceil(processedData.length / currentPageSize);
  const startIndex = (currentPage - 1) * currentPageSize;
  const endIndex = startIndex + currentPageSize;
  const paginatedData = processedData.slice(startIndex, endIndex);

  // Handlers
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleSort = (column) => {
    if (!showSorting) return;

    setSortConfig((prev) => ({
      column,
      direction:
        prev.column === column && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    onPageChange?.(page);
  };

  const handlePageSizeChange = (size) => {
    setCurrentPageSize(size);
    setCurrentPage(1); // Reset to first page
    onPageSizeChange?.(size);
  };

  const handleSelectAll = (checked) => {
    const newSelection = checked ? paginatedData.map((row) => row[rowKey]) : [];
    setLocalSelectedRows(newSelection);
    onRowSelectionChange?.(newSelection);
  };

  const handleSelectRow = (rowId, checked) => {
    const newSelection = checked
      ? [...localSelectedRows, rowId]
      : localSelectedRows.filter((id) => id !== rowId);

    setLocalSelectedRows(newSelection);
    onRowSelectionChange?.(newSelection);
  };

  const handleExport = (format) => {
    if (onExport) {
      onExport(format, processedData);
    } else {
      // Default export behavior
      console.log(`Exporting ${format} data:`, processedData);
    }
  };

  const handleActionButton = (action, row = null) => {
    if (onActionButtonClick) {
      onActionButtonClick(action, row);
    }
  };

  const handleRowClick = (row) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  // Render functions
  const renderSortIcon = (column) => {
    if (!showSorting) return null;

    if (sortConfig.column === column) {
      return sortConfig.direction === "asc" ? (
        <ChevronUpIcon className="w-4 h-4 ml-1" />
      ) : (
        <ChevronDownIcon className="w-4 h-4 ml-1" />
      );
    }
    return <ChevronUpIcon className="w-4 h-4 ml-1 text-gray opacity-30" />;
  };

  const renderCellContent = (row, column) => {
    if (renderCell) {
      return renderCell(row, column, row[column.key]);
    }
    return row[column.key];
  };

  const renderActionsCell = (row) => {
    if (renderActions) {
      return renderActions(row);
    }
    return (
      <button className="p-1 text-gray hover:text-light transition-colors">
        <EllipsisHorizontalIcon className="w-4 h-4" />
      </button>
    );
  };

  return (
    <div className={`bg-bg-2 rounded-lg border border-border ${className}`}>
      {/* Header Section */}
      <div className={`p-4 border-b border-border ${headerClassName}`}>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Left side - Export buttons */}
          {showExport && (
            <div className="flex gap-2">
              <div className="flex gap-2">
                {exportOptions.map((option) => (
                  <CustomButton
                    key={option}
                    variant="outline"
                    size="md"
                    onClick={() => handleExport(option)}
                    className="!px-3 !py-2"
                  >
                    {option}
                  </CustomButton>
                ))}
              </div>

              {/* Center - Search */}
              {showSearch && (
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray" />
                    <input
                      type="text"
                      placeholder={searchPlaceholder}
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-bg-2 border border-border rounded-lg text-light placeholder:text-gray focus:outline-none focus:border-light text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Right side - Action buttons */}
          {actionButtons.length > 0 && (
            <div className="flex gap-2">
              {actionButtons.map((button, index) => (
                <Button
                  key={index}
                  variant={button.variant || "primary"}
                  size="md"
                  onClick={() => handleActionButton(button.action)}
                  icon={<PlusIcon className="w-4 h-4" />}
                  iconPosition="left"
                >
                  {button.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div
        className={`overflow-x-auto ${
          maxHeight ? `max-h-[${maxHeight}px] overflow-y-auto` : ""
        }`}
      >
        <table className={`w-full ${tableClassName}`}>
          <thead className={`bg-bg ${stickyHeader ? "sticky top-0 z-10" : ""}`}>
            <tr>
              {/* Row numbers */}
              {showRowNumbers && (
                <th className="px-4 py-3 text-left text-gray text-sm font-medium border-b border-border">
                  #
                </th>
              )}

              {/* Row selection */}
              {showRowSelection && (
                <th className="px-4 py-3 text-left border-b border-border">
                  <label className="flex items-center cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={
                        localSelectedRows.length === paginatedData.length &&
                        paginatedData.length > 0
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="peer sr-only"
                    />
                    <span
                      className="relative inline-flex size-5 items-center justify-center rounded-sm border border-border peer-checked:bg-bg/60
                      transition-colors duration-150
                      peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-light
                      peer-checked:border-light bg-light/10"
                    >
                      <svg
                        className="absolute w-3 h-3 text-light opacity-0 group-has-[input:checked]:opacity-100 transition-opacity duration-150 pointer-events-none z-10"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  </label>
                </th>
              )}

              {/* Column headers */}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-gray text-sm font-medium border-b border-border ${
                    showSorting && column.sortable !== false
                      ? "cursor-pointer hover:text-light"
                      : ""
                  }`}
                  onClick={() =>
                    column.sortable !== false && handleSort(column.key)
                  }
                >
                  <div className="flex items-center">
                    {column.label}
                    {showSorting &&
                      column.sortable !== false &&
                      renderSortIcon(column.key)}
                  </div>
                </th>
              ))}

              {/* Actions column */}
              <th className="px-4 py-3 text-left text-gray text-sm font-medium border-b border-border">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (showRowSelection ? 2 : 1) +
                    (showRowNumbers ? 1 : 0)
                  }
                  className="px-4 py-8 text-center text-gray"
                >
                  Loading...
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (showRowSelection ? 2 : 1) +
                    (showRowNumbers ? 1 : 0)
                  }
                  className="px-4 py-8 text-center text-gray"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={row[rowKey] || rowIndex}
                  className={`border-b border-border hover:bg-bg/30 transition-colors ${
                    onRowClick ? "cursor-pointer" : ""
                  } ${rowClassName}`}
                  onClick={() => onRowClick && handleRowClick(row)}
                >
                  {/* Row numbers */}
                  {showRowNumbers && (
                    <td className="px-4 py-3 text-gray text-sm">
                      {startIndex + rowIndex + 1}
                    </td>
                  )}

                  {/* Row selection */}
                  {showRowSelection && (
                    <td className="px-4 py-3">
                      <label className="flex items-center cursor-pointer select-none group">
                        <input
                          type="checkbox"
                          checked={localSelectedRows.includes(row[rowKey])}
                          onChange={(e) =>
                            handleSelectRow(row[rowKey], e.target.checked)
                          }
                          className="peer sr-only"
                        />
                        <span
                          className="relative inline-flex size-5 items-center justify-center rounded-sm border border-border peer-checked:bg-bg/60
                          transition-colors duration-150
                          peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-light
                          peer-checked:border-light bg-light/10"
                        >
                          <svg
                            className="absolute w-3 h-3 text-light opacity-0 group-has-[input:checked]:opacity-100 transition-opacity duration-150 pointer-events-none z-10"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                      </label>
                    </td>
                  )}

                  {/* Data cells */}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-3 text-light text-sm"
                    >
                      {renderCellContent(row, column)}
                    </td>
                  ))}

                  {/* Actions */}
                  <td className="px-4 py-3">{renderActionsCell(row)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Section */}
      {showPagination && (
        <div className="p-4 border-t border-border">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Selection info */}
            <div className="text-gray text-sm">
              {localSelectedRows.length} of {processedData.length} row(s)
              selected
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-4">
              {/* Rows per page */}
              <div className="flex items-center gap-2">
                <span className="text-gray text-sm">Rows per page</span>
                <div className="relative">
                  <select
                    value={currentPageSize}
                    onChange={(e) =>
                      handlePageSizeChange(Number(e.target.value))
                    }
                    className="appearance-none pr-8 px-2 py-1 bg-bg border border-border rounded text-light text-sm focus:outline-none focus:border-light"
                  >
                    {pageSizeOptions.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  <ChevronUpDownIcon className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray pointer-events-none" />
                </div>
              </div>

              {/* Page navigation */}
              <div className="flex items-center gap-2">
                <span className="text-gray text-sm">
                  Page {currentPage} of {totalPages}
                </span>

                <div className="flex gap-1">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="p-1 rounded text-gray hover:text-light disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronDoubleLeftIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1 rounded text-gray hover:text-light disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded text-gray hover:text-light disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded text-gray hover:text-light disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronDoubleRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTable;
