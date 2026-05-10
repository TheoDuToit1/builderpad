import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { decodeTokenToProject, cn } from '@/lib/utils';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, FileText, CheckCircle2, LayoutGrid, List, Square, CheckSquare, FolderOpen, File, Download, Image as ImageIcon, X } from 'lucide-react';
import { ProjectFile } from '@/lib/types';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function SharedProjectView() {
  const { token } = useParams();
  
  const project = useMemo(() => {
    if (!token) return null;
    return decodeTokenToProject(token);
  }, [token]);

  const [activeTab, setActiveTab] = useState<'notes' | 'phases' | 'todos' | 'files'>('notes');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [fileToView, setFileToView] = useState<ProjectFile | null>(null);

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

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-800 bg-gray-50/50">
         <Layers className="w-12 h-12 mb-4 text-gray-300" />
        <h2 className="text-xl font-medium mb-2">Invalid or corrupted link.</h2>
        <p className="text-gray-500 mb-6">We couldn't decode this project.</p>
        <Link to="/" className="text-sm border border-gray-200 px-4 py-2 hover:bg-gray-100 rounded-md font-medium">Go to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <div className="flex items-center px-6 py-4 border-b border-gray-100 bg-[#f9f9f8]">
         <Link to="/" className="flex items-center gap-2 font-semibold text-gray-800 hover:text-gray-900 transition-colors">
            <Layers className="w-5 h-5 text-gray-600" />
            <span>BuilderPad</span>
         </Link>
         <div className="ml-4 px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-[11px] font-bold uppercase tracking-wider">
            Read-Only Shared View
         </div>
      </div>
      
      <motion.div 
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         className="max-w-5xl mx-auto px-4 sm:px-8 py-8 md:py-12 pb-32"
      >
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 pb-1">{project.name}</h1>
          <p className="text-sm text-gray-500 mt-2 font-mono">Last updated {format(project.updatedAt, "MMM d, yyyy")}</p>
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
            <div className="flex items-center justify-end mb-4">
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
                  <p>No notes in this project.</p>
               </div>
            ) : (
               <div className={cn(
                 "mt-6", 
                 viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-3"
               )}>
                 {project.notes.map(note => (
                     <div
                       key={note.id}
                       className={cn(
                         "bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col",
                         viewMode === 'table' ? "flex-row p-4 items-start gap-4" : "p-5 min-h-[200px]"
                       )}
                     >
                       <div className="flex-1 flex flex-col min-w-0 w-full h-full max-h-full">
                         <div className="font-medium text-gray-900 mb-2 w-full truncate">
                           {note.title || 'Untitled Note'}
                         </div>
                         <div className="flex-1 text-sm text-gray-700 w-full prose prose-sm max-w-none mb-2 dark:prose-invert prose-headings:font-medium prose-p:leading-relaxed overflow-x-hidden">
                           {note.content ? (
                             <Markdown remarkPlugins={[remarkGfm]}>{note.content}</Markdown>
                           ) : (
                             <span className="text-gray-300 italic">Empty note...</span>
                           )}
                         </div>
                         <div className={cn("text-[11px] text-gray-400 font-mono mt-4 pt-2 border-t border-gray-50", viewMode === 'table' && "hidden sm:block")}>
                           Updated {format(note.updatedAt, "MMM d, yyyy")}
                         </div>
                       </div>
                     </div>
                   ))}
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
            {project.phases.length === 0 ? (
               <div className="mt-12 text-center text-gray-400">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No phases in this project.</p>
               </div>
            ) : (
                <div className="flex flex-col gap-2 mt-4">
                    {project.phases.map((phase) => (
                      <div
                        key={phase.id}
                        className={cn(
                          "group flex items-start gap-3 p-3 sm:p-4 bg-white border rounded-lg",
                          phase.isDone ? "border-gray-100 bg-gray-50/50" : "border-gray-200"
                        )}
                      >
                        <div className="mt-1 text-gray-400 flex-shrink-0">
                          {phase.isDone ? (
                            <CheckSquare className="w-5 h-5 text-gray-900" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className={cn(
                              "font-medium transition-all text-sm sm:text-base",
                              phase.isDone ? "text-gray-400 line-through" : "text-gray-900"
                            )}>
                            {phase.title || 'Untitled Phase'}
                          </div>
                          {!phase.isDone && phase.content && (
                            <div className="w-full mt-2 text-sm text-gray-600 whitespace-pre-wrap break-words">
                              {phase.content}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
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
            {!(project.todos && project.todos.length > 0) ? (
               <div className="mt-12 text-center text-gray-400">
                  <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No to-dos in this project.</p>
               </div>
            ) : (
                <div className="flex flex-col gap-2 mt-4">
                    {project.todos.map((todo) => (
                      <div
                        key={todo.id}
                        className={cn(
                          "group flex items-center gap-3 p-3 bg-white border rounded-lg",
                          todo.isCompleted ? "border-gray-100 bg-gray-50/50" : "border-gray-200"
                        )}
                      >
                        <div className="text-gray-400 flex-shrink-0">
                          {todo.isCompleted ? (
                            <CheckSquare className="w-5 h-5 text-green-600" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className={cn(
                              "font-medium transition-all text-sm",
                              todo.isCompleted ? "text-gray-400 line-through" : "text-gray-800"
                            )}>
                            {todo.text || 'Untitled To-Do'}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="files"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {!(project.files && project.files.length > 0) && !project.logo && !project.favicon ? (
               <div className="mt-12 text-center text-gray-400 py-12 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                  <FolderOpen className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-medium text-gray-600">No files in this project.</p>
               </div>
            ) : (
              <>
                {(project.logo || project.favicon) && (
                  <div className="flex gap-6 mb-8 border-b border-gray-100 pb-8">
                    {project.logo && (
                      <div className="flex items-center gap-3">
                         <div className="w-16 h-16 rounded-xl border border-gray-200 bg-white overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                           <img src={project.logo} className="w-full h-full object-contain" alt="Logo" />
                         </div>
                         <div className="text-sm font-medium text-gray-900">Project Logo</div>
                      </div>
                    )}
                    {project.favicon && (
                      <div className="flex items-center gap-3">
                         <div className="w-16 h-16 rounded-xl border border-gray-200 bg-white overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                           <img src={project.favicon} className="w-full h-full object-contain" alt="Favicon" />
                         </div>
                         <div className="text-sm font-medium text-gray-900">Favicon</div>
                      </div>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  <AnimatePresence>
                    {(project.files || []).map((file) => (
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
              </>
            )}
          </motion.div>
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

      </motion.div>
    </div>
  );
}
