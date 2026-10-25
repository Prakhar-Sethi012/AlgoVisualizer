/**
 * Graph Data Structure & Geometry Engine
 *
 * Provides multiple graph presets designed for algorithm education:
 * 1. The Wheel (Default): 7-node radial hub with outer hexagonal ring.
 * 2. The City Grid: 9-node (3x3) Manhattan street grid with competing shortest paths.
 * 3. The Network Bottleneck: Two 4-node dense clusters joined by a single high-cost bridge edge.
 */

export const GRAPH_PRESETS = {
  wheel: {
    id: 'wheel',
    name: 'The Wheel (Default)',
    shortName: 'Wheel',
    description: 'Central hub surrounded by a balanced hexagonal ring.',
    defaultStart: 'A',
    defaultTarget: 'D',
    nodes: [
      { id: 'A', x: 360, y: 190, label: 'A' },
      { id: 'B', x: 500, y: 190, label: 'B' },
      { id: 'C', x: 430, y: 311, label: 'C' },
      { id: 'D', x: 290, y: 311, label: 'D' },
      { id: 'E', x: 220, y: 190, label: 'E' },
      { id: 'F', x: 290, y: 69, label: 'F' },
      { id: 'G', x: 430, y: 69, label: 'G' }
    ],
    edges: [
      // Outer perimeter hexagon ring
      { id: 'e-BC', source: 'B', target: 'C', weight: 4 },
      { id: 'e-CD', source: 'C', target: 'D', weight: 8 },
      { id: 'e-DE', source: 'D', target: 'E', weight: 6 },
      { id: 'e-EF', source: 'E', target: 'F', weight: 5 },
      { id: 'e-FG', source: 'F', target: 'G', weight: 7 },
      { id: 'e-GB', source: 'G', target: 'B', weight: 3 },

      // Spokes connecting to central hub 'A'
      { id: 'e-AB', source: 'A', target: 'B', weight: 2 },
      { id: 'e-AC', source: 'A', target: 'C', weight: 9 },
      { id: 'e-AD', source: 'A', target: 'D', weight: 4 },
      { id: 'e-AE', source: 'A', target: 'E', weight: 11 },
      { id: 'e-AF', source: 'A', target: 'F', weight: 5 },
      { id: 'e-AG', source: 'A', target: 'G', weight: 6 }
    ],
    getScaledNodes: (containerWidth = 720, containerHeight = 380) => {
      const centerX = containerWidth / 2;
      const centerY = containerHeight / 2;
      const radiusX = Math.max(Math.min(containerWidth * 0.32, 220), 120);
      const radiusY = Math.max(Math.min(containerHeight * 0.36, 170), 100);

      const angles = [
        { id: 'B', angle: 0 },
        { id: 'C', angle: Math.PI / 3 },
        { id: 'D', angle: (2 * Math.PI) / 3 },
        { id: 'E', angle: Math.PI },
        { id: 'F', angle: (4 * Math.PI) / 3 },
        { id: 'G', angle: (5 * Math.PI) / 3 }
      ];

      const scaled = [{ id: 'A', x: Math.round(centerX), y: Math.round(centerY), label: 'A' }];

      for (const { id, angle } of angles) {
        scaled.push({
          id,
          label: id,
          x: Math.round(centerX + radiusX * Math.cos(angle)),
          y: Math.round(centerY + radiusY * Math.sin(angle))
        });
      }

      return scaled;
    }
  },

  grid: {
    id: 'grid',
    name: 'The City Grid (Multiple Paths)',
    shortName: 'City Grid',
    description: 'A 3x3 grid forcing Dijkstra to evaluate competing paths of similar costs.',
    defaultStart: 'A',
    defaultTarget: 'I',
    nodes: [
      { id: 'A', x: 180, y: 80, label: 'A' },
      { id: 'B', x: 360, y: 80, label: 'B' },
      { id: 'C', x: 540, y: 80, label: 'C' },
      { id: 'D', x: 180, y: 190, label: 'D' },
      { id: 'E', x: 360, y: 190, label: 'E' },
      { id: 'F', x: 540, y: 190, label: 'F' },
      { id: 'G', x: 180, y: 300, label: 'G' },
      { id: 'H', x: 360, y: 300, label: 'H' },
      { id: 'I', x: 540, y: 300, label: 'I' }
    ],
    edges: [
      // Horizontal streets
      { id: 'e-AB', source: 'A', target: 'B', weight: 3 },
      { id: 'e-BC', source: 'B', target: 'C', weight: 4 },
      { id: 'e-DE', source: 'D', target: 'E', weight: 3 },
      { id: 'e-EF', source: 'E', target: 'F', weight: 4 },
      { id: 'e-GH', source: 'G', target: 'H', weight: 3 },
      { id: 'e-HI', source: 'H', target: 'I', weight: 4 },

      // Vertical avenues
      { id: 'e-AD', source: 'A', target: 'D', weight: 4 },
      { id: 'e-DG', source: 'D', target: 'G', weight: 5 },
      { id: 'e-BE', source: 'B', target: 'E', weight: 4 },
      { id: 'e-EH', source: 'E', target: 'H', weight: 3 },
      { id: 'e-CF', source: 'C', target: 'F', weight: 3 },
      { id: 'e-FI', source: 'F', target: 'I', weight: 3 }
    ],
    getScaledNodes: (containerWidth = 720, containerHeight = 380) => {
      const marginX = Math.max(containerWidth * 0.16, 50);
      const marginY = Math.max(containerHeight * 0.16, 45);
      const usableW = containerWidth - 2 * marginX;
      const usableH = containerHeight - 2 * marginY;
      const stepX = usableW / 2;
      const stepY = usableH / 2;

      const gridMap = [
        ['A', 'B', 'C'],
        ['D', 'E', 'F'],
        ['G', 'H', 'I']
      ];

      const scaled = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const id = gridMap[r][c];
          scaled.push({
            id,
            label: id,
            x: Math.round(marginX + c * stepX),
            y: Math.round(marginY + r * stepY)
          });
        }
      }
      return scaled;
    }
  },

  bottleneck: {
    id: 'bottleneck',
    name: 'The Network Bottleneck',
    shortName: 'Bottleneck',
    description: 'Two dense clusters connected by a single high-weight bridge.',
    defaultStart: 'A',
    defaultTarget: 'G',
    nodes: [
      // Left Cluster (A, B, C, D)
      { id: 'A', x: 200, y: 110, label: 'A' },
      { id: 'B', x: 280, y: 190, label: 'B' },
      { id: 'C', x: 200, y: 270, label: 'C' },
      { id: 'D', x: 120, y: 190, label: 'D' },

      // Right Cluster (E, F, G, H)
      { id: 'E', x: 440, y: 190, label: 'E' },
      { id: 'F', x: 520, y: 110, label: 'F' },
      { id: 'G', x: 600, y: 190, label: 'G' },
      { id: 'H', x: 520, y: 270, label: 'H' }
    ],
    edges: [
      // Left Cluster internal cheap links
      { id: 'e-AB', source: 'A', target: 'B', weight: 2 },
      { id: 'e-BC', source: 'B', target: 'C', weight: 3 },
      { id: 'e-CD', source: 'C', target: 'D', weight: 2 },
      { id: 'e-DA', source: 'D', target: 'A', weight: 4 },
      { id: 'e-AC', source: 'A', target: 'C', weight: 3 },

      // Right Cluster internal cheap links
      { id: 'e-EF', source: 'E', target: 'F', weight: 2 },
      { id: 'e-FG', source: 'F', target: 'G', weight: 4 },
      { id: 'e-GH', source: 'G', target: 'H', weight: 2 },
      { id: 'e-HE', source: 'H', target: 'E', weight: 3 },
      { id: 'e-FH', source: 'F', target: 'H', weight: 3 },

      // The Expensive Single Bridge Edge between B and E
      { id: 'e-BE', source: 'B', target: 'E', weight: 18 }
    ],
    getScaledNodes: (containerWidth = 720, containerHeight = 380) => {
      const centerY = containerHeight / 2;
      const leftCenterX = containerWidth * 0.28;
      const rightCenterX = containerWidth * 0.72;

      const radiusX = Math.min(containerWidth * 0.14, 90);
      const radiusY = Math.min(containerHeight * 0.28, 90);

      return [
        // Left Cluster
        { id: 'A', label: 'A', x: Math.round(leftCenterX), y: Math.round(centerY - radiusY) },
        { id: 'B', label: 'B', x: Math.round(leftCenterX + radiusX), y: Math.round(centerY) },
        { id: 'C', label: 'C', x: Math.round(leftCenterX), y: Math.round(centerY + radiusY) },
        { id: 'D', label: 'D', x: Math.round(leftCenterX - radiusX), y: Math.round(centerY) },

        // Right Cluster
        { id: 'E', label: 'E', x: Math.round(rightCenterX - radiusX), y: Math.round(centerY) },
        { id: 'F', label: 'F', x: Math.round(rightCenterX), y: Math.round(centerY - radiusY) },
        { id: 'G', label: 'G', x: Math.round(rightCenterX + radiusX), y: Math.round(centerY) },
        { id: 'H', label: 'H', x: Math.round(rightCenterX), y: Math.round(centerY + radiusY) }
      ];
    }
  }
};

