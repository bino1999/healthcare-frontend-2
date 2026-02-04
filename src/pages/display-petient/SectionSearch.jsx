function SectionSearch({ value, onChange, placeholder = 'Search fields' }) {
  return (
    <div className="detail-search">
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export default SectionSearch;
