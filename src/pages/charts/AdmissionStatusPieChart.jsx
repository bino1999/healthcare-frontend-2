import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import ChartCard from './ChartCard';

function colorForIndex(i) {
  // Generate visually distinct HSL colors
  const hue = (i * 60) % 360; // 60-degree steps
  return `hsl(${hue} 70% 45%)`;
}

function AdmissionStatusPieChart({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <ChartCard title="Admission Status Overview">
      {total === 0 ? (
        <div className="chart-empty">No admission data available.</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={50}
              paddingAngle={3}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${entry.name}`} fill={colorForIndex(index)} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value}`} />
            <Legend verticalAlign="bottom" height={48} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export default AdmissionStatusPieChart;
