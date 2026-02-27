import React, { useState } from 'react';
import MatrixView from './components/MatrixView';
import RoadmapView from './components/RoadmapView';
import PortfolioView from './components/PortfolioView';
import SettingsView from './components/SettingsView';
import KanbanView from './components/KanbanView';
import GanttView from './components/GanttView';
import EisenhowerView from './components/EisenhowerView';
import { Settings, Briefcase, UserCog, LayoutGrid, Map, Columns3, CalendarDays, Target } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState('roadmap');
  const [selectedProjectId, setSelectedProjectId] = useState(1);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true);

  const defaultSettings = {
    opexCategories: [
      { id: 1, name: 'Salarios Dev Senior', amount: 500 },
      { id: 2, name: 'Salarios Dev Junior', amount: 250 },
    ],
    cogsCategories: [
      { id: 1, name: 'Servidores Cloud', amount: 100 },
      { id: 2, name: 'APIs Externas', amount: 50 },
    ],
    cogsMultiplier: 1.5,
  };

  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "App Móvil Core",
      settings: {
        opexCategories: [
          { id: 1, name: 'Salarios Dev Senior', amount: 500 },
          { id: 2, name: 'Salarios Dev Junior', amount: 250 },
        ],
        cogsCategories: [
          { id: 1, name: 'Servidores Cloud', amount: 100 },
          { id: 2, name: 'APIs Externas', amount: 50 },
        ],
        cogsMultiplier: 1.5,
      },
      roadmap: [
        {
          id: 1,
          name: "v1.0: Foundation (MVP)",
          color: "#0073ea",
          limit: 100,
          features: [
            { id: 101, title: "Autenticación OAuth2", effortMin: 15, effortMax: 30, impact: 5, complexity: 6, category: "Tech", devStatus: "Terminado", startDate: "2023-10-01", endDate: "2023-10-15", assignee: "Jorge", eisenhower: 1 },
            { id: 102, title: "Dashboard Principal", effortMin: 30, effortMax: 50, impact: 8, complexity: 3, category: "UI", devStatus: "Funcional", startDate: "2023-10-10", endDate: "2023-11-20", assignee: "Mario", eisenhower: 1 },
            { id: 103, title: "Integración de API Core", effortMin: 20, effortMax: 40, impact: 9, complexity: 8, category: "Backend", devStatus: "Design Phase", startDate: "2023-11-01", endDate: "2023-11-30", assignee: "Alberto", eisenhower: 2 }
          ]
        },
        {
          id: 2,
          name: "v1.5: Optimization",
          color: "#a25ddc",
          limit: 120,
          features: [
            { id: 201, title: "Analítica Avanzada", effortMin: 40, effortMax: 60, impact: 9, complexity: 7, category: "Business", devStatus: "Prototype", startDate: "2023-12-01", endDate: "2024-01-30", assignee: "Andrea", eisenhower: 2 },
            { id: 202, title: "Notificaciones Push", effortMin: 20, effortMax: 35, impact: 4, complexity: 5, category: "UX", devStatus: "No Empezado", startDate: "2024-01-15", endDate: "2024-02-15", assignee: "Fabián", eisenhower: null }
          ]
        },
        {
          id: 3,
          name: "v2.0: Scaling & Vision",
          color: "#00c875",
          limit: 150,
          features: [
            { id: 301, title: "Motor de IA Predictiva", effortMin: 80, effortMax: 120, impact: 10, complexity: 10, category: "Vision", devStatus: "No Empezado", startDate: "2024-03-01", endDate: "2024-06-30", assignee: "Daniel", eisenhower: null },
            { id: 302, title: "Multi-idioma (Mercado Asia)", effortMin: 50, effortMax: 80, impact: 10, complexity: 6, category: "Global", devStatus: "No Empezado", startDate: "2024-05-01", endDate: "2024-07-30", assignee: "Jorge", eisenhower: 3 }
          ]
        }
      ]
    }
  ]);

  const activeProject = projects.find(p => p.id === selectedProjectId);

  // --- Helper to derive costPerDay from opexCategories ---
  const getCostPerDay = (settings) => {
    return settings.opexCategories.reduce((sum, c) => sum + c.amount, 0);
  };

  const getBaseCogs = (settings) => {
    return settings.cogsCategories.reduce((sum, c) => sum + c.amount, 0);
  };

  // --- Project CRUD ---
  const createProject = (name) => {
    const newProject = {
      id: Date.now(),
      name: name,
      settings: JSON.parse(JSON.stringify(defaultSettings)),
      roadmap: [
        { id: Date.now() + 1, name: "v1.0: Foundation", color: "#0073ea", limit: 100, features: [] },
      ]
    };
    setProjects([...projects, newProject]);
  };

  const deleteProject = (id) => {
    setProjects(projects.filter(p => p.id !== id));
    if (selectedProjectId === id) {
      const remaining = projects.filter(p => p.id !== id);
      setSelectedProjectId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // --- Roadmap Version CRUD ---
  const addVersion = (name, color, limit) => {
    if (!activeProject) return;
    const updated = [...activeProject.roadmap];
    updated.push({ id: Date.now(), name, color: color || '#6366f1', limit: limit || 100, features: [] });
    updateActiveProjectRoadmap(updated);
  };

  const editVersion = (vIdx, newData) => {
    if (!activeProject) return;
    const updated = [...activeProject.roadmap];
    updated[vIdx] = { ...updated[vIdx], ...newData };
    updateActiveProjectRoadmap(updated);
  };

  const deleteVersion = (vIdx) => {
    if (!activeProject) return;
    const updated = [...activeProject.roadmap];
    updated.splice(vIdx, 1);
    updateActiveProjectRoadmap(updated);
  };

  // --- Core state updaters ---
  const updateActiveProjectRoadmap = (newRoadmap) => {
    setProjects(projects.map(p =>
      p.id === selectedProjectId ? { ...p, roadmap: newRoadmap } : p
    ));
  };

  const updateActiveProjectSettings = (newSettings) => {
    setProjects(projects.map(p =>
      p.id === selectedProjectId ? { ...p, settings: newSettings } : p
    ));
  };

  // --- Feature operations ---
  const moveFeature = (fromIdx, featureId, toIdx) => {
    if (!activeProject) return;
    const updated = [...activeProject.roadmap];
    const feature = updated[fromIdx].features.find(f => f.id === featureId);
    if (!feature) return;
    updated[fromIdx].features = updated[fromIdx].features.filter(f => f.id !== featureId);
    updated[toIdx].features.push(feature);
    updateActiveProjectRoadmap(updated);
  };

  const deleteFeature = (vIdx, featureId) => {
    if (!activeProject) return;
    const updated = [...activeProject.roadmap];
    updated[vIdx].features = updated[vIdx].features.filter(f => f.id !== featureId);
    updateActiveProjectRoadmap(updated);
  };

  const addIdea = (newIdea) => {
    if (!activeProject) return;
    const updated = [...activeProject.roadmap];
    const targetVersion = updated.length - 1;
    updated[targetVersion].features.push({
      id: Date.now(),
      title: newIdea.title,
      effortMin: newIdea.effortMin,
      effortMax: newIdea.effortMax,
      impact: newIdea.impact,
      complexity: newIdea.complexity,
      category: "Idea",
      devStatus: "No Empezado",
      assignee: "No Asignado",
      eisenhower: null, // No priority assigned - Eisenhower will pick it up
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    updateActiveProjectRoadmap(updated);
  };

  const updateFeatureStatus = (vIdx, featureId, newStatus) => {
    if (!activeProject) return;
    const updated = [...activeProject.roadmap];
    const feature = updated[vIdx].features.find(f => f.id === featureId);
    if (feature) feature.devStatus = newStatus;
    updateActiveProjectRoadmap(updated);
  };

  const updateFeatureEisenhower = (featureId, quadrant) => {
    if (!activeProject) return;
    const updated = [...activeProject.roadmap];
    for (const version of updated) {
      const feature = version.features.find(f => f.id === featureId);
      if (feature) {
        feature.eisenhower = quadrant;
        break;
      }
    }
    updateActiveProjectRoadmap(updated);
  };

  const updateFeatureDates = (vIdx, featureId, startDate, endDate) => {
    if (!activeProject) return;
    const updated = [...activeProject.roadmap];
    const feature = updated[vIdx].features.find(f => f.id === featureId);
    if (feature) {
      feature.startDate = startDate;
      feature.endDate = endDate;
    }
    updateActiveProjectRoadmap(updated);
  };

  // Derive computed settings for financial views
  const getComputedSettings = () => {
    if (!activeProject) return { costPerDay: 0, baseCogs: 0, cogsMultiplier: 1 };
    return {
      costPerDay: getCostPerDay(activeProject.settings),
      baseCogs: getBaseCogs(activeProject.settings),
      cogsMultiplier: activeProject.settings.cogsMultiplier,
      opexCategories: activeProject.settings.opexCategories,
      cogsCategories: activeProject.settings.cogsCategories,
    };
  };

  return (
    <div className="min-h-screen bg-[var(--color-page-bg)] text-[var(--color-page-text)] font-sans flex flex-col selection:bg-accent-blue/30 relative overflow-hidden">
      {/* Universal Top Navigation - Dark Mode to anchor the bright background */}
      <nav className="glass-header px-6 py-4 flex justify-between items-center z-50 sticky top-0 shadow-xl">

        {/* Left Side: Logo & Main Navigation */}
        <div className="flex items-center gap-8">
          <div
            className="font-bold tracking-widest uppercase flex items-center gap-3 cursor-pointer group"
            onClick={() => setShowPortfolio(true)}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] transition-shadow">
              <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>
            </div>
            <span className="text-glow text-lg">Chambómetro</span>
          </div>

          {/* Separator */}
          <div className="h-8 w-px bg-white/10 hidden md:block"></div>

          {/* View Selectors (Only shown if a project is selected) */}
          {selectedProjectId && (
            <div className="hidden md:flex gap-2 p-1 bg-carbon-light rounded-xl border border-white/5">
              <button
                onClick={() => setCurrentView('matrix')}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 ${currentView === 'matrix' ? 'bg-white/10 text-white shadow-sm' : 'text-bone/50 hover:text-bone hover:bg-white/5'}`}
              >
                <LayoutGrid size={14} /> Matriz
              </button>
              <button
                onClick={() => setCurrentView('roadmap')}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 ${currentView === 'roadmap' ? 'bg-white/10 text-white shadow-sm' : 'text-bone/50 hover:text-bone hover:bg-white/5'}`}
              >
                <Map size={14} /> Roadmap
              </button>
              <button
                onClick={() => setCurrentView('kanban')}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 ${currentView === 'kanban' ? 'bg-white/10 text-white shadow-sm' : 'text-bone/50 hover:text-bone hover:bg-white/5'}`}
              >
                <Columns3 size={14} /> Kanban
              </button>
              <button
                onClick={() => setCurrentView('gantt')}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 ${currentView === 'gantt' ? 'bg-white/10 text-white shadow-sm' : 'text-bone/50 hover:text-bone hover:bg-white/5'}`}
              >
                <CalendarDays size={14} /> Gantt
              </button>
              <button
                onClick={() => setCurrentView('eisenhower')}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 ${currentView === 'eisenhower' ? 'bg-white/10 text-white shadow-sm' : 'text-bone/50 hover:text-bone hover:bg-white/5'}`}
              >
                <Target size={14} /> Eisenhower
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Global Toggles & Settings */}
        <div className="flex items-center gap-4">

          <button
            onClick={() => setShowPortfolio(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all text-bone/60 hover:text-bone hover:bg-white/5 border border-transparent hover:border-white/10"
            title="Abrir Portafolio"
          >
            <Briefcase size={16} /> <span className="hidden md:inline">Portafolios</span>
          </button>

          {/* Admin Toggle Simulator */}
          <div className="flex items-center gap-3 bg-carbon-light/80 border border-white/10 rounded-lg px-3 py-1.5 backdrop-blur-sm">
            <UserCog size={14} className={isAdmin ? 'text-accent-blue' : 'text-bone/40'} />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-bone/40">Rol:</span>
            <button
              onClick={() => setIsAdmin(!isAdmin)}
              className={`text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider transition-all ${isAdmin ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/30' : 'bg-transparent text-bone/50 hover:text-bone border border-transparent hover:border-white/10'}`}
            >
              {isAdmin ? 'M-Admin' : 'Viewer'}
            </button>
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                if (!selectedProjectId && projects.length > 0) {
                  setSelectedProjectId(projects[0].id);
                }
                setCurrentView('settings');
              }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all border ${currentView === 'settings' ? 'bg-white/10 text-white border-white/20 shadow-sm' : 'text-bone/60 hover:text-bone hover:bg-white/5 border-transparent hover:border-white/10'}`}
              title="Configuración Financiera"
            >
              <Settings size={16} /> <span className="hidden md:inline">Parámetros</span>
            </button>
          )}
        </div>
      </nav>

      <main className="pb-12 h-full">
        {/* Project Breadcrumb / Back Navigation */}
        {selectedProjectId && currentView !== 'settings' && (
          <div className="bg-slate-300/50 border-b border-slate-400/30 px-8 flex items-center gap-3 relative h-1 backdrop-blur-sm">
            {/* Elegant thin indicator line */}
            <div className="h-0.5 w-full bg-gradient-to-r from-accent-blue via-accent-purple to-transparent absolute top-0 left-0 opacity-70"></div>
          </div>
        )}

        {/* Floating Portfolio Overlay */}
        {showPortfolio && (
          <PortfolioView
            projects={projects}
            selectProject={(id) => {
              setSelectedProjectId(id);
              setShowPortfolio(false);
              if (currentView === 'settings') setCurrentView('roadmap');
            }}
            closePortfolio={() => setShowPortfolio(false)}
            createProject={createProject}
            deleteProject={deleteProject}
            isAdmin={isAdmin}
          />
        )}

        {currentView === 'settings' && activeProject && (
          <SettingsView
            activeProject={activeProject}
            updateSettings={updateActiveProjectSettings}
            isAdmin={isAdmin}
          />
        )}

        {currentView === 'matrix' && activeProject && (
          <MatrixView
            roadmap={activeProject.roadmap}
            moveFeature={moveFeature}
            addIdea={addIdea}
            deleteFeature={deleteFeature}
            settings={getComputedSettings()}
            isAdmin={isAdmin}
          />
        )}

        {currentView === 'roadmap' && activeProject && (
          <RoadmapView
            roadmap={activeProject.roadmap}
            addIdea={addIdea}
            updateFeatureStatus={updateFeatureStatus}
            deleteFeature={deleteFeature}
            addVersion={addVersion}
            editVersion={editVersion}
            deleteVersion={deleteVersion}
            settings={getComputedSettings()}
            isAdmin={isAdmin}
          />
        )}

        {currentView === 'kanban' && activeProject && (
          <KanbanView
            roadmap={activeProject.roadmap}
            updateFeatureStatus={updateFeatureStatus}
            settings={getComputedSettings()}
          />
        )}

        {currentView === 'gantt' && activeProject && (
          <GanttView
            roadmap={activeProject.roadmap}
            updateFeatureDates={updateFeatureDates}
          />
        )}

        {currentView === 'eisenhower' && activeProject && (
          <EisenhowerView
            roadmap={activeProject.roadmap}
            updateFeatureEisenhower={updateFeatureEisenhower}
          />
        )}
      </main>
    </div>
  );
}

export default App;
