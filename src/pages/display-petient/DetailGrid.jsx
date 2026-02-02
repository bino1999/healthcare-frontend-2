import React from 'react';

function DetailGrid({ items, emptyText = 'N/A' }) {
  const renderValue = (value) => {
    if (React.isValidElement(value)) return value;
    if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : emptyText;
    if (value === null || value === undefined || value === '') return emptyText;
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return value;
  };

  return (
    <div className="detail-grid">
      {items.map((item) => (
        <div key={item.label} className="detail-item">
          <span className="detail-label">{item.label}</span>
          <span className="detail-value">{renderValue(item.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default DetailGrid;
