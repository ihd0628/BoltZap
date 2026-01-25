import React, { createContext, useContext } from 'react';

import { useNode, type NodeActions, type NodeState } from '../hooks/useNode';

// Context 타입 정의
interface NodeContextValue {
  state: NodeState;
  actions: NodeActions;
}

const NodeContext = createContext<NodeContextValue | null>(null);

// Provider 컴포넌트
export const NodeProvider = ({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element => {
  const [state, actions] = useNode();

  return (
    <NodeContext.Provider value={{ state, actions }}>
      {children}
    </NodeContext.Provider>
  );
};

// Custom Hook으로 Context 사용
export const useNodeContext = (): NodeContextValue => {
  const context = useContext(NodeContext);
  if (!context) {
    throw new Error('useNodeContext must be used within a NodeProvider');
  }
  return context;
};
