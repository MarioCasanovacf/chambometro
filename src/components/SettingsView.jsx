import React, { useState } from 'react';
import { Save, AlertTriangle, Calculator, Plus, Trash2, Info } from 'lucide-react';

const SettingsView = ({ activeProject, updateSettings, isAdmin }) => {
    const [localSettings, setLocalSettings] = useState(JSON.parse(JSON.stringify(activeProject.settings)));

    const handleSave = () => {
        updateSettings(localSettings);
    };

    // --- OPEX Category CRUD ---
    const addOpexCategory = () => {
        setLocalSettings({
            ...localSettings,
            opexCategories: [...localSettings.opexCategories, { id: Date.now(), name: '', amount: 0 }]
        });
    };

    const updateOpexCategory = (id, field, value) => {
        setLocalSettings({
            ...localSettings,
            opexCategories: localSettings.opexCategories.map(c =>
                c.id === id ? { ...c, [field]: field === 'amount' ? (parseInt(value) || 0) : value } : c
            )
        });
    };

    const removeOpexCategory = (id) => {
        setLocalSettings({
            ...localSettings,
            opexCategories: localSettings.opexCategories.filter(c => c.id !== id)
        });
    };

    // --- COGS Category CRUD ---
    const addCogsCategory = () => {
        setLocalSettings({
            ...localSettings,
            cogsCategories: [...localSettings.cogsCategories, { id: Date.now(), name: '', amount: 0 }]
        });
    };

    const updateCogsCategory = (id, field, value) => {
        setLocalSettings({
            ...localSettings,
            cogsCategories: localSettings.cogsCategories.map(c =>
                c.id === id ? { ...c, [field]: field === 'amount' ? (parseInt(value) || 0) : value } : c
            )
        });
    };

    const removeCogsCategory = (id) => {
        setLocalSettings({
            ...localSettings,
            cogsCategories: localSettings.cogsCategories.filter(c => c.id !== id)
        });
    };

    const totalOpex = localSettings.opexCategories.reduce((sum, c) => sum + c.amount, 0);
    const totalCogs = localSettings.cogsCategories.reduce((sum, c) => sum + c.amount, 0);

    if (!isAdmin) {
        return (
            <div className="p-8 max-w-7xl mx-auto font-sans flex flex-col items-center justify-center min-h-[60vh] text-center">
                <AlertTriangle size={64} className="text-red-500/80 mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                <h1 className="text-3xl font-sans font-bold text-slate-900 mb-4">Acceso Denegado</h1>
                <p className="text-slate-700 max-w-lg text-lg leading-relaxed">
                    La manipulación del Motor Financiero está estrictamente restringida a usuarios con privilegios de Administración.
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto font-sans text-slate-900 bg-transparent min-h-[85vh]">
            <div className="mb-12 border-b border-slate-300 pb-8">
                <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 shadow-xl">
                        <Calculator size={32} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-sans font-black tracking-tight text-slate-900 drop-shadow-sm">Configuración: <span className="text-slate-700 font-semibold">{activeProject.name}</span></h1>
                </div>
                <p className="text-slate-700 font-medium text-lg max-w-3xl leading-relaxed mt-4">
                    Ajuste los multiplicadores económicos específicos para este proyecto. Modificar estos valores NO afectará a otros proyectos del portafolio.
                </p>
            </div>

            <div className="space-y-8">
                {/* OPEX Settings - Dynamic Categories */}
                <div className="glass-panel p-8 rounded-2xl relative overflow-hidden group">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-accent-emerald to-accent-blue opacity-80"></div>

                    <div className="mb-8 flex flex-col md:flex-row items-start justify-between gap-6">
                        <div>
                            <h2 className="text-xl font-bold uppercase tracking-widest text-white flex items-center gap-2">
                                Ajustes OPEX <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-bone/60 border border-white/5">Capital Operativo</span>
                            </h2>
                            <p className="text-sm text-bone/50 mt-2 leading-relaxed max-w-xl">Desglose de costos de salarios y esfuerzo de horas-hombre para <b>{activeProject.name}</b>.</p>
                        </div>
                        <div className="text-left md:text-right bg-carbon/50 p-4 rounded-xl border border-white/5 min-w-[200px]">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-bone/40">Total Estimado OPEX/Día</span>
                            <div className="text-3xl font-mono font-bold text-accent-emerald mt-1 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">${totalOpex.toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        {localSettings.opexCategories.map((cat) => (
                            <div key={cat.id} className="flex flex-col md:flex-row items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                <input
                                    type="text"
                                    value={cat.name}
                                    onChange={(e) => updateOpexCategory(cat.id, 'name', e.target.value)}
                                    placeholder="Nombre de categoría..."
                                    className="flex-1 w-full bg-transparent border-none p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent-emerald/50 rounded-lg transition-all"
                                />
                                <div className="flex items-center gap-3 w-full md:w-auto px-3 md:px-0">
                                    <div className="flex items-center bg-carbon/50 rounded-lg border border-white/10 px-3 flex-1 md:flex-none">
                                        <span className="text-[10px] font-bold text-bone/40">USD</span>
                                        <input
                                            type="number"
                                            value={cat.amount}
                                            onChange={(e) => updateOpexCategory(cat.id, 'amount', e.target.value)}
                                            className="w-full md:w-28 bg-transparent border-none p-3 text-sm font-mono text-white text-right focus:outline-none"
                                            min="0" step="50"
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeOpexCategory(cat.id)}
                                        className="text-bone/30 hover:text-red-400 transition-colors p-3 rounded-lg hover:bg-white/5"
                                        title="Eliminar categoría"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={addOpexCategory}
                        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent-emerald hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10"
                    >
                        <Plus size={16} /> Añadir Categoría OPEX
                    </button>
                </div>

                {/* COGS Settings - Dynamic Categories */}
                <div className="glass-panel p-8 rounded-2xl relative overflow-hidden group">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-accent-purple to-pink-500 opacity-80"></div>

                    <div className="mb-8 flex flex-col md:flex-row items-start justify-between gap-6">
                        <div>
                            <h2 className="text-xl font-bold uppercase tracking-widest text-white flex items-center gap-2">
                                Ajustes COGS <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-bone/60 border border-white/5">Infraestructura</span>
                            </h2>
                            <p className="text-sm text-bone/50 mt-2 leading-relaxed max-w-xl">Desglose de costos de servidores, licencias y APIs para <b>{activeProject.name}</b>.</p>
                        </div>
                        <div className="text-left md:text-right bg-carbon/50 p-4 rounded-xl border border-white/5 min-w-[200px]">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-bone/40">Total Base COGS/Mes</span>
                            <div className="text-3xl font-mono font-bold text-accent-purple mt-1 drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]">${totalCogs.toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        {localSettings.cogsCategories.map((cat) => (
                            <div key={cat.id} className="flex flex-col md:flex-row items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                <input
                                    type="text"
                                    value={cat.name}
                                    onChange={(e) => updateCogsCategory(cat.id, 'name', e.target.value)}
                                    placeholder="Nombre de infraestructura..."
                                    className="flex-1 w-full bg-transparent border-none p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent-purple/50 rounded-lg transition-all"
                                />
                                <div className="flex items-center gap-3 w-full md:w-auto px-3 md:px-0">
                                    <div className="flex items-center bg-carbon/50 rounded-lg border border-white/10 px-3 flex-1 md:flex-none">
                                        <span className="text-[10px] font-bold text-bone/40">USD</span>
                                        <input
                                            type="number"
                                            value={cat.amount}
                                            onChange={(e) => updateCogsCategory(cat.id, 'amount', e.target.value)}
                                            className="w-full md:w-28 bg-transparent border-none p-3 text-sm font-mono text-white text-right focus:outline-none"
                                            min="0" step="10"
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeCogsCategory(cat.id)}
                                        className="text-bone/30 hover:text-red-400 transition-colors p-3 rounded-lg hover:bg-white/5"
                                        title="Eliminar categoría"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={addCogsCategory}
                        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent-purple hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10"
                    >
                        <Plus size={16} /> Añadir Categoría COGS
                    </button>
                </div>

                {/* Complexity Multiplier */}
                <div className="glass-panel p-8 rounded-2xl relative overflow-hidden group">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 to-orange-600 opacity-80"></div>
                    <div className="mb-6">
                        <h2 className="text-xl font-bold uppercase tracking-widest text-white">Multiplicador de Complejidad</h2>
                        <div className="flex items-start gap-4 mt-4 p-5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                            <Info size={20} className="text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-100/80 leading-relaxed font-medium">
                                El <b className="text-amber-400">Multiplicador de Complejidad</b> escala los costos base de infraestructura (COGS) exponencialmente según el nivel de dificultad técnica del proyecto (`baseCogs * (multiplier ^ complexity)`).
                                Un valor de <b className="text-amber-400">1.0</b> significa que la complejidad no impacta los costos. Un valor de <b className="text-amber-400">1.5</b> aplica un cargo sustancial para moonshots de alta complejidad.
                            </p>
                        </div>
                    </div>
                    <div className="max-w-[200px]">
                        <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 text-bone/60">
                            Factor Multiplicador
                        </label>
                        <div className="flex items-center bg-carbon/50 rounded-xl border border-white/10 overflow-hidden focus-within:ring-1 focus-within:ring-amber-500/50 focus-within:border-amber-500/50 transition-all">
                            <div className="px-4 text-bone/40 font-mono text-lg select-none">x</div>
                            <input
                                type="number"
                                value={localSettings.cogsMultiplier}
                                onChange={(e) => setLocalSettings({ ...localSettings, cogsMultiplier: parseFloat(e.target.value) || 1 })}
                                className="w-full bg-transparent border-none p-4 font-mono text-2xl text-white focus:outline-none"
                                min="1" step="0.1"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-6">
                    <button
                        onClick={handleSave}
                        className="bg-accent-blue text-white px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center gap-3 hover:bg-accent-blue/90 transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] border border-accent-blue/50"
                    >
                        <Save size={20} /> Guardar Cambios Financieros
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
