import React, { useState } from 'react';
import { Target, Zap, LayoutGrid, DollarSign, Columns3 } from 'lucide-react';

const KANBAN_STAGES = ["Not Started", "Design Phase", "Prototype", "Working on it", "Stuck", "Done", "Obsoleta"];

const STAGE_STYLES = {
    "Not Started": { border: "from-white/20 to-white/5", text: "text-white/70" },
    "Design Phase": { border: "from-[#579bfc] to-blue-900", text: "text-[#579bfc]" },
    "Prototype": { border: "from-[#a25ddc] to-purple-900", text: "text-[#a25ddc]" },
    "Working on it": { border: "from-[#fdab3d] to-orange-900", text: "text-[#fdab3d]" },
    "Stuck": { border: "from-[#e2445c] to-red-900", text: "text-[#e2445c]" },
    "Done": { border: "from-[#00c875] to-emerald-900", text: "text-[#00c875]" },
    "Obsoleta": { border: "from-white/20 to-transparent", text: "text-white/40 line-through" }
};

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const calculateFinancials = (effortMin, effortMax, impact, complexity, settings) => {
    const opexMin = effortMin * settings.costPerDay;
    const opexMax = effortMax * settings.costPerDay;
    const cogs = Math.round(settings.baseCogs * Math.pow(settings.cogsMultiplier, complexity));
    return { OPEX_MIN: opexMin, OPEX_MAX: opexMax, COGS: cogs };
};

