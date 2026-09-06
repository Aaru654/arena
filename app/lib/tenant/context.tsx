'use client';

import React, { createContext, useContext } from 'react';

interface Tenant {
  id: string;
  slug: string;
  name: string;
  logo_url?: string;
  settings?: Record<string, any>;
  [key: string]: any;
}

interface Profile {
  id: string;
  role: string;
  tenant_id: string;
  [key: string]: any;
}

interface TenantContextType {
  tenant: Tenant | null;
  profile: Profile | null;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: React.ReactNode;
  tenant: Tenant | null;
  profile: Profile | null;
}

export function TenantProvider({ children, tenant, profile }: TenantProviderProps) {
  return (
    <TenantContext.Provider value={{ tenant, profile }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant(): TenantContextType {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
