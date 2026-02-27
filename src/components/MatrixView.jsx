import React, { useState } from 'react';
import {
    Plus,
    ChevronRight,
    Target,
    Zap,
    AlertCircle,
    Shield,
    Clock,
    TrendingUp,
    Trash2,
    LayoutGrid
} from 'lucide-react';

const STATUS_COLORS = {
    "Done": "bg-[#00c875]/20 text-[#00c875] border-[#00c875]/30",
    "Working on it": "bg-[#fdab3d]/20 text-[#fdab3d] border-[#fdab3d]/30",
    "Stuck": "bg-[#e2445c]/20 text-[#e2445c] border-[#e2445c]/30",
    "Not Started": "bg-white/10 text-white/70 border-white/20",
    "Design Phase": "bg-[#579bfc]/20 text-[#579bfc] border-[#579bfc]/30",
    "Prototype": "bg-[#a25ddc]/20 text-[#a25ddc] border-[#a25ddc]/30",
    "Obsoleta": "bg-white/5 text-white/40 line-through border-white/10"
};

const STATUS_OPTIONS = ["Not Started", "Working on it", "Stuck", "Done", "Obsoleta"];

const calculateFinancials = (effortMin, effortMax, impact, complexity, settings) => {
    const opexMin = effortMin * settings.costPerDay;
    const opexMax = effortMax * settings.costPerDay;
    const cogs = Math.round(settings.baseCogs * Math.pow(settings.cogsMultiplier, complexity));
    return { OPEX_MIN: opexMin, OPEX_MAX: opexMax, COGS: cogs };
};

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const MatrixView = ({ roadmap, moveFeature, addIdea: propAddIdea, deleteFeature, settings, isAdmin }) => {
    const [draggedItem, setDraggedItem] = useState(null);
    const [showIdeaModal, setShowIdeaModal] = useState(false);
    const [newIdea, setNewIdea] = useState({ title: '', impact: 5, complexity: 5, effortMin: 10, effortMax: 20 });

    const calculateTotalEffort = (versionIndex) => {
        return roadmap[versionIndex].features.reduce((acc, f) => acc + f.effortMin, 0); // Using effortMin for total
    };

    const handleDragStart = (e, vIdx, featureId) => {
        setDraggedItem({ vIdx, featureId });
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // Necessary to allow dropping
    };

    const handleDrop = (e, targetVIdx) => {
        e.preventDefault();
        if (draggedItem) {
            moveFeature(draggedItem.vIdx, draggedItem.featureId, targetVIdx);
            setDraggedItem(null);
        }
    };

    const addIdea = () => {
        if (!newIdea.title) return;
        propAddIdea(newIdea);
        setShowIdeaModal(false);
        setNewIdea({ title: '', impact: 5, complexity: 5, effortMin: 10, effortMax: 20 });
    };

    return (
        <div className="bg-transparent p-6 md:p-10 font-sans min-h-[85vh]">
            {/* Header Estilo Negocios */}
            <div className="max-w-7xl mx-auto mb-12 border-b border-slate-300 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-sans font-bold tracking-tight mb-3 flex items-center gap-4 text-slate-900 drop-shadow-sm">
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 shadow-xl">
                            <LayoutGrid className="text-accent-blue" size={32} />
                        </div>
                        Matriz Ejecutiva
                    </h1>
                    <p className="text-slate-700 font-medium text-lg max-w-2xl leading-relaxed">
                        Sistema de contención estratégica para la transición de la visión comercial a la realidad técnica.
                        Priorice el valor sin comprometer la integridad estructural.
                    </p>
                </div>
                <button
                    onClick={() => setShowIdeaModal(true)}
                    className="bg-accent-blue text-white px-6 py-3 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] flex items-center gap-2 hover:bg-accent-blue/90 transition-all font-semibold uppercase tracking-wider text-sm"
                >
                    <Plus size={20} /> Nueva Iniciativa
                </button>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {roadmap.map((version, vIdx) => {
                    const totalEffort = calculateTotalEffort(vIdx);
                    const isOverloaded = totalEffort > version.limit;

                    // Compute dynamic top border style based on version index or overloaded status
                    let topBorderStyle = 'from-stone to-stone/50';
                    if (vIdx === 0) topBorderStyle = isOverloaded ? 'from-red-600 to-red-800' : 'from-accent-emerald to-emerald-800';
                    else if (vIdx === 1) topBorderStyle = 'from-accent-purple to-purple-800';
                    else if (vIdx === 2) topBorderStyle = 'from-accent-blue to-blue-800';

                    return (
                        <div
                            key={version.id}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, vIdx)}
                            className="bg-carbon-light border border-white/8 rounded-2xl p-6 relative overflow-hidden flex flex-col transition-all"
                        >
                            {/* Accent Top Border */}
                            <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${topBorderStyle} opacity-90`}></div>

                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-xl font-bold font-sans uppercase tracking-widest text-white mb-2">{version.name}</h2>
                                    <span className={`text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-wider border ${vIdx === 0 ? (isOverloaded ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30') : 'bg-white/5 text-bone/60 border-white/10'
                                        }`}>
                                        {version.status || (vIdx === 0 ? "Activa" : "Planificada")}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className={`text-sm font-semibold ${isOverloaded ? 'text-red-400' : 'text-bone/60'}`}>
                                        Capacidad: <span className={isOverloaded ? "font-bold" : "text-white"}>{totalEffort}</span> / {version.limit}
                                    </div>
                                    <div className="w-24 h-2 bg-black/40 rounded-full mt-2 overflow-hidden border border-white/5 float-right">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${isOverloaded ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : (vIdx === 0 ? 'bg-accent-emerald shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-accent-blue shadow-[0_0_10px_rgba(59,130,246,0.5)]')}`}
                                            style={{ width: `${Math.min((totalEffort / version.limit) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-bone/50 mb-6 italic leading-relaxed min-h-[40px]">
                                {version.description || "Iteración del plan de producto. Arrastre elementos aquí para ajustar su alcance."}
                            </p>

                            <div className="flex-grow space-y-4">
                                {version.features.map(feature => (
                                    <div
                                        key={feature.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, vIdx, feature.id)}
                                        className={`bg-carbon-surface border border-white/8 rounded-xl p-5 shadow-lg relative cursor-grab active:cursor-grabbing hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-2xl group ${feature.devStatus === 'Done' ? 'border-l-4 border-l-[#00c875]' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded border ${STATUS_COLORS[feature.devStatus]}`}>
                                                {feature.devStatus}
                                            </span>
                                            <span className="text-[10px] text-bone/50 font-bold uppercase tracking-widest bg-white/5 border border-white/5 px-2 py-1 rounded flex items-center gap-1">
                                                {feature.category}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-white text-lg leading-tight mb-4">{feature.title}</h3>

                                        <div className={`grid grid-cols-2 gap-3 text-xs ${feature.devStatus === 'Obsoleta' ? 'opacity-40 grayscale' : ''}`}>
                                            <div className="bg-carbon-raised/60 rounded-lg p-2.5 flex items-center gap-2 text-bone/70 border border-white/5" title="Rango de Esfuerzo Orgánico">
                                                <Zap size={14} className="text-amber-400" />
                                                <span className="font-mono text-white font-semibold">{feature.effortMin}-{feature.effortMax}</span> <span className="text-[10px] uppercase">Días</span>
                                            </div>
                                            <div className="bg-carbon-raised/60 rounded-lg p-2.5 flex items-center gap-2 text-bone/70 border border-white/5" title="Valor Comercial / Complejidad">
                                                <Target size={14} className="text-accent-purple" />
                                                <span><span className="text-white font-semibold">{feature.impact}</span> / <span className="text-white font-semibold">{feature.complexity}</span></span>
                                            </div>
                                            <div className="bg-carbon-raised/60 rounded-lg p-2.5 flex items-center gap-2 text-bone/70 border border-white/5 col-span-2" title="Impacto Financiero Diario Estimado">
                                                <div className="flex items-center w-full justify-between">
                                                    <div className="flex items-center gap-2 text-accent-emerald font-mono font-bold">
                                                        <span className="text-[10px] uppercase text-bone/50 font-sans tracking-widest mr-1">OPEX:</span>
                                                        {formatCurrency(calculateFinancials(feature.effortMin, feature.effortMax, feature.impact, feature.complexity, settings).OPEX_MIN)}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-accent-purple font-mono font-bold">
                                                        <span className="text-[10px] uppercase text-bone/50 font-sans tracking-widest mr-1">COGS:</span>
                                                        {formatCurrency(calculateFinancials(feature.effortMin, feature.effortMax, feature.impact, feature.complexity, settings).COGS)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-carbon/90 backdrop-blur-sm p-1 rounded-lg border border-white/10 shadow-xl z-10">
                                            {vIdx > 0 && (
                                                <button
                                                    onClick={() => moveFeature(vIdx, feature.id, vIdx - 1)}
                                                    className="p-1.5 text-bone/50 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                                                    title="Adelantar Prioridad"
                                                >
                                                    <ChevronRight size={14} className="rotate-180" />
                                                </button>
                                            )}
                                            {vIdx < roadmap.length - 1 && (
                                                <button
                                                    onClick={() => moveFeature(vIdx, feature.id, vIdx + 1)}
                                                    className="p-1.5 text-bone/50 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                                                    title="Postergar Módulo"
                                                >
                                                    <ChevronRight size={14} />
                                                </button>
                                            )}
                                            {isAdmin && (
                                                <button
                                                    onClick={() => deleteFeature(vIdx, feature.id)}
                                                    className="p-1.5 text-bone/50 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors ml-1"
                                                    title="Eliminar Entidad"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {isOverloaded && vIdx === 0 && (
                                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                                    <AlertCircle size={18} className="shrink-0" />
                                    <span>Alerta Contención: Exceso de Features</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Modal para "Visiones" del CEO */}
            {showIdeaModal && (
                <div className="fixed inset-0 bg-carbon/80 backdrop-blur-xl flex items-center justify-center p-4 z-[60]">
                    <div className="glass-panel p-8 max-w-lg w-full rounded-2xl relative shadow-2xl border-t-4 border-accent-blue">
                        <h2 className="text-2xl font-sans font-bold mb-2 text-white text-glow">Nueva Iniciativa</h2>
                        <p className="text-sm text-bone/60 mb-6 leading-relaxed">
                            Registre la iniciativa y se asignará automáticamente al final del backlog. Su impacto real se tasará contra la infraestructura.
                        </p>

                        <div className="mb-8 p-4 bg-red-500/10 border-l-4 border-red-500 rounded-r-xl flex items-start gap-4">
                            <AlertCircle className="shrink-0 mt-0.5 text-red-400" size={20} />
                            <div className="text-xs font-bold leading-relaxed tracking-wide text-red-200 uppercase">
                                Asegúrate de saber lo que estás calculando, no pongas cosas a lo puro pendejo. Sueña poquito, sueña chiquito.
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-bone/60">Identificador / Título</label>
                                <input
                                    type="text"
                                    value={newIdea.title}
                                    onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                                    className="w-full bg-carbon/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
                                    placeholder="Ej. Integración Motor LLM..."
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-bone/60">Estimación Empírica (Días)</label>
                                <div className="flex gap-4">
                                    <input
                                        type="number"
                                        value={newIdea.effortMin}
                                        onChange={(e) => setNewIdea({ ...newIdea, effortMin: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-carbon/50 border border-white/10 rounded-xl p-4 text-white font-mono focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
                                        placeholder="Min"
                                    />
                                    <input
                                        type="number"
                                        value={newIdea.effortMax}
                                        onChange={(e) => setNewIdea({ ...newIdea, effortMax: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-carbon/50 border border-white/10 rounded-xl p-4 text-white font-mono focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
                                        placeholder="Max"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-bone/60">Retorno Impacto (0-10)</label>
                                    <input
                                        type="number"
                                        min="1" max="10"
                                        value={newIdea.impact}
                                        onChange={(e) => setNewIdea({ ...newIdea, impact: parseInt(e.target.value) || 1 })}
                                        className="w-full bg-carbon/50 border border-white/10 rounded-xl p-4 text-white font-mono text-center focus:outline-none focus:border-accent-emerald focus:ring-1 focus:ring-accent-emerald transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-bone/60">Deuda / Complejidad (0-10)</label>
                                    <input
                                        type="number"
                                        min="1" max="10"
                                        value={newIdea.complexity}
                                        onChange={(e) => setNewIdea({ ...newIdea, complexity: parseInt(e.target.value) || 1 })}
                                        className="w-full bg-carbon/50 border border-white/10 rounded-xl p-4 text-white font-mono text-center focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-10 border-t border-white/10 pt-6">
                                <button
                                    onClick={() => setShowIdeaModal(false)}
                                    className="px-6 py-3 border border-white/10 rounded-lg text-bone/60 hover:bg-white/10 hover:text-white uppercase tracking-widest text-xs font-semibold transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => {
                                        addIdea(newIdea);
                                        setShowIdeaModal(false);
                                        setNewIdea({ title: '', impact: 5, complexity: 5, effortMin: 10, effortMax: 20 });
                                    }}
                                    className="px-8 py-3 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/80 transition-all text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]"
                                >
                                    Agregar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Informativo */}
            <div className="max-w-7xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-slate-300 pt-10 text-slate-600">
                <div className="flex gap-4">
                    <div className="p-3 bg-slate-200 rounded-xl border border-slate-300 h-fit">
                        <Shield className="shrink-0 text-accent-blue" size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 uppercase tracking-widest text-[10px] mb-2">Integridad de V1.0</h4>
                        <p className="text-sm leading-relaxed">Las features en V1.0 están resguardadas. Cualquier adición forzada disparará alertas de desborde y riesgos de deuda.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="p-3 bg-slate-200 rounded-xl border border-slate-300 h-fit">
                        <Clock className="shrink-0 text-accent-emerald" size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 uppercase tracking-widest text-[10px] mb-2">Time-to-Market</h4>
                        <p className="text-sm leading-relaxed">La matriz favorece lanzamientos incrementales quirúrgicos, mitigando largas iteraciones teóricas ("Agile" real).</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="p-3 bg-slate-200 rounded-xl border border-slate-300 h-fit">
                        <TrendingUp className="shrink-0 text-accent-purple" size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 uppercase tracking-widest text-[10px] mb-2">Apetito Comercial</h4>
                        <p className="text-sm leading-relaxed">Las propuestas de ventas e inversores (Moonshots) madurarán en buckets en base al OPEX requerido. Filtro de realidad.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatrixView;
