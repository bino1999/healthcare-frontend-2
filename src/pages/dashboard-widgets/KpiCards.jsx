function KpiCards({ items = [] }) {
  return (
    <div className="kpi-grid">
      {items.map((item) => (
        <div key={item.label} className="kpi-card">
          <p className="kpi-label">{item.label}</p>
          <h3 className="kpi-value">{item.value}</h3>
        </div>
      ))}
    </div>
  );
}

export default KpiCards;