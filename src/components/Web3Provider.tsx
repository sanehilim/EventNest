'use client';

import { createWeb3Modal } from '@web3modal/wagmi/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, State } from 'wagmi';
import { wagmiConfig, projectId } from '@/lib/web3config';
import { ReactNode, useState } from 'react';

if (projectId) {
  createWeb3Modal({
    wagmiConfig,
    projectId,
    enableAnalytics: false,
    themeMode: 'light',
    themeVariables: {
      '--w3m-accent': '#F97316',
      '--w3m-border-radius-master': '12px',
    },
  });
}

export function Web3Provider({ 
  children, 
  initialState 
}: { 
  children: ReactNode;
  initialState?: State;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
