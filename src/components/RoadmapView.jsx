import React, { useState } from 'react';
import { Plus, MoreHorizontal, Zap, Target, DollarSign, LayoutGrid, Trash2, AlertCircle, Edit3, X, Check } from 'lucide-react';

const STATUS_COLORS = {
    "Done": "bg-[#00c875]/20 text-[#00c875] border-[#00c875]/30",
    "Working on it": "bg-[#fdab3d]/20 text-[#fdab3d] border-[#fdab3d]/30",
    "Stuck": "bg-[#e2445c]/20 text-[#e2445c] border-[#e2445c]/30",
    "Not Started": "bg-white/10 text-white/70 border-white/20",
    "Design Phase": "bg-[#579bfc]/20 text-[#579bfc] border-[#579bfc]/30",
    "Prototype": "bg-[#a25ddc]/20 text-[#a25ddc] border-[#a25ddc]/30",
    "Obsoleta": "bg-white/5 text-white/40 line-through border-white/10"
};

const STATUS_OPTIONS = ["Not Started", "Design Phase", "Prototype", "Working on it", "Stuck", "Done", "Obsoleta"];

const calculateFinancials = (effortMin, effortMax, impact, complexity, settings) => {
    const opexMin = effortMin * settings.costPerDay;
    const opexMax = effortMax * settings.costPerDay;
    const cogs = Math.round(settings.baseCogs * Math.pow(settings.cogsMultiplier, complexity));
    return { OPEX_MIN: opexMin, OPEX_MAX: opexMax, COGS: cogs };
};

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const RoadmapView = ({ roadmap, addIdea, updateFeatureStatus, deleteFeature, addVersion, editVersion, deleteVersion, settings, isAdmin }) => {
    const [newIdea, setNewIdea] = useState({ title: '', effortMin: 10, effortMax: 20, impact: 5, complexity: 5 });
    const [showAddVersion, setShowAddVersion] = useState(false);
    const [newVersion, setNewVersion] = useState({ name: '', color: '#3b82f6', limit: 100 });
    const [editingVersion, setEditingVersion] = useState(null); // vIdx being edited

    const handleAddIdea = () => {
        if (newIdea.title.trim() !== '') {
            addIdea(newIdea);
            setNewIdea({ title: '', effortMin: 10, effortMax: 20, impact: 5, complexity: 5 });
        }
    };

    const handleAddVersion = () => {
        if (newVersion.name.trim() !== '') {
            addVersion(newVersion.name, newVersion.color, parseInt(newVersion.limit) || 100);
            setNewVersion({ name: '', color: '#3b82f6', limit: 100 });
            setShowAddVersion(false);
        }
    };

    const toggleStatus = (vIdx, featureId, currentStatus) => {
        const nextIdx = (STATUS_OPTIONS.indexOf(currentStatus) + 1) % STATUS_OPTIONS.length;
        updateFeatureStatus(vIdx, featureId, STATUS_OPTIONS[nextIdx]);
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto font-sans bg-transparent min-h-[85vh]">
            <div className="mb-10 border-b border-slate-300 pb-8">
                <h1 className="text-4xl font-black mb-3 font-sans tracking-tight text-slate-900 drop-shadow-sm">Roadmap Financiero y Operativo</h1>
                <p className="text-slate-700 font-medium text-lg max-w-2xl leading-relaxed">Diseño matricial vertical equipado con el motor financiero. Organiza los módulos, visualiza costos y arrastra iniciativas comerciales a la realidad técnica.</p>
            </div>

            {/* Warning Message */}
            <div className="mb-8 p-4 bg-red-100 border-l-4 border-red-500 rounded-r-xl text-red-800 flex items-start gap-4">
                <AlertCircle className="shrink-0 mt-0.5 text-red-500" size={20} />
                <div className="text-xs font-bold leading-relaxed tracking-wide uppercase">
                    Asegúrate de saber lo que estás calculando, no pongas cosas a lo puro pendejo. Sueña poquito, sueña chiquito.
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
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

                    const isEditing = editingVersion === vIdx;

                    return (
                        <div key={column.id} className="flex flex-col bg-carbon-light backdrop-blur-sm border border-white/8 rounded-2xl shadow-xl overflow-hidden group">
                            {/* Accent Top Sub-line from Matrix view adapted */}
                            <div className="h-1.5 w-full opacity-80" style={{ backgroundColor: column.color }}></div>

                            {/* Column Header */}
                            <div className="p-5 bg-carbon-raised/40 border-b border-white/8 relative">
                                <div className="flex justify-between items-start mb-4">
                                    {isEditing ? (
                                        <div className="flex-1 space-y-3">
                                            <input
                                                type="text"
                                                defaultValue={column.name}
                                                className="w-full bg-carbon/80 border border-white/10 rounded-lg p-2 text-sm font-bold text-white focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue"
                                                id={`edit-name-${vIdx}`}
                                            />
                                            <div className="flex gap-2 items-center">
                                                <input type="color" defaultValue={column.color} className="w-10 h-10 cursor-pointer rounded-lg bg-transparent border border-white/10 p-1" id={`edit-color-${vIdx}`} />
                                                <input type="number" defaultValue={column.limit} className="flex-1 bg-carbon/80 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-accent-blue" id={`edit-limit-${vIdx}`} placeholder="Límite Días" />
                                            </div>
                                            <div className="flex justify-end gap-2 pt-1 border-t border-white/10">
                                                <button onClick={() => setEditingVersion(null)} className="text-xs text-bone/50 px-3 py-1.5 rounded hover:text-white hover:bg-white/10 transition-colors">
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const name = document.getElementById(`edit-name-${vIdx}`).value;
                                                        const color = document.getElementById(`edit-color-${vIdx}`).value;
                                                        const limit = parseInt(document.getElementById(`edit-limit-${vIdx}`).value) || 100;
                                                        editVersion(vIdx, { name, color, limit });
                                                        setEditingVersion(null);
                                                    }}
                                                    className="text-xs bg-accent-emerald text-white font-bold px-3 py-1.5 rounded flex items-center gap-1 hover:bg-emerald-500 transition-colors shadow-lg"
                                                >
                                                    <Check size={14} /> Confirmar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <h2 className="text-xl font-bold font-sans uppercase tracking-widest text-shadow" style={{ color: column.color }}>{column.name}</h2>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold bg-white/10 border border-white/10 text-white rounded-md px-2.5 py-1">
                                                    {column.features.length}
                                                </span>
                                                {isAdmin && (
                                                    <>
                                                        <button onClick={() => setEditingVersion(vIdx)} className="text-bone/40 hover:text-white hover:bg-white/10 p-1.5 rounded-md transition-colors" title="Editar versión">
                                                            <Edit3 size={14} />
                                                        </button>
                                                        {roadmap.length > 1 && (
                                                            <button onClick={() => deleteVersion(vIdx)} className="text-bone/40 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-md transition-colors" title="Eliminar versión">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                                {!isEditing && (
                                    <div className="text-xs text-bone/60 font-medium space-y-2 mt-4 bg-carbon-surface p-3 rounded-lg border border-white/8">
                                        <div className="flex justify-between items-center">
                                            <span className="uppercase tracking-wider text-[9px] font-bold">Total Est. OPEX:</span>
                                            <span className="font-bold font-mono text-accent-emerald text-[11px]">{formatCurrency(columnTotals.OPEX_MIN)} - {formatCurrency(columnTotals.OPEX_MAX)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="uppercase tracking-wider text-[9px] font-bold">Total Est. COGS/mo:</span>
                                            <span className="font-bold font-mono text-accent-purple text-[11px]">{formatCurrency(columnTotals.COGS)}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-white/10 mt-2">
                                            <span className="uppercase tracking-wider text-[9px] font-bold">Densidad / Capacidad:</span>
                                            <span className={`font-bold ${columnTotals.effortMax > column.limit ? 'text-red-400' : 'text-white'}`}>{columnTotals.effortMin}-{columnTotals.effortMax} / {column.limit} Días</span>
                                        </div>

                                        {/* Capacity bar */}
                                        <div className="w-full h-1.5 bg-black/50 rounded-full mt-2 overflow-hidden border border-white/5">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${columnTotals.effortMax > column.limit ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]'}`}
                                                style={{ width: `${Math.min((columnTotals.effortMax / column.limit) * 100, 100)}%`, backgroundColor: columnTotals.effortMax <= column.limit ? column.color : undefined }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Cards Container */}
                            <div className="flex-1 p-4 space-y-4 overflow-y-auto min-h-[500px] max-h-[800px] custom-scrollbar">
                                {column.features.map(feature => {
                                    const { OPEX_MIN, OPEX_MAX, COGS } = calculateFinancials(feature.effortMin, feature.effortMax, feature.impact, feature.complexity, settings);

                                    return (
                                        <div key={feature.id} className="bg-carbon-surface border border-white/8 rounded-xl p-5 shadow-lg relative group transition-all hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl flex flex-col">
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="font-bold text-white text-base flex-1 pr-3 leading-snug">
                                                    {feature.title}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-bone/50 bg-white/5 border border-white/5 px-2 py-1 rounded-md">
                                                        {feature.category}
                                                    </span>
                                                    {isAdmin && (
                                                        <button
                                                            onClick={() => deleteFeature(vIdx, feature.id)}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-bone/40 hover:text-red-400 bg-black/20 hover:bg-red-500/20 p-1.5 rounded-md"
                                                            title="Expulsar Entidad del Backlog"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Status Pill */}
                                            <div
                                                onClick={() => toggleStatus(vIdx, feature.id, feature.devStatus)}
                                                className={`w-full py-2 mb-4 text-center text-[11px] font-bold tracking-widest uppercase rounded-lg cursor-pointer select-none transition-all relative flex items-center justify-center border hover:brightness-110 shadow-sm ${STATUS_COLORS[feature.devStatus] || STATUS_COLORS["Not Started"]}`}
                                            >
                                                {feature.devStatus}
                                                <div className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreHorizontal size={16} />
                                                </div>
                                            </div>

                                            {/* Financial Details */}
                                            <div className={`grid grid-cols-2 gap-3 text-xs mt-auto ${feature.devStatus === 'Obsoleta' ? 'opacity-40 grayscale' : ''}`}>
                                                <div className="bg-white/5 border border-white/5 rounded-lg p-2.5 flex flex-col justify-between group-hover:bg-white/10 transition-colors" title="Rango de Esfuerzo Orgánico en Días">
                                                    <div className="flex items-center gap-1.5 mb-1.5">
                                                        <Zap size={14} className="text-amber-400/80" />
                                                        <span className="uppercase text-[9px] font-bold tracking-widest text-bone/40">Esfuerzo</span>
                                                    </div>
                                                    <div className="font-mono text-white/90 font-semibold">{feature.effortMin}-{feature.effortMax} <span className="text-[10px] uppercase font-sans tracking-wide text-bone/40">Días</span></div>
                                                </div>
                                                <div className="bg-white/5 border border-white/5 rounded-lg p-2.5 flex flex-col justify-between group-hover:bg-white/10 transition-colors" title="Valor Comercial vs Complejidad Técnica">
                                                    <div className="flex items-center gap-1.5 mb-1.5">
                                                        <Target size={14} className="text-accent-blue/80" />
                                                        <span className="uppercase text-[9px] font-bold tracking-widest text-bone/40">Retorno / Deuda</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-mono font-bold text-white">{feature.impact}</span> <span className="text-bone/30">/</span> <span className="font-mono font-bold text-white/50">{feature.complexity}</span>
                                                    </div>
                                                </div>
                                                <div className="bg-white/5 border border-white/5 rounded-lg p-3 col-span-2 group-hover:bg-white/10 transition-colors">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <div className="flex items-center gap-1.5" title="Estimación Rango OPEX">
                                                            <DollarSign size={13} className="text-accent-emerald" />
                                                            <span className="font-mono font-bold text-accent-emerald text-[11px]">{formatCurrency(OPEX_MIN)} - {formatCurrency(OPEX_MAX)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-right" title="Estimación COGS Promedio Mensual">
                                                            <span className="font-mono font-bold text-accent-purple text-[11px]">{formatCurrency(COGS)}</span>
                                                            <LayoutGrid size={13} className="text-accent-purple" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Add Idea Input - shown only on the last version */}
                                {vIdx === roadmap.length - 1 && (
                                    <div className="bg-carbon/60 backdrop-blur-md border border-dashed border-white/20 rounded-xl p-5 flex flex-col gap-4 focus-within:border-accent-blue transition-colors mt-2">
                                        <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                                            <div className="bg-white/5 p-1.5 rounded-lg">
                                                <Plus size={16} className="text-accent-blue" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Título de la Nueva Iniciativa..."
                                                className="bg-transparent border-none outline-none w-full text-white font-bold text-sm placeholder:font-normal placeholder:text-bone/40 focus:ring-0"
                                                value={newIdea.title}
                                                onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-[10px] uppercase font-bold tracking-widest text-bone/50">
                                            <div>
                                                <label className="block mb-1.5">Esfuerzo (Días)</label>
                                                <div className="flex gap-2">
                                                    <input type="number" placeholder="Min" value={newIdea.effortMin} onChange={(e) => setNewIdea({ ...newIdea, effortMin: parseInt(e.target.value) || 0 })} className="w-full bg-carbon border border-white/10 rounded-lg p-2 text-white font-mono focus:border-accent-blue focus:outline-none" />
                                                    <input type="number" placeholder="Max" value={newIdea.effortMax} onChange={(e) => setNewIdea({ ...newIdea, effortMax: parseInt(e.target.value) || 0 })} className="w-full bg-carbon border border-white/10 rounded-lg p-2 text-white font-mono focus:border-accent-blue focus:outline-none" />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center justify-between gap-2">
                                                    <label className="mb-0 flex-1">Impacto (1-10)</label>
                                                    <input type="number" min="1" max="10" value={newIdea.impact} onChange={(e) => setNewIdea({ ...newIdea, impact: parseInt(e.target.value) || 1 })} className="w-14 bg-carbon border border-white/10 rounded-lg p-1.5 text-center text-white font-mono focus:border-accent-emerald focus:outline-none" />
                                                </div>
                                                <div className="flex items-center justify-between gap-2">
                                                    <label className="mb-0 flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Deuda Cx (1-10)</label>
                                                    <input type="number" min="1" max="10" value={newIdea.complexity} onChange={(e) => setNewIdea({ ...newIdea, complexity: parseInt(e.target.value) || 1 })} className="w-14 bg-carbon border border-white/10 rounded-lg p-1.5 text-center text-white font-mono focus:border-red-500 focus:outline-none" />
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={handleAddIdea} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 rounded-lg text-white font-bold text-xs uppercase tracking-widest mt-2 transition-all flex items-center justify-center gap-2">
                                            Añadir al Backlog <MoreHorizontal size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Add Version Button Column */}
                {isAdmin && (
                    <div className="flex flex-col h-full min-h-[400px]">
                        {showAddVersion ? (
                            <div className="bg-carbon-light/40 backdrop-blur-sm border border-white/5 rounded-2xl p-6 shadow-xl space-y-5 flex flex-col mt-0 h-full">
                                <h3 className="font-bold text-base font-sans uppercase tracking-widest text-white border-b border-white/10 pb-4 flex items-center gap-2">
                                    <Plus size={18} className="text-accent-blue" /> Desplegar Bucket
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-bone/50 mb-2">Identificador Versión</label>
                                        <input
                                            type="text"
                                            placeholder="Ej: v3.0: Refactoring Core"
                                            value={newVersion.name}
                                            onChange={(e) => setNewVersion({ ...newVersion, name: e.target.value })}
                                            className="w-full bg-carbon border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-bone/50 mb-2">Aura (Color)</label>
                                            <div className="p-1 border border-white/10 rounded-lg bg-carbon w-[52px] h-[52px]">
                                                <input
                                                    type="color"
                                                    value={newVersion.color}
                                                    onChange={(e) => setNewVersion({ ...newVersion, color: e.target.value })}
                                                    className="w-full h-full cursor-pointer rounded bg-transparent border-0"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-bone/50 mb-2">Capacidad Orgánica (Días)</label>
                                            <input
                                                type="number"
                                                value={newVersion.limit}
                                                onChange={(e) => setNewVersion({ ...newVersion, limit: e.target.value })}
                                                className="w-full bg-carbon border border-white/10 rounded-lg p-3 font-mono text-white focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
                                                min="1"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 mt-auto pt-6">
                                    <button onClick={handleAddVersion} className="w-full py-3.5 bg-accent-blue text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-accent-blue/80 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] border border-accent-blue/50">
                                        Crear Instancia
                                    </button>
                                    <button onClick={() => setShowAddVersion(false)} className="w-full py-3 text-bone/50 font-bold text-xs uppercase tracking-widest hover:text-white hover:bg-white/5 rounded-lg border border-transparent transition-all">
                                        Abortar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div
                                onClick={() => setShowAddVersion(true)}
                                className="bg-transparent border-2 border-dashed border-white/10 rounded-2xl flex-1 flex flex-col items-center justify-center gap-4 text-bone/30 hover:text-white hover:border-accent-blue/50 hover:bg-white/5 transition-all cursor-pointer group"
                            >
                                <div className="p-4 bg-white/5 rounded-full group-hover:bg-accent-blue/20 group-hover:scale-110 transition-all">
                                    <Plus size={36} className="group-hover:text-accent-blue transition-colors" />
                                </div>
                                <div className="text-center px-6">
                                    <span className="block text-sm font-bold uppercase tracking-widest text-white mb-2">Instanciar Bucket</span>
                                    <span className="text-xs">Extender ciclo de desarrollo agregando nuevas versiones al pipeline.</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoadmapView;
