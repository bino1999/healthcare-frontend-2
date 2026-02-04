function SectionTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="section-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={activeTab === tab.key ? 'tab-button active' : 'tab-button'}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default SectionTabs;
