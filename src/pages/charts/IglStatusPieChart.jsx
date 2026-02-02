import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import ChartCard from './ChartCard';

const COLORS = ['#f59e0b', '#16a34a', '#ef4444'];

function IglStatusPieChart({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <ChartCard
      title="IGL Status Overview"
      subtitle="Pending vs Approved vs Rejected"
    >
      {total === 0 ? (
        <div className="chart-empty">No IGL data available.</div>
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
                <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export default IglStatusPieChart;
