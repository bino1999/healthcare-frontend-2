function DetailSection({ title, subtitle, isEditing, onEdit, showEdit = true, children }) {
  return (
    <section className="section-card">
      <div className="section-header">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
        {showEdit && (
          <button type="button" className="icon-button" onClick={onEdit}>
            <span className="icon">✎</span>
            {isEditing ? 'Close' : 'Edit'}
          </button>
        )}
      </div>
      <div className="section-body">{children}</div>
    </section>
  );
}

export default DetailSection;
