import React, { useCallback, useState, DragEvent, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  MarkerType,
  NodeTypes,
  useReactFlow,
  Handle,
  Position,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Diagram } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { Maximize2, Minimize2, Type, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Minimal, clean editable text component
const EditableText = ({ 
  value, 
  onChange, 
  className,
  placeholder = "Type here..."
}: { 
  value: string; 
  onChange: (val: string) => void; 
  className?: string;
  placeholder?: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(value);

  const handleBlur = () => {
    setIsEditing(false);
    onChange(text);
  };

  if (isEditing) {
    return (
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === 'Escape') handleBlur();
        }}
        className={cn("outline-none resize-none bg-transparent", className)}
        rows={2}
      />
    );
  }

  return (
    <div
      onDoubleClick={() => setIsEditing(true)}
      className={cn("cursor-text", className)}
    >
      {text || <span className="opacity-40">{placeholder}</span>}
    </div>
  );
};

// Clean, minimal node designs - Notion style
const BaseNode = ({ 
  data, 
  id, 
  className,
  children 
}: { 
  data: any; 
  id: string;
  className?: string;
  children?: React.ReactNode;
}) => (
  <div className={cn(
    "px-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all min-w-[140px] group",
    className
  )}>
    <Handle type="target" position={Position.Top} id="top" className="w-2 h-2 !bg-gray-400 !border-none opacity-0 group-hover:opacity-100 transition-opacity" />
    <Handle type="source" position={Position.Bottom} id="bottom" className="w-2 h-2 !bg-gray-400 !border-none opacity-0 group-hover:opacity-100 transition-opacity" />
    <Handle type="target" position={Position.Left} id="left" className="w-2 h-2 !bg-gray-400 !border-none opacity-0 group-hover:opacity-100 transition-opacity" />
    <Handle type="source" position={Position.Right} id="right" className="w-2 h-2 !bg-gray-400 !border-none opacity-0 group-hover:opacity-100 transition-opacity" />
    {children || (
      <EditableText
        value={data.label}
        onChange={(val) => data.onChange(id, val)}
        className="text-sm text-gray-700 text-center font-medium"
      />
    )}
  </div>
);

const ProcessNode = ({ data, id }: { data: any; id: string }) => (
  <BaseNode data={data} id={id} />
);

const DecisionNode = ({ data, id }: { data: any; id: string }) => (
  <div className="relative w-32 h-32 group">
    <Handle type="target" position={Position.Top} id="top" className="w-2 h-2 !bg-gray-400 !border-none opacity-0 group-hover:opacity-100 transition-opacity z-10" style={{ top: '14px' }} />
    <Handle type="source" position={Position.Bottom} id="bottom" className="w-2 h-2 !bg-gray-400 !border-none opacity-0 group-hover:opacity-100 transition-opacity z-10" style={{ bottom: '14px' }} />
    <Handle type="target" position={Position.Left} id="left" className="w-2 h-2 !bg-gray-400 !border-none opacity-0 group-hover:opacity-100 transition-opacity z-10" style={{ left: '14px' }} />
    <Handle type="source" position={Position.Right} id="right" className="w-2 h-2 !bg-gray-400 !border-none opacity-0 group-hover:opacity-100 transition-opacity z-10" style={{ right: '14px' }} />
    
    <div className="absolute inset-0 bg-white border border-gray-200 transform rotate-45 shadow-sm hover:shadow-md transition-all" />
    
    <div className="absolute inset-0 flex items-center justify-center">
      <EditableText
        value={data.label}
        onChange={(val) => data.onChange(id, val)}
        className="text-sm text-gray-700 text-center font-medium max-w-[80px] z-10"
      />
    </div>
  </div>
);

const StartEndNode = ({ data, id }: { data: any; id: string }) => (
  <BaseNode data={data} id={id} className="rounded-full px-6" />
);

const DatabaseNode = ({ data, id }: { data: any; id: string }) => (
  <div className="relative w-28 h-32 group">
    <Handle type="target" position={Position.Top} id="top" className="w-2 h-2 !bg-gray-400 !border-none opacity-0 group-hover:opacity-100 transition-opacity z-10" style={{ top: '8px' }} />
    <Handle type="source" position={Position.Bottom} id="bottom" className="w-2 h-2 !bg-gray-400 !border-none opacity-0 group-hover:opacity-100 transition-opacity z-10" style={{ bottom: '8px' }} />
    <Handle type="target" position={Position.Left} id="left" className="w-2 h-2 !bg-gray-400 !border-none opacity-0 group-hover:opacity-100 transition-opacity z-10" />
    <Handle type="source" position={Position.Right} id="right" className="w-2 h-2 !bg-gray-400 !border-none opacity-0 group-hover:opacity-100 transition-opacity z-10" />
    
    <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-sm hover:drop-shadow-md transition-all">
      <ellipse cx="50" cy="15" rx="45" ry="12" fill="white" stroke="#d1d5db" strokeWidth="1.5"/>
      <rect x="5" y="15" width="90" height="90" fill="white" stroke="#d1d5db" strokeWidth="1.5"/>
      <ellipse cx="50" cy="105" rx="45" ry="12" fill="white" stroke="#d1d5db" strokeWidth="1.5"/>
    </svg>
    
    <div className="absolute inset-0 flex items-center justify-center pt-2">
      <EditableText
        value={data.label}
        onChange={(val) => data.onChange(id, val)}
        className="text-xs text-gray-700 text-center font-medium max-w-[80px]"
      />
    </div>
  </div>
);

const NoteNode = ({ data, id }: { data: any; id: string }) => (
  <BaseNode data={data} id={id} className="border-dashed bg-gray-50 max-w-[200px]">
    <EditableText
      value={data.label}
      onChange={(val) => data.onChange(id, val)}
      className="text-xs text-gray-600 font-normal"
    />
  </BaseNode>
);

const ApiNode = ({ data, id }: { data: any; id: string }) => (
  <BaseNode data={data} id={id} className="border-l-4 border-l-blue-500" />
);

const FunctionNode = ({ data, id }: { data: any; id: string }) => (
  <BaseNode data={data} id={id} className="border-l-4 border-l-purple-500" />
);

const InputOutputNode = ({ data, id }: { data: any; id: string }) => (
  <div className="relative w-36 h-16 group">
    <Handle type="target" position={Position.Top} id="top" className="w-2 h-2 !bg-gray-400 !border-none opacity-0 group-hover:opacity-100 transition-opacity z-10" />
    <Handle type="source" position={Position.Bottom} id="bottom" className="w-2 h-2 !bg-gray-400 !border-none opacity-0 group-hover:opacity-100 transition-opacity z-10" />
    <Handle type="target" position={Position.Left} id="left" className="w-2 h-2 !bg-gray-400 !border-none opacity-0 group-hover:opacity-100 transition-opacity z-10" />
    <Handle type="source" position={Position.Right} id="right" className="w-2 h-2 !bg-gray-400 !border-none opacity-0 group-hover:opacity-100 transition-opacity z-10" />
    
    <svg viewBox="0 0 144 64" className="w-full h-full drop-shadow-sm hover:drop-shadow-md transition-all">
      <path d="M 16 0 L 128 0 L 144 32 L 128 64 L 16 64 L 0 32 Z" fill="white" stroke="#d1d5db" strokeWidth="1.5"/>
    </svg>
    
    <div className="absolute inset-0 flex items-center justify-center">
      <EditableText
        value={data.label}
        onChange={(val) => data.onChange(id, val)}
        className="text-sm text-gray-700 text-center font-medium max-w-[110px]"
      />
    </div>
  </div>
);

// Text annotation node - for writing on the board
const TextNode = ({ data, id }: { data: any; id: string }) => (
  <div className="bg-transparent min-w-[100px] max-w-[300px] group">
    <EditableText
      value={data.label}
      onChange={(val) => data.onChange(id, val)}
      className="text-sm text-gray-600 font-normal"
      placeholder="Add text..."
    />
  </div>
);

const nodeTypes: NodeTypes = {
  process: ProcessNode,
  decision: DecisionNode,
  start: StartEndNode,
  end: StartEndNode,
  note: NoteNode,
  database: DatabaseNode,
  api: ApiNode,
  function: FunctionNode,
  io: InputOutputNode,
  text: TextNode,
};


interface DiagramEditorProps {
  diagram: Diagram;
  onUpdate: (updates: Partial<Diagram>) => void;
  onAddNode: (nodeType: string) => void;
  readOnly?: boolean;
}

export function DiagramEditor({ diagram, onUpdate, onAddNode, readOnly = false }: DiagramEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition, fitView } = useReactFlow();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync nodes
  useEffect(() => {
    const updatedNodes = diagram.nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        onChange: (nodeId: string, newLabel: string) => {
          setNodes((nds) =>
            nds.map((n) =>
              n.id === nodeId ? { ...n, data: { ...n.data, label: newLabel } } : n
            )
          );
          
          onUpdate({
            nodes: diagram.nodes.map(n =>
              n.id === nodeId ? { ...n, data: { ...n.data, label: newLabel } } : n
            ),
          });
        },
      },
    })) as Node[];
    
    setNodes(updatedNodes);
  }, [diagram.nodes]);

  // Sync edges
  useEffect(() => {
    const updatedEdges = diagram.edges.map(edge => ({
      ...edge,
      type: 'smoothstep',
      animated: false,
      markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#9ca3af' },
      style: { strokeWidth: 1.5, stroke: '#9ca3af' },
    })) as Edge[];
    
    setEdges(updatedEdges);
  }, [diagram.edges]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: `e${params.source}-${params.target}-${Date.now()}`,
        type: 'smoothstep',
        animated: false,
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#9ca3af' },
        style: { strokeWidth: 1.5, stroke: '#9ca3af' },
      };
      setEdges((eds) => addEdge(newEdge, eds));
      
      const updatedEdges = [...diagram.edges, {
        id: newEdge.id,
        source: params.source!,
        target: params.target!,
        animated: false,
      }];
      
      onUpdate({ edges: updatedEdges });
    },
    [diagram.edges, onUpdate, setEdges]
  );

  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes);
      
      setTimeout(() => {
        setNodes((nds) => {
          const updatedNodes = nds.map(n => ({
            id: n.id,
            type: n.type as any,
            position: n.position,
            data: { label: n.data.label },
          }));
          
          onUpdate({ nodes: updatedNodes });
          return nds;
        });
      }, 100);
    },
    [onNodesChange, onUpdate, setNodes]
  );

  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChange(changes);
      
      setTimeout(() => {
        setEdges((eds) => {
          const updatedEdges = eds.map(e => ({
            id: e.id,
            source: e.source,
            target: e.target,
            label: e.label as string,
            animated: e.animated,
          }));
          
          onUpdate({ edges: updatedEdges });
          return eds;
        });
      }, 100);
    },
    [onEdgesChange, onUpdate, setEdges]
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const nodeLabels: Record<string, string> = {
        process: 'Process',
        decision: 'Decision',
        start: 'Start',
        end: 'End',
        note: 'Note',
        database: 'Database',
        api: 'API',
        function: 'Function',
        io: 'Input/Output',
        text: 'Text',
      };

      const newNodeId = uuidv4();
      const newNode = {
        id: newNodeId,
        type,
        position,
        data: {
          label: nodeLabels[type] || 'Node',
          onChange: (nodeId: string, newLabel: string) => {
            setNodes((nds) =>
              nds.map((n) =>
                n.id === nodeId ? { ...n, data: { ...n.data, label: newLabel } } : n
              )
            );
            
            onUpdate({
              nodes: diagram.nodes.map(n =>
                n.id === nodeId ? { ...n, data: { ...n.data, label: newLabel } } : n
              ),
            });
          },
        },
      };

      setNodes((nds) => nds.concat(newNode as Node));
      
      const updatedNodes = [...diagram.nodes, {
        id: newNode.id,
        type: newNode.type as any,
        position: newNode.position,
        data: { label: newNode.data.label },
      }];
      
      onUpdate({ nodes: updatedNodes });
    },
    [screenToFlowPosition, diagram.nodes, onUpdate, setNodes]
  );

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => fitView(), 100);
  };

  return (
    <div className={cn(
      "border border-gray-200 rounded-lg overflow-hidden bg-white transition-all",
      isFullscreen ? "fixed inset-0 z-50 rounded-none" : "w-full h-[600px]"
    )}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : handleNodesChange}
        onEdgesChange={readOnly ? undefined : handleEdgesChange}
        onConnect={readOnly ? undefined : onConnect}
        onDrop={readOnly ? undefined : onDrop}
        onDragOver={readOnly ? undefined : onDragOver}
        nodeTypes={nodeTypes}
        connectionMode="loose"
        connectionRadius={25}
        fitView
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        defaultEdgeOptions={{
          animated: false,
          style: { strokeWidth: 1.5, stroke: '#9ca3af' },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={16} 
          size={0.5} 
          color="#e5e7eb"
        />
        <Controls 
          className="!bg-white !border !border-gray-200 !rounded-lg !shadow-sm"
          showInteractive={false}
        />
        <Panel position="top-right" className="flex gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-gray-600" /> : <Maximize2 className="w-4 h-4 text-gray-600" />}
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}


// Clean, minimal node palette - Notion style
interface NodePaletteProps {
  onAddNode: (nodeType: string) => void;
}

export function NodePalette({ onAddNode }: NodePaletteProps) {
  const onDragStart = (event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const nodes = [
    { type: 'process', label: 'Process', icon: '▭' },
    { type: 'decision', label: 'Decision', icon: '◆' },
    { type: 'start', label: 'Start/End', icon: '●' },
    { type: 'database', label: 'Database', icon: '⬢' },
    { type: 'api', label: 'API', icon: '⚡' },
    { type: 'function', label: 'Function', icon: 'ƒ' },
    { type: 'io', label: 'Input/Output', icon: '⬡' },
    { type: 'note', label: 'Note', icon: '📝' },
    { type: 'text', label: 'Text', icon: 'T' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {nodes.map((node) => (
        <button
          key={node.type}
          onClick={() => onAddNode(node.type)}
          onDragStart={(e) => onDragStart(e, node.type)}
          draggable
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-all cursor-move font-medium"
        >
          <span className="text-base">{node.icon}</span>
          <span>{node.label}</span>
        </button>
      ))}
    </div>
  );
}
