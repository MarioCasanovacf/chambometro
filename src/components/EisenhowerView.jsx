import React, { useState, useMemo } from 'react';
import { Target, User, Zap, AlertTriangle, Layers, Trash2, GripVertical } from 'lucide-react';
import { DndContext, DragOverlay, useDroppable, useDraggable, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

const QUADRANTS = [
    { id: 1, label: '[1] Hazlo Ahora', sublabel: 'Urgente + Importante', icon: AlertTriangle, bgHeader: 'bg-red-500/10', borderHeader: 'border-red-500/20', textColor: 'text-red-400', badgeBg: 'bg-red-500/20 text-red-400 border-red-500/30', bgBody: 'bg-red-900/5', tagBg: 'bg-red-500/10 border-red-500/20', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.05)]', emptyText: 'No hay incidentes críticos.' },
    { id: 2, label: '[2] Decide / Planifica', sublabel: 'Importante', icon: Target, bgHeader: 'bg-blue-500/10', borderHeader: 'border-blue-500/20', textColor: 'text-blue-400', badgeBg: 'bg-blue-500/20 text-blue-400 border-blue-500/30', bgBody: 'bg-blue-900/5', tagBg: 'bg-blue-500/10 border-blue-500/20', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.05)]', emptyText: 'No hay foco estratégico.' },
    { id: 3, label: '[3] Delega', sublabel: 'Urgente', icon: Layers, bgHeader: 'bg-orange-500/10', borderHeader: 'border-orange-500/20', textColor: 'text-orange-400', badgeBg: 'bg-orange-500/20 text-orange-400 border-orange-500/30', bgBody: 'bg-orange-900/5', tagBg: 'bg-orange-500/10 border-orange-500/20', glow: 'shadow-[0_0_20px_rgba(249,115,22,0.05)]', emptyText: 'Bandwidth liberado.' },
    { id: 4, label: '[4] Archiva', sublabel: 'No hacer', icon: Trash2, bgHeader: 'bg-white/5', borderHeader: 'border-white/10', textColor: 'text-bone/60', badgeBg: 'bg-white/5 text-bone/50 border-white/10', bgBody: 'bg-black/20', tagBg: 'bg-white/5 border-white/10', glow: 'shadow-[0_0_20px_rgba(255,255,255,0.02)]', emptyText: 'Sin ruido operativo.' },
];

// --- Static Card (used for both draggable and overlay) ---
const TaskCardContent = ({ feature, badgeColor }) => (
    <div className="bg-carbon-surface border border-white/10 rounded-xl p-4 shadow-lg mb-3 hover:border-white/30 transition-all group cursor-grab active:cursor-grabbing relative overflow-hidden flex flex-col">
        <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-1.5">
                <GripVertical size={14} className="text-white/10 group-hover:text-white/40 transition-colors" />
                <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${badgeColor}`}>
                    {feature.eisenhower ? `Q${feature.eisenhower}` : 'Sin Clasificar'}
                </span>
            </div>
            <span className="text-[9px] uppercase tracking-widest text-bone/40 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/5 truncate max-w-[120px]" title={feature.columnName}>
                {feature.columnName?.split(':')[0]}
            </span>
        </div>
        <h4 className="font-bold text-sm text-white leading-snug mb-3">{feature.title}</h4>

        {/* Bottom Bar */}
        <div className="flex justify-between items-center text-[10px] text-bone/50 pt-2 border-t border-white/5 bg-white/5 -mx-4 -mb-4 px-4 pb-2 mt-auto">
            <div className="flex items-center gap-1.5 font-bold tracking-wide">
                <User size={12} className="text-white/30" /> {feature.assignee || 'Sin Asignar'}
            </div>
            <div className="flex items-center gap-1 uppercase tracking-wider font-bold text-[9px]">
                {feature.devStatus}
            </div>
        </div>
    </div>
);

// --- Draggable Task Card ---
const DraggableTaskCard = ({ feature, badgeColor, quadrantId }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `feature-${feature.id}`,
        data: { feature, fromQuadrant: quadrantId },
    });

    return (
        <div
            ref={setNodeRef}
            style={{ opacity: isDragging ? 0.3 : 1, transform: isDragging ? 'scale(1.02)' : 'none' }}
            {...listeners}
            {...attributes}
            className="transition-transform"
        >
            <TaskCardContent feature={feature} badgeColor={badgeColor} />
        </div>
    );
};

// --- Droppable Quadrant Zone ---
const DroppableQuadrant = ({ quadrant, features }) => {
    const { setNodeRef, isOver } = useDroppable({ id: `quadrant-${quadrant.id}` });
    const Icon = quadrant.icon;

    return (
        <div
            ref={setNodeRef}
            className={`border border-white/10 bg-carbon-light flex flex-col min-h-[300px] transition-all rounded-2xl overflow-hidden backdrop-blur-md relative ${isOver ? 'ring-2 ring-accent-blue bg-accent-blue/10 scale-[1.01]' : quadrant.glow}`}
        >
            <div className={`${quadrant.bgHeader} p-4 border-b ${quadrant.borderHeader} flex items-center justify-between`}>
                <div className={`flex items-center gap-2 ${quadrant.textColor} font-bold uppercase tracking-widest text-sm text-shadow`}>
                    <Icon size={18} /> {quadrant.label}
                </div>
                <span className={`text-[9px] font-bold ${quadrant.textColor} ${quadrant.tagBg} border px-2.5 py-1 rounded shadow-sm uppercase tracking-wider`}>
                    {quadrant.sublabel} <span className="text-white/50 ml-1">({features.length})</span>
                </span>
            </div>
            <div className={`p-4 ${quadrant.bgBody} flex-1 overflow-y-auto custom-scrollbar`}>
                {features.map(f => (
                    <DraggableTaskCard key={f.id} feature={f} badgeColor={quadrant.badgeBg} quadrantId={quadrant.id} />
                ))}
                {features.length === 0 && (
                    <div className={`text-bone/30 text-xs text-center py-10 border-2 border-dashed ${isOver ? 'border-accent-blue/50 text-accent-blue bg-accent-blue/5' : 'border-white/5 bg-black/20'} rounded-xl font-bold uppercase tracking-widest transition-all backdrop-blur-sm shadow-inner`}>
                        <div className={`transform transition-transform ${isOver ? '-translate-y-1' : ''}`}>
                            {isOver ? '⬇ Soltar aquí' : quadrant.emptyText}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


const EisenhowerView = ({ roadmap, updateFeatureEisenhower }) => {
    const [selectedAssignee, setSelectedAssignee] = useState('Todos');
    const [activeFeature, setActiveFeature] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    // Flatten all features
    const allFeatures = useMemo(() => {
        return roadmap.reduce((acc, column) => {
            const enriched = column.features.map(f => ({ ...f, columnName: column.name }));
            return [...acc, ...enriched];
        }, []);
    }, [roadmap]);

    // Extract unique assignees
    const assignees = useMemo(() => {
        const unique = [...new Set(allFeatures.map(f => f.assignee).filter(Boolean))];
        return ['Todos', ...unique];
    }, [allFeatures]);

    // Filter by assignee
    const filteredFeatures = useMemo(() => {
        if (selectedAssignee === 'Todos') return allFeatures;
        return allFeatures.filter(f => f.assignee === selectedAssignee);
    }, [allFeatures, selectedAssignee]);

    const getFeaturesByQuadrant = (quadrantNumber) => {
        if (quadrantNumber === 0) {
            return filteredFeatures.filter(f => f.eisenhower === null || f.eisenhower === undefined);
        }
        return filteredFeatures.filter(f => f.eisenhower === quadrantNumber);
    };

    const handleDragStart = (event) => {
        const { feature } = event.active.data.current;
        setActiveFeature(feature);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveFeature(null);
        if (!over) return;

        const featureId = parseInt(active.id.replace('feature-', ''));
        const targetQuadrant = parseInt(over.id.replace('quadrant-', ''));

        if (isNaN(targetQuadrant)) return;

        updateFeatureEisenhower(featureId, targetQuadrant);
    };

    const unclassified = getFeaturesByQuadrant(0);

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="bg-transparent p-6 md:p-10 min-h-[85vh] font-sans">
                {/* Header */}
                <div className="max-w-screen-2xl mx-auto mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-300 pb-8">
                    <div>
                        <h1 className="text-4xl font-sans font-bold tracking-tight mb-4 flex items-center gap-4 text-slate-900 drop-shadow-sm">
                            <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 shadow-xl">
                                <Target className="text-accent-emerald" size={32} />
                            </div>
                            Matriz de Eisenhower
                        </h1>
                        <p className="text-slate-700 font-medium text-lg leading-relaxed max-w-2xl mt-4">
                            Priorización paramétrica del backlog. Clasifique el ruido operativo transfiriendo tarjetas a su cuadrante estratégico.
                        </p>
                    </div>

                    {/* Assignee Filter */}
                    <div className="bg-carbon-surface border border-white/10 px-5 py-3 rounded-xl shadow-lg flex items-center gap-4 self-start md:self-auto backdrop-blur-md">
                        <User size={18} className="text-accent-emerald" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-bone/50">Ver Carga de:</span>
                        <select
                            value={selectedAssignee}
                            onChange={(e) => setSelectedAssignee(e.target.value)}
                            className="bg-black/30 border border-white/10 rounded-lg text-white font-bold py-2 px-4 focus:outline-none focus:border-accent-emerald transition-colors min-w-[160px] shadow-inner font-sans text-sm"
                        >
                            {assignees.map(a => (
                                <option key={a} value={a}>{a}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Unclassified Pool - removed from here, moved below the grid */}

                {/* Eisenhower Grid */}
                <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 h-full lg:h-[calc(100vh-320px)]">
                    {QUADRANTS.map(q => (
                        <DroppableQuadrant
                            key={q.id}
                            quadrant={q}
                            features={getFeaturesByQuadrant(q.id)}
                        />
                    ))}
                </div>

                {/* Floating Entities - always visible, below the matrix */}
                <div className="max-w-screen-2xl mx-auto mt-8">
                    <div className={`${unclassified.length > 0 ? 'bg-amber-900/10 border-amber-500/20' : 'bg-emerald-900/10 border-emerald-500/20'} border p-5 rounded-2xl shadow-inner backdrop-blur-sm`}>
                        <h3 className={`text-xs font-bold uppercase tracking-widest ${unclassified.length > 0 ? 'text-amber-500' : 'text-emerald-500'} mb-5 flex items-center gap-2`}>
                            <AlertTriangle size={16} />
                            {unclassified.length > 0
                                ? `Entidades Flotantes (${unclassified.length}) — Requieren clasificación táctica`
                                : 'Entidades Flotantes (0) — Todas las entidades han sido clasificadas'
                            }
                        </h3>
                        {unclassified.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {unclassified.map(f => (
                                    <DraggableTaskCard key={f.id} feature={f} badgeColor="bg-amber-500/20 text-amber-500 border-amber-500/30" quadrantId={0} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                                ✓ Backlog limpio. Arrastre tarjetas aquí para desclasificarlas.
                            </div>
                        )}
                    </div>
                </div>

                {/* DragOverlay renders in a portal above everything */}
                <DragOverlay dropAnimation={{
                    duration: 250,
                    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                }}>
                    {activeFeature ? (
                        <div style={{ width: '320px', opacity: 0.95, transform: 'rotate(2deg) scale(1.05)' }}>
                            <TaskCardContent feature={activeFeature} badgeColor="bg-accent-blue/20 text-accent-blue border-accent-blue/30" />
                        </div>
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
};

export default EisenhowerView;
