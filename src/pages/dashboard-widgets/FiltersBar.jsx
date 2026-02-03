function FiltersBar({ searchTerm, onSearchChange, placeholder = 'Search by patient name' }) {
  return (
    <div className="dashboard-controls">
      <div className="control-group">
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}

export default FiltersBar;