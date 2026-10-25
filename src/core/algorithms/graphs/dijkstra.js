/**
 * Dijkstra's Single-Source Shortest Path Algorithm Generator
 *
 * Implements Dijkstra's algorithm for undirected weighted graphs.
 * Yields state at each exploration, edge relaxation, and final path reconstruction.
 *
 * @param {Array} nodes - Array of { id, label, x, y }
 * @param {Array} edges - Array of { id, source, target, weight }
 * @param {string} startNodeId - Source node ID (default 'A')
 * @param {string|null} targetNodeId - Destination node ID (optional, defaults to opposite node 'D')
 */
export function* dijkstra(nodes, edges, startNodeId = 'A', targetNodeId = null) {
  // Determine target node for path reconstruction
  let chosenTarget = targetNodeId;
  if (!chosenTarget) {
    const nonStart = nodes.filter((n) => n.id !== startNodeId);
    // Prefer opposite node 'D' if available, otherwise pick random
    const preferred = nonStart.find((n) => n.id === 'D');
    chosenTarget = preferred ? preferred.id : nonStart[Math.floor(Math.random() * nonStart.length)]?.id;
  }

  // Build adjacency list for undirected graph
  const adj = {};
  for (const node of nodes) {
    adj[node.id] = [];
  }
  for (const edge of edges) {
    if (adj[edge.source] && adj[edge.target]) {
      adj[edge.source].push({ neighbor: edge.target, weight: edge.weight, edgeId: edge.id });
      adj[edge.target].push({ neighbor: edge.source, weight: edge.weight, edgeId: edge.id });
    }
  }

  // Distance table and predecessors
  const distances = {};
  const previous = {};
  const unvisited = new Set();
  const visited = new Set();

  for (const node of nodes) {
    distances[node.id] = node.id === startNodeId ? 0 : Infinity;
    previous[node.id] = null;
    unvisited.add(node.id);
  }

  // Initial state yield
  yield {
    phase: 'INIT',
    activeNodeId: startNodeId,
    visitedNodeIds: [],
    evaluatingEdgeId: null,
    neighborNodeId: null,
    updatedNodeId: null,
    pathEdgeIds: [],
    pathNodeIds: [],
    targetNodeId: chosenTarget,
    distances: { ...distances },
    previous: { ...previous },
    stepInfo: `Starting GPS search from source '${startNodeId}'. All other destination distances are unknown (∞).`
  };

  while (unvisited.size > 0) {
    // Extract unvisited node with minimum tentative distance
    let minNode = null;
    let minDistance = Infinity;

    for (const nodeId of unvisited) {
      if (distances[nodeId] < minDistance) {
        minDistance = distances[nodeId];
        minNode = nodeId;
      }
    }

    // If remaining unvisited nodes are unreachable, stop
    if (!minNode || minDistance === Infinity) {
      break;
    }

    const u = minNode;

    // Yield extraction of minimum node
    yield {
      phase: 'EXTRACT',
      activeNodeId: u,
      visitedNodeIds: Array.from(visited),
      evaluatingEdgeId: null,
      neighborNodeId: null,
      updatedNodeId: null,
      pathEdgeIds: [],
      pathNodeIds: [],
      targetNodeId: chosenTarget,
      distances: { ...distances },
      previous: { ...previous },
      stepInfo: `Stepping to nearest reachable location '${u}' (current cost: ${distances[u]}).`
    };

    unvisited.delete(u);
    visited.add(u);

    // Evaluate neighbors
    const neighbors = adj[u] || [];
    for (const { neighbor: v, weight, edgeId } of neighbors) {
      if (visited.has(v)) continue;

      const candidateDist = distances[u] + weight;

      // Yield edge evaluation
      yield {
        phase: 'EVALUATE',
        activeNodeId: u,
        visitedNodeIds: Array.from(visited),
        evaluatingEdgeId: edgeId,
        neighborNodeId: v,
        updatedNodeId: null,
        pathEdgeIds: [],
        pathNodeIds: [],
        targetNodeId: chosenTarget,
        distances: { ...distances },
        previous: { ...previous },
        stepInfo: `Checking road '${u}'—'${v}' (road cost ${weight}). Potential route cost: ${distances[u]} + ${weight} = ${candidateDist}.`
      };

      if (candidateDist < distances[v]) {
        const oldDist = distances[v];
        distances[v] = candidateDist;
        previous[v] = { prevNodeId: u, edgeId, weight };

        // Yield distance relaxation
        yield {
          phase: 'UPDATE',
          activeNodeId: u,
          visitedNodeIds: Array.from(visited),
          evaluatingEdgeId: edgeId,
          neighborNodeId: v,
          updatedNodeId: v,
          pathEdgeIds: [],
          pathNodeIds: [],
          targetNodeId: chosenTarget,
          distances: { ...distances },
          previous: { ...previous },
          stepInfo: `Found a faster shortcut to '${v}'! Improved route cost from ${oldDist === Infinity ? '∞' : oldDist} → ${candidateDist} via '${u}'.`
        };
      } else {
        yield {
          phase: 'RELAX_FAILED',
          activeNodeId: u,
          visitedNodeIds: Array.from(visited),
          evaluatingEdgeId: edgeId,
          neighborNodeId: v,
          updatedNodeId: null,
          pathEdgeIds: [],
          pathNodeIds: [],
          targetNodeId: chosenTarget,
          distances: { ...distances },
          previous: { ...previous },
          stepInfo: `Road '${u}'—'${v}' is not a shortcut. Current best route to '${v}' (${distances[v]}) is already faster than or equal to ${candidateDist}.`
        };
      }
    }
  }

  // Backtrace shortest path from chosen target to start
  const pathEdgeIds = [];
  const pathNodeIds = [];
  let curr = chosenTarget;

  while (curr && curr !== startNodeId) {
    pathNodeIds.unshift(curr);
    const prev = previous[curr];
    if (!prev) break;
    pathEdgeIds.unshift(prev.edgeId);
    curr = prev.prevNodeId;
  }

  if (curr === startNodeId) {
    pathNodeIds.unshift(startNodeId);
  }

  // Yield completion with traced path
  yield {
    phase: 'COMPLETE',
    activeNodeId: null,
    visitedNodeIds: Array.from(visited),
    evaluatingEdgeId: null,
    neighborNodeId: null,
    updatedNodeId: null,
    pathEdgeIds,
    pathNodeIds,
    targetNodeId: chosenTarget,
    distances: { ...distances },
    previous: { ...previous },
    stepInfo: `Fastest route found! Shortest path to '${chosenTarget}' is [${pathNodeIds.join(' → ')}] with total travel cost ${distances[chosenTarget]}.`
  };
}
