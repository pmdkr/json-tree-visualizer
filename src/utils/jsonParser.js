// src/utils/jsonParser.js
import { MarkerType } from 'reactflow';

let nodeId = 0;

// Helper functions
const generateId = () => `node_${nodeId++}`;

const getNodeColor = (type) => {
  switch (type) {
    case 'object':
      return '#6366f1';
    case 'array':
      return '#10b981';
    case 'primitive':
      return '#f59e0b';
    default:
      return '#6b7280';
  }
};

const createNode = (id, data, position) => ({
  id,
  type: 'default',
  position,
  data: {
    ...data,
    label: data.label,
  },
  style: {
    background: getNodeColor(data.nodeType),
    color: 'white',
    border: '2px solid #fff',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 'bold',
    minWidth: 120,
    padding: '8px 12px',
  },
});

const createEdge = (source, target) => ({
  id: `edge-${source}-${target}`,
  source,
  target,
  type: 'smoothstep',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#6b7280',
  },
  style: {
    stroke: '#6b7280',
    strokeWidth: 2,
  },
});

export const validateJson = (jsonString) => {
  try {
    JSON.parse(jsonString);
    return { isValid: true, error: null };
  } catch (error) {
    return { 
      isValid: false, 
      error: error.message 
    };
  }
};

// Improved tree layout with better spacing
const calculateTreeLayout = (rootNode) => {
  const nodes = [];
  const edges = [];
  
  const nodeWidth = 150;
  const nodeHeight = 60;
  const horizontalSpacing = 200;
  const verticalSpacing = 120;

  // First pass: calculate tree structure and widths
  const calculateNode = (node, depth = 0) => {
    let width = nodeWidth;
    let children = [];

    if (node.children && node.children.length > 0) {
      children = node.children.map(child => calculateNode(child, depth + 1));
      // Node width is the sum of children widths or its own width, whichever is larger
      width = Math.max(
        nodeWidth,
        children.reduce((sum, child) => sum + child.width + horizontalSpacing, -horizontalSpacing)
      );
    }

    return {
      ...node,
      width,
      children,
      depth
    };
  };

  const treeWithDimensions = calculateNode(rootNode);

  // Second pass: assign positions
  const assignPositions = (node, startX, y) => {
    const nodeId = generateId();
    const x = startX + (node.width - nodeWidth) / 2;

    // Create the node
    nodes.push(createNode(nodeId, {
      label: node.label,
      path: node.path,
      value: node.value,
      nodeType: node.nodeType,
      keyName: node.keyName
    }, { x, y }));

    // Process children
    let currentX = startX;
    const childY = y + verticalSpacing;
    
    const childNodes = [];
    node.children.forEach(child => {
      const childNode = assignPositions(child, currentX, childY);
      childNodes.push(childNode);
      currentX += child.width + horizontalSpacing;
    });

    // Create edges to children
    childNodes.forEach(childNode => {
      edges.push(createEdge(nodeId, childNode.id));
    });

    return { id: nodeId, x, y, width: node.width };
  };

  assignPositions(treeWithDimensions, 0, 0);
  return { nodes, edges };
};

// Build tree structure from JSON
const buildTreeStructure = (data, path = '$', keyName = 'root') => {
  if (data === null) {
    return {
      label: keyName === 'root' ? 'null' : `${keyName}: null`,
      path,
      value: 'null',
      nodeType: 'primitive',
      keyName
    };
  }

  if (data === undefined) {
    return {
      label: keyName === 'root' ? 'undefined' : `${keyName}: undefined`,
      path,
      value: 'undefined',
      nodeType: 'primitive',
      keyName
    };
  }

  if (Array.isArray(data)) {
    const children = data.map((item, index) => {
      const childPath = `${path}[${index}]`;
      const childKeyName = `[${index}]`;
      return buildTreeStructure(item, childPath, childKeyName);
    });

    return {
      label: keyName === 'root' ? 'root' : `${keyName} [${data.length}]`,
      path,
      value: `Array with ${data.length} items`,
      nodeType: 'array',
      keyName,
      children
    };
  }

  if (typeof data === 'object' && data !== null) {
    const children = Object.entries(data).map(([key, value]) => {
      const childPath = `${path}.${key}`;
      return buildTreeStructure(value, childPath, key);
    });

    return {
      label: keyName === 'root' ? 'root' : keyName,
      path,
      value: `Object with ${Object.keys(data).length} keys`,
      nodeType: 'object',
      keyName,
      children
    };
  }

  // Primitive value
  return {
    label: keyName === 'root' ? String(data) : `${keyName}: ${data}`,
    path,
    value: typeof data,
    nodeType: 'primitive',
    keyName
  };
};

// Export the main tree creation function
export const createTreeFromJson = (json) => {
  // Reset nodeId for new tree
  nodeId = 0;
  
  const treeStructure = buildTreeStructure(json);
  return calculateTreeLayout(treeStructure);
};

export const findNodeByPath = (nodes, searchPath) => {
  if (!searchPath || searchPath.trim() === '') {
    return { found: false, message: 'Please enter a search path' };
  }

  let normalizedSearchPath = searchPath.trim();
  
  if (normalizedSearchPath.startsWith('$.')) {
    normalizedSearchPath = normalizedSearchPath.substring(2);
  } else if (normalizedSearchPath.startsWith('$')) {
    normalizedSearchPath = normalizedSearchPath.substring(1);
  }
  
  normalizedSearchPath = normalizedSearchPath
    .replace(/\[/g, '.')
    .replace(/\]/g, '')
    .replace(/\.\./g, '.')
    .replace(/^\./, '');

  console.log('Searching for:', normalizedSearchPath);
  console.log('Available paths:', nodes.map(n => n.data.path));

  const foundNode = nodes.find(node => {
    const nodePath = node.data.path
      .replace(/\[/g, '.')
      .replace(/\]/g, '')
      .replace(/^\./, '');
    
    return nodePath === normalizedSearchPath || 
           nodePath.endsWith('.' + normalizedSearchPath);
  });

  return {
    found: !!foundNode,
    node: foundNode,
    id: foundNode?.id
  };
};