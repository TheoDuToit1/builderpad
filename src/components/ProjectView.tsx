import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { useProjects } from '@/lib/store';
import { encodeProjectToToken } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { 
  Lock, Unlock, Share2, Type, Subtitles, Grip, CheckSquare, 
  Square, Plus, Trash2, Calendar, FileText, CheckCircle2, 
  LayoutGrid, List, Pencil, FolderOpen, UploadCloud, Download, Image as ImageIcon, File, X, Check, Copy, Link as LinkIcon, Edit3, Eye, Maximize2, Key, EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Note, Phase, Project, ProjectFile, Todo, Credential, CredentialKey } from '@/lib/types';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function ProjectView() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { getProject, updateProject, deleteProject } = useProjects();
  const project = projectId ? getProject(projectId) : undefined;
  
  const [activeTab, setActiveTab] = useState<'notes' | 'phases' | 'todos' | 'files' | 'credentials'>('notes');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  // Modal States
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{message: string, onConfirm: () => void} | null>(null);
  const [fileToView, setFileToView] = useState<ProjectFile | null>(null);
  const [previewNotes, setPreviewNotes] = useState<Record<string, boolean>>({});
  const [noteToView, setNoteToView] = useState<Note | null>(null);
  const [phaseToView, setPhaseToView] = useState<Phase | null>(null);

  const toggleNotePreview = (id: string) => {
    setPreviewNotes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const activeTodosCount = (project?.todos || []).filter(t => !t.isCompleted).length;
  const completedTodosCount = (project?.todos || []).filter(t => t.isCompleted).length;

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Project not found. Select or create one from the sidebar.
      </div>
    );
  }

  const handleShare = () => {
    try {
      const token = encodeProjectToToken(project);
      // Use APP_URL from env if available, otherwise use window.location.origin
      const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
      const url = `${baseUrl}/share/${token}`;
      console.log('Share URL generated:', url);
      setShareUrl(url);
    } catch (error) {
      console.error('Error generating share URL:', error);
      alert('Failed to generate share link. Please try again.');
    }
  };

  const handleCreateNote = () => {
    const newNote: Note = {
      id: uuidv4(),
      title: 'Untitled Note',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    updateProject(project.id, { notes: [newNote, ...project.notes] });
  };

  const handleCreatePhase = () => {
    const newPhase: Phase = {
      id: uuidv4(),
      title: 'New Phase',
      content: '',
      isDone: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    updateProject(project.id, { phases: [...project.phases, newPhase] });
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    updateProject(project.id, {
      notes: project.notes.map(n => n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n)
    });
  };

  const deleteNote = (id: string) => {
    setConfirmState({
      message: "Are you sure you want to delete this note?",
      onConfirm: () => {
        updateProject(project.id, {
          notes: project.notes.filter(n => n.id !== id)
        });
      }
    });
  };

  const updatePhase = (id: string, updates: Partial<Phase>) => {
    updateProject(project.id, {
      phases: project.phases.map(p => p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p)
    });
  };

  const deletePhase = (id: string) => {
    setConfirmState({
      message: "Are you sure you want to delete this phase?",
      onConfirm: () => {
        updateProject(project.id, {
          phases: project.phases.filter(p => p.id !== id)
        });
      }
    });
  };

  const handleCreateTodo = () => {
    const newTodo: Todo = {
      id: uuidv4(),
      text: '',
      isCompleted: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    updateProject(project.id, { todos: [...(project.todos || []), newTodo] });
  };

  const updateTodo = (id: string, updates: Partial<Todo>) => {
    updateProject(project.id, {
      todos: (project.todos || []).map(t => t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t)
    });
  };

  const deleteTodo = (id: string) => {
    updateProject(project.id, {
       todos: (project.todos || []).filter(t => t.id !== id)
    });
  };

  // Credential Management
  const handleCreateCredential = () => {
    const newCredential: Credential = {
      id: uuidv4(),
      title: 'New Credential',
      keys: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    updateProject(project.id, { credentials: [...(project.credentials || []), newCredential] });
  };

  const updateCredential = (id: string, updates: Partial<Credential>) => {
    updateProject(project.id, {
      credentials: (project.credentials || []).map(c => c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c)
    });
  };

  const deleteCredential = (id: string) => {
    setConfirmState({
      message: "Are you sure you want to delete this credential?",
      onConfirm: () => {
        updateProject(project.id, {
          credentials: (project.credentials || []).filter(c => c.id !== id)
        });
      }
    });
  };

  const addKeyToCredential = (credentialId: string) => {
    const credential = (project.credentials || []).find(c => c.id === credentialId);
    if (!credential) return;

    const newKey: CredentialKey = {
      id: uuidv4(),
      key: '',
      value: '',
      isVisible: false,
    };

    updateCredential(credentialId, {
      keys: [...credential.keys, newKey]
    });
  };

  const updateCredentialKey = (credentialId: string, keyId: string, updates: Partial<CredentialKey>) => {
    const credential = (project.credentials || []).find(c => c.id === credentialId);
    if (!credential) return;

    updateCredential(credentialId, {
      keys: credential.keys.map(k => k.id === keyId ? { ...k, ...updates } : k)
    });
  };

  const deleteCredentialKey = (credentialId: string, keyId: string) => {
    const credential = (project.credentials || []).find(c => c.id === credentialId);
    if (!credential) return;

    updateCredential(credentialId, {
      keys: credential.keys.filter(k => k.id !== keyId)
    });
  };

  const toggleKeyVisibility = (credentialId: string, keyId: string) => {
    const credential = (project.credentials || []).find(c => c.id === credentialId);
    if (!credential) return;

    const key = credential.keys.find(k => k.id === keyId);
    if (!key) return;

    updateCredentialKey(credentialId, keyId, { isVisible: !key.isVisible });
  };

  const handleBrandUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert(`File is too large. Limit is 2MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      if (type === 'logo') {
        updateProject(project.id, { logo: base64Data });
      } else {
        updateProject(project.id, { favicon: base64Data });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const deleteBrand = (type: 'logo' | 'favicon') => {
    if (type === 'logo') {
      updateProject(project.id, { logo: undefined });
    } else {
      updateProject(project.id, { favicon: undefined });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const newFiles: ProjectFile[] = [];
    let processedCount = 0;

    fileArray.forEach((file: File) => {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit per file for localStorage limit safety
        alert(`File ${file.name} is too large. Please upload files under 2MB.`);
        processedCount++;
        if (processedCount === fileArray.length && newFiles.length > 0) {
          updateProject(project.id, { files: [...newFiles, ...(project.files || [])] });
        }
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target?.result as string;
        const newFile: ProjectFile = {
          id: uuidv4(),
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          data: base64Data,
          createdAt: Date.now()
        };
        newFiles.push(newFile);
        processedCount++;

        // Update project only after all files are processed
        if (processedCount === fileArray.length) {
          updateProject(project.id, { files: [...newFiles, ...(project.files || [])] });
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const deleteFile = (id: string) => {
    setConfirmState({
      message: "Are you sure you want to delete this file?",
      onConfirm: () => {
        updateProject(project.id, {
          files: (project.files || []).filter(f => f.id !== id)
        });
      }
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const isTextFile = (file: ProjectFile) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const textExtensions = ['txt', 'md', 'json', 'csv', 'ts', 'tsx', 'js', 'jsx', 'html', 'css', 'yaml', 'yml'];
    return file.type.startsWith('text/') || (ext && textExtensions.includes(ext));
  };

  const getTextContent = (dataUrl: string) => {
    try {
      const base64 = dataUrl.split(',')[1];
      const binString = window.atob(base64);
      const bytes = new Uint8Array(binString.length);
      for (let i = 0; i < binString.length; i++) {
          bytes[i] = binString.charCodeAt(i);
      }
      return new TextDecoder().decode(bytes);
    } catch (e) {
      return "Unable to decode file content.";
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      key={project.id}
      className="max-w-5xl mx-auto px-4 sm:px-8 py-8 md:py-12 pb-32"
    >
      {/* Header */}
      <div className="group flex flex-col items-start gap-4 mb-10">
        <div className="flex w-full items-center justify-between gap-4">
          <input
            value={project.name}
            onChange={(e) => updateProject(project.id, { name: e.target.value })}
            placeholder="Project Name"
            className="text-3xl sm:text-4xl font-bold bg-transparent outline-none w-full placeholder:text-gray-300 text-gray-900 border-b border-transparent hover:border-gray-200 focus:border-gray-300 transition-colors pb-1"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateProject(project.id, { isPublic: !project.isPublic })}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                project.isPublic ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {project.isPublic ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{project.isPublic ? 'Public' : 'Private'}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-100 mb-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('notes')}
          className={cn(
            "pb-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
            activeTab === 'notes' ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Notes ({project.notes.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('phases')}
          className={cn(
            "pb-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
            activeTab === 'phases' ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Phases ({project.phases.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('todos')}
          className={cn(
            "pb-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
            activeTab === 'todos' ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            To-Dos ({(project.todos || []).length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={cn(
            "pb-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
            activeTab === 'files' ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            Files ({(project.files || []).length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('credentials')}
          className={cn(
            "pb-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
            activeTab === 'credentials' ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            Credentials ({(project.credentials || []).length})
          </div>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'notes' ? (
          <motion.div
            key="notes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handleCreateNote}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-md transition-colors"
              >
                <Plus className="w-4 h-4" /> New Note
              </button>
              
              <div className="flex items-center bg-gray-100 p-0.5 rounded-md border border-gray-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn("p-1.5 rounded-sm transition-colors", viewMode === 'grid' ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-800")}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={cn("p-1.5 rounded-sm transition-colors", viewMode === 'table' ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-800")}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {project.notes.length === 0 ? (
               <div className="mt-12 text-center text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No notes yet. Create one to get started.</p>
               </div>
            ) : (
               <div className={cn(
                 "mt-6", 
                 viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-3"
               )}>
                 <AnimatePresence>
                   {project.notes.map(note => (
                     <motion.div
                       layout
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.9 }}
                       key={note.id}
                       className={cn(
                         "group relative bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col transition-shadow hover:shadow-md",
                         viewMode === 'table' ? "flex-row p-4 items-start gap-4" : "p-5 min-h-[200px]"
                       )}
                     >
                       <div className="flex-1 flex flex-col min-w-0 w-full h-full">
                         <div className="flex items-start justify-between gap-2 mb-2 w-full">
                           <input
                             value={note.title}
                             onChange={(e) => updateNote(note.id, { title: e.target.value })}
                             placeholder="Note Title"
                             className="font-medium text-gray-900 bg-transparent outline-none w-full placeholder:text-gray-300"
                           />
                           <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                             <button
                               onClick={() => setNoteToView(note)}
                               className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                               title="Open in popup"
                             >
                               <Maximize2 className="w-4 h-4" />
                             </button>
                             <button
                               onClick={() => toggleNotePreview(note.id)}
                               className={cn(
                                 "p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors",
                                 previewNotes[note.id] && "bg-gray-100 text-gray-800"
                               )}
                               title="Toggle Preview"
                             >
                               {previewNotes[note.id] ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                             </button>
                             <button
                               onClick={() => deleteNote(note.id)}
                               className="text-gray-400 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded"
                               title="Delete note"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </div>
                         </div>
                         
                         {previewNotes[note.id] ? (
                           <div className="flex-1 w-full prose prose-sm max-w-none text-gray-700 overflow-y-auto mb-2 dark:prose-invert prose-headings:font-medium prose-p:leading-relaxed">
                             {note.content ? (
                               <Markdown remarkPlugins={[remarkGfm]}>{note.content}</Markdown>
                             ) : (
                               <span className="text-gray-400 italic">No content to preview.</span>
                             )}
                           </div>
                         ) : (
                           <textarea
                             value={note.content}
                             onChange={(e) => updateNote(note.id, { content: e.target.value })}
                             placeholder="Type your note content here (Markdown supported)..."
                             className="flex-1 text-sm text-gray-600 bg-transparent outline-none resize-none placeholder:text-gray-300 min-h-[100px] w-full"
                           />
                         )}
                         <div className={cn("text-[11px] text-gray-400 font-mono mt-3", viewMode === 'table' && "hidden sm:block")}>
                           Updated {format(note.updatedAt, "MMM d, yyyy")}
                         </div>
                       </div>
                     </motion.div>
                   ))}
                 </AnimatePresence>
               </div>
            )}
          </motion.div>
        ) : activeTab === 'phases' ? (
          <motion.div
            key="phases"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
               <button
                  onClick={handleCreatePhase}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-md transition-colors"
                >
                <Plus className="w-4 h-4" /> New Phase
              </button>
            </div>

            {project.phases.length === 0 ? (
               <div className="mt-12 text-center text-gray-400">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No phases yet. Create one to get started.</p>
               </div>
            ) : (
                <div className="flex flex-col gap-2 mt-4">
                  <AnimatePresence>
                    {project.phases.map((phase) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        key={phase.id}
                        className={cn(
                          "group flex items-start gap-3 p-3 sm:p-4 bg-white border rounded-lg transition-colors",
                          phase.isDone ? "border-gray-100 bg-gray-50/50" : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <button
                          onClick={() => updatePhase(phase.id, { isDone: !phase.isDone })}
                          className="mt-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                        >
                          {phase.isDone ? (
                            <CheckSquare className="w-5 h-5 text-gray-900" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <input
                            value={phase.title}
                            onChange={(e) => updatePhase(phase.id, { title: e.target.value })}
                            placeholder="Phase Target"
                            className={cn(
                              "font-medium bg-transparent outline-none w-full placeholder:text-gray-300 transition-all text-sm sm:text-base",
                              phase.isDone ? "text-gray-400 line-through" : "text-gray-900"
                            )}
                          />
                          {!phase.isDone && (
                            <textarea
                              value={phase.content}
                              onChange={(e) => updatePhase(phase.id, { content: e.target.value })}
                              placeholder="Add description..."
                              className="w-full mt-2 text-sm text-gray-600 bg-transparent outline-none resize-none placeholder:text-gray-300 min-h-[40px]"
                            />
                          )}
                        </div>

                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setPhaseToView(phase)}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors flex-shrink-0"
                            title="Open in popup"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deletePhase(phase.id)}
                            className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0 transition-colors hover:bg-red-50 rounded"
                            title="Delete phase"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
            )}
          </motion.div>
        ) : activeTab === 'todos' ? (
          <motion.div
            key="todos"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handleCreateTodo}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-md transition-colors"
              >
                <Plus className="w-4 h-4" /> New To-Do
              </button>
            </div>

            {!(project.todos && project.todos.length > 0) ? (
               <div className="mt-12 text-center text-gray-400">
                  <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No to-dos yet. Add some tasks to track your progress.</p>
               </div>
            ) : (
                <div className="flex flex-col gap-2 mt-4">
                  <AnimatePresence>
                    {project.todos.map((todo) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        key={todo.id}
                        className={cn(
                          "group flex items-start gap-3 p-3 bg-white border rounded-lg transition-colors",
                          todo.isCompleted ? "border-gray-100 bg-gray-50/50" : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <button
                          onClick={() => updateTodo(todo.id, { isCompleted: !todo.isCompleted })}
                          className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 self-start mt-1"
                        >
                          {todo.isCompleted ? (
                            <CheckSquare className="w-5 h-5 text-green-600" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <textarea
                            value={todo.text}
                            onChange={(e) => {
                              updateTodo(todo.id, { text: e.target.value });
                              const target = e.target as HTMLTextAreaElement;
                              target.style.height = 'auto';
                              target.style.height = target.scrollHeight + 'px';
                            }}
                            placeholder="What needs to be done?"
                            className={cn(
                              "font-medium bg-transparent outline-none w-full placeholder:text-gray-300 transition-all text-sm resize-none overflow-hidden",
                              todo.isCompleted ? "text-gray-400 line-through" : "text-gray-800"
                            )}
                            style={{
                              minHeight: '24px',
                              height: 'auto'
                            }}
                            onFocus={(e) => {
                              const target = e.target as HTMLTextAreaElement;
                              target.style.height = 'auto';
                              target.style.height = target.scrollHeight + 'px';
                            }}
                            ref={(el) => {
                              if (el) {
                                el.style.height = 'auto';
                                el.style.height = el.scrollHeight + 'px';
                              }
                            }}
                          />
                        </div>

                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 flex-shrink-0 transition-opacity self-start"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
            )}
          </motion.div>
        ) : activeTab === 'files' ? (
          <motion.div
            key="files"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-3">
                   <label className="w-12 h-12 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer hover:border-gray-400 transition-colors">
                     {project.logo ? (
                       <img src={project.logo} className="w-full h-full object-contain bg-white" alt="Logo" />
                     ) : (
                       <ImageIcon className="w-5 h-5 text-gray-300 pointer-events-none" />
                     )}
                     <input type="file" accept="image/*" onChange={(e) => handleBrandUpload(e, 'logo')} className="hidden" />
                   </label>
                   <div>
                      <p className="text-sm font-medium text-gray-900 leading-none mb-1.5">Project Logo</p>
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] font-semibold text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-wider cursor-pointer">
                          {project.logo ? 'Change' : 'Upload'}
                          <input type="file" accept="image/*" onChange={(e) => handleBrandUpload(e, 'logo')} className="hidden" />
                        </label>
                        {project.logo && (
                          <button onClick={() => deleteBrand('logo')} className="text-[11px] font-semibold text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider">
                            Remove
                          </button>
                        )}
                      </div>
                   </div>
                 </div>

                 <div className="flex items-center gap-3">
                   <label className="w-12 h-12 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer hover:border-gray-400 transition-colors">
                     {project.favicon ? (
                       <img src={project.favicon} className="w-full h-full object-contain bg-white" alt="Favicon" />
                     ) : (
                       <ImageIcon className="w-5 h-5 text-gray-300 pointer-events-none" />
                     )}
                     <input type="file" accept=".ico,.png,.jpg,.svg" onChange={(e) => handleBrandUpload(e, 'favicon')} className="hidden" />
                   </label>
                   <div>
                      <p className="text-sm font-medium text-gray-900 leading-none mb-1.5">Favicon</p>
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] font-semibold text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-wider cursor-pointer">
                          {project.favicon ? 'Change' : 'Upload'}
                          <input type="file" accept=".ico,.png,.jpg,.svg" onChange={(e) => handleBrandUpload(e, 'favicon')} className="hidden" />
                        </label>
                        {project.favicon && (
                          <button onClick={() => deleteBrand('favicon')} className="text-[11px] font-semibold text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider">
                            Remove
                          </button>
                        )}
                      </div>
                   </div>
                 </div>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  multiple 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  ref={fileInputRef}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-md transition-colors"
                  title="Select one or multiple files to upload"
                >
                  <UploadCloud className="w-4 h-4" /> Upload Files
                </button>
              </div>
            </div>

            {!(project.files && project.files.length > 0) ? (
               <div className="mt-8 text-center text-gray-400 py-12 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                  <FolderOpen className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-medium text-gray-600">No files uploaded yet.</p>
                  <p className="text-xs mt-1">Upload project assets, documents, or screenshots.</p>
               </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  <AnimatePresence>
                    {project.files.map((file) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        key={file.id}
                        className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col transition-shadow hover:shadow-md"
                      >
                        <div className="aspect-square bg-gray-50 flex items-center justify-center p-2 relative overflow-hidden border-b border-gray-100">
                          {file.type.startsWith('image/') ? (
                            <img src={file.data} alt={file.name} className="w-full h-full object-contain" />
                          ) : (
                            <File className="w-10 h-10 text-gray-300" />
                          )}
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                             <button
                               onClick={() => setFileToView(file)}
                               className="p-1.5 bg-white text-gray-900 rounded hover:bg-gray-100 transition-colors"
                               title="View"
                             >
                                <ImageIcon className="w-4 h-4" />
                             </button>
                             <a 
                                href={file.data} 
                                download={file.name}
                                className="p-1.5 bg-white text-gray-900 rounded hover:bg-gray-100 transition-colors"
                                title="Download"
                             >
                               <Download className="w-4 h-4" />
                             </a>
                             <button
                               onClick={() => deleteFile(file.id)}
                               className="p-1.5 bg-white text-red-600 rounded hover:bg-red-50 transition-colors"
                               title="Delete"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                           </div>
                        </div>
                        <div className="p-3 bg-white">
                          <p className="text-xs font-medium text-gray-900 truncate" title={file.name}>{file.name}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{formatFileSize(file.size)}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
            )}
          </motion.div>
        ) : activeTab === 'credentials' ? (
          <motion.div
            key="credentials"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handleCreateCredential}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-md transition-colors"
              >
                <Plus className="w-4 h-4" /> New Credential
              </button>
            </div>

            {!(project.credentials && project.credentials.length > 0) ? (
               <div className="mt-12 text-center text-gray-400">
                  <Key className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No credentials yet. Add login details, API keys, or other secrets.</p>
               </div>
            ) : (
                <div className="flex flex-col gap-4 mt-4">
                  <AnimatePresence>
                    {project.credentials.map((credential) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        key={credential.id}
                        className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <input
                            value={credential.title}
                            onChange={(e) => updateCredential(credential.id, { title: e.target.value })}
                            placeholder="Credential Title (e.g., AWS Account, Database Login)"
                            className="font-medium text-gray-900 bg-transparent outline-none w-full placeholder:text-gray-300 text-base"
                          />
                          <button
                            onClick={() => deleteCredential(credential.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 flex-shrink-0 transition-opacity hover:bg-red-50 rounded"
                            title="Delete credential"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-2">
                          {credential.keys.map((keyItem) => (
                            <div key={keyItem.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded-md border border-gray-100">
                              <input
                                value={keyItem.key}
                                onChange={(e) => updateCredentialKey(credential.id, keyItem.id, { key: e.target.value })}
                                placeholder="Key name (e.g., username, api_key)"
                                className="text-sm text-gray-700 bg-white border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-gray-400 w-1/3 placeholder:text-gray-400"
                              />
                              <div className="flex-1 relative">
                                <input
                                  type={keyItem.isVisible ? "text" : "password"}
                                  value={keyItem.value}
                                  onChange={(e) => updateCredentialKey(credential.id, keyItem.id, { value: e.target.value })}
                                  placeholder="Value"
                                  className="text-sm text-gray-700 bg-white border border-gray-200 rounded px-2 py-1.5 pr-8 outline-none focus:border-gray-400 w-full placeholder:text-gray-400"
                                />
                                <button
                                  onClick={() => toggleKeyVisibility(credential.id, keyItem.id)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                  title={keyItem.isVisible ? "Hide" : "Show"}
                                >
                                  {keyItem.isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                              <button
                                onClick={() => deleteCredentialKey(credential.id, keyItem.id)}
                                className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0 transition-colors hover:bg-red-50 rounded"
                                title="Remove key"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => addKeyToCredential(credential.id)}
                          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Key
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {shareUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/20 z-0" 
              onClick={() => setShareUrl(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 10 }} 
              className="bg-white rounded-xl shadow-xl w-full max-w-md relative z-10 overflow-hidden flex flex-col p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold text-gray-900 text-lg">Share Project</h3>
                <button onClick={() => setShareUrl(null)} className="text-gray-400 hover:text-gray-600 rounded-md p-1"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-gray-500 mb-4">Anyone with this link can view the read-only version of this project.</p>
              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                <LinkIcon className="w-4 h-4 text-gray-400 ml-2 shrink-0" />
                <input type="text" readOnly value={shareUrl} className="bg-transparent text-sm text-gray-700 outline-none w-full" onFocus={(e) => e.target.select()} />
                <button 
                  onClick={() => { navigator.clipboard.writeText(shareUrl).catch(()=>alert('Copy manually!')); setShareUrl(null); }} 
                  className="shrink-0 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 text-xs font-medium rounded-md hover:bg-gray-50"
                >
                  <Copy className="w-3.5 h-3.5 inline mr-1.5"/> Copy
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmState && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/20 z-0" 
              onClick={() => setConfirmState(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 10 }} 
              className="bg-white rounded-xl shadow-xl w-full max-w-sm relative z-10 overflow-hidden flex flex-col p-6 text-center"
            >
              <h3 className="font-semibold text-gray-900 text-lg mb-2">Are you sure?</h3>
              <p className="text-sm text-gray-500 mb-6">{confirmState.message}</p>
              <div className="flex gap-2 w-full">
                <button onClick={() => setConfirmState(null)} className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
                <button onClick={() => { confirmState.onConfirm(); setConfirmState(null); }} className="flex-1 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* File Viewer Modal */}
      <AnimatePresence>
        {fileToView && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80" onClick={() => setFileToView(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-xl shadow-2xl relative flex flex-col overflow-hidden max-w-5xl w-full max-h-full">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2 min-w-0">
                  <File className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="font-medium text-sm text-gray-900 truncate">{fileToView.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a href={fileToView.data} download={fileToView.name} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                    <Download className="w-4 h-4" />
                  </a>
                  <button onClick={() => setFileToView(null)} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-4 min-h-[300px] w-full">
                {fileToView.type.startsWith('image/') ? (
                  <img src={fileToView.data} alt={fileToView.name} className="max-w-full max-h-full object-contain rounded drop-shadow-md bg-white pattern-checkered" />
                ) : isTextFile(fileToView) ? (
                  <div className="w-full h-full overflow-auto bg-white p-6 rounded-lg shadow-inner border border-gray-200">
                    {fileToView.name.toLowerCase().endsWith('.md') ? (
                       <div className="prose prose-sm max-w-none text-gray-700 dark:prose-invert prose-headings:font-medium prose-p:leading-relaxed mx-auto w-full">
                         <Markdown remarkPlugins={[remarkGfm]}>{getTextContent(fileToView.data)}</Markdown>
                       </div>
                    ) : (
                       <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">{getTextContent(fileToView.data)}</pre>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <File className="w-16 h-16 mb-2 opacity-50" />
                    <p className="text-sm">No preview available for this file type.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Note Viewer Modal */}
      <AnimatePresence>
        {noteToView && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60" onClick={() => setNoteToView(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-xl shadow-2xl relative flex flex-col overflow-hidden max-w-4xl w-full max-h-[90vh]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                  <h3 className="font-semibold text-lg text-gray-900 truncate">{noteToView.title || 'Untitled Note'}</h3>
                </div>
                <button onClick={() => setNoteToView(null)} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-6 sm:p-8">
                <div className="prose prose-base max-w-none text-gray-700 dark:prose-invert prose-headings:font-semibold prose-p:leading-relaxed prose-a:text-blue-600 prose-code:text-pink-600 prose-pre:bg-gray-900">
                  {noteToView.content ? (
                    <Markdown remarkPlugins={[remarkGfm]}>{noteToView.content}</Markdown>
                  ) : (
                    <p className="text-gray-400 italic">This note is empty.</p>
                  )}
                </div>
              </div>
              <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 font-mono">
                Updated {format(noteToView.updatedAt, "MMMM d, yyyy 'at' h:mm a")}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Phase Viewer Modal */}
      <AnimatePresence>
        {phaseToView && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60" onClick={() => setPhaseToView(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-xl shadow-2xl relative flex flex-col overflow-hidden max-w-3xl w-full max-h-[90vh]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => {
                      updatePhase(phaseToView.id, { isDone: !phaseToView.isDone });
                      setPhaseToView({ ...phaseToView, isDone: !phaseToView.isDone });
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                  >
                    {phaseToView.isDone ? (
                      <CheckSquare className="w-6 h-6 text-green-600" />
                    ) : (
                      <Square className="w-6 h-6" />
                    )}
                  </button>
                  <h3 className={cn(
                    "font-semibold text-lg truncate",
                    phaseToView.isDone ? "text-gray-400 line-through" : "text-gray-900"
                  )}>
                    {phaseToView.title || 'New Phase'}
                  </h3>
                </div>
                <button onClick={() => setPhaseToView(null)} className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-6 sm:p-8">
                <div className="prose prose-base max-w-none text-gray-700 dark:prose-invert prose-headings:font-semibold prose-p:leading-relaxed prose-a:text-blue-600 prose-code:text-pink-600 prose-pre:bg-gray-900">
                  {phaseToView.content ? (
                    <Markdown remarkPlugins={[remarkGfm]}>{phaseToView.content}</Markdown>
                  ) : (
                    <p className="text-gray-400 italic">No description provided for this phase.</p>
                  )}
                </div>
              </div>
              <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 font-mono">
                Updated {format(phaseToView.updatedAt, "MMMM d, yyyy 'at' h:mm a")}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
