import React, { useState } from 'react';
import { Plus, FolderOpen, Trash2 } from 'lucide-react';

const PortfolioView = ({ projects, selectProject, createProject, deleteProject, isAdmin, closePortfolio }) => {
    const [showNewModal, setShowNewModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');

    const calculateProjectStats = (project) => {
        let totalFeatures = 0;
        let totalEffortMin = 0;
        let totalEffortMax = 0;

        const costPerDay = project.settings.opexCategories.reduce((s, c) => s + c.amount, 0);
        const baseCogs = project.settings.cogsCategories.reduce((s, c) => s + c.amount, 0);

        let totalOpexMin = 0;
        let totalOpexMax = 0;
        let totalCogs = 0;

        project.roadmap.forEach(version => {
            version.features.forEach(feature => {
                totalFeatures++;
                totalEffortMin += feature.effortMin;
                totalEffortMax += feature.effortMax;
                totalOpexMin += feature.effortMin * costPerDay;
                totalOpexMax += feature.effortMax * costPerDay;
                totalCogs += Math.round(baseCogs * Math.pow(project.settings.cogsMultiplier, feature.complexity));
            });
        });

        return { totalFeatures, totalEffortMin, totalEffortMax, totalOpexMin, totalOpexMax, totalCogs };
    };

    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    const handleCreate = () => {
        if (!newProjectName.trim()) return;
        createProject(newProjectName);
        setNewProjectName('');
        setShowNewModal(false);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-start justify-center p-4 md:p-8 z-50 overflow-y-auto">
            <div className="bg-slate-50 border border-slate-300 text-slate-900 w-full max-w-7xl relative shadow-2xl rounded-2xl overflow-hidden">
                {/* Elegant Top Border */}
                <div className="h-1 w-full bg-gradient-to-r from-accent-blue via-accent-purple to-transparent absolute top-0 left-0 opacity-80"></div>

                <button
                    onClick={closePortfolio}
                    className="absolute top-6 right-6 text-bone/50 hover:text-white transition-all bg-white/5 hover:bg-white/10 p-2 rounded-lg"
                    title="Cerrar Portafolio"
                >
                    &times; Cerrar
                </button>

                <div className="p-8 md:p-12">
                    <div className="mb-10 border-b border-slate-300 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <h1 className="text-4xl font-sans font-bold mb-3 tracking-tight text-slate-900">Portafolio de Proyectos</h1>
                            <p className="text-bone/60 text-lg">Visión global financiera y operativa ({projects.length} Proyectos Activos).</p>
                        </div>
                        {isAdmin && (
                            <button
                                onClick={() => setShowNewModal(true)}
                                className="bg-accent-blue text-white px-6 py-3 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] flex items-center gap-2 hover:bg-accent-blue/90 transition-all font-semibold uppercase tracking-wider text-sm"
                            >
                                <Plus size={18} /> Nuevo Proyecto
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => {
                            const stats = calculateProjectStats(project);

                            return (
                                <div key={project.id} className="glass-panel rounded-xl group hover:border-accent-blue/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all flex flex-col overflow-hidden">
                                    <div className="p-6 border-b border-white/5 flex justify-between items-start bg-white/5">
                                        <div className="flex-1">
                                            <h2 className="text-xl font-bold font-sans text-white mb-2">{project.name}</h2>
                                            <div className="flex items-center gap-2 text-xs text-bone/50 uppercase tracking-widest font-semibold">
                                                <FolderOpen size={14} className="text-accent-blue" /> {project.roadmap.length} Versiones <span className="text-white/20">•</span> {stats.totalFeatures} Features
                                            </div>
                                        </div>
                                        {isAdmin && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
                                                className="text-bone/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-md hover:bg-white/5"
                                                title="Eliminar Proyecto"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="p-6 space-y-6 flex-1">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-carbon rounded-lg p-3 border border-white/5">
                                                <p className="text-[10px] text-bone/40 uppercase font-bold tracking-widest mb-1">OPEX Rango</p>
                                                <p className="text-lg font-mono text-accent-emerald font-bold">{formatCurrency(stats.totalOpexMin)}</p>
                                                <p className="text-xs font-mono text-bone/50">a {formatCurrency(stats.totalOpexMax)}</p>
                                            </div>
                                            <div className="bg-carbon rounded-lg p-3 border border-white/5">
                                                <p className="text-[10px] text-bone/40 uppercase font-bold tracking-widest mb-1">Total COGS (Mo)</p>
                                                <p className="text-lg font-mono text-accent-purple font-bold mt-1">{formatCurrency(stats.totalCogs)}</p>
                                            </div>
                                        </div>

                                        <div className="bg-carbon rounded-lg p-3 border border-white/5">
                                            <p className="text-[10px] text-bone/40 uppercase font-bold tracking-widest mb-1">Esfuerzo Técnico Global</p>
                                            <p className="text-lg font-bold text-bone">{stats.totalEffortMin}-{stats.totalEffortMax} <span className="text-xs font-semibold text-bone/40 uppercase ml-1 tracking-wider">Días</span></p>
                                        </div>
                                    </div>

                                    <div className="p-4 border-t border-white/5">
                                        <button
                                            onClick={() => selectProject(project.id)}
                                            className="w-full py-3 bg-white/5 text-bone/80 font-semibold uppercase tracking-widest text-xs hover:bg-white/10 hover:text-white rounded-lg transition-all border border-transparent hover:border-white/10"
                                        >
                                            Abrir Proyecto
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {isAdmin && (
                            <div
                                onClick={() => setShowNewModal(true)}
                                className="rounded-xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 hover:border-accent-blue/50 flex flex-col items-center justify-center p-8 text-bone/50 hover:text-white transition-all cursor-pointer min-h-[350px] group"
                            >
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-accent-blue/20 transition-all">
                                    <Plus size={32} className="group-hover:text-accent-blue transition-colors" />
                                </div>
                                <h3 className="font-sans font-bold text-xl tracking-tight mb-2">Nuevo Proyecto</h3>
                                <p className="text-sm text-center text-bone/40">Crear un nuevo proyecto con su propia configuración.</p>
                            </div>
                        )}
                    </div>

                    {/* Modal */}
                    {showNewModal && (
                        <div className="fixed inset-0 bg-carbon/60 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
                            <div className="glass-panel rounded-2xl p-8 max-w-md w-full relative">
                                <h2 className="text-2xl font-sans font-bold mb-3 text-white text-glow">Crear Nuevo Proyecto</h2>
                                <p className="text-sm text-bone/60 mb-6 leading-relaxed">
                                    El proyecto se creará con una versión v1.0 base y la configuración financiera por defecto.
                                </p>

                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-[10px] font-bold tracking-widest uppercase mb-2 text-bone/60">Nombre del Proyecto</label>
                                        <input
                                            type="text"
                                            value={newProjectName}
                                            onChange={(e) => setNewProjectName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                            className="w-full bg-carbon/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
                                            placeholder="Ej. Moonshot Nexus..."
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={handleCreate}
                                            className="flex-grow bg-accent-blue text-white py-3 rounded-lg font-semibold hover:bg-accent-blue/80 uppercase tracking-widest text-xs transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                                        >
                                            Crear Proyecto
                                        </button>
                                        <button
                                            onClick={() => setShowNewModal(false)}
                                            className="px-6 py-3 border border-white/10 rounded-lg text-bone/60 hover:bg-white/10 hover:text-white uppercase tracking-widest text-xs transition-all"
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
