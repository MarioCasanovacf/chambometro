import React, { useState, useEffect, Suspense } from 'react';
import LoginScreen from './components/LoginScreen';
import { Settings, Briefcase, UserCog, LayoutGrid, Map, Columns3, CalendarDays, Target, Loader2, LogOut } from 'lucide-react';
import { db, auth } from './lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Lazy-load heavy view components for code splitting
const MatrixView = React.lazy(() => import('./components/MatrixView'));
const RoadmapView = React.lazy(() => import('./components/RoadmapView'));
const PortfolioView = React.lazy(() => import('./components/PortfolioView'));
const SettingsView = React.lazy(() => import('./components/SettingsView'));
const KanbanView = React.lazy(() => import('./components/KanbanView'));
const GanttView = React.lazy(() => import('./components/GanttView'));
const EisenhowerView = React.lazy(() => import('./components/EisenhowerView'));

function App() {
  const [currentView, setCurrentView] = useState('roadmap');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

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



  // --- Auth & Firestore Real-time Sync ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) {
        setLoading(false); // Stop loading if no user
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setProjects([]);
      return;
    }

    setLoading(true);
    const unsubscribeDb = onSnapshot(collection(db, 'projects'), (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id === '1' ? 1 : doc.id // Handle the initial numeric ID if it exists
      }));

      setProjects(projectsData);
      setLoading(false);

      // Select first project if none selected (functional updater avoids stale closure)
      setSelectedProjectId((prev) => {
        if (prev === null && projectsData.length > 0) {
          return projectsData[0].id;
        }
        return prev;
      });
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });

    return () => unsubscribeDb();
  }, [user]); // Only re-subscribe when user changes — NOT selectedProjectId

  const saveProjectToFirestore = async (project) => {
    try {
      await setDoc(doc(db, 'projects', String(project.id)), project);
    } catch (error) {
      console.error("Error saving project: ", error);
    }
  };

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
      id: String(Date.now()), // Use string IDs for Firestore consistency
      name: name,
      settings: JSON.parse(JSON.stringify(defaultSettings)),
      roadmap: [
        { id: Date.now() + 1, name: "v1.0: Foundation", color: "#0073ea", limit: 100, features: [] },
      ]
    };
    saveProjectToFirestore(newProject);
  };

  const deleteProject = async (id) => {
    try {
      await deleteDoc(doc(db, 'projects', String(id)));
      if (selectedProjectId === id) {
        setSelectedProjectId(null);
      }
    } catch (error) {
      console.error("Error deleting project: ", error);
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
    if (!activeProject) return;
    const updatedProject = { ...activeProject, roadmap: newRoadmap };
    saveProjectToFirestore(updatedProject);
  };

  const updateActiveProjectSettings = (newSettings) => {
    if (!activeProject) return;
    const updatedProject = { ...activeProject, settings: newSettings };
    saveProjectToFirestore(updatedProject);
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

  const handleSignOut = () => {
    signOut(auth);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-page-bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-accent-blue animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-page-bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-accent-blue animate-spin" />
          <p className="text-bone/60 font-medium tracking-widest uppercase text-xs">Cargando Tablero...</p>
        </div>
      </div>
    );
  }

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

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all text-bone/40 hover:text-red-400 hover:bg-red-400/10 border border-transparent"
            title="Cerrar Sesión"
          >
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      <main className="pb-12 h-full">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-10 h-10 text-accent-blue animate-spin" />
          </div>
        }>
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
        </Suspense>
      </main>
    </div>
  );
}

export default App;
