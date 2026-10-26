/**
 * Expression Tree Generator & Traversal Engine
 * 
 * Constructs a binary Expression Tree from standard Infix notation using
 * a Stack-based Shunting-Yard algorithm.
 * 
 * Provides:
 * 1. buildExpressionTree(infix): Yields step-by-step tree/forest construction.
 * 2. getPostfix(root): Yields Post-order (Left, Right, Root) traversal.
 * 3. getPrefix(root): Yields Pre-order (Root, Left, Right) traversal.
 * 4. getInfix(root): Yields In-order (Left, Root, Right) traversal with parentheses.
 */

const PRECEDENCE = {
  '^': 4,
  '*': 3,
  '/': 3,
  '%': 3,
  '+': 2,
  '-': 2
};

const IS_RIGHT_ASSOCIATIVE = {
  '^': true
};

/**
 * Tokenize infix mathematical expression string into operands, operators, and parentheses.
 * Handles single/multi-character variable names, numbers, operators, and parentheses.
 * 
 * @param {string} expr
 * @returns {string[]}
 */
export function tokenizeExpression(expr) {
  if (!expr || typeof expr !== 'string') return [];
  const matches = expr.match(/[a-zA-Z0-9]+|[\+\-\*\/\%\^\(\)]/g);
  return matches || [];
}

/**
 * Helper to clone a tree node structure deeply
 */
function cloneNode(node) {
  if (!node) return null;
  return {
    id: node.id,
    value: node.value,
    isOperator: node.isOperator,
    left: cloneNode(node.left),
    right: cloneNode(node.right)
  };
}

/**
 * Shunting-Yard Expression Tree Builder Generator
 * 
 * Yields state at every step:
 * - Current token being inspected
 * - Newly allocated operand leaf or operator root
 * - Active operator stack and node stack snapshots
 * - Complete or partial tree root
 * 
 * @param {string} infixString
 * @yields {{ root: Object|null, activeNodeId: string|null, forest: Array<Object>, operatorStack: string[], nodeStack: Array<Object>, token: string, stepInfo: string, isDone?: boolean, error?: boolean }}
 */
