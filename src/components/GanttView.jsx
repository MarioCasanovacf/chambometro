import React, { useMemo } from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

const GanttView = ({ roadmap }) => {

    // Extraemos todas las features y nos aseguramos de que tengan formato de fecha válido
    const allFeatures = useMemo(() => {
        return roadmap.reduce((acc, column) => {
            const enriched = column.features.filter(f => f.startDate && f.endDate).map(f => ({
                ...f,
                columnName: column.name,
                parseStart: new Date(f.startDate),
                parseEnd: new Date(f.endDate)
            }));
            return [...acc, ...enriched];
        }, []).sort((a, b) => a.parseStart - b.parseStart); // Sort by start date
    }, [roadmap]);

    // Calcular el rango dinámico del calendario basado en las tareas
    const { minDate, maxDate } = useMemo(() => {
        if (allFeatures.length === 0) {
            const today = new Date();
            return {
                minDate: new Date(today.getFullYear(), today.getMonth() - 1, 1),
                maxDate: new Date(today.getFullYear(), today.getMonth() + 2, 0)
            };
        }

        let min = new Date(allFeatures[0].parseStart);
        let max = new Date(allFeatures[0].parseEnd);

        allFeatures.forEach(f => {
            if (f.parseStart < min) min = new Date(f.parseStart);
            if (f.parseEnd > max) max = new Date(f.parseEnd);
        });

        // Darle un margen de un mes visual hacia atrás y adelante
        return {
            minDate: new Date(min.getFullYear(), min.getMonth() - 1, 1),
            maxDate: new Date(max.getFullYear(), max.getMonth() + 2, 0)
        };
    }, [allFeatures]);


    // Generar el grid de meses para el header del Gantt
    const months = useMemo(() => {
        const result = [];
        let current = new Date(minDate);
        while (current <= maxDate) {
            result.push({
                date: new Date(current),
                label: current.toLocaleString('default', { month: 'short', year: 'numeric' })
            });
            current.setMonth(current.getMonth() + 1);
        }
        return result;
    }, [minDate, maxDate]);

    // Calcula el % de posición horizontal y el ancho de la barra
    const getPositionStyles = (startDate, endDate) => {
        const totalDuration = maxDate.getTime() - minDate.getTime();
        const startOffset = startDate.getTime() - minDate.getTime();
        const taskDuration = endDate.getTime() - startDate.getTime();

        const leftPercent = Math.max(0, (startOffset / totalDuration) * 100);
        // Garantizar un mínimo de ancho visual (1%) para tareas de un día
        const widthPercent = Math.max(1, (taskDuration / totalDuration) * 100);

        return {
            left: `${leftPercent}%`,
            width: `${Math.min(widthPercent, 100 - leftPercent)}%`
        };
    };

    const STATUS_COLORS = {
        "No Empezado": "bg-stone-light text-carbon",
        "Prototipo": "bg-indigo-500 text-white",
        "Diseño": "bg-blue-500 text-white",
        "Funcional": "bg-orange-500 text-white",
        "Terminado": "bg-[#00c875] text-white",
        "Working on it": "bg-[#fdab3d] text-white", // Fallbacks for old data
        "Stuck": "bg-red-500 text-white",
        "Done": "bg-[#00c875] text-white"
    };

    return (
        <div className="bg-bone text-carbon p-4 md:p-8 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto mb-10 border-b border-stone-light pb-6">
                <h1 className="text-4xl font-serif font-bold tracking-tight mb-2 flex items-center gap-3">
                    <Calendar className="text-stone" /> Roadmap Cronológico (Gantt)
                </h1>
                <p className="text-stone text-lg max-w-2xl">
                    Visualización temporal de las iniciativas. Permite identificar cuellos de botella y superposiciones críticas en la ventana de ejecución técnica.
                </p>
            </div>

            <div className="max-w-7xl mx-auto bg-white border border-stone-light shadow-sm overflow-hidden">

                {/* Header de Meses (Timeline) */}
                <div className="flex border-b border-stone-light bg-bone-alt relative">
                    <div className="w-1/4 min-w-[250px] p-4 font-bold uppercase text-xs tracking-widest text-stone border-r border-stone-light flex items-end">
                        Iniciativa / Feature
                    </div>
                    <div className="w-3/4 relative flex">
                        {months.map((m, i) => (
                            <div key={i} className="flex-1 border-r border-stone-light/30 p-2 text-center text-[10px] font-bold text-stone uppercase tracking-wider">
                                {m.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Grid Container y Barras */}
                <div className="relative divide-y divide-stone-light overflow-x-auto">

                    {allFeatures.length === 0 && (
                        <div className="p-12 text-center text-stone flex flex-col items-center justify-center">
                            <AlertCircle size={32} className="mb-3 opacity-50" />
                            <p className="font-bold">No hay tareas con estimaciones de fecha activas.</p>
                            <p className="text-sm mt-1">Regrese al Roadmap Operativo y asegúrese de que las tareas tengan un "startDate" y "endDate".</p>
                        </div>
                    )}

                    {allFeatures.map(feature => {
                        const position = getPositionStyles(feature.parseStart, feature.parseEnd);
                        const progressBg = STATUS_COLORS[feature.devStatus] || "bg-carbon text-white";

                        return (
                            <div key={feature.id} className="flex hover:bg-stone-50 transition-colors group">
                                {/* Label Left Side */}
                                <div className="w-1/4 min-w-[250px] p-4 border-r border-stone-light">
                                    <h3 className="font-bold text-sm text-carbon truncate flex items-center gap-2" title={feature.title}>
                                        {feature.title}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1 text-[10px] text-stone uppercase tracking-wider font-semibold">
                                        <span className="truncate">{feature.columnName}</span>
                                        <span className="flex items-center gap-1"><Clock size={10} /> {feature.effortMin}-{feature.effortMax}d</span>
                                    </div>
                                </div>

                                {/* Timeline Right Side */}
                                <div className="w-3/4 relative py-4 min-w-[600px]">
                                    {/* Month divider lines (Background) */}
                                    <div className="absolute inset-0 flex pointer-events-none">
                                        {months.map((_, i) => (
                                            <div key={`grid-${i}`} className="flex-1 border-r border-stone-light/30"></div>
                                        ))}
                                    </div>

                                    {/* The colored Gantt Bar */}
                                    <div
                                        className={`absolute h-8 rounded-sm shadow-sm flex items-center px-3 text-[10px] font-bold uppercase tracking-wider truncate cursor-pointer hover:brightness-110 transition-all ${progressBg}`}
                                        style={position}
                                        title={`${feature.title} \nInicio: ${feature.startDate}\nFin Est.: ${feature.endDate}\nStatus: ${feature.devStatus}`}
                                    >
                                        {feature.devStatus}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="max-w-7xl mx-auto mt-6 flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider text-stone">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-stone-light"></div> No Empezado</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-indigo-500"></div> Prototipo</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500"></div> Diseño</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-500"></div> Funcional</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#00c875]"></div> Terminado</div>
            </div>
        </div>
    );
};

export default GanttView;
