import React, { useState } from 'react';
import { Plus, Settings, ShieldAlert, FolderOpen, Trash2 } from 'lucide-react';

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const PortfolioView = ({ projects, selectProject, createProject, deleteProject, isAdmin, globalSettings, closePortfolio }) => {
    const [showNewModal, setShowNewModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');

    const calculateProjectFinancials = (project) => {
        let totalEffort = 0;
        let totalOpex = 0;
        let totalCogs = 0;

        project.roadmap.forEach(version => {
            version.features.forEach(feature => {
                totalEffort += feature.effort;
                totalOpex += feature.effort * globalSettings.costPerDay;
                totalCogs += Math.round(globalSettings.baseCogs * Math.pow(globalSettings.cogsMultiplier, feature.value));
            });
        });

        return { effort: totalEffort, OPEX: totalOpex, COGS: totalCogs };
    };

    const handleCreate = () => {
        if (!newProjectName.trim()) return;
        createProject(newProjectName);
        setNewProjectName('');
        setShowNewModal(false);
    };

    return (
        <div className="fixed inset-0 bg-carbon/90 backdrop-blur-sm flex items-start justify-center p-4 md:p-8 z-50 overflow-y-auto">
            <div className="bg-bone text-carbon w-full max-w-7xl relative shadow-2xl border-t-8 border-stone">
                {/* Close Button */}
                <button
                    onClick={closePortfolio}
                    className="absolute top-4 right-4 text-stone hover:text-carbon transition-colors bg-bone-alt p-2 font-bold"
                    title="Cerrar Portafolio"
                >
                    &times; Cerrar
                </button>

                <div className="p-6 md:p-10">
                    <div className="mb-8 border-b border-stone-light pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                        <div>
                            <h1 className="text-4xl font-serif font-bold mb-2 tracking-tight">Portafolio de Proyectos</h1>
                            <p className="text-stone-light text-lg">Visión global financiera y operativa ({projects.length} Proyectos Activos).</p>
                        </div>
                        {isAdmin && (
                            <button
                                onClick={() => setShowNewModal(true)}
                                className="bg-carbon text-bone px-6 py-3 flex items-center gap-2 hover:bg-stone transition-colors font-bold uppercase text-sm"
                            >
                                <Plus size={18} /> Nuevo Proyecto
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => {
                            const stats = calculateProjectFinancials(project);

                            return (
                                <div key={project.id} className="bg-bone-alt border border-stone-light group hover:border-carbon transition-all flex flex-col">
                                    <div className="p-5 border-b border-stone-light flex justify-between items-start">
                                        <div className="flex-1">
                                            <h2 className="text-xl font-bold font-serif text-carbon mb-1">{project.name}</h2>
                                            <div className="flex items-center gap-2 text-xs text-stone uppercase tracking-wider font-bold">
                                                <FolderOpen size={14} /> {project.roadmap.length} Versiones Planificadas
                                            </div>
                                        </div>
                                        {isAdmin && (
                                            <button
                                                onClick={() => deleteProject(project.id)}
                                                className="text-stone hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                                title="Eliminar Proyecto"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="p-5 space-y-4 flex-1">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-stone uppercase font-bold mb-1">Total OPEX</p>
                                                <p className="text-xl font-mono text-red-600 font-bold">{formatCurrency(stats.OPEX)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-stone uppercase font-bold mb-1">Total COGS (Mo)</p>
                                                <p className="text-xl font-mono text-indigo-600 font-bold">{formatCurrency(stats.COGS)}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-xs text-stone uppercase font-bold mb-1">Esfuerzo Técnico Global</p>
                                            <p className="text-lg font-bold text-carbon">{stats.effort} <span className="text-sm font-normal text-stone">Días de Ingeniería</span></p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-bone border-t border-stone-light">
                                        <button
                                            onClick={() => selectProject(project.id)}
                                            className="w-full py-2 bg-stone-light text-carbon font-bold uppercase text-xs hover:bg-carbon hover:text-bone transition-colors"
                                        >
                                            Abrir Proyecto
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Card Create New */}
                        {isAdmin && (
                            <div
                                onClick={() => setShowNewModal(true)}
                                className="bg-bone border-2 border-dashed border-stone-light flex flex-col items-center justify-center p-8 text-stone hover:text-carbon hover:border-carbon transition-colors cursor-pointer min-h-[300px]"
                            >
                                <Plus size={48} className="mb-4 opacity-50" />
                                <h3 className="font-serif font-bold text-xl">Inicializar Nueva Visión</h3>
                                <p className="text-sm mt-2 text-center">Desplegar un nuevo entorno para un proyecto naciente.</p>
                            </div>
                        )}
                    </div>

                    {/* Modal */}
                    {showNewModal && (
                        <div className="fixed inset-0 bg-carbon/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                            <div className="bg-bone-alt p-8 max-w-md w-full shadow-2xl border-t-8 border-carbon">
                                <h2 className="text-2xl font-serif font-bold mb-4 text-carbon">Crear Nuevo Proyecto</h2>
                                <p className="text-sm text-stone mb-6">
                                    El proyecto se inicializará automáticamente con las versiones estándar (v1.0, v1.5, v2.0) y la configuración financiera global.
                                </p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase mb-1 text-carbon">Nombre del Proyecto</label>
                                        <input
                                            type="text"
                                            value={newProjectName}
                                            onChange={(e) => setNewProjectName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                            className="w-full border border-stone-light p-3 focus:outline-none focus:border-carbon bg-white text-carbon"
                                            placeholder="Ej. App Móvil Zenith..."
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={handleCreate}
                                            className="flex-grow bg-carbon text-bone py-3 font-bold hover:bg-stone uppercase text-sm"
                                        >
                                            Crear Proyecto
                                        </button>
                                        <button
                                            onClick={() => setShowNewModal(false)}
                                            className="px-6 py-3 border border-stone-light text-stone hover:bg-stone-light hover:text-carbon uppercase text-sm"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PortfolioView;
