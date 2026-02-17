import React from 'react';


function DetailGrid({ items, emptyText = 'N/A' }) {
  const renderValue = (item) => {
    const { label, value } = item;
    // Special handling for 'Related Conditions' and similar long, comma-separated fields
    if (
      label &&
      (label.toLowerCase().includes('related condition') || label.toLowerCase().includes('additional condition')) &&
      typeof value === 'string' &&
      value.length > 40 &&
      value.includes(',')
    ) {
      // Split by comma, trim, and render as a list
      const items = value.split(',').map((v) => v.trim()).filter(Boolean);
      if (items.length === 0) return emptyText;
      return (
        <ul className="detail-list">
          {items.map((v, i) => (
            <li key={i}>{v}</li>
          ))}
        </ul>
      );
    }
    if (React.isValidElement(value)) return value;
    if (Array.isArray(value)) {
      if (value.length === 0) return emptyText;
      // If array items are long, render as list
      const joined = value.join(', ');
      if (joined.length > 40) {
        return (
          <ul className="detail-list">
            {value.map((v, i) => (
              <li key={i}>{v}</li>
            ))}
          </ul>
        );
      }
      return joined;
    }
    if (value === null || value === undefined || value === '') return emptyText;
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return value;
  };

  return (
    <div className="detail-grid">
      {items.map((item) => (
        <div key={item.label} className="detail-item">
          <span className="detail-label">{item.label}</span>
          <span className="detail-value">{renderValue(item)}</span>
        </div>
      ))}
    </div>
  );
}

export default DetailGrid;
