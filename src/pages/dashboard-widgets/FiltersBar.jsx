import './FiltersBar.css';

function FiltersBar({ 
  searchTerm, 
  onSearchChange, 
  operationDateFilter = '',
  onOperationDateChange,
  placeholder = 'Search by patient name, MRN, insurance company, or bed no' 
}) {
  // Get today's date in YYYY-MM-DD format for the date input
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="filters-bar">
      <div className="filter-group search-group">
        <label htmlFor="unified-search">Search</label>
        <input
          id="unified-search"
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      {onOperationDateChange && (
        <div className="filter-group date-group">
          <label htmlFor="operation-date">Operation Date</label>
          <div className="date-filter-wrapper">
            <input
              id="operation-date"
              type="date"
              value={operationDateFilter}
              onChange={(e) => onOperationDateChange(e.target.value)}
            />
            <button 
              type="button"
              className="btn-today"
              onClick={() => onOperationDateChange(today)}
              title="Show today's operations"
            >
              Today
            </button>
            {operationDateFilter && (
              <button 
                type="button"
                className="btn-clear"
                onClick={() => onOperationDateChange('')}
                title="Clear filter"
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FiltersBar;