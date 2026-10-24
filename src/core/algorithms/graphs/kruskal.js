/**
 * Union-Find (Disjoint Set Union) Data Structure with Path Compression and Rank
 */
export class UnionFind {
  constructor(elements) {
    this.parent = {};
    this.rank = {};
    this.count = elements.length;

    for (const elem of elements) {
      this.parent[elem] = elem;
      this.rank[elem] = 0;
    }
  }

  find(item) {
    if (this.parent[item] === item) {
      return item;
    }
    // Path compression
    this.parent[item] = this.find(this.parent[item]);
    return this.parent[item];
  }

  union(item1, item2) {
    const root1 = this.find(item1);
    const root2 = this.find(item2);

    if (root1 === root2) {
      return false; // Already in the same set, cycle would be formed
    }

    // Union by rank
    if (this.rank[root1] < this.rank[root2]) {
      this.parent[root1] = root2;
    } else if (this.rank[root1] > this.rank[root2]) {
      this.parent[root2] = root1;
    } else {
      this.parent[root2] = root1;
      this.rank[root1] += 1;
    }

    this.count -= 1;
    return true;
  }

  connected(item1, item2) {
    return this.find(item1) === this.find(item2);
  }
}

/**
 * Kruskal's Minimum Spanning Tree (MST) Generator
 *
 * Sorts all edges in non-decreasing order of weight and uses Disjoint Set Union
 * to pick greedy edges without forming cycles.
 *
 * @param {Array} nodes - Array of { id, label, x, y }
 * @param {Array} edges - Array of { id, source, target, weight }
 */
export function* kruskal(nodes, edges) {
  // Sort edges ascending by weight
  const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);

  const uf = new UnionFind(nodes.map((n) => n.id));
  const mstEdges = [];
  const rejectedEdgeIds = new Set();
  let totalWeight = 0;

  // Initial yield
  yield {
    phase: 'INIT',
    sortedEdges,
    evaluatingEdgeId: null,
    cycleEdgeId: null,
    mstEdgeIds: [],
    rejectedEdgeIds: [],
    totalWeight: 0,
    componentsCount: uf.count,
    stepInfo: `Kruskal's MST initialized. Sorted ${sortedEdges.length} edges in ascending order by weight.`
  };

  for (const edge of sortedEdges) {
    // 1. Yield edge under evaluation
    yield {
      phase: 'EVALUATING',
      sortedEdges,
      evaluatingEdgeId: edge.id,
      cycleEdgeId: null,
      mstEdgeIds: mstEdges.map((e) => e.id),
      rejectedEdgeIds: Array.from(rejectedEdgeIds),
      totalWeight,
      componentsCount: uf.count,
      stepInfo: `Inspecting lowest-weight available edge '${edge.source}'—'${edge.target}' (weight ${edge.weight}).`
    };

    // 2. Check for cycle using Union-Find
    if (uf.connected(edge.source, edge.target)) {
      rejectedEdgeIds.add(edge.id);

      yield {
        phase: 'CYCLE_DETECTED',
        sortedEdges,
        evaluatingEdgeId: null,
        cycleEdgeId: edge.id,
        mstEdgeIds: mstEdges.map((e) => e.id),
        rejectedEdgeIds: Array.from(rejectedEdgeIds),
        totalWeight,
        componentsCount: uf.count,
        stepInfo: `Cycle detected! Nodes '${edge.source}' and '${edge.target}' are already connected in the same component. Rejecting edge '${edge.id}'.`
      };
    } else {
      uf.union(edge.source, edge.target);
      mstEdges.push(edge);
      totalWeight += edge.weight;

      yield {
        phase: 'ACCEPTED',
        sortedEdges,
        evaluatingEdgeId: null,
        cycleEdgeId: null,
        mstEdgeIds: mstEdges.map((e) => e.id),
        rejectedEdgeIds: Array.from(rejectedEdgeIds),
        totalWeight,
        componentsCount: uf.count,
        stepInfo: `Accepted edge '${edge.source}'—'${edge.target}' (weight ${edge.weight}) into MST! Current tree weight: ${totalWeight}.`
      };

      // Check if MST is complete (V - 1 edges)
      if (mstEdges.length === nodes.length - 1) {
        break;
      }
    }
  }

  // Final yield
  yield {
    phase: 'COMPLETE',
    sortedEdges,
    evaluatingEdgeId: null,
    cycleEdgeId: null,
    mstEdgeIds: mstEdges.map((e) => e.id),
    rejectedEdgeIds: Array.from(rejectedEdgeIds),
    totalWeight,
    componentsCount: uf.count,
    stepInfo: `Kruskal's MST complete! Connected all ${nodes.length} nodes with ${mstEdges.length} edges. Total MST weight: ${totalWeight}.`
  };
}
