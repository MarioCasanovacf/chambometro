import React, { useState } from 'react';
import MatrixView from './components/MatrixView';
import RoadmapView from './components/RoadmapView';
import PortfolioView from './components/PortfolioView';
import SettingsView from './components/SettingsView';
import KanbanView from './components/KanbanView';
import GanttView from './components/GanttView';
import EisenhowerView from './components/EisenhowerView';
import { Settings, Briefcase, UserCog } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState('roadmap'); // 'matrix', 'roadmap', 'settings'
  const [selectedProjectId, setSelectedProjectId] = useState(1);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true); // Toggle for CEO/Manager simulation

  const [globalDefaults, setGlobalDefaults] = useState({
    costPerDay: 500,
    baseCogs: 100,
    cogsMultiplier: 1.5
  });

  // Estado que ahora contiene Múltiples proyectos
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "App Móvil Core",
      settings: {
        costPerDay: 500,
        baseCogs: 100,
        cogsMultiplier: 1.5
      },
      roadmap: [
        {
          id: 1,
          name: "v1.0: Foundation (MVP)",
          color: "#0073ea",
          limit: 100,
          features: [
            { id: 101, title: "Autenticación OAuth2", effortMin: 15, effortMax: 30, impact: 5, complexity: 6, category: "Tech", devStatus: "Terminado", startDate: "2023-10-01", endDate: "2023-10-15", assignee: "Jorge", priority: "P0" },
            { id: 102, title: "Dashboard Principal", effortMin: 30, effortMax: 50, impact: 8, complexity: 3, category: "UI", devStatus: "Funcional", startDate: "2023-10-10", endDate: "2023-11-20", assignee: "Mario", priority: "P1" },
            { id: 103, title: "Integración de API Core", effortMin: 20, effortMax: 40, impact: 9, complexity: 8, category: "Backend", devStatus: "Diseño", startDate: "2023-11-01", endDate: "2023-11-30", assignee: "Alberto", priority: "P2" }
          ]
        },
        {
          id: 2,
          name: "v1.5: Optimization",
          color: "#a25ddc",
          limit: 120,
          features: [
            { id: 201, title: "Analítica Avanzada", effortMin: 40, effortMax: 60, impact: 9, complexity: 7, category: "Business", devStatus: "Prototipo", startDate: "2023-12-01", endDate: "2024-01-30", assignee: "Andrea", priority: "P3" },
            { id: 202, title: "Notificaciones Push", effortMin: 20, effortMax: 35, impact: 4, complexity: 5, category: "UX", devStatus: "No Empezado", startDate: "2024-01-15", endDate: "2024-02-15", assignee: "Fabián", priority: "P4" }
          ]
        },
        {
          id: 3,
          name: "v2.0: Scaling & Vision",
          color: "#00c875",
          limit: 150,
          features: [
            { id: 301, title: "Motor de IA Predictiva", effortMin: 80, effortMax: 120, impact: 10, complexity: 10, category: "Vision", devStatus: "No Empezado", startDate: "2024-03-01", endDate: "2024-06-30", assignee: "Daniel", priority: "P5" },
            { id: 302, title: "Multi-idioma (Mercado Asia)", effortMin: 50, effortMax: 80, impact: 10, complexity: 6, category: "Global", devStatus: "No Empezado", startDate: "2024-05-01", endDate: "2024-07-30", assignee: "Jorge", priority: "P4" }
          ]
        }
      ]
    }
  ]);

  const activeProject = projects.find(p => p.id === selectedProjectId);

  const createProject = (name) => {
    const newProject = {
      id: Date.now(),
      name: name,
      settings: { ...globalDefaults },
      roadmap: [
        { id: 1, name: "v1.0: Foundation", color: "#0073ea", limit: 100, features: [] },
        { id: 2, name: "v1.5: Optimization", color: "#a25ddc", limit: 120, features: [] },
        { id: 3, name: "v2.0: Scaling & Vision", color: "#00c875", limit: 150, features: [] }
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

  // Funciones puente para aislar los updates del roadmap al proyecto seleccionado
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

  const moveFeature = (fromIdx, featureId, toIdx) => {
    if (!activeProject) return;
    const updated = [...activeProject.roadmap];
    const feature = updated[fromIdx].features.find(f => f.id === featureId);
    updated[fromIdx].features = updated[fromIdx].features.filter(f => f.id !== featureId);
    updated[toIdx].features.push(feature);
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
      priority: "P5",
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

  return (
    <div className="min-h-screen bg-bone text-carbon">
      {/* Universal Top Navigation */}
      <nav className="bg-carbon text-bone px-4 py-3 flex justify-between items-center shadow-md sticky top-0 z-40">

        {/* Left Side: Logo & Main Navigation */}
        <div className="flex items-center gap-6">
          <div
            className="font-serif font-bold tracking-widest uppercase flex items-center gap-2 cursor-pointer"
            onClick={() => setShowPortfolio(true)}
          >
            <div className="w-6 h-6 bg-bone flex items-center justify-center">
              <div className="w-2 h-2 bg-carbon"></div>
            </div>
            <span>Chambómetro</span>
          </div>

          {/* Separator */}
          <div className="h-6 w-px bg-stone-light opacity-30 hidden md:block"></div>

          {/* View Selectors (Only shown if a project is selected) */}
          {selectedProjectId && (
            <div className="hidden md:flex gap-2">
              <button
                onClick={() => setCurrentView('matrix')}
                className={`px-4 py-1.5 text-xs font-bold uppercase transition-colors flex items-center gap-2 ${currentView === 'matrix' ? 'bg-bone text-carbon' : 'hover:bg-stone text-bone/70'}`}
              >
                Matriz Ejecutiva
              </button>
              <button
                onClick={() => setCurrentView('roadmap')}
                className={`px-4 py-1.5 text-xs font-bold uppercase transition-colors flex items-center gap-2 ${currentView === 'roadmap' ? 'bg-bone text-carbon' : 'text-bone/70 hover:bg-stone'}`}
              >
                <span className={`w-2 h-2 rounded-full ${currentView === 'roadmap' ? 'bg-[#00c875]' : 'bg-transparent'}`}></span> Roadmap Operativo
              </button>
              <button
                onClick={() => setCurrentView('kanban')}
                className={`px-4 py-1.5 text-xs font-bold uppercase transition-colors flex items-center gap-2 ${currentView === 'kanban' ? 'bg-bone text-carbon' : 'text-bone/70 hover:bg-stone'}`}
              >
                Kanban
              </button>
              <button
                onClick={() => setCurrentView('gantt')}
                className={`px-4 py-1.5 text-xs font-bold uppercase transition-colors flex items-center gap-2 ${currentView === 'gantt' ? 'bg-bone text-carbon' : 'text-bone/70 hover:bg-stone'}`}
              >
                Gantt
              </button>
              <button
                onClick={() => setCurrentView('eisenhower')}
                className={`px-4 py-1.5 text-xs font-bold uppercase transition-colors flex items-center gap-2 ${currentView === 'eisenhower' ? 'bg-bone text-carbon' : 'text-bone/70 hover:bg-stone'}`}
              >
                Eisenhower
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Global Toggles & Settings */}
        <div className="flex items-center gap-4">

          <button
            onClick={() => setShowPortfolio(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase transition-colors text-bone/70 hover:bg-stone"
            title="Abrir Portafolio"
          >
            <Briefcase size={16} /> <span className="hidden md:inline">Portafolios</span>
          </button>

          {/* Admin Toggle Simulator */}
          <div className="flex items-center gap-2 bg-stone px-3 py-1.5">
            <UserCog size={14} className={isAdmin ? 'text-bone' : 'text-stone-light'} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-light">Rol:</span>
            <button
              onClick={() => setIsAdmin(!isAdmin)}
              className={`text-xs font-bold px-2 py-0.5 uppercase transition-colors ${isAdmin ? 'bg-bone text-carbon' : 'text-bone hover:text-white'}`}
            >
              {isAdmin ? 'M-Admin' : 'Viewer'}
            </button>
          </div>

          <button
            onClick={() => {
              setSelectedProjectId(null);
              setCurrentView('settings');
            }}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase transition-colors ${currentView === 'settings' ? 'bg-bone text-carbon' : 'text-bone/70 hover:bg-stone'}`}
            title="Configuración Financiera"
          >
            <Settings size={16} /> <span className="hidden md:inline">Parámetros</span>
          </button>
        </div>
      </nav>

      <main className="pb-12 h-full">
        {/* Project Breadcrumb / Back Navigation */}
        {selectedProjectId && currentView !== 'settings' && (
          <div className="bg-bone border-b border-stone-light px-8 py-3 flex items-center gap-3">
            <div className="text-carbon font-bold text-sm tracking-wide flex items-center gap-2">
              <Briefcase size={14} /> Proyecto Activo: {activeProject?.name}
            </div>
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
            globalSettings={globalDefaults}
          />
        )}

        {currentView === 'settings' && (
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
            settings={activeProject.settings} // Passed down to calculate financials
          />
        )}

        {currentView === 'roadmap' && activeProject && (
          <RoadmapView
            roadmap={activeProject.roadmap}
            addIdea={addIdea}
            updateFeatureStatus={updateFeatureStatus}
            settings={activeProject.settings} // Passed down to calculate financials
          />
        )}

        {currentView === 'kanban' && activeProject && (
          <KanbanView
            roadmap={activeProject.roadmap}
            updateFeatureStatus={updateFeatureStatus}
            settings={activeProject.settings}
          />
        )}

        {currentView === 'gantt' && activeProject && (
          <GanttView
            roadmap={activeProject.roadmap}
          />
        )}

        {currentView === 'eisenhower' && activeProject && (
          <EisenhowerView
            roadmap={activeProject.roadmap}
          />
        )}
      </main>
    </div>
  );
}

export default App;
