import PropTypes from 'prop-types';
import './AiAnalysisModal.css';

// Sub-component for Risk Badge with probability bar
const RiskBadge = ({ level, probability }) => {
  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="ai-risk-badge">
      <span 
        className="risk-level" 
        style={{ backgroundColor: getRiskColor(level) }}
      >
        {level || 'Unknown'}
      </span>
      {probability && (
        <div className="probability-bar-container">
          <div 
            className="probability-bar" 
            style={{ 
              width: `${probability}%`,
              backgroundColor: getRiskColor(level)
            }}
          />
          <span className="probability-text">{probability}%</span>
        </div>
      )}
    </div>
  );
};

RiskBadge.propTypes = {
  level: PropTypes.string,
  probability: PropTypes.number
};

// Sub-component for Info Cards
const InfoCard = ({ title, children, icon }) => (
  <div className="ai-info-card">
    <div className="ai-card-header">
      {icon && <span className="ai-card-icon">{icon}</span>}
      <h4>{title}</h4>
    </div>
    <div className="ai-card-content">
      {children}
    </div>
  </div>
);

InfoCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  icon: PropTypes.string
};

// Sub-component for Flagged Items List
const FlaggedItemsList = ({ items }) => {
  if (!items || items.length === 0) {
    return <p className="ai-empty-state">No items flagged</p>;
  }

  return (
    <ul className="ai-flagged-list">
      {items.map((item, index) => (
        <li key={index} className="ai-flagged-item">
          <span className="ai-flag-icon">⚠️</span>
          <div className="ai-flag-content">
            <strong>{item.item || item.name || 'Item'}</strong>
            {item.reason && <p className="ai-flag-reason">{item.reason}</p>}
            {item.cost && (
              <span className="ai-flag-cost">
                Estimated: Rs. {item.cost.toLocaleString()}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

FlaggedItemsList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object)
};

// Sub-component for Simple Lists (recommendations, missing info, etc.)
const SimpleList = ({ items, emptyMessage = 'No items' }) => {
  if (!items || items.length === 0) {
    return <p className="ai-empty-state">{emptyMessage}</p>;
  }

  return (
    <ul className="ai-simple-list">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
};

SimpleList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string),
  emptyMessage: PropTypes.string
};

// Main Modal Component
const AiAnalysisModal = ({ isOpen, onClose, loading, error, analysisData }) => {
  if (!isOpen) return null;

  return (
    <div className="ai-modal-backdrop" onClick={onClose}>
      <div className="ai-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="ai-modal-header">
          <h3>AI Claim Risk Analysis</h3>
          <button className="ai-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="ai-modal-body">
          {loading && (
            <div className="ai-loading-state">
              <div className="ai-spinner"></div>
              <p>Analyzing claim data with AI...</p>
            </div>
          )}

          {error && !loading && (
            <div className="ai-error-state">
              <span className="ai-error-icon">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && analysisData && (
            <div className="ai-analysis-content">
              {/* Risk Assessment Section */}
              <div className="ai-risk-section">
                <RiskBadge 
                  level={analysisData.overallRiskLevel} 
                  probability={analysisData.fraudProbability}
                />
              </div>

              {/* Summary */}
              {analysisData.summary && (
                <div className="ai-summary-section">
                  <h4 className="ai-summary-title">Analysis Summary</h4>
                  <div className="ai-summary-content">
                    {analysisData.summary.split(/\.\s+/).filter(s => s.trim()).map((sentence, index) => (
                      <p key={index} className="ai-summary-sentence">
                        <span className="ai-bullet">•</span>
                        {sentence.trim()}{sentence.trim().endsWith('.') ? '' : '.'}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Info Cards Grid */}
              <div className="ai-cards-grid">
                {/* Flagged Items */}
                {analysisData.flaggedItems && analysisData.flaggedItems.length > 0 && (
                  <InfoCard title="Flagged Items" icon="🚩">
                    <FlaggedItemsList items={analysisData.flaggedItems} />
                  </InfoCard>
                )}

                {/* Cost Analysis */}
                {analysisData.costAnalysis && (
                  <InfoCard title="Cost Analysis" icon="💰">
                    <div className="ai-cost-breakdown">
                      {analysisData.costAnalysis.estimatedTotal && (
                        <div className="ai-cost-item">
                          <span>Estimated Total:</span>
                          <strong>Rs. {analysisData.costAnalysis.estimatedTotal.toLocaleString()}</strong>
                        </div>
                      )}
                      {analysisData.costAnalysis.marketAverage && (
                        <div className="ai-cost-item">
                          <span>Market Average:</span>
                          <strong>Rs. {analysisData.costAnalysis.marketAverage.toLocaleString()}</strong>
                        </div>
                      )}
                      {analysisData.costAnalysis.deviation && (
                        <div className="ai-cost-item ai-cost-deviation">
                          <span>Deviation:</span>
                          <strong>{analysisData.costAnalysis.deviation}</strong>
                        </div>
                      )}
                    </div>
                  </InfoCard>
                )}

                {/* Recommendations */}
                {analysisData.recommendations && analysisData.recommendations.length > 0 && (
                  <InfoCard title="Recommendations" icon="💡">
                    <SimpleList 
                      items={analysisData.recommendations}
                      emptyMessage="No recommendations"
                    />
                  </InfoCard>
                )}

                {/* Missing Information */}
                {analysisData.missingInformation && analysisData.missingInformation.length > 0 && (
                  <InfoCard title="Missing Information" icon="📋">
                    <SimpleList 
                      items={analysisData.missingInformation}
                      emptyMessage="No missing information"
                    />
                  </InfoCard>
                )}
              </div>

              {/* Additional Notes */}
              {analysisData.notes && (
                <div className="ai-notes-section">
                  <h4>Additional Notes</h4>
                  <p>{analysisData.notes}</p>
                </div>
              )}
            </div>
          )}

          {!loading && !error && !analysisData && (
            <div className="ai-empty-state">
              <p>No analysis data available</p>
            </div>
          )}
        </div>

        <div className="ai-modal-footer">
          <button className="ai-btn-close" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

AiAnalysisModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  analysisData: PropTypes.shape({
    overallRiskLevel: PropTypes.string,
    fraudProbability: PropTypes.number,
    summary: PropTypes.string,
    flaggedItems: PropTypes.arrayOf(PropTypes.object),
    costAnalysis: PropTypes.shape({
      estimatedTotal: PropTypes.number,
      marketAverage: PropTypes.number,
      deviation: PropTypes.string
    }),
    recommendations: PropTypes.arrayOf(PropTypes.string),
    missingInformation: PropTypes.arrayOf(PropTypes.string),
    notes: PropTypes.string
  })
};

export default AiAnalysisModal;
