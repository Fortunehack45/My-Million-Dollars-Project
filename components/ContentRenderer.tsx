import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import {
    PieChart, Pie, Cell, BarChart, Bar,
    XAxis, YAxis, Tooltip, ResponsiveContainer,
    LineChart, Line
} from 'recharts';

interface ContentRendererProps {
    html: string;
    className?: string;
}

const CHART_COLORS = ['#800000', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#6366f1'];

const ChartRenderer = ({ type, dataString }: { type: string, dataString: string }) => {
    try {
        const data = dataString.split(',').map(item => {
            const [name, value] = item.split(':');
            return { name: name.trim(), value: parseFloat(value.trim()) };
        });

        if (type === 'PIE_CHART') {
            return (
                <div className="h-64 my-8 bg-zinc-950/50 border border-zinc-900 rounded-2xl p-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
                                itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            );
        }

        if (type === 'BAR_CHART') {
            return (
                <div className="h-64 my-8 bg-zinc-950/50 border border-zinc-900 rounded-2xl p-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
                                itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                            />
                            <Bar dataKey="value" fill="#800000" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            );
        }

        return null;
    } catch (e) {
        return <div className="text-red-500 font-mono text-[10px]">Error Rendering Chart</div>;
    }
};

export const ContentRenderer: React.FC<ContentRendererProps> = ({ html, className = "" }) => {
    if (!html) return null;

    // Split content by potential Latex or Chart markers
    // Markers: $$...$$, [PIE_CHART data="..."], [BAR_CHART data="..."]
    const parts = html.split(/(\$\$.*?\$\$|\[(?:PIE|BAR)_CHART data=".*?"\])/g);

    return (
        <div className={`prose prose-invert prose-emerald max-w-none ${className}`}>
            {parts.map((part, index) => {
                if (part.startsWith('$$') && part.endsWith('$$')) {
                    const formula = part.slice(2, -2);
                    return <div key={index} className="my-6 flex justify-center"><BlockMath math={formula} /></div>;
                }

                if (part.startsWith('[PIE_CHART') || part.startsWith('[BAR_CHART')) {
                    const type = part.startsWith('[PIE') ? 'PIE_CHART' : 'BAR_CHART';
                    const match = part.match(/data="(.*?)"/);
                    const dataString = match ? match[1] : "";
                    return <ChartRenderer key={index} type={type} dataString={dataString} />;
                }

                // Standard HTML content
                // SECURITY: This content must be sanitized or come from a trusted source (site_content)
                // In a production environment, use DOMPurify to sanitize this HTML.
                return (
                    <div
                        key={index}
                        dangerouslySetInnerHTML={{ __html: part }}
                        className="inline-block w-full"
                        style={{
                            whiteSpace: 'pre-wrap',
                            // Resetting base styles that might be inherited
                            display: part.trim() === '' ? 'none' : 'block'
                        }}
                    />
                );
            })}
            <style>{`
        .prose table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
          border: 1px solid #27272a;
        }
        .prose th {
          background-color: #09090b;
          border: 1px solid #27272a;
          padding: 1rem;
          text-align: left;
          color: #800000;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
        }
        .prose td {
          border: 1px solid #18181b;
          padding: 1rem;
          color: #a1a1aa;
          font-size: 0.875rem;
        }
        .prose tr:hover {
          background-color: rgba(255,255,255,0.01);
        }
      `}</style>
        </div>
    );
};
