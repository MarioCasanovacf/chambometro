import React, { useState } from 'react';
import {
    Plus,
    ChevronRight,
    Target,
    Zap,
    AlertCircle,
    Shield,
    Clock,
    TrendingUp
} from 'lucide-react';

const STATUS_COLORS = {
    "Done": "bg-[#00c875] text-white",
    "Working on it": "bg-[#fdab3d] text-white",
    "Stuck": "bg-[#e2445c] text-white",
    "Not Started": "bg-[#c4c4c4] text-white",
    "Obsoleta": "bg-[#333333] text-stone-light line-through"
};

const STATUS_OPTIONS = ["Not Started", "Working on it", "Stuck", "Done", "Obsoleta"];

const calculateFinancials = (effortMin, effortMax, impact, complexity, settings) => {
    const opexMin = effortMin * settings.costPerDay;
    const opexMax = effortMax * settings.costPerDay;
    const cogs = Math.round(settings.baseCogs * Math.pow(settings.cogsMultiplier, complexity));
    return { OPEX_MIN: opexMin, OPEX_MAX: opexMax, COGS: cogs };
};

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const MatrixView = ({ roadmap, moveFeature, addIdea: propAddIdea, settings }) => {
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
        <div className="bg-bone text-carbon p-4 md:p-8 font-sans">
            {/* Header Estilo Negocios */}
            <div className="max-w-7xl mx-auto mb-10 border-b border-stone-light pb-6 flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-4xl font-serif font-bold tracking-tight mb-2">Matrix de Versionado de Producto</h1>
                    <p className="text-stone text-lg max-w-2xl">
                        Sistema de contención estratégica para la transición de la visión comercial a la realidad técnica.
                        Priorice el valor sin comprometer la integridad estructural.
                    </p>
                </div>
                <button
                    onClick={() => setShowIdeaModal(true)}
                    className="bg-carbon text-white px-6 py-3 flex items-center gap-2 hover:bg-stone transition-colors"
                >
                    <Plus size={20} /> Registar Nueva Visión
                </button>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                {roadmap.map((version, vIdx) => {
                    const totalEffort = calculateTotalEffort(vIdx);
                    const isOverloaded = totalEffort > version.limit;

                    return (
                        <div
                            key={version.id}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, vIdx)}
                            className={`bg-bone-alt border-t-4 ${vIdx === 0 ? 'border-red-800' : 'border-stone-light'} p-6 shadow-sm flex flex-col`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-bold font-serif uppercase tracking-widest">{version.name}</h2>
                                    <span className={`text-xs font-bold px-2 py-1 ${vIdx === 0 ? 'bg-red-100 text-red-800' : 'bg-bone text-stone'
                                        }`}>
                                        {version.status}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className={`text-sm font-bold ${isOverloaded ? 'text-red-600' : 'text-stone'}`}>
                                        Capacidad: {totalEffort} / {version.limit}
                                    </div>
                                    <div className="w-24 h-2 bg-bone mt-1 overflow-hidden">
                                        <div
                                            className={`h-full ${isOverloaded ? 'bg-red-600' : 'bg-carbon'}`}
                                            style={{ width: `${Math.min((totalEffort / version.limit) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-stone mb-6 italic min-h-[40px]">
                                {version.description}
                            </p>

                            <div className="flex-grow space-y-3">
                                {version.features.map(feature => (
                                    <div
                                        key={feature.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, vIdx, feature.id)}
                                        className={`bg-bone border border-stone-light p-4 shadow-sm cursor-grab active:cursor-grabbing hover:border-carbon transition-colors group relative ${feature.devStatus === 'Done' ? 'border-l-4 border-l-[#00c875]' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 ${STATUS_COLORS[feature.devStatus]}`}>
                                                {feature.devStatus}
                                            </span>
                                            <span className="text-[10px] text-stone font-bold uppercase tracking-wider bg-bone-alt px-2 py-1 flex items-center gap-1">
                                                {feature.category}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-carbon">{feature.title}</h3>
                                        <div className={`mt-3 grid grid-cols-2 gap-y-2 text-xs ${feature.devStatus === 'Obsoleta' ? 'opacity-50' : ''}`}>
                                            <div className="flex items-center gap-1 text-stone" title="Rango de Esfuerzo Orgánico">
                                                <Zap size={12} /> {feature.effortMin}-{feature.effortMax} Días
                                            </div>
                                            <div className="flex items-center gap-1 text-carbon font-bold justify-end" title="Valor Comercial / Complejidad">
                                                <Target size={12} /> Val: {feature.impact} / Cx: {feature.complexity}
                                            </div>
                                            <div className="flex items-center gap-1 text-red-600 font-mono font-bold" title="Rango OPEX">
                                                <span>OP:</span> {formatCurrency(calculateFinancials(feature.effortMin, feature.effortMax, feature.impact, feature.complexity, settings).OPEX_MIN)} - {formatCurrency(calculateFinancials(feature.effortMin, feature.effortMax, feature.impact, feature.complexity, settings).OPEX_MAX)}
                                            </div>
                                            <div className="flex items-center gap-1 text-indigo-600 font-mono font-bold justify-end" title="Costo Servidores">
                                                <span>CG:</span> {formatCurrency(calculateFinancials(feature.effortMin, feature.effortMax, feature.impact, feature.complexity, settings).COGS)}
                                            </div>
                                        </div>
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {vIdx > 0 && (
                                                <button
                                                    onClick={() => moveFeature(vIdx, feature.id, vIdx - 1)}
                                                    className="p-1 hover:bg-stone-light rounded"
                                                    title="Mover a versión anterior"
                                                >
                                                    <ChevronRight size={14} className="rotate-180" />
                                                </button>
                                            )}
                                            {vIdx < roadmap.length - 1 && (
                                                <button
                                                    onClick={() => moveFeature(vIdx, feature.id, vIdx + 1)}
                                                    className="p-1 hover:bg-stone-light rounded"
                                                    title="Postergar a siguiente versión"
                                                >
                                                    <ChevronRight size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {isOverloaded && vIdx === 0 && (
                                <div className="mt-6 p-3 bg-red-50 border border-red-200 flex items-center gap-2 text-red-800 text-xs font-bold uppercase">
                                    <AlertCircle size={16} /> Alerta de Bloqueo: Exceso de Features
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Modal para "Visiones" del CEO */}
            {showIdeaModal && (
                <div className="fixed inset-0 bg-carbon/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-bone-alt p-8 max-w-md w-full shadow-2xl border-t-8 border-carbon">
                        <h2 className="text-2xl font-serif font-bold mb-4">Nueva Visión Estratégica</h2>
                        <p className="text-sm text-stone mb-4">
                            Registre la idea sin interrumpir el flujo de código. Se asignará automáticamente a la versión 2.0 para su evaluación técnica posterior.
                        </p>

                        {/* Warning solicitado por el usuario */}
                        <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-600 text-red-800 flex items-start gap-3">
                            <AlertCircle className="shrink-0 mt-0.5" size={18} />
                            <div className="text-xs font-bold leading-tight uppercase italic">
                                Asegúrate de no saber lo que estás calculando, no pongas cosas a lo puro pendejo.
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase mb-1">Nombre del Feature</label>
                                <input
                                    type="text"
                                    value={newIdea.title}
                                    onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                                    className="w-full border border-stone-light p-3 focus:outline-none focus:border-carbon bg-bone text-carbon"
                                    placeholder="Ej. Integración con Metaverso..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase mb-1">Días de Esfuerzo Orgánico (Rango)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={newIdea.effortMin}
                                        onChange={(e) => setNewIdea({ ...newIdea, effortMin: parseInt(e.target.value) || 0 })}
                                        className="w-full border border-stone-light p-3 focus:outline-none focus:border-carbon bg-bone text-carbon"
                                        placeholder="Min"
                                    />
                                    <input
                                        type="number"
                                        value={newIdea.effortMax}
                                        onChange={(e) => setNewIdea({ ...newIdea, effortMax: parseInt(e.target.value) || 0 })}
                                        className="w-full border border-stone-light p-3 focus:outline-none focus:border-carbon bg-bone text-carbon"
                                        placeholder="Max"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase mb-1">Impacto Comercial (1-10)</label>
                                    <input
                                        type="number"
                                        min="1" max="10"
                                        value={newIdea.impact}
                                        onChange={(e) => setNewIdea({ ...newIdea, impact: parseInt(e.target.value) || 1 })}
                                        className="w-full border border-stone-light p-3 focus:outline-none focus:border-carbon bg-bone text-carbon"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase mb-1">Complejidad Técnica (1-10)</label>
                                    <input
                                        type="number"
                                        min="1" max="10"
                                        value={newIdea.complexity}
                                        onChange={(e) => setNewIdea({ ...newIdea, complexity: parseInt(e.target.value) || 1 })}
                                        className="w-full border border-stone-light p-3 focus:outline-none focus:border-carbon bg-bone text-carbon"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    onClick={() => setShowIdeaModal(false)}
                                    className="px-6 py-2 border border-stone-light text-stone hover:bg-stone hover:text-white transition-colors text-sm font-bold uppercase tracking-wider"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => {
                                        addIdea(newIdea);
                                        setShowIdeaModal(false);
                                        setNewIdea({ title: '', impact: 5, complexity: 5, effortMin: 10, effortMax: 20 });
                                    }}
                                    className="px-6 py-2 bg-carbon text-bone hover:bg-stone transition-colors text-sm font-bold uppercase tracking-wider shadow-md"
                                >
                                    Guardar Visión
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Informativo */}
            <div className="max-w-7xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-stone-light pt-8 text-stone">
                <div className="flex gap-3">
                    <Shield className="shrink-0" size={24} />
                    <div>
                        <h4 className="font-bold text-carbon uppercase text-xs mb-1">Integridad de V1.0</h4>
                        <p className="text-xs italic">Las features en V1.0 están bloqueadas. Cualquier adición requiere remover una de igual peso.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Clock className="shrink-0" size={24} />
                    <div>
                        <h4 className="font-bold text-carbon uppercase text-xs mb-1">Time-to-Market</h4>
                        <p className="text-xs italic">El versionado permite lanzamientos incrementales sin esperar a la "solución total".</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <TrendingUp className="shrink-0" size={24} />
                    <div>
                        <h4 className="font-bold text-carbon uppercase text-xs mb-1">Apetito Comercial</h4>
                        <p className="text-xs italic">Las visiones de alto impacto se evalúan trimestralmente para su promoción a versiones activas.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatrixView;
