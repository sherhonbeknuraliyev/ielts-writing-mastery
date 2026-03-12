import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";
import type { ChartData } from "@shared/schemas/prompt.schema.js";

interface Props {
  chartData: ChartData;
}

const PIE_COLORS = ["#4F46E5", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4"];

function buildRowData(labels: string[], datasets: ChartData["datasets"]) {
  return labels.map((label, i) => {
    const row: Record<string, string | number> = { label };
    datasets.forEach((ds) => {
      row[ds.label] = ds.data[i] ?? 0;
    });
    return row;
  });
}

function buildPieData(chartData: ChartData) {
  if (chartData.datasets.length === 0) return [];
  const ds = chartData.datasets[0];
  return chartData.labels.map((label, i) => ({
    name: label,
    value: ds.data[i] ?? 0,
  }));
}

function renderPercentLabel(props: PieLabelRenderProps) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  if (
    cx == null || cy == null || midAngle == null ||
    innerRadius == null || outerRadius == null || percent == null
  ) return null;
  const RADIAN = Math.PI / 180;
  const r = (Number(innerRadius) + Number(outerRadius)) * 0.5;
  const x = Number(cx) + r * Math.cos(-Number(midAngle) * RADIAN);
  const y = Number(cy) + r * Math.sin(-Number(midAngle) * RADIAN);
  if (Number(percent) < 0.04) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(Number(percent) * 100).toFixed(0)}%`}
    </text>
  );
}

export function TaskChart({ chartData }: Props) {
  const rowData = buildRowData(chartData.labels, chartData.datasets);

  return (
    <div className="chart-container">
      <h3>{chartData.title}</h3>

      <div className="chart-wrapper">
        {chartData.type === "line" && (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={rowData} margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="label"
                label={{ value: chartData.xAxisLabel, position: "insideBottom", offset: -10, fontSize: 12 }}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                label={{ value: `${chartData.yAxisLabel}${chartData.unit ? ` (${chartData.unit})` : ""}`, angle: -90, position: "insideLeft", offset: 10, fontSize: 12 }}
                tick={{ fontSize: 11 }}
              />
              <Tooltip formatter={(value) => [`${value}${chartData.unit}`, ""]} />
              <Legend verticalAlign="top" wrapperStyle={{ fontSize: 12 }} />
              {chartData.datasets.map((ds) => (
                <Line
                  key={ds.label}
                  type="monotone"
                  dataKey={ds.label}
                  stroke={ds.color}
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}

        {chartData.type === "bar" && (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={rowData} margin={{ top: 10, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="label"
                label={{ value: chartData.xAxisLabel, position: "insideBottom", offset: -10, fontSize: 12 }}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                label={{ value: `${chartData.yAxisLabel}${chartData.unit ? ` (${chartData.unit})` : ""}`, angle: -90, position: "insideLeft", offset: 10, fontSize: 12 }}
                tick={{ fontSize: 11 }}
              />
              <Tooltip formatter={(value) => [`${value}${chartData.unit}`, ""]} />
              <Legend verticalAlign="top" wrapperStyle={{ fontSize: 12 }} />
              {chartData.datasets.map((ds) => (
                <Bar key={ds.label} dataKey={ds.label} fill={ds.color} radius={[3, 3, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartData.type === "pie" && (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={buildPieData(chartData)}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                labelLine={false}
                label={renderPercentLabel}
              >
                {buildPieData(chartData).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}${chartData.unit}`, ""]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        )}

        {chartData.type === "table" && (
          <table className="data-table">
            <thead>
              <tr>
                <th></th>
                {chartData.labels.map((label) => (
                  <th key={label}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chartData.datasets.map((ds) => (
                <tr key={ds.label}>
                  <td>{ds.label}</td>
                  {ds.data.map((val, i) => (
                    <td key={i}>{val}{chartData.unit}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {chartData.type === "process" && (
          <div className="process-diagram">
            {chartData.labels.map((step, i) => {
              const total = chartData.labels.length;
              const lightness = Math.round(55 - (i / Math.max(total - 1, 1)) * 25);
              const bg = `hsl(220, 70%, ${lightness}%)`;
              return (
                <div key={i} className="process-step">
                  <div className="process-step-box" style={{ background: bg }}>
                    <div style={{ fontSize: "0.7rem", opacity: 0.85, marginBottom: 2 }}>Step {i + 1}</div>
                    {step}
                  </div>
                  {i < total - 1 && <div className="process-arrow">→</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
