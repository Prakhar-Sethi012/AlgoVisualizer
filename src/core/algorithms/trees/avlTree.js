/**
 * AVL Tree Implementation with Step-by-Step Generator
 * 
 * Supports self-balancing binary search tree insertions with animated rotations:
 * - Left-Left (LL) -> Right Rotation
 * - Right-Right (RR) -> Left Rotation
 * - Left-Right (LR) -> Left Rotation then Right Rotation
 * - Right-Left (RL) -> Right Rotation then Left Rotation
 */

export class AVLNode {
  constructor(value) {
    this.id = `avl-node-${value}`;
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
    this.balanceFactor = 0;
  }
}

/**
 * Deep clone of an AVL tree to produce immutable snapshots for visualization
 */
export function cloneTree(node) {
  if (!node) return null;
  const clone = {
    id: node.id,
    value: node.value,
    height: node.height,
    balanceFactor: getBalance(node),
    left: cloneTree(node.left),
    right: cloneTree(node.right)
  };
  return clone;
}

export function getHeight(node) {
  return node ? node.height : 0;
}

export function getBalance(node) {
  return node ? getHeight(node.left) - getHeight(node.right) : 0;
}

export function updateNodeStats(node) {
  if (!node) return;
  node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
  node.balanceFactor = getBalance(node);
}

/**
 * Right Rotation (LL Case)
 */
export function rightRotate(y) {
  const x = y.left;
  const T2 = x ? x.right : null;

  // Perform rotation
  x.right = y;
  y.left = T2;

  // Update heights
  updateNodeStats(y);
  updateNodeStats(x);

  return x;
}

/**
 * Left Rotation (RR Case)
 */
export function leftRotate(x) {
  const y = x.right;
  const T2 = y ? y.left : null;

  // Perform rotation
  y.left = x;
  x.right = T2;

  // Update heights
  updateNodeStats(x);
  updateNodeStats(y);

  return y;
}

export class AVLTree {
  constructor() {
    this.root = null;
  }

  /**
   * Generator inserting a value into the AVL tree with traversal, insertion, and rotation yields.
   * 
   * @param {number} value
   * @yields {{ root: Object|null, activeNodeId: string|null, newNodeId?: string, imbalanceNodeId?: string, rotatedNodeIds?: string[], stepInfo: string }}
   */
  *insert(value) {
    yield {
      root: cloneTree(this.root),
      activeNodeId: null,
      stepInfo: `Starting insertion of value ${value} into AVL Tree.`
    };

    if (!this.root) {
      this.root = new AVLNode(value);
      yield {
        root: cloneTree(this.root),
        activeNodeId: this.root.id,
        newNodeId: this.root.id,
        stepInfo: `Tree was empty. Created root node with value ${value}.`
      };
      return;
    }

    // Generator-based recursive insertion
    this.root = yield* this.insertHelper(this.root, value);

    yield {
      root: cloneTree(this.root),
      activeNodeId: null,
      stepInfo: `Completed insertion of ${value}. Tree is fully balanced with O(log n) height.`
    };
  }

