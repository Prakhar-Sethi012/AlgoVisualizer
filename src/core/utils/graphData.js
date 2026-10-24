/**
 * Graph Data Structure & Geometry Engine
 *
 * Provides a predefined 7-node wheel graph (central hub 'A' surrounded by a
 * regular hexagon of nodes 'B' through 'G').
 * Eliminates random overlap collisions while keeping all edge lengths balanced.
 */

export const initialNodes = [
  { id: 'A', x: 360, y: 190, label: 'A' },
  { id: 'B', x: 500, y: 190, label: 'B' },
  { id: 'C', x: 430, y: 311, label: 'C' },
  { id: 'D', x: 290, y: 311, label: 'D' },
  { id: 'E', x: 220, y: 190, label: 'E' },
  { id: 'F', x: 290, y: 69, label: 'F' },
  { id: 'G', x: 430, y: 69, label: 'G' },
];

export const initialEdges = [
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
  { id: 'e-AG', source: 'A', target: 'G', weight: 6 },
];

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
 * Computes responsive node coordinates adapted to container dimensions.
 *
 * @param {number} containerWidth
 * @param {number} containerHeight
 * @returns {Array} Scaled node objects
 */
export function getScaledNodes(containerWidth = 720, containerHeight = 380) {
  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;

  // Scale radius based on viewport while keeping safety margins
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
