import React, { useState } from 'react';
import { Save, AlertTriangle, Calculator } from 'lucide-react';

const SettingsView = ({ activeProject, updateSettings, isAdmin }) => {
    const [localSettings, setLocalSettings] = useState({ ...activeProject.settings });

    const handleSave = () => {
        updateSettings(localSettings);
    };

    if (!isAdmin) {
        // ... (Keep access denied logic as is)
        return (
            <div className="p-8 max-w-7xl mx-auto font-sans flex flex-col items-center justify-center min-h-[60vh] text-center">
                <AlertTriangle size={64} className="text-red-500 mb-6" />
                <h1 className="text-3xl font-serif font-bold text-carbon mb-4">Acceso Denegado</h1>
                <p className="text-stone max-w-lg">
                    La manipulación del Motor Financiero está estrictamente restringida a usuarios con privilegios de Administración.
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto font-sans text-carbon">
            <div className="mb-10 border-b border-stone-light pb-6">
                <div className="flex items-center gap-3 mb-2">
                    <Calculator size={32} className="text-stone" />
                    <h1 className="text-4xl font-serif font-bold tracking-tight">Configuración: {activeProject.name}</h1>
                </div>
                <p className="text-stone text-lg">
                    Ajuste los multiplicadores económicos específicos para este proyecto. Modificar estos valores NO afectará a otros proyectos del portafolio.
                </p>
            </div>

            <div className="space-y-8">
                {/* OPEX Settings */}
                <div className="bg-bone-alt p-6 md:p-8 border-l-4 border-red-600 shadow-sm border border-stone-light">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold uppercase tracking-widest text-carbon">Ajustes OPEX (Capital Operativo)</h2>
                        <p className="text-sm text-stone mt-1">Estimación de costos de salarios y esfuerzo de horas-hombre para <b>{activeProject.name}</b>.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold uppercase mb-2 text-carbon">
                                Costo Base por Día de Esfuerzo (USD)
                            </label>
                            <input
                                type="number"
                                value={localSettings.costPerDay}
                                onChange={(e) => setLocalSettings({ ...localSettings, costPerDay: parseInt(e.target.value) || 0 })}
                                className="w-full border border-stone-light p-3 focus:outline-none focus:border-red-600 font-mono text-lg"
                                min="0" step="50"
                            />
                        </div>
                    </div>
                </div>

                {/* COGS Settings */}
                <div className="bg-bone-alt p-6 md:p-8 border-l-4 border-indigo-600 shadow-sm border border-stone-light">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold uppercase tracking-widest text-carbon">Ajustes COGS (Infraestructura)</h2>
                        <p className="text-sm text-stone mt-1">Estimación de costos de servidores y APIs para <b>{activeProject.name}</b>.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold uppercase mb-2 text-carbon">
                                Costo Base Servidores (USD/Mes)
                            </label>
                            <input
                                type="number"
                                value={localSettings.baseCogs}
                                onChange={(e) => setLocalSettings({ ...localSettings, baseCogs: parseInt(e.target.value) || 0 })}
                                className="w-full border border-stone-light p-3 focus:outline-none focus:border-indigo-600 font-mono text-lg"
                                min="0" step="10"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-2 text-carbon">
                                Multiplicador de Complejidad
                            </label>
                            <input
                                type="number"
                                value={localSettings.cogsMultiplier}
                                onChange={(e) => setLocalSettings({ ...localSettings, cogsMultiplier: parseFloat(e.target.value) || 1 })}
                                className="w-full border border-stone-light p-3 focus:outline-none focus:border-indigo-600 font-mono text-lg"
                                min="1" step="0.1"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSave}
                        className="bg-carbon text-bone px-8 py-4 font-bold uppercase text-sm flex items-center gap-2 hover:bg-stone transition-colors shadow-lg"
                    >
                        <Save size={18} /> Guardar Cambios del Proyecto
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