export const initialNodes = GRAPH_PRESETS.wheel.nodes;
export const initialEdges = GRAPH_PRESETS.wheel.edges;

/**
 * Updates the weights of edges to random integers between 1 and 20.
 *
 * @param {Array} edges - Array of edge objects
 * @returns {Array} New array of edges with randomized weights
 */
export function randomizeWeights(edges = initialEdges) {
  return edges.map((edge) => ({
    ...edge,
    weight: Math.floor(Math.random() * 20) + 1
  }));
}

/**
 * Computes responsive node coordinates adapted to container dimensions and preset.
 *
 * @param {string|number} arg1 - Preset ID or containerWidth
 * @param {number} arg2 - containerWidth or containerHeight
 * @param {number|string} arg3 - containerHeight or presetId
 * @returns {Array} Scaled node objects
 */
export function getScaledNodes(arg1 = 720, arg2 = 380, arg3 = 'wheel') {
  let presetId = 'wheel';
  let width = 720;
  let height = 380;

  if (typeof arg1 === 'string') {
    presetId = arg1;
    width = typeof arg2 === 'number' ? arg2 : 720;
    height = typeof arg3 === 'number' ? arg3 : 380;
  } else if (typeof arg1 === 'number') {
    width = arg1;
    height = typeof arg2 === 'number' ? arg2 : 380;
    presetId = typeof arg3 === 'string' ? arg3 : 'wheel';
  }

  const preset = GRAPH_PRESETS[presetId] || GRAPH_PRESETS.wheel;
  return preset.getScaledNodes(width, height);
}
