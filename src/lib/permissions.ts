// Multi-user Permissions System
// Role-based access control for the admin panel

export type UserRole = 'admin' | 'manager' | 'seller' | 'cashier' | 'viewer'

export interface Permission {
  module: string
  actions: ('view' | 'create' | 'edit' | 'delete')[]
}

export interface RolePermissions {
  role: UserRole
  label: string
  description: string
  permissions: Permission[]
}

// Define permissions for each role
export const rolePermissions: Record<UserRole, RolePermissions> = {
  admin: {
    role: 'admin',
    label: 'Administrador',
    description: 'Acesso total ao sistema',
    permissions: [
      { module: 'dashboard', actions: ['view'] },
      { module: 'estoque', actions: ['view', 'create', 'edit', 'delete'] },
      { module: 'pdv', actions: ['view', 'create'] },
      { module: 'vendas', actions: ['view', 'create', 'edit', 'delete'] },
      { module: 'clientes', actions: ['view', 'create', 'edit', 'delete'] },
      { module: 'financeiro', actions: ['view', 'create', 'edit', 'delete'] },
      { module: 'contas', actions: ['view', 'create', 'edit', 'delete'] },
      { module: 'configuracoes', actions: ['view', 'edit'] },
      { module: 'marketing', actions: ['view', 'create', 'edit', 'delete'] },
      { module: 'atendimento', actions: ['view', 'create', 'edit'] },
      { module: 'usuarios', actions: ['view', 'create', 'edit', 'delete'] },
      { module: 'loja-admin', actions: ['view', 'edit'] },
      { module: 'relatorios', actions: ['view'] },
    ],
  },
  manager: {
    role: 'manager',
    label: 'Gerente',
    description: 'Gerencia operacoes e equipe',
    permissions: [
      { module: 'dashboard', actions: ['view'] },
      { module: 'estoque', actions: ['view', 'create', 'edit'] },
      { module: 'pdv', actions: ['view', 'create'] },
      { module: 'vendas', actions: ['view', 'create', 'edit'] },
      { module: 'clientes', actions: ['view', 'create', 'edit'] },
      { module: 'financeiro', actions: ['view', 'create'] },
      { module: 'contas', actions: ['view'] },
      { module: 'marketing', actions: ['view', 'create', 'edit'] },
      { module: 'atendimento', actions: ['view', 'create', 'edit'] },
      { module: 'loja-admin', actions: ['view', 'edit'] },
      { module: 'relatorios', actions: ['view'] },
    ],
  },
  seller: {
    role: 'seller',
    label: 'Vendedor',
    description: 'Realiza vendas e atende clientes',
    permissions: [
      { module: 'dashboard', actions: ['view'] },
      { module: 'estoque', actions: ['view'] },
      { module: 'pdv', actions: ['view', 'create'] },
      { module: 'vendas', actions: ['view', 'create'] },
      { module: 'clientes', actions: ['view', 'create', 'edit'] },
      { module: 'atendimento', actions: ['view', 'create'] },
    ],
  },
  cashier: {
    role: 'cashier',
    label: 'Caixa',
    description: 'Opera o PDV e recebe pagamentos',
    permissions: [
      { module: 'pdv', actions: ['view', 'create'] },
      { module: 'vendas', actions: ['view'] },
      { module: 'clientes', actions: ['view'] },
    ],
  },
  viewer: {
    role: 'viewer',
    label: 'Visualizador',
    description: 'Apenas visualiza dados',
    permissions: [
      { module: 'dashboard', actions: ['view'] },
      { module: 'estoque', actions: ['view'] },
      { module: 'vendas', actions: ['view'] },
      { module: 'clientes', actions: ['view'] },
      { module: 'relatorios', actions: ['view'] },
    ],
  },
}

// Check if a role has permission for a specific action on a module
export function hasPermission(
  role: UserRole,
  module: string,
  action: 'view' | 'create' | 'edit' | 'delete'
): boolean {
  const roleConfig = rolePermissions[role]
  if (!roleConfig) return false

  const modulePermission = roleConfig.permissions.find(p => p.module === module)
  if (!modulePermission) return false

  return modulePermission.actions.includes(action)
}

// Get all permissions for a role
export function getRolePermissions(role: UserRole): Permission[] {
  return rolePermissions[role]?.permissions || []
}

// Get all modules a role can access
export function getAccessibleModules(role: UserRole): string[] {
  const permissions = getRolePermissions(role)
  return permissions
    .filter(p => p.actions.includes('view'))
    .map(p => p.module)
}

// Check if user can access a route
export function canAccessRoute(role: UserRole, pathname: string): boolean {
  // Extract module from pathname (e.g., /estoque -> estoque)
  const module = pathname.split('/').filter(Boolean)[0] || 'dashboard'
  return hasPermission(role, module, 'view')
}

// Get menu items filtered by permissions
export function getFilteredMenuItems(role: UserRole, menuItems: Array<{ href: string; title: string; icon: any }>) {
  return menuItems.filter(item => {
    const module = item.href.split('/').filter(Boolean)[0] || 'dashboard'
    return hasPermission(role, module, 'view')
  })
}

// Audit log entry type
export interface AuditLogEntry {
  userId: string
  userName: string
  action: string
  module: string
  details: string
  timestamp: Date
  ipAddress?: string
}

// Create audit log entry (to be saved to database)
export function createAuditLog(
  userId: string,
  userName: string,
  action: string,
  module: string,
  details: string,
  ipAddress?: string
): AuditLogEntry {
  return {
    userId,
    userName,
    action,
    module,
    details,
    timestamp: new Date(),
    ipAddress,
  }
}

// Format action for display
export function formatAction(action: string): string {
  const actionLabels: Record<string, string> = {
    view: 'Visualizou',
    create: 'Criou',
    edit: 'Editou',
    delete: 'Excluiu',
    login: 'Login',
    logout: 'Logout',
    export: 'Exportou',
    print: 'Imprimiu',
  }
  return actionLabels[action] || action
}

// Module labels for display
export const moduleLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  estoque: 'Estoque',
  pdv: 'PDV',
  vendas: 'Vendas',
  clientes: 'Clientes',
  financeiro: 'Financeiro',
  contas: 'Contas Fixas',
  configuracoes: 'Configuracoes',
  marketing: 'Marketing',
  atendimento: 'Atendimento',
  usuarios: 'Usuarios',
  'loja-admin': 'Loja Virtual',
  relatorios: 'Relatorios',
}
