import React, { useState, useMemo } from 'react';
import { CalendarDays, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';

const GanttView = ({ roadmap, updateFeatureDates }) => {
    const [zoomLevel, setZoomLevel] = useState(2); // 1=Months, 2=Weeks, 3=Days
    const ZOOM_LABELS = ['', 'Meses', 'Semanas', 'Días'];
    const DAY_WIDTHS = [0, 4, 12, 30]; // px per day at each zoom level

    const dayWidth = DAY_WIDTHS[zoomLevel];

    // Flatten all features with version metadata
    const allFeatures = useMemo(() => {
        return roadmap.reduce((acc, version, vIdx) => {
            const enriched = version.features
                .filter(f => f.startDate && f.endDate)
                .map(f => ({
                    ...f,
                    versionName: version.name,
                    versionColor: version.color,
                    vIdx,
                    startDateObj: new Date(f.startDate + 'T00:00:00'),
                    endDateObj: new Date(f.endDate + 'T00:00:00'),
                }));
            return [...acc, ...enriched];
        }, []);
    }, [roadmap]);

    // Calculate timeline boundaries
    const { minDate, maxDate, totalDays } = useMemo(() => {
        if (allFeatures.length === 0) {
            const today = new Date();
            const future = new Date(today);
            future.setMonth(future.getMonth() + 3);
            return { minDate: today, maxDate: future, totalDays: 90 };
        }

        let min = allFeatures[0].startDateObj;
        let max = allFeatures[0].endDateObj;

        allFeatures.forEach(f => {
            if (f.startDateObj < min) min = f.startDateObj;
            if (f.endDateObj > max) max = f.endDateObj;
        });

        // Add some padding
        const paddedMin = new Date(min);
        paddedMin.setDate(paddedMin.getDate() - 7);
        const paddedMax = new Date(max);
        paddedMax.setDate(paddedMax.getDate() + 14);

        const days = Math.ceil((paddedMax - paddedMin) / (1000 * 60 * 60 * 24));
        return { minDate: paddedMin, maxDate: paddedMax, totalDays: days };
    }, [allFeatures]);

    // Generate time markers
    const timeMarkers = useMemo(() => {
        const markers = [];
        const cursor = new Date(minDate);

        if (zoomLevel === 1) {
            // Monthly markers
            cursor.setDate(1);
            while (cursor <= maxDate) {
                const offset = Math.ceil((cursor - minDate) / (1000 * 60 * 60 * 24));
                markers.push({
                    label: cursor.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' }),
                    offset
                });
                cursor.setMonth(cursor.getMonth() + 1);
            }
        } else if (zoomLevel === 2) {
            // Weekly markers
            const dayOfWeek = cursor.getDay();
            cursor.setDate(cursor.getDate() - dayOfWeek + 1); // Start on Monday
            while (cursor <= maxDate) {
                const offset = Math.ceil((cursor - minDate) / (1000 * 60 * 60 * 24));
                markers.push({
                    label: cursor.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }),
                    offset
                });
                cursor.setDate(cursor.getDate() + 7);
            }
        } else {
            // Daily markers (every other day to avoid clutter)
            while (cursor <= maxDate) {
                const offset = Math.ceil((cursor - minDate) / (1000 * 60 * 60 * 24));
                markers.push({
                    label: cursor.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }),
                    offset
                });
                cursor.setDate(cursor.getDate() + 2);
            }
        }

        return markers;
    }, [minDate, maxDate, zoomLevel]);

    const getBarStyles = (feature) => {
        const startOffset = Math.max(0, (feature.startDateObj - minDate) / (1000 * 60 * 60 * 24));
        const duration = Math.max(1, (feature.endDateObj - feature.startDateObj) / (1000 * 60 * 60 * 24));

        return {
            left: `${startOffset * dayWidth}px`,
            width: `${duration * dayWidth}px`,
        };
    };

    // Today marker
    const todayOffset = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return Math.ceil((today - minDate) / (1000 * 60 * 60 * 24));
    }, [minDate]);

    const totalWidth = totalDays * dayWidth;

    return (
        <div className="bg-transparent p-6 md:p-10 min-h-[85vh] font-sans">
            {/* Header */}
            <div className="max-w-screen-2xl mx-auto mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-300 pb-8">
                <div>
                    <h1 className="text-4xl font-sans font-black tracking-tight mb-3 flex items-center gap-4 text-slate-900 drop-shadow-sm">
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 shadow-xl">
                            <CalendarDays className="text-accent-blue" size={32} />
                        </div>
                        Diagrama de Gantt
                    </h1>
                    <p className="text-slate-700 font-medium text-lg leading-relaxed max-w-2xl mt-4">
                        Timeline integral de desarrollo basado en fechas configuradas por actividad. Visualice la cadencia de entregas en todos los buckets.
                    </p>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-4 bg-carbon-surface border border-white/10 px-5 py-3 rounded-xl shadow-lg backdrop-blur-md">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-bone/50">Resolución Temporal:</span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setZoomLevel(Math.max(1, zoomLevel - 1))}
                            disabled={zoomLevel <= 1}
                            className="p-1.5 hover:bg-white/10 rounded-md disabled:opacity-30 transition-colors text-white border border-transparent hover:border-white/10"
                        >
                            <ZoomOut size={18} />
                        </button>
                        <span className="text-xs font-bold text-white min-w-[70px] text-center uppercase tracking-widest font-mono bg-black/30 py-1 rounded border border-white/5 shadow-inner">
                            {ZOOM_LABELS[zoomLevel]}
                        </span>
                        <button
                            onClick={() => setZoomLevel(Math.min(3, zoomLevel + 1))}
                            disabled={zoomLevel >= 3}
                            className="p-1.5 hover:bg-white/10 rounded-md disabled:opacity-30 transition-colors text-white border border-transparent hover:border-white/10"
                        >
                            <ZoomIn size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Gantt Body */}
            <div className="max-w-screen-2xl mx-auto overflow-x-auto border border-white/10 bg-carbon-light rounded-2xl shadow-2xl custom-scrollbar relative">
                <div className="min-w-[800px]" style={{ width: `${Math.max(800, totalWidth + 300)}px` }}>

                    {/* Timeline Header */}
                    <div className="flex border-b border-white/10 sticky top-0 z-20 bg-carbon-raised/80 backdrop-blur-xl">
                        <div className="w-[300px] shrink-0 p-4 border-r border-white/10 font-bold text-[10px] uppercase tracking-widest text-bone/50 flex flex-col justify-end">
                            Entidad / Actividad
                        </div>
                        <div className="relative flex-1" style={{ width: `${totalWidth}px` }}>
                            {timeMarkers.map((marker, i) => (
                                <div
                                    key={i}
                                    className="absolute top-0 h-full border-l border-white/5 text-[10px] text-bone/40 font-bold px-2 py-3 uppercase tracking-wider"
                                    style={{ left: `${marker.offset * dayWidth}px` }}
                                >
                                    {marker.label}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Rows */}
                    {roadmap.map((version, vIdx) => (
                        <React.Fragment key={version.id}>
                            {/* Version Header Row */}
                            <div className="flex border-b border-white/5 bg-carbon-raised/30">
                                <div className="w-[300px] shrink-0 p-3 border-r border-white/10 bg-carbon-raised/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: version.color, boxShadow: `0 0 10px ${version.color}80` }}></div>
                                        <span className="font-bold text-[11px] uppercase tracking-widest text-white text-shadow">{version.name}</span>
                                    </div>
                                </div>
                                <div className="flex-1 relative" style={{ width: `${totalWidth}px` }}>
                                    {/* Vertical grid lines */}
                                    {timeMarkers.map((marker, i) => (
                                        <div
                                            key={i}
                                            className="absolute top-0 h-full border-l border-white/5"
                                            style={{ left: `${marker.offset * dayWidth}px` }}
                                        ></div>
                                    ))}
                                </div>
                            </div>

                            {/* Feature Rows */}
                            {version.features.filter(f => f.startDate && f.endDate).map(f => {
                                const featureObj = {
                                    ...f,
                                    startDateObj: new Date(f.startDate + 'T00:00:00'),
                                    endDateObj: new Date(f.endDate + 'T00:00:00'),
                                };
                                const barStyle = getBarStyles(featureObj);

                                return (
                                    <div key={f.id} className="flex border-b border-white/5 hover:bg-white/5 transition-colors group relative">
                                        <div className="w-[300px] shrink-0 p-3 border-r border-white/10 flex items-center gap-3 bg-carbon/20">
                                            <span className="text-xs font-semibold text-white truncate flex-1 leading-snug group-hover:text-accent-blue transition-colors" title={f.title}>{f.title}</span>
                                            <span className="text-[9px] text-bone/40 font-mono shrink-0 bg-black/40 px-2 py-1 rounded border border-white/5">{f.startDate}</span>
                                        </div>
                                        <div className="flex-1 relative h-12" style={{ width: `${totalWidth}px` }}>
                                            {/* Today line */}
                                            <div
                                                className="absolute top-0 h-[200vh] border-l-2 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)] z-10 pointer-events-none"
                                                style={{ left: `${todayOffset * dayWidth}px`, top: '-50vh' }}
                                            ></div>

                                            {/* Grid lines */}
                                            {timeMarkers.map((marker, i) => (
                                                <div
                                                    key={i}
                                                    className="absolute top-0 h-full border-l border-white/5 pointer-events-none"
                                                    style={{ left: `${marker.offset * dayWidth}px` }}
                                                ></div>
                                            ))}

                                            {/* Task Bar */}
                                            <div
                                                className="absolute top-2.5 h-7 rounded-md flex items-center px-3 text-white text-[10px] uppercase tracking-wider font-bold truncate shadow-lg hover:brightness-125 transition-all cursor-pointer border border-white/20 hover:scale-[1.02] origin-left z-0"
                                                style={{
                                                    ...barStyle,
                                                    backgroundColor: version.color,
                                                    minWidth: '24px',
                                                    boxShadow: `0 4px 15px ${version.color}40`
                                                }}
                                                title={`${f.title}\n${f.startDate} → ${f.endDate}\n${f.assignee || 'Sin Asignar'}`}
                                            >
                                                {parseFloat(barStyle.width) > 90 ? <span className="drop-shadow-md truncate">{f.title}</span> : ''}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="max-w-screen-2xl mx-auto mt-6 flex flex-wrap gap-6 text-[10px] text-bone/60 uppercase tracking-widest font-bold bg-carbon-light/30 p-4 rounded-xl border border-white/5 mb-8">
                <div className="flex items-center gap-3 bg-black/20 px-3 py-1.5 rounded border border-white/5">
                    <div className="w-5 h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                    <span>Línea del Día de Hoy</span>
                </div>
                {roadmap.map(v => (
                    <div key={v.id} className="flex items-center gap-3 bg-black/20 px-3 py-1.5 rounded border border-white/5">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: v.color, boxShadow: `0 0 8px ${v.color}80` }}></div>
                        <span className="text-shadow">{v.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GanttView;