export function* buildExpressionTree(infixString) {
  const tokens = tokenizeExpression(infixString);
  let idCounter = 1;

  if (tokens.length === 0) {
    yield {
      root: null,
      activeNodeId: null,
      forest: [],
      operatorStack: [],
      nodeStack: [],
      token: '',
      stepInfo: 'Empty expression. Please provide a valid equation.',
      isDone: true,
      error: true
    };
    return;
  }

  const operatorStack = [];
  const nodeStack = [];

  yield {
    root: null,
    activeNodeId: null,
    forest: [],
    operatorStack: [],
    nodeStack: [],
    token: '',
    stepInfo: `Starting Expression Tree construction for "${infixString}". Parsed ${tokens.length} tokens.`,
    isDone: false
  };

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    // Case 1: Left Parenthesis '('
    if (token === '(') {
      operatorStack.push(token);
      yield {
        root: nodeStack[nodeStack.length - 1] ? cloneNode(nodeStack[nodeStack.length - 1]) : null,
        activeNodeId: null,
        forest: nodeStack.map(cloneNode),
        operatorStack: [...operatorStack],
        nodeStack: nodeStack.map(cloneNode),
        token,
        stepInfo: `Pushed '(' onto operator stack to begin nested sub-expression.`,
        isDone: false
      };
    }
    // Case 2: Right Parenthesis ')'
    else if (token === ')') {
      yield {
        root: nodeStack[nodeStack.length - 1] ? cloneNode(nodeStack[nodeStack.length - 1]) : null,
        activeNodeId: null,
        forest: nodeStack.map(cloneNode),
        operatorStack: [...operatorStack],
        nodeStack: nodeStack.map(cloneNode),
        token,
        stepInfo: `Encountered ')'. Resolving operators inside parentheses...`,
        isDone: false
      };

      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
        const op = operatorStack.pop();
        if (nodeStack.length < 2) {
          yield {
            root: null,
            activeNodeId: null,
            forest: [],
            operatorStack: [...operatorStack],
            nodeStack: nodeStack.map(cloneNode),
            token,
            stepInfo: `Syntax Error: Insufficient operands for operator "${op}".`,
            isDone: true,
            error: true
          };
          return;
        }

        const right = nodeStack.pop();
        const left = nodeStack.pop();
        const opNode = {
          id: `node-${idCounter++}`,
          value: op,
          isOperator: true,
          left,
          right
        };
        nodeStack.push(opNode);

        yield {
          root: cloneNode(opNode),
          activeNodeId: opNode.id,
          forest: nodeStack.map(cloneNode),
          operatorStack: [...operatorStack],
          nodeStack: nodeStack.map(cloneNode),
          token,
          stepInfo: `Linked operator "${op}": Left child "${left.value}", Right child "${right.value}".`,
          isDone: false
        };
      }

      // Pop '('
      if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] === '(') {
        operatorStack.pop();
        yield {
          root: nodeStack[nodeStack.length - 1] ? cloneNode(nodeStack[nodeStack.length - 1]) : null,
          activeNodeId: null,
          forest: nodeStack.map(cloneNode),
          operatorStack: [...operatorStack],
          nodeStack: nodeStack.map(cloneNode),
          token,
          stepInfo: `Matched and discarded enclosing parentheses '()'.`,
          isDone: false
        };
      }
    }
    // Case 3: Operator (+, -, *, /, ^, %)
    else if (PRECEDENCE[token] !== undefined) {
      const currentPrec = PRECEDENCE[token];
      const isRightAssoc = !!IS_RIGHT_ASSOCIATIVE[token];

      while (operatorStack.length > 0) {
        const topOp = operatorStack[operatorStack.length - 1];
        if (topOp === '(') break;

        const topPrec = PRECEDENCE[topOp] || 0;
        const shouldPop = isRightAssoc ? topPrec > currentPrec : topPrec >= currentPrec;

        if (shouldPop) {
          operatorStack.pop();
          if (nodeStack.length < 2) {
            yield {
              root: null,
              activeNodeId: null,
              forest: [],
              operatorStack: [...operatorStack],
              nodeStack: nodeStack.map(cloneNode),
              token,
              stepInfo: `Syntax Error: Missing operand for operator "${topOp}".`,
              isDone: true,
              error: true
            };
            return;
          }

          const right = nodeStack.pop();
          const left = nodeStack.pop();
          const opNode = {
            id: `node-${idCounter++}`,
            value: topOp,
            isOperator: true,
            left,
            right
          };
          nodeStack.push(opNode);

          yield {
            root: cloneNode(opNode),
            activeNodeId: opNode.id,
            forest: nodeStack.map(cloneNode),
            operatorStack: [...operatorStack],
            nodeStack: nodeStack.map(cloneNode),
            token,
            stepInfo: `Precedence resolution: Created operator subtree for "${topOp}" (${left.value} ${topOp} ${right.value}).`,
            isDone: false
          };
        } else {
          break;
        }
      }

      operatorStack.push(token);
      yield {
        root: nodeStack[nodeStack.length - 1] ? cloneNode(nodeStack[nodeStack.length - 1]) : null,
        activeNodeId: null,
        forest: nodeStack.map(cloneNode),
        operatorStack: [...operatorStack],
        nodeStack: nodeStack.map(cloneNode),
        token,
        stepInfo: `Pushed operator "${token}" (precedence ${currentPrec}) to operator stack.`,
        isDone: false
      };
    }
    // Case 4: Operand (Variable or Number)
    else {
      const leafNode = {
        id: `node-${idCounter++}`,
        value: token,
        isOperator: false,
        left: null,
        right: null
      };
      nodeStack.push(leafNode);

      yield {
        root: cloneNode(leafNode),
        activeNodeId: leafNode.id,
        forest: nodeStack.map(cloneNode),
        operatorStack: [...operatorStack],
        nodeStack: nodeStack.map(cloneNode),
        token,
        stepInfo: `Created operand leaf node "${token}". Pushed to node stack.`,
        isDone: false
      };
    }
  }

  // Drain remaining operators
  while (operatorStack.length > 0) {
    const op = operatorStack.pop();
    if (op === '(' || op === ')') {
      yield {
        root: null,
        activeNodeId: null,
        forest: [],
        operatorStack: [...operatorStack],
        nodeStack: nodeStack.map(cloneNode),
        token: op,
        stepInfo: `Syntax Error: Unmatched parenthesis "${op}".`,
        isDone: true,
        error: true
      };
      return;
    }

    if (nodeStack.length < 2) {
      yield {
        root: null,
        activeNodeId: null,
        forest: [],
        operatorStack: [...operatorStack],
        nodeStack: nodeStack.map(cloneNode),
        token: op,
        stepInfo: `Syntax Error: Insufficient operands remaining for operator "${op}".`,
        isDone: true,
        error: true
      };
      return;
    }

    const right = nodeStack.pop();
    const left = nodeStack.pop();
    const opNode = {
      id: `node-${idCounter++}`,
      value: op,
      isOperator: true,
      left,
      right
    };
    nodeStack.push(opNode);

    yield {
      root: cloneNode(opNode),
      activeNodeId: opNode.id,
      forest: nodeStack.map(cloneNode),
      operatorStack: [...operatorStack],
      nodeStack: nodeStack.map(cloneNode),
      token: op,
      stepInfo: `Drained operator "${op}" from stack: Built root subtree (${left.value} ${op} ${right.value}).`,
      isDone: false
    };
  }

  const finalRoot = nodeStack.length === 1 ? nodeStack[0] : null;

  yield {
    root: cloneNode(finalRoot),
    activeNodeId: finalRoot ? finalRoot.id : null,
    forest: nodeStack.map(cloneNode),
    operatorStack: [],
    nodeStack: nodeStack.map(cloneNode),
    token: '',
    stepInfo: finalRoot
      ? `Expression Tree successfully constructed! Root operator is "${finalRoot.value}".`
      : 'Expression construction completed with multiple disconnected nodes.',
    isDone: true,
    error: !finalRoot
  };
}

