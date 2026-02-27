import React, { useState } from 'react';
import { Plus, MoreHorizontal, Zap, Target, DollarSign, LayoutGrid } from 'lucide-react';

const STATUS_COLORS = {
    "Done": "bg-[#00c875] text-white hover:bg-[#00b368]",
    "Working on it": "bg-[#fdab3d] text-white hover:bg-[#e99d38]",
    "Stuck": "bg-[#e2445c] text-white hover:bg-[#d13b52]",
    "Not Started": "bg-[#c4c4c4] text-white hover:bg-[#b5b5b5]",
    "Obsoleta": "bg-[#333333] text-stone-light hover:bg-[#1a1a1a] line-through"
};

const STATUS_OPTIONS = ["Not Started", "Working on it", "Stuck", "Done", "Obsoleta"];

const calculateFinancials = (effortMin, effortMax, impact, complexity, settings) => {
    const opexMin = effortMin * settings.costPerDay;
    const opexMax = effortMax * settings.costPerDay;
    const cogs = Math.round(settings.baseCogs * Math.pow(settings.cogsMultiplier, complexity));
    return { OPEX_MIN: opexMin, OPEX_MAX: opexMax, COGS: cogs };
};

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const RoadmapView = ({ roadmap, addIdea, updateFeatureStatus, settings }) => {
    const [newIdea, setNewIdea] = useState({ title: '', effortMin: 10, effortMax: 20, impact: 5, complexity: 5 });

    const handleAddIdea = () => {
        if (newIdea.title.trim() !== '') {
            addIdea(newIdea);
            setNewIdea({ title: '', effortMin: 10, effortMax: 20, impact: 5, complexity: 5 });
        }
    };

    const toggleStatus = (vIdx, featureId, currentStatus) => {
        const nextIdx = (STATUS_OPTIONS.indexOf(currentStatus) + 1) % STATUS_OPTIONS.length;
        updateFeatureStatus(vIdx, featureId, STATUS_OPTIONS[nextIdx]);
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans bg-bone text-carbon">
            <div className="mb-8 border-b border-stone-light pb-6">
                <h1 className="text-3xl font-bold mb-2 font-serif tracking-tight">Roadmap Financiero y Operativo</h1>
                <p className="text-stone text-sm">Diseño matricial vertical equipado con el motor financiero y la paleta de Monday.com</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {roadmap.map((column, vIdx) => {
                    const columnTotals = column.features.reduce((acc, f) => {
                        const { OPEX_MIN, OPEX_MAX, COGS } = calculateFinancials(f.effortMin, f.effortMax, f.impact, f.complexity, settings);
                        return {
                            OPEX_MIN: acc.OPEX_MIN + OPEX_MIN,
                            OPEX_MAX: acc.OPEX_MAX + OPEX_MAX,
                            COGS: acc.COGS + COGS,
                            effortMin: acc.effortMin + f.effortMin,
                            effortMax: acc.effortMax + f.effortMax
                        };
                    }, { OPEX_MIN: 0, OPEX_MAX: 0, COGS: 0, effortMin: 0, effortMax: 0 });

                    return (
                        <div key={column.id} className="flex flex-col bg-bone-alt border border-stone-light shadow-sm">
                            {/* Column Header */}
                            <div className="p-4 bg-bone border-b border-stone-light border-t-4" style={{ borderTopColor: column.color }}>
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-xl font-bold font-serif uppercase tracking-widest" style={{ color: column.color }}>{column.name}</h2>
                                    <span className="text-xs font-bold bg-bone-alt text-stone px-2 py-1">{column.features.length}</span>
                                </div>
                                <div className="text-xs text-stone font-medium space-y-1 mt-3">
                                    <div className="flex justify-between">
                                        <span>Total OPEX:</span>
                                        <span className="font-bold text-red-600">{formatCurrency(columnTotals.OPEX_MIN)} - {formatCurrency(columnTotals.OPEX_MAX)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Est. COGS/mo:</span>
                                        <span className="font-bold text-indigo-600">{formatCurrency(columnTotals.COGS)}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-stone-light pt-2 mt-2">
                                        <span>Esfuerzo Técnico:</span>
                                        <span className="font-bold text-carbon">{columnTotals.effortMin}-{columnTotals.effortMax} / {column.limit} Días</span>
                                    </div>
                                </div>

                                {/* Barra de capacidad */}
                                <div className="w-full h-1.5 bg-bone mt-3 overflow-hidden">
                                    <div
                                        className={`h-full ${columnTotals.effortMax > column.limit ? 'bg-red-600' : 'bg-carbon'}`}
                                        style={{ width: `${Math.min((columnTotals.effortMax / column.limit) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Cards Container */}
                            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                                {column.features.map(feature => {
                                    const { OPEX_MIN, OPEX_MAX, COGS } = calculateFinancials(feature.effortMin, feature.effortMax, feature.impact, feature.complexity, settings);

                                    return (
                                        <div key={feature.id} className="bg-bone p-4 border border-stone-light hover:border-carbon transition-colors group relative shadow-sm">

                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="font-bold text-carbon text-sm flex-1 pr-2 leading-tight">
                                                    {feature.title}
                                                </h3>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-stone bg-bone-alt px-2 py-1">
                                                    {feature.category}
                                                </span>
                                            </div>

                                            {/* Status Pill interactiva */}
                                            <div
                                                onClick={() => toggleStatus(vIdx, feature.id, feature.devStatus)}
                                                className={`w-full py-1.5 text-center text-xs font-bold rounded cursor-pointer select-none transition-colors relative flex items-center justify-center ${STATUS_COLORS[feature.devStatus]} mb-4`}
                                            >
                                                {feature.devStatus}
                                                <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreHorizontal size={14} />
                                                </div>
                                            </div>

                                            {/* Separador */}
                                            <div className="h-px bg-stone-light w-full mb-3"></div>

                                            {/* Financial & Technical Details */}
                                            <div className="grid grid-cols-2 gap-y-3 text-xs">
                                                <div className="flex flex-col gap-1 text-stone" title="Rango de Esfuerzo Orgánico en Días">
                                                    <span className="uppercase text-[9px] font-bold tracking-wider">Esfuerzo (Días)</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <Zap size={14} className="text-stone" />
                                                        <span className="font-semibold text-carbon">{feature.effortMin} - {feature.effortMax}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1 text-stone items-end" title="Valor Comercial vs Complejidad Técnica">
                                                    <span className="uppercase text-[9px] font-bold tracking-wider">Valor / Compl.</span>
                                                    <div className="flex items-center gap-1.5 ">
                                                        <Target size={14} className="text-stone" />
                                                        <span className="font-semibold text-carbon">{feature.impact}</span> / <span className="font-semibold text-stone">{feature.complexity}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1 text-stone" title="Rango de Estimación OPEX">
                                                    <span className="uppercase text-[9px] font-bold tracking-wider">OPEX</span>
                                                    <div className="flex items-center gap-1">
                                                        <DollarSign size={14} className="text-red-600" />
                                                        <span className="font-mono font-bold text-red-600">{formatCurrency(OPEX_MIN)} - {formatCurrency(OPEX_MAX)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1 text-stone items-end" title="Estimación COGS Mensual Basada en Complejidad">
                                                    <span className="uppercase text-[9px] font-bold tracking-wider">COGS / mo</span>
                                                    <div className="flex items-center gap-1">
                                                        <LayoutGrid size={13} className="text-indigo-600" />
                                                        <span className="font-mono font-bold text-indigo-600">{formatCurrency(COGS)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Add Idea Input */}
                                {vIdx === roadmap.length - 1 && (
                                    <div className="bg-bone p-4 border border-dashed border-stone-light flex flex-col gap-3 focus-within:border-carbon transition-colors">
                                        <div className="flex items-center gap-2 border-b border-stone-light pb-2">
                                            <Plus size={16} className="text-stone" />
                                            <input
                                                type="text"
                                                placeholder="Título de la nueva Idea..."
                                                className="bg-transparent border-none outline-none w-full text-carbon font-bold text-sm placeholder:font-normal"
                                                value={newIdea.title}
                                                onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-[10px] uppercase font-bold tracking-wider text-stone">
                                            <div>
                                                <label className="block mb-1">Días Mín</label>
                                                <input type="number" value={newIdea.effortMin} onChange={(e) => setNewIdea({ ...newIdea, effortMin: parseInt(e.target.value) || 0 })} className="w-full bg-white border border-stone-light p-1 text-carbon" />
                                            </div>
                                            <div>
                                                <label className="block mb-1">Días Máx</label>
                                                <input type="number" value={newIdea.effortMax} onChange={(e) => setNewIdea({ ...newIdea, effortMax: parseInt(e.target.value) || 0 })} className="w-full bg-white border border-stone-light p-1 text-carbon" />
                                            </div>
                                            <div>
                                                <label className="block mb-1">Valor Comercial (1-10)</label>
                                                <input type="number" min="1" max="10" value={newIdea.impact} onChange={(e) => setNewIdea({ ...newIdea, impact: parseInt(e.target.value) || 1 })} className="w-full bg-white border border-stone-light p-1 text-carbon" />
                                            </div>
                                            <div>
                                                <label className="block mb-1">Dificultad Arquitectónica (1-10)</label>
                                                <input type="number" min="1" max="10" value={newIdea.complexity} onChange={(e) => setNewIdea({ ...newIdea, complexity: parseInt(e.target.value) || 1 })} className="w-full bg-white border border-stone-light p-1 text-carbon" />
                                            </div>
                                        </div>
                                        <button onClick={handleAddIdea} className="w-full py-2 bg-stone-light text-carbon font-bold text-xs hover:bg-carbon hover:text-white transition-colors uppercase tracking-widest mt-2">
                                            Añadir al Backlog
                                        </button>
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

export default RoadmapView;
