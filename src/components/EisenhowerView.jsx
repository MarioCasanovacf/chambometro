import React, { useState, useMemo } from 'react';
import { Target, User, Zap, AlertTriangle, Layers, Trash2 } from 'lucide-react';

const EisenhowerView = ({ roadmap }) => {
    const [selectedAssignee, setSelectedAssignee] = useState('Todos');

    // Extraer todas las features planas
    const allFeatures = useMemo(() => {
        return roadmap.reduce((acc, column) => {
            const enriched = column.features.map(f => ({ ...f, columnName: column.name }));
            return [...acc, ...enriched];
        }, []);
    }, [roadmap]);

    // Extraer lista única de responsables (Assignees)
    const assignees = useMemo(() => {
        const unique = [...new Set(allFeatures.map(f => f.assignee).filter(Boolean))];
        return ['Todos', ...unique];
    }, [allFeatures]);

    // Filtrar tareas por el usuario seleccionado
    const filteredFeatures = useMemo(() => {
        if (selectedAssignee === 'Todos') return allFeatures;
        return allFeatures.filter(f => f.assignee === selectedAssignee);
    }, [allFeatures, selectedAssignee]);

    // Función que clasifica la tarjeta en el cuadrante correcto
    const getFeaturesByQuadrant = (quadrantNumber) => {
        return filteredFeatures.filter(f => {
            // Lógica Pizarrón -> Eisenhower
            const p = f.priority;
            const status = f.devStatus;

            if (quadrantNumber === 1) {
                // Haz (Urgente e Importante)
                return ['P0', 'P1', 'P2'].includes(p) && status !== 'Obsoleta';
            }
            if (quadrantNumber === 2) {
                // Decide / Planifica (Importante, No Urgente)
                return ['P3', 'P4', 'P5', 'Pn'].includes(p) && status !== 'Obsoleta';
            }
            if (quadrantNumber === 3) {
                // Delega (Urgente, No Importante) -> Asumimos prioridades bajas o marcadas explícitamente
                return ['P6', 'P7', 'Delega'].includes(p) && status !== 'Obsoleta';
            }
            if (quadrantNumber === 4) {
                // Elimina (Ni Urgente ni Importante) -> Tareas Obsoletas o prioridad Eliminada
                return status === 'Obsoleta' || p === 'Elimina';
            }
            return false;
        });
    };

    // Card Component para reutilizar en los cuadrantes
    const TaskCard = ({ feature, badgeColor }) => (
        <div className="bg-white p-3 border border-stone-light shadow-sm mb-2 hover:border-carbon transition-colors group">
            <div className="flex justify-between items-start mb-1">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 ${badgeColor}`}>
                    {feature.priority}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-stone font-bold truncate max-w-[100px]" title={feature.columnName}>
                    {feature.columnName.split(':')[0]}
                </span>
            </div>
            <h4 className="font-bold text-sm text-carbon leading-tight mb-2">{feature.title}</h4>
            <div className="flex justify-between items-center text-[10px] text-stone mt-2 pt-2 border-t border-stone-light/50">
                <div className="flex items-center gap-1 font-bold">
                    <User size={10} /> {feature.assignee}
                </div>
                <div className="flex items-center gap-1 uppercase tracking-wider">
                    {feature.devStatus}
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-bone text-carbon p-4 md:p-8 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-light pb-6">
                <div>
                    <h1 className="text-4xl font-serif font-bold tracking-tight mb-2 flex items-center gap-3">
                        <Target className="text-stone" /> Matriz de Eisenhower
                    </h1>
                    <p className="text-stone text-lg max-w-2xl">
                        Gestión de prioridades (P0-Pn). Filtra por responsable para visualizar la carga de trabajo urgente vs. importante.
                    </p>
                </div>

                {/* Filtro de Assignee */}
                <div className="bg-stone-100 p-2 flex items-center gap-3 self-start md:self-auto border border-stone-light">
                    <User size={16} className="text-stone ml-2" />
                    <span className="text-xs font-bold uppercase tracking-widest text-stone">Ver Carga de:</span>
                    <select
                        value={selectedAssignee}
                        onChange={(e) => setSelectedAssignee(e.target.value)}
                        className="bg-white border border-stone-light text-carbon text-sm font-bold py-1 px-3 focus:outline-none focus:border-carbon min-w-[150px]"
                    >
                        {assignees.map(a => (
                            <option key={a} value={a}>{a}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Eisenhower Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 h-full md:h-[calc(100vh-250px)]">

                {/* Cuadrante 1: Haz (Urgente / Importante) */}
                <div className="border border-stone-light bg-bone flex flex-col min-h-[300px]">
                    <div className="bg-red-50 p-3 border-b border-red-200 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-red-700 font-bold uppercase tracking-wider text-sm">
                            <AlertTriangle size={16} /> [1] Hazlo Ahora (P0 - P2)
                        </div>
                        <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-sm">Urgente + Importante</span>
                    </div>
                    <div className="p-3 bg-red-50/30 flex-1 overflow-y-auto">
                        {getFeaturesByQuadrant(1).map(f => (
                            <TaskCard key={f.id} feature={f} badgeColor="bg-red-600 text-white" />
                        ))}
                        {getFeaturesByQuadrant(1).length === 0 && (
                            <div className="text-stone text-xs text-center py-8">No hay tareas críticas para esta persona.</div>
                        )}
                    </div>
                </div>

                {/* Cuadrante 2: Decide (No Urgente / Importante) */}
                <div className="border border-stone-light bg-bone flex flex-col min-h-[300px]">
                    <div className="bg-blue-50 p-3 border-b border-blue-200 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-blue-700 font-bold uppercase tracking-wider text-sm">
                            <Target size={16} /> [2] Decide / Planifica (P3 - Pn)
                        </div>
                        <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-sm">Importante</span>
                    </div>
                    <div className="p-3 bg-blue-50/30 flex-1 overflow-y-auto">
                        {getFeaturesByQuadrant(2).map(f => (
                            <TaskCard key={f.id} feature={f} badgeColor="bg-blue-600 text-white" />
                        ))}
                        {getFeaturesByQuadrant(2).length === 0 && (
                            <div className="text-stone text-xs text-center py-8">No hay tareas de planeación asignadas.</div>
                        )}
                    </div>
                </div>

                {/* Cuadrante 3: Delega (Urgente / No Importante) */}
                <div className="border border-stone-light bg-bone flex flex-col min-h-[300px]">
                    <div className="bg-orange-50 p-3 border-b border-orange-200 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-orange-700 font-bold uppercase tracking-wider text-sm">
                            <Layers size={16} /> [3] Delega (Operativo)
                        </div>
                        <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-sm">Urgente</span>
                    </div>
                    <div className="p-3 bg-orange-50/30 flex-1 overflow-y-auto">
                        {getFeaturesByQuadrant(3).map(f => (
                            <TaskCard key={f.id} feature={f} badgeColor="bg-orange-500 text-white" />
                        ))}
                        {getFeaturesByQuadrant(3).length === 0 && (
                            <div className="text-stone text-xs text-center py-8">Cuadrante libre. Vaciado recomendado.</div>
                        )}
                    </div>
                </div>

                {/* Cuadrante 4: Elimina / Archiva (No Urgente / No Importante) */}
                <div className="border border-stone-light bg-bone flex flex-col min-h-[300px]">
                    <div className="bg-stone-200 p-3 border-b border-stone-300 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-carbon font-bold uppercase tracking-wider text-sm">
                            <Trash2 size={16} /> [4] Archiva (Obsoleto)
                        </div>
                        <span className="text-xs font-bold text-carbon bg-stone-300 px-2 py-0.5 rounded-sm">No hacer</span>
                    </div>
                    <div className="p-3 bg-stone-100/50 flex-1 overflow-y-auto">
                        {getFeaturesByQuadrant(4).map(f => (
                            <TaskCard key={f.id} feature={f} badgeColor="bg-carbon text-white" />
                        ))}
                        {getFeaturesByQuadrant(4).length === 0 && (
                            <div className="text-stone text-xs text-center py-8">Sin basura operativa detectada.</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EisenhowerView;