/**
 * Post-order Traversal Generator (Left -> Right -> Root)
 * Converts Expression Tree to Postfix (Reverse Polish Notation).
 * 
 * @param {Object} root
 * @yields {{ activeNodeId: string, currentString: string, visitedNodeIds: string[], stepInfo: string, isDone?: boolean }}
 */
export function* getPostfix(root) {
  if (!root) {
    yield {
      activeNodeId: null,
      currentString: '',
      visitedNodeIds: [],
      stepInfo: 'Tree is empty. Cannot trace Postfix traversal.',
      isDone: true
    };
    return;
  }

  const resultTokens = [];
  const visitedNodeIds = [];

  function* postOrder(node) {
    if (!node) return;

    // 1. Traverse Left Subtree
    if (node.left) {
      yield {
        activeNodeId: node.left.id,
        currentString: resultTokens.join(' '),
        visitedNodeIds: [...visitedNodeIds],
        stepInfo: `Post-order: Traversing LEFT child of "${node.value}" -> visiting "${node.left.value}".`
      };
      yield* postOrder(node.left);
    }

    // 2. Traverse Right Subtree
    if (node.right) {
      yield {
        activeNodeId: node.right.id,
        currentString: resultTokens.join(' '),
        visitedNodeIds: [...visitedNodeIds],
        stepInfo: `Post-order: Traversing RIGHT child of "${node.value}" -> visiting "${node.right.value}".`
      };
      yield* postOrder(node.right);
    }

    // 3. Visit Root Node
    resultTokens.push(node.value);
    visitedNodeIds.push(node.id);

    yield {
      activeNodeId: node.id,
      currentString: resultTokens.join(' '),
      visitedNodeIds: [...visitedNodeIds],
      stepInfo: `Post-order Visit: Processed "${node.value}". Appended to Postfix output.`
    };
  }

  yield {
    activeNodeId: root.id,
    currentString: '',
    visitedNodeIds: [],
    stepInfo: `Starting Post-order traversal (Left, Right, Root) at Root "${root.value}".`
  };

  yield* postOrder(root);

  yield {
    activeNodeId: null,
    currentString: resultTokens.join(' '),
    visitedNodeIds: [...visitedNodeIds],
    stepInfo: `Postfix Traversal Complete! Result: ${resultTokens.join(' ')}`,
    isDone: true
  };
}

