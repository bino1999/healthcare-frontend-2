const toList = (value) => (Array.isArray(value) ? value : value ? [value] : []);

const formatCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'N/A';
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatAiAnalysis = (analysis) => {
  if (!analysis) return '';

  let data = analysis;
  if (typeof analysis === 'string') {
    const trimmed = analysis.trim();
    if (!trimmed) return '';
    try {
      data = JSON.parse(trimmed);
    } catch (err) {
      return trimmed;
    }
  }

  if (typeof data !== 'object' || data === null) {
    return String(data);
  }

  const lines = [];
  lines.push('Predictive Claims Analysis');
  lines.push('');
  lines.push(`Risk Level: ${data.risk_level || 'N/A'}`);
  lines.push(
    `Risk Probability: ${
      typeof data.risk_probability_pct === 'number'
        ? `${data.risk_probability_pct}%`
        : 'N/A'
    }`
  );
  lines.push(`Amount at Risk: ${formatCurrency(data.amount_at_risk_rm)}`);
  lines.push('');

  const flaggedItems = toList(data.flagged_items);
  lines.push('Flagged Items:');
  if (flaggedItems.length === 0) {
    lines.push('- None');
  } else {
    flaggedItems.forEach((item) => {
      const label = item?.item || 'Unnamed item';
      const reason = item?.reason ? ` (${item.reason})` : '';
      const evidence = toList(item?.evidence_fields).filter(Boolean);
      const evidenceText = evidence.length ? ` [evidence: ${evidence.join(', ')}]` : '';
      lines.push(`- ${label}${reason}${evidenceText}`);
    });
  }
  lines.push('');

  const recommendations = toList(data.recommendations);
  lines.push('Recommendations:');
  if (recommendations.length === 0) {
    lines.push('- None');
  } else {
    recommendations.forEach((rec) => lines.push(`- ${rec}`));
  }
  lines.push('');

  const missingInfo = toList(data.missing_info);
  lines.push('Missing Info:');
  if (missingInfo.length === 0) {
    lines.push('- None');
  } else {
    missingInfo.forEach((info) => lines.push(`- ${info}`));
  }
  lines.push('');

  const flags = toList(data.data_quality_flags);
  lines.push('Data Quality Flags:');
  if (flags.length === 0) {
    lines.push('- None');
  } else {
    flags.forEach((flag) => lines.push(`- ${flag}`));
  }
  lines.push('');

  if (data.summary) {
    lines.push('Summary:');
    lines.push(data.summary);
  }

  return lines.join('\n');
};
