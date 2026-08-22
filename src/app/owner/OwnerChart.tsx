"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import styles from "./owner.module.css";

export default function OwnerChart({ data }: { data: { hari: string; dibuka: number; durasi: number }[] }) {
  return <div className={styles.chart}><ResponsiveContainer width="100%" height={280}><BarChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}><CartesianGrid stroke="#eee" vertical={false} /><XAxis dataKey="hari" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: "#fff7f7" }} /><Bar dataKey="dibuka" name="SOP dibuka" fill="#8b0000" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>;
}
