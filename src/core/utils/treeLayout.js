/**
 * Tree Coordinate Layout Engine
 * 
 * Calculates (X, Y) pixel coordinates for binary tree nodes and connects edges.
 * Uses recursive depth-based positioning with geometrically halving horizontal offsets.
 * 
 * @param {Object|null} root - Root node of the tree
 * @param {number} width - Available viewport width in px (default: 800)
 * @param {number} height - Available viewport height in px (default: 450)
 * @returns {{ nodes: Array<Object>, edges: Array<Object> }}
 */
export function calculateTreeLayout(root, width = 800, height = 450) {
  if (!root) {
    return { nodes: [], edges: [] };
  }

  const nodes = [];
  const edges = [];

  const initialY = 60;
  const levelHeight = 75;
  const initialOffset = Math.min(width / 4, 180);

  function layoutHelper(node, x, y, offset, depth) {
    if (!node) return null;

    // Constrain X within bounds
    const clampedX = Math.max(35, Math.min(width - 35, x));

    const leftChild = node.left;
    const rightChild = node.right;

    const nextOffset = Math.max(offset / 1.85, 28);
    const nextY = y + levelHeight;

    const layoutNode = {
      id: node.id || `node-${node.value}`,
      value: node.value,
      x: Math.round(clampedX),
      y: Math.round(y),
      height: node.height !== undefined ? node.height : 1,
      balanceFactor: node.balanceFactor !== undefined ? node.balanceFactor : 0,
      leftId: leftChild ? (leftChild.id || `node-${leftChild.value}`) : null,
      rightId: rightChild ? (rightChild.id || `node-${rightChild.value}`) : null,
      depth
    };

    nodes.push(layoutNode);

    // Layout left subtree
    if (leftChild) {
      const leftX = clampedX - offset;
      const leftLayout = layoutHelper(leftChild, leftX, nextY, nextOffset, depth + 1);
      if (leftLayout) {
        edges.push({
          id: `edge-${layoutNode.id}-${leftLayout.id}`,
          parentId: layoutNode.id,
          childId: leftLayout.id,
          x1: layoutNode.x,
          y1: layoutNode.y,
          x2: leftLayout.x,
          y2: leftLayout.y
        });
      }
    }

    // Layout right subtree
    if (rightChild) {
      const rightX = clampedX + offset;
      const rightLayout = layoutHelper(rightChild, rightX, nextY, nextOffset, depth + 1);
      if (rightLayout) {
        edges.push({
          id: `edge-${layoutNode.id}-${rightLayout.id}`,
          parentId: layoutNode.id,
          childId: rightLayout.id,
          x1: layoutNode.x,
          y1: layoutNode.y,
          x2: rightLayout.x,
          y2: rightLayout.y
        });
      }
    }

    return layoutNode;
  }

  layoutHelper(root, width / 2, initialY, initialOffset, 0);

  return { nodes, edges };
}
