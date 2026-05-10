import React, { useState } from 'react';
import { Outlet, Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useProjects } from '@/lib/store';
import { Folder, Plus, Menu, X, Share2, Search, Zap, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Layout() {
  const { projects, createProject, isLoaded } = useProjects();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const navigate = useNavigate();
  const { projectId } = useParams();

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      const p = createProject(newProjectName.trim());
      setNewProjectName('');
      setIsCreateModalOpen(false);
      navigate(`/p/${p.id}`);
      setIsSidebarOpen(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#fdfdfc] text-gray-400">
        <div className="flex flex-col items-center gap-3">
           <Layers className="w-8 h-8 animate-pulse text-gray-300" />
           <p className="text-sm font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#f9f9f8] border-r border-[#e9e9e7] w-full">
      <div className="p-4 flex items-center justify-between pb-6">
        <div className="flex items-center gap-2 font-semibold text-gray-800">
          <Layers className="w-5 h-5 text-gray-700" />
          <span>BuilderPad</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
         <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest px-2 pb-2 mt-4">
            Projects
         </div>
        
        {projects.map((p) => (
          <Link
            key={p.id}
            to={`/p/${p.id}`}
            onClick={() => setIsSidebarOpen(false)}
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors decoration-transparent",
              projectId === p.id 
                ? "bg-[#efefef] text-gray-900 font-medium" 
                : "text-gray-600 hover:bg-[#efefef] hover:text-gray-900"
            )}
          >
            <Folder className="w-4 h-4 opacity-70" />
            <span className="truncate">{p.name}</span>
          </Link>
        ))}
        {projects.length === 0 && (
          <div className="px-2 py-3 text-sm text-gray-400">
            No projects yet.
          </div>
        )}
      </div>

      <div className="p-3 border-t border-[#e9e9e7]">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-[#efefef] hover:text-gray-900 rounded-md transition-colors font-medium border border-transparent"
        >
           <Plus className="w-4 h-4" />
           New Project
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-white text-gray-900 font-sans overflow-hidden selection:bg-gray-200">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 flex-shrink-0 h-full">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/20 z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-white z-50 md:hidden shadow-2xl border-r border-gray-100"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="md:hidden flex items-center p-3 border-b border-gray-100 bg-white z-10 sticky top-0">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 -ml-1.5 mr-2 rounded-md hover:bg-gray-100 text-gray-600"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="font-semibold text-gray-800 flex items-center gap-2">
             <Layers className="w-4 h-4" />
             BuilderPad
          </div>
        </div>
        
        <main className="flex-1 overflow-y-auto w-full relative">
          <Outlet />
        </main>
      </div>

      {/* Create Project Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20"
              onClick={() => setIsCreateModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md relative overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Create New Project</h3>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600 rounded-md p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleCreateSubmit} className="p-6">
                <input
                  type="text"
                  autoFocus
                  placeholder="Project Name, e.g. Side Hustle"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full text-base placeholder:text-gray-400 text-gray-900 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
                />
                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newProjectName.trim()}
                    className="px-4 py-2 text-sm font-medium text-white hover:text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 rounded-lg transition-colors"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
