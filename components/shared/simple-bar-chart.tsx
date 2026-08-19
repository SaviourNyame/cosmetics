"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

export function SimpleBarChart({
  data,
  color,
}: {
  data: { name: string; value: number }[];
  color: string;
}) {
  return (
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e2e1" vertical={false} />
      <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#747878" />
      <YAxis tick={{ fontSize: 12 }} stroke="#747878" allowDecimals={false} />
      <Tooltip />
      <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
    </BarChart>
  );
}
