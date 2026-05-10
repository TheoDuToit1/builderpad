import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Layers, Plus } from 'lucide-react';
import { useProjects } from '@/lib/store';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { projects, createProject } = useProjects();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      const p = createProject(newProjectName.trim());
      navigate(`/p/${p.id}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-full max-w-5xl mx-auto w-full bg-[#fdfdfc]">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full"
      >
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-white border border-gray-100 shadow-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Layers className="w-8 h-8 text-gray-700" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Welcome to BuilderPad</h1>
          <p className="text-gray-500 text-lg max-w-lg mx-auto">
            Your fast, local-first workspace. Manage notes, organize phases, and track your to-dos.
          </p>
        </div>

        {projects.length > 0 ? (
          <div className="w-full">
            <div className="flex items-center justify-between mb-6 px-1">
               <h3 className="font-semibold text-gray-800 text-lg">Your Projects</h3>
               <button
                  onClick={() => setIsCreating(true)}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors bg-white px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 shadow-sm"
               >
                 <Plus className="w-4 h-4" /> New Project
               </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => navigate(`/p/${p.id}`)}
                  className="group flex flex-col text-left bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                >
                  <div className="flex items-start justify-between mb-4 w-full">
                    <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {p.logo ? (
                         <img src={p.logo} alt="" className="w-full h-full object-contain bg-white" />
                      ) : (
                        <Layers className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <span className="text-gray-400 group-hover:text-gray-900 transition-colors">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 text-lg mb-1 truncate w-full">{p.name}</h4>
                  <p className="text-sm text-gray-500 mb-4 truncate w-full">Last updated {new Date(p.updatedAt).toLocaleDateString()}</p>
                  
                  <div className="flex items-center gap-3 mt-auto text-xs font-medium text-gray-500 border-t border-gray-100 pt-4 w-full">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> {p.notes?.length || 0} Notes</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> {p.phases?.length || 0} Phases</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {p.todos?.length || 0} Tasks</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : isCreating ? (
          <form onSubmit={handleCreateSubmit} className="max-w-sm mx-auto bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Create New Project</h3>
            <input
              type="text"
              autoFocus
              placeholder="e.g. Side Hustle Dashboard"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="w-full text-base placeholder:text-gray-400 text-gray-900 border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all mb-4"
            />
            <div className="flex gap-3">
               <button
                 type="button"
                 onClick={() => setIsCreating(false)}
                 className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-lg transition-colors"
               >
                 Cancel
               </button>
               <button
                 type="submit"
                 disabled={!newProjectName.trim()}
                 className="flex-1 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 rounded-lg transition-colors"
               >
                 Create
               </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3.5 rounded-xl font-medium hover:bg-gray-800 focus:ring-4 focus:ring-gray-200 transition-all shadow-md mx-auto"
          >
            <Plus className="w-5 h-5" />
            Create Your First Project
          </button>
        )}
      </motion.div>
    </div>
  );
}
