"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { RoleType, Tenant, Branch, Employee } from "@/types";
import { DataStore } from "@/lib/data/store";

interface AuthContextType {
  currentRole: RoleType;
  setRole: (role: RoleType) => void;
  selectedBranchId: string; // "all" o id de sucursal
  setSelectedBranchId: (id: string) => void;
  activeEmployeeId?: string;
  setActiveEmployeeId: (id: string | undefined) => void;
  tenant: Tenant;
  branches: Branch[];
  employees: Employee[];
  refreshData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setRole] = useState<RoleType>("owner");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("all");
  const [activeEmployeeId, setActiveEmployeeId] = useState<string | undefined>("emp_carlos");
  const [tenant, setTenant] = useState<Tenant>(DataStore.getTenant());
  const [branches, setBranches] = useState<Branch[]>(DataStore.getBranches());
  const [employees, setEmployees] = useState<Employee[]>(DataStore.getEmployees());

  const refreshData = () => {
    setTenant(DataStore.getTenant());
    setBranches([...DataStore.getBranches()]);
    setEmployees([...DataStore.getEmployees()]);
  };

  useEffect(() => {
    // Si el rol es empleado, forzar a su id de empleado
    if (currentRole === "employee") {
      setActiveEmployeeId("emp_carlos");
      setSelectedBranchId("br_centro");
    }
  }, [currentRole]);

  return (
    <AuthContext.Provider
      value={{
        currentRole,
        setRole,
        selectedBranchId,
        setSelectedBranchId,
        activeEmployeeId,
        setActiveEmployeeId,
        tenant,
        branches,
        employees,
        refreshData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