/**
 * Pre-order Traversal Generator (Root -> Left -> Right)
 * Converts Expression Tree to Prefix (Polish Notation).
 * 
 * @param {Object} root
 * @yields {{ activeNodeId: string, currentString: string, visitedNodeIds: string[], stepInfo: string, isDone?: boolean }}
 */
export function* getPrefix(root) {
  if (!root) {
    yield {
      activeNodeId: null,
      currentString: '',
      visitedNodeIds: [],
      stepInfo: 'Tree is empty. Cannot trace Prefix traversal.',
      isDone: true
    };
    return;
  }

  const resultTokens = [];
  const visitedNodeIds = [];

  function* preOrder(node) {
    if (!node) return;

    // 1. Visit Root Node First
    resultTokens.push(node.value);
    visitedNodeIds.push(node.id);

    yield {
      activeNodeId: node.id,
      currentString: resultTokens.join(' '),
      visitedNodeIds: [...visitedNodeIds],
      stepInfo: `Pre-order Visit: Processed "${node.value}". Appended to Prefix output.`
    };

    // 2. Traverse Left Subtree
    if (node.left) {
      yield {
        activeNodeId: node.left.id,
        currentString: resultTokens.join(' '),
        visitedNodeIds: [...visitedNodeIds],
        stepInfo: `Pre-order: Advancing to LEFT child of "${node.value}" -> "${node.left.value}".`
      };
      yield* preOrder(node.left);
    }

    // 3. Traverse Right Subtree
    if (node.right) {
      yield {
        activeNodeId: node.right.id,
        currentString: resultTokens.join(' '),
        visitedNodeIds: [...visitedNodeIds],
        stepInfo: `Pre-order: Advancing to RIGHT child of "${node.value}" -> "${node.right.value}".`
      };
      yield* preOrder(node.right);
    }
  }

  yield {
    activeNodeId: root.id,
    currentString: '',
    visitedNodeIds: [],
    stepInfo: `Starting Pre-order traversal (Root, Left, Right) at Root "${root.value}".`
  };

  yield* preOrder(root);

  yield {
    activeNodeId: null,
    currentString: resultTokens.join(' '),
    visitedNodeIds: [...visitedNodeIds],
    stepInfo: `Prefix Traversal Complete! Result: ${resultTokens.join(' ')}`,
    isDone: true
  };
}

/**
 * In-order Traversal Generator (Left -> Root -> Right)
 * Yields parenthesized Infix expression to demonstrate mathematical equivalence.
 * 
 * @param {Object} root
 * @yields {{ activeNodeId: string, currentString: string, visitedNodeIds: string[], stepInfo: string, isDone?: boolean }}
 */
export function* getInfix(root) {
  if (!root) {
    yield {
      activeNodeId: null,
      currentString: '',
      visitedNodeIds: [],
      stepInfo: 'Tree is empty. Cannot trace Infix traversal.',
      isDone: true
    };
    return;
  }

  const resultTokens = [];
  const visitedNodeIds = [];

  function* inOrder(node) {
    if (!node) return;

    const isOp = !!node.isOperator;
    if (isOp && (node.left || node.right)) {
      resultTokens.push('(');
    }

    // Left
    if (node.left) {
      yield* inOrder(node.left);
    }

    // Root
    resultTokens.push(node.value);
    visitedNodeIds.push(node.id);

    yield {
      activeNodeId: node.id,
      currentString: resultTokens.join(' '),
      visitedNodeIds: [...visitedNodeIds],
      stepInfo: `In-order Visit: Processed "${node.value}". Current Infix: ${resultTokens.join(' ')}`
    };

    // Right
    if (node.right) {
      yield* inOrder(node.right);
    }

    if (isOp && (node.left || node.right)) {
      resultTokens.push(')');
    }
  }

  yield {
    activeNodeId: root.id,
    currentString: '',
    visitedNodeIds: [],
    stepInfo: `Starting In-order traversal (Left, Root, Right) at Root "${root.value}".`
  };

  yield* inOrder(root);

  yield {
    activeNodeId: null,
    currentString: resultTokens.join(' '),
    visitedNodeIds: [...visitedNodeIds],
    stepInfo: `In-order Traversal Complete! Result: ${resultTokens.join(' ')}`,
    isDone: true
  };
}