const KanbanView = ({ roadmap, updateFeatureStatus, settings }) => {
    const [draggedItem, setDraggedItem] = useState(null);

    const allFeatures = roadmap.reduce((acc, column, vIdx) => {
        const enrichedFeatures = column.features.map(f => ({ ...f, vIdx }));
        return [...acc, ...enrichedFeatures];
    }, []);

    const handleDragStart = (e, featureId, currentVIdx) => {
        setDraggedItem({ featureId, currentVIdx });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, targetStatus) => {
        e.preventDefault();
        if (draggedItem) {
            updateFeatureStatus(draggedItem.currentVIdx, draggedItem.featureId, targetStatus);
            setDraggedItem(null);
        }
    };

    const getFeaturesByStatus = (status) => {
        return allFeatures.filter(f => f.devStatus === status);
    };

    return (
        <div className="bg-transparent p-6 md:p-10 min-h-[85vh] font-sans">
            <div className="max-w-screen-2xl mx-auto mb-10 border-b border-slate-300 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-sans font-bold tracking-tight mb-3 flex items-center gap-4 text-slate-900 drop-shadow-sm">
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 shadow-xl">
                            <Columns3 className="text-accent-purple" size={32} />
                        </div>
                        Kanban Táctico
                    </h1>
                    <p className="text-slate-700 font-medium text-lg max-w-2xl leading-relaxed">
                        Flujo de trabajo ágil para el equipo técnico. Arrastre las tarjetas entre las fases para actualizar el progreso general y la visibilidad a ejecutivos.
                    </p>
                </div>
            </div>

            <div className="max-w-screen-2xl mx-auto flex gap-6 overflow-x-auto pb-8 snap-x custom-scrollbar">
                {KANBAN_STAGES.map((stage) => {
                    const features = getFeaturesByStatus(stage);
                    const style = STAGE_STYLES[stage] || STAGE_STYLES["Not Started"];

                    return (
                        <div
                            key={stage}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, stage)}
                            className="bg-carbon-light border border-white/8 rounded-2xl flex flex-col min-w-[260px] max-w-[300px] flex-shrink-0 snap-start h-[calc(100vh-220px)] shadow-xl relative overflow-hidden group transition-all"
                        >
                            {/* Accent Top Sub-line */}
                            <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${style.border} opacity-90`}></div>

                            {/* Column Header */}
                            <div className="p-5 bg-carbon-raised/40 border-b border-white/8 relative flex justify-between items-center">
                                <h2 className={`font-bold uppercase tracking-widest text-sm text-shadow ${style.text}`}>{stage}</h2>
                                <span className="text-xs font-bold bg-white/10 border border-white/10 text-white rounded-md px-2.5 py-1">
                                    {features.length}
                                </span>
                            </div>

                            {/* Cards Container */}
                            <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar bg-transparent">
                                {features.map(feature => {
                                    const { OPEX_MIN, OPEX_MAX, COGS } = calculateFinancials(feature.effortMin, feature.effortMax, feature.impact, feature.complexity, settings);

                                    return (
                                        <div
                                            key={feature.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, feature.id, feature.vIdx)}
                                            className={`bg-carbon-surface border border-white/8 rounded-xl p-5 shadow-lg cursor-grab active:cursor-grabbing hover:border-white/20 transition-all group relative hover:-translate-y-1 hover:shadow-xl flex flex-col ${stage === 'Obsoleta' ? 'opacity-50 grayscale' : ''}`}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="text-[9px] text-bone/50 font-bold uppercase tracking-widest bg-white/5 border border-white/5 px-2 py-1 rounded-md">
                                                    {feature.category}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-sm text-white leading-snug mb-4">{feature.title}</h3>

                                            <div className="grid grid-cols-2 gap-3 text-[10px] mt-auto">
                                                <div className="bg-white/5 border border-white/5 rounded-lg p-2.5 flex flex-col gap-1 group-hover:bg-white/10 transition-colors" title="Esfuerzo Orgánico en Días">
                                                    <span className="uppercase text-[8px] font-bold tracking-widest text-bone/40">Esfuerzo</span>
                                                    <div className="flex items-center gap-1.5 text-white">
                                                        <Zap size={11} className="text-amber-400/80" />
                                                        <span className="font-mono font-semibold">{feature.effortMin}-{feature.effortMax}</span>
                                                    </div>
                                                </div>
                                                <div className="bg-white/5 border border-white/5 rounded-lg p-2.5 flex flex-col gap-1 group-hover:bg-white/10 transition-colors" title="Valor Comercial / Complejidad Técnica">
                                                    <span className="uppercase text-[8px] font-bold tracking-widest text-bone/40">Ret/Deuda</span>
                                                    <div className="flex items-center gap-1.5 text-white">
                                                        <Target size={11} className="text-accent-blue/80" />
                                                        <span><span className="font-mono font-bold">{feature.impact}</span>/<span className="font-mono text-bone/50 font-bold">{feature.complexity}</span></span>
                                                    </div>
                                                </div>
                                                <div className="bg-white/5 border border-white/5 rounded-lg p-2.5 flex flex-col gap-1 group-hover:bg-white/10 transition-colors" title="Estimación Rango OPEX">
                                                    <span className="uppercase text-[8px] font-bold tracking-widest text-bone/40 text-accent-emerald">OPEX Est.</span>
                                                    <div className="flex items-center gap-1 text-accent-emerald">
                                                        <DollarSign size={11} />
                                                        <span className="font-mono font-bold text-[10px]">{formatCurrency(OPEX_MIN)}</span>
                                                    </div>
                                                </div>
                                                <div className="bg-white/5 border border-white/5 rounded-lg p-2.5 flex flex-col gap-1 group-hover:bg-white/10 transition-colors" title="Estimación COGS Mensual">
                                                    <span className="uppercase text-[8px] font-bold tracking-widest text-bone/40 text-accent-purple">COGS / mo</span>
                                                    <div className="flex items-center gap-1 text-accent-purple">
                                                        <LayoutGrid size={11} />
                                                        <span className="font-mono font-bold text-[10px]">{formatCurrency(COGS)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {features.length === 0 && (
                                    <div className="h-full flex items-center justify-center p-6 text-center border-2 border-dashed border-white/10 rounded-xl text-bone/30 text-xs font-bold uppercase tracking-widest hover:bg-white/5 hover:border-white/20 transition-all group min-h-[150px]">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity -translate-y-2 group-hover:translate-y-0 text-white">
                                            Soltar Entrada Aquí
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default KanbanView;