  *insertHelper(node, value) {
    if (!node) {
      const newNode = new AVLNode(value);
      return newNode;
    }

    // 1. Traversal Step Yield
    yield {
      root: cloneTree(this.root),
      activeNodeId: node.id,
      stepInfo: `Comparing ${value} with current node ${node.value} (Balance Factor: ${getBalance(node)})...`
    };

    if (value < node.value) {
      if (!node.left) {
        node.left = new AVLNode(value);
        updateNodeStats(node);
        yield {
          root: cloneTree(this.root),
          activeNodeId: node.left.id,
          newNodeId: node.left.id,
          stepInfo: `Placed ${value} as left child of ${node.value}.`
        };
      } else {
        node.left = yield* this.insertHelper(node.left, value);
      }
    } else if (value > node.value) {
      if (!node.right) {
        node.right = new AVLNode(value);
        updateNodeStats(node);
        yield {
          root: cloneTree(this.root),
          activeNodeId: node.right.id,
          newNodeId: node.right.id,
          stepInfo: `Placed ${value} as right child of ${node.value}.`
        };
      } else {
        node.right = yield* this.insertHelper(node.right, value);
      }
    } else {
      // Duplicate value
      yield {
        root: cloneTree(this.root),
        activeNodeId: node.id,
        stepInfo: `Value ${value} already exists in tree. No duplicates allowed in AVL BST.`
      };
      return node;
    }

    // 2. Update height and balance factor on way up
    updateNodeStats(node);
    const balance = getBalance(node);

    // 3. Check for AVL Imbalance (|BF| > 1)
    if (Math.abs(balance) > 1) {
      yield {
        root: cloneTree(this.root),
        activeNodeId: node.id,
        imbalanceNodeId: node.id,
        stepInfo: `Imbalance detected at node ${node.value} (BF: ${balance}). Preparing rebalance rotation...`
      };

      // Case 1: Left-Left (LL) -> Right Rotation
      if (balance > 1 && value < node.left.value) {
        yield {
          root: cloneTree(this.root),
          activeNodeId: node.id,
          imbalanceNodeId: node.id,
          stepInfo: `Left-Left (LL) imbalance detected. Performing single Right Rotation on ${node.value}.`
        };
        const newSubRoot = rightRotate(node);
        yield {
          root: cloneTree(this.root),
          activeNodeId: newSubRoot.id,
          rotatedNodeIds: [newSubRoot.id, node.id],
          stepInfo: `Right Rotation complete! ${newSubRoot.value} is now the parent of ${node.value}.`
        };
        return newSubRoot;
      }

      // Case 2: Right-Right (RR) -> Left Rotation
      if (balance < -1 && value > node.right.value) {
        yield {
          root: cloneTree(this.root),
          activeNodeId: node.id,
          imbalanceNodeId: node.id,
          stepInfo: `Right-Right (RR) imbalance detected. Performing single Left Rotation on ${node.value}.`
        };
        const newSubRoot = leftRotate(node);
        yield {
          root: cloneTree(this.root),
          activeNodeId: newSubRoot.id,
          rotatedNodeIds: [newSubRoot.id, node.id],
          stepInfo: `Left Rotation complete! ${newSubRoot.value} is now the parent of ${node.value}.`
        };
        return newSubRoot;
      }

      // Case 3: Left-Right (LR) -> Left rotate left child, then Right rotate node
      if (balance > 1 && value > node.left.value) {
        yield {
          root: cloneTree(this.root),
          activeNodeId: node.left.id,
          imbalanceNodeId: node.id,
          stepInfo: `Left-Right (LR) imbalance detected. Step 1: Performing Left Rotation on child ${node.left.value}.`
        };
        node.left = leftRotate(node.left);
        yield {
          root: cloneTree(this.root),
          activeNodeId: node.left.id,
          rotatedNodeIds: [node.left.id],
          stepInfo: `Step 1 complete. Now performing Step 2: Right Rotation on ${node.value}.`
        };
        const newSubRoot = rightRotate(node);
        yield {
          root: cloneTree(this.root),
          activeNodeId: newSubRoot.id,
          rotatedNodeIds: [newSubRoot.id, node.id],
          stepInfo: `Left-Right (LR) double rotation complete! ${newSubRoot.value} is now the parent.`
        };
        return newSubRoot;
      }

      // Case 4: Right-Left (RL) -> Right rotate right child, then Left rotate node
      if (balance < -1 && value < node.right.value) {
        yield {
          root: cloneTree(this.root),
          activeNodeId: node.right.id,
          imbalanceNodeId: node.id,
          stepInfo: `Right-Left (RL) imbalance detected. Step 1: Performing Right Rotation on child ${node.right.value}.`
        };
        node.right = rightRotate(node.right);
        yield {
          root: cloneTree(this.root),
          activeNodeId: node.right.id,
          rotatedNodeIds: [node.right.id],
          stepInfo: `Step 1 complete. Now performing Step 2: Left Rotation on ${node.value}.`
        };
        const newSubRoot = leftRotate(node);
        yield {
          root: cloneTree(this.root),
          activeNodeId: newSubRoot.id,
          rotatedNodeIds: [newSubRoot.id, node.id],
          stepInfo: `Right-Left (RL) double rotation complete! ${newSubRoot.value} is now the parent.`
        };
        return newSubRoot;
      }
    }

    return node;
  }

  clear() {
    this.root = null;
  }
}
