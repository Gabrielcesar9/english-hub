

export default function PieChart({ percent, size = 120, stroke = 16, fillColor = "#F7B731" }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <svg width={size} height={size}>
      <circle
        className="piechart-bg"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        className="piechart-fill"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={stroke}
        fill="none"
        stroke={fillColor}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
      <text
        className="piechart-text"
        x="50%"
        y="50%"
        textAnchor="middle"
        dy="0.3em"
      >
        {percent}%
      </text>
    </svg>
  );
}