// src/App.jsx
import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import JsonInput from './components/JsonInput';
import SearchBar from './components/SearchBar';
import ControlPanel from './components/ControlPanel';
import { createTreeFromJson, findNodeByPath, validateJson } from './utils/jsonParser';
import { useTheme } from './hooks/useTheme';
import './index.css';

// Helper function to get node color
const getNodeColor = (nodeType) => {
  switch (nodeType) {
    case 'object': return '#6366f1';
    case 'array': return '#10b981';
    case 'primitive': return '#f59e0b';
    default: return '#6b7280';
  }
};

// Create a separate Flow component with React Flow hooks
function FlowComponent({ initialNodes, initialEdges, searchResult, onNodeClick }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { fitView } = useReactFlow();

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // Apply colors to nodes when initialNodes change
  React.useEffect(() => {
    if (initialNodes.length > 0) {
      const coloredNodes = initialNodes.map(node => ({
        ...node,
        style: {
          ...node.style,
          backgroundColor: getNodeColor(node.data.nodeType),
          color: 'white',
          border: '2px solid #fff',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 'bold',
          minWidth: 100,
          padding: '8px 12px',
        }
      }));
      setNodes(coloredNodes);
      setEdges(initialEdges);
    }
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Highlight node when search result changes
  React.useEffect(() => {
    if (searchResult && searchResult.found) {
      const updatedNodes = nodes.map(node => ({
        ...node,
        style: {
          ...node.style,
          backgroundColor: node.id === searchResult.id ? '#ffeb3b' : getNodeColor(node.data.nodeType),
          color: node.id === searchResult.id ? '#000000' : 'white'
        }
      }));
      setNodes(updatedNodes);

      // Center the view on the found node
      setTimeout(() => {
        fitView({
          nodes: [{ id: searchResult.id }],
          duration: 800,
          padding: 0.3
        });
      }, 100);
    }
  }, [searchResult, setNodes, fitView]);

  // Fit view when nodes change
  React.useEffect(() => {
    if (nodes.length > 0) {
      setTimeout(() => {
        fitView({
          duration: 1000,
          padding: 0.3,
          minZoom: 0.5,
          maxZoom: 1.5
        });
      }, 500);
    }
  }, [nodes, fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={onNodeClick}
      fitView
      minZoom={0.1}
      maxZoom={2}
    >
      <Controls />
      <MiniMap />
      <Background variant="dots" gap={12} size={1} />
    </ReactFlow>
  );
}

function Flow({ nodes, edges, searchResult, onNodeClick }) {
  return (
    <div className="flex-1 h-full">
      <ReactFlowProvider>
        <FlowComponent
          initialNodes={nodes}
          initialEdges={edges}
          searchResult={searchResult}
          onNodeClick={onNodeClick}
        />
      </ReactFlowProvider>
    </div>
  );
}

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const { theme, toggleTheme } = useTheme();
  const reactFlowWrapper = useRef(null);

  // In App.jsx - update the handleJsonSubmit function
  const handleJsonSubmit = useCallback((jsonString) => {
    // Clear previous state
    setError('');
    setSearchResult(null);

    const validation = validateJson(jsonString);

    if (!validation.isValid) {
      setError(`Invalid JSON: ${validation.error}`);
      setNodes([]);
      setEdges([]);
      return;
    }

    try {
      const parsedJson = JSON.parse(jsonString);
      console.log('Parsed JSON:', parsedJson);

      const { nodes: newNodes, edges: newEdges } = createTreeFromJson(parsedJson);

      console.log('Generated nodes:', newNodes);
      console.log('Generated edges:', newEdges);

      if (newNodes.length === 0) {
        setError('No data found in JSON');
        return;
      }

      setNodes(newNodes);
      setEdges(newEdges);
      setError('');

    } catch (err) {
      setError(`Error processing JSON: ${err.message}`);
      setNodes([]);
      setEdges([]);
    }
  }, []);

  const handleSearch = useCallback((path) => {
    setSearchTerm(path);
    if (!nodes.length) {
      setSearchResult({ found: false, message: 'No tree generated yet' });
      return;
    }

    console.log('Searching for:', path);
    console.log('Current nodes:', nodes);

    const result = findNodeByPath(nodes, path);
    setSearchResult(result);

    // Reset all nodes to their original colors first
    const resetNodes = nodes.map(node => ({
      ...node,
      style: {
        ...node.style,
        backgroundColor: getNodeColor(node.data.nodeType),
        color: 'white'
      }
    }));

    if (result.found) {
      // Highlight only the found node
      const updatedNodes = resetNodes.map(node => ({
        ...node,
        style: {
          ...node.style,
          backgroundColor: node.id === result.id ? '#ffeb3b' : getNodeColor(node.data.nodeType),
          color: node.id === result.id ? '#000000' : 'white'
        }
      }));
      setNodes(updatedNodes);
    } else {
      // Ensure all nodes are reset if no match found
      setNodes(resetNodes);
    }
  }, [nodes]);

  const handleNodeClick = useCallback((event, node) => {
    // Copy path to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(node.data.path).then(() => {
        showNotification(`Copied: ${node.data.path}`);
      }).catch(err => {
        console.error('Failed to copy: ', err);
        fallbackCopyToClipboard(node.data.path);
      });
    } else {
      fallbackCopyToClipboard(node.data.path);
    }
  }, []);

  const showNotification = useCallback((message) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 2000);
  }, []);

  const fallbackCopyToClipboard = useCallback((text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      showNotification(`Copied: ${text}`);
    } catch (err) {
      console.error('Fallback copy failed: ', err);
      showNotification('Copy failed');
    } finally {
      document.body.removeChild(textArea);
    }
  }, [showNotification]);

  const handleClear = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setError('');
    setSearchTerm('');
    setSearchResult(null);
  }, []);

  // Fixed sample JSON - no syntax errors
  const sampleJson = `{
  "user": {
    "id": 1,
    "name": "John Doe",
    "address": {
      "city": "New York",
      "country": "USA"
    },
    "items": [
      {
        "name": "item1"
      },
      {
        "name": "item2"
      }
    ]
  }
}`;

  return (
    <div className={`h-screen flex flex-col ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              JSON Tree Visualizer
            </h1>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Panel - Input and Controls */}
        <div className="w-full md:w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col">
          <JsonInput
            onSubmit={handleJsonSubmit}
            onClear={handleClear}
            sampleJson={sampleJson}
            error={error}
          />

          <div className="mt-4">
            <SearchBar
              onSearch={handleSearch}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              searchResult={searchResult}
            />
          </div>

          <ControlPanel />
        </div>

        {/* Right Panel - Visualization */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <Flow
            nodes={nodes}
            edges={edges}
            searchResult={searchResult}
            onNodeClick={handleNodeClick}
          />

          {nodes.length === 0 && !error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <p className="text-lg mb-2">No JSON data visualized yet</p>
                <p className="text-sm">Enter valid JSON and click "Generate Tree" to start</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-red-500 dark:text-red-400">
                <p className="text-lg mb-2">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

// AI fix suggestion (ppfeqtpa): Review and improve: The app accepts raw JSON input from users but does not show explicit validation or sanitization before parsing or rendering. This can lead to injection attacks or runtime errors. Ensure robust JSON validation and error handling.
