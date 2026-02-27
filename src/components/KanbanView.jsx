import React, { useState } from 'react';
import { Target, Zap, LayoutGrid, DollarSign } from 'lucide-react';

const KANBAN_STAGES = ["No Empezado", "Prototipo", "Diseño", "Funcional", "Terminado"];

const STAGE_COLORS = {
    "No Empezado": "border-t-stone text-stone",
    "Prototipo": "border-t-indigo-500 text-indigo-700",
    "Diseño": "border-t-blue-500 text-blue-700",
    "Funcional": "border-t-orange-500 text-orange-700",
    "Terminado": "border-t-[#00c875] text-[#00c875]"
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

    // Flatten all features from the roadmap versions
    const allFeatures = roadmap.reduce((acc, column) => {
        const enrichedFeatures = column.features.map(f => ({ ...f, vIdx: roadmap.indexOf(column) }));
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
        <div className="bg-bone text-carbon p-4 md:p-8 min-h-full font-sans">
            <div className="max-w-[1400px] mx-auto mb-10 border-b border-stone-light pb-6">
                <h1 className="text-4xl font-serif font-bold tracking-tight mb-2">Kanban de Ejecución Operativa</h1>
                <p className="text-stone text-lg max-w-2xl">
                    Flujo de trabajo diario para el equipo técnico. Arrastre las tarjetas entre las fases para actualizar el progreso general del proyecto.
                </p>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-4 max-w-[1400px] mx-auto snap-x">
                {KANBAN_STAGES.map((stage) => {
                    const features = getFeaturesByStatus(stage);
                    return (
                        <div
                            key={stage}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, stage)}
                            className="bg-bone-alt border border-stone-light shadow-sm flex flex-col min-w-[320px] max-w-[350px] flex-shrink-0 snap-start h-[calc(100vh-280px)]"
                        >
                            {/* Column Header */}
                            <div className={`p-4 bg-bone border-b border-stone-light border-t-4 ${STAGE_COLORS[stage].split(' ')[0]}`}>
                                <div className="flex justify-between items-center">
                                    <h2 className={`font-bold uppercase tracking-widest text-sm ${STAGE_COLORS[stage].split(' ')[1]}`}>{stage}</h2>
                                    <span className="text-xs font-bold bg-bone-alt text-stone px-2 py-1 border border-stone-light">{features.length}</span>
                                </div>
                            </div>

                            {/* Cards Container */}
                            <div className="flex-1 p-3 space-y-3 overflow-y-auto bg-stone-100/30">
                                {features.map(feature => {
                                    const { OPEX_MIN, OPEX_MAX, COGS } = calculateFinancials(feature.effortMin, feature.effortMax, feature.impact, feature.complexity, settings);

                                    return (
                                        <div
                                            key={feature.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, feature.id, feature.vIdx)}
                                            className="bg-white p-4 border border-stone-light shadow-sm cursor-grab active:cursor-grabbing hover:border-carbon transition-colors group relative"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] text-stone font-bold uppercase tracking-wider bg-bone px-2 py-1">
                                                    {feature.category}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-sm text-carbon leading-snug">{feature.title}</h3>

                                            <div className="mt-4 grid grid-cols-2 gap-y-3 text-xs border-t border-stone-light/50 pt-3">
                                                <div className="flex flex-col gap-1 text-stone" title="Rango de Esfuerzo">
                                                    <span className="uppercase text-[9px] font-bold tracking-wider">Esfuerzo</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <Zap size={14} className="text-stone" />
                                                        <span className="font-semibold text-carbon">{feature.effortMin}-{feature.effortMax} d</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1 text-stone items-end" title="Valor / Compl.">
                                                    <span className="uppercase text-[9px] font-bold tracking-wider">Impacto/Comp</span>
                                                    <div className="flex items-center gap-1.5 ">
                                                        <Target size={14} className="text-stone" />
                                                        <span className="font-semibold text-carbon">{feature.impact}</span> / <span className="font-semibold text-stone">{feature.complexity}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1 text-stone" title="OPEX Rango">
                                                    <div className="flex items-center gap-1">
                                                        <span className="uppercase text-[9px] font-bold tracking-wider text-red-600">OPEX</span>
                                                    </div>
                                                    <span className="font-mono font-bold text-red-600 text-[10px]">{formatCurrency(OPEX_MIN)} - {formatCurrency(OPEX_MAX)}</span>
                                                </div>
                                                <div className="flex flex-col gap-1 text-stone items-end" title="COGS Mensual">
                                                    <span className="uppercase text-[9px] font-bold tracking-wider text-indigo-600">COGS/mo</span>
                                                    <span className="font-mono font-bold text-indigo-600">{formatCurrency(COGS)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {features.length === 0 && (
                                    <div className="h-full flex items-center justify-center p-6 text-center border-2 border-dashed border-stone-light text-stone text-sm">
                                        Arrastre tarjetas aquí
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
