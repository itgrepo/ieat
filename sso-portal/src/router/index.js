import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import ApplicationDashboard from '../views/ApplicationDashboard.vue'
import UserManagement from '../views/admin/UserManagement.vue'
import UserEdit from '../views/admin/UserEdit.vue'
import DataExchange from '../views/admin/DataExchange.vue'
import ExecutiveDashboard from '../views/admin/ExecutiveDashboard.vue'
import ApplicationManagement from '../views/admin/ApplicationManagement.vue'
import IDProviders from '../views/admin/IDProviders.vue'
import Logs from '../views/admin/Logs.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/portal',
    name: 'PortalHome',
    component: () => import('../views/PortalHome.vue')
  },
  {
    path: '/apps/pmis',
    name: 'PmisApp',
    component: () => import('../views/PmisApp.vue')
  },
  {
    path: '/admin/data-exchange',
    name: 'DataExchange',
    component: DataExchange
  },
  {
    path: '/sso-portal',
    name: 'Dashboard',
    component: ApplicationDashboard
  },
  {
    path: '/admin/users',
    name: 'UserManagement',
    component: UserManagement
  },
  {
    path: '/admin/users/add',
    name: 'UserAdd',
    component: UserEdit
  },
  {
    path: '/admin/users/edit/:id',
    name: 'UserEdit',
    component: UserEdit
  },
  {
    path: '/admin/applications',
    name: 'ApplicationManagement',
    component: ApplicationManagement
  },
  {
    path: '/admin/idp',
    name: 'IDProviders',
    component: IDProviders
  },
  {
    path: '/admin/logs',
    name: 'Logs',
    component: Logs
  },
  {
    path: '/admin/stats',
    name: 'ExecutiveDashboard',
    component: ExecutiveDashboard
  },
  {
    path: '/',
    name: 'CatalogView',
    component: () => import('../views/CatalogView.vue')
  },
  {
    path: '/dataset/:id',
    name: 'DatasetDetailView',
    component: () => import('../views/DatasetDetailView.vue')
  },
  {
    path: '/dataset-config',
    name: 'DatasetConfigView',
    component: () => import('../views/DatasetConfigView.vue')
  },
  {
    path: '/api-management',
    name: 'APIManagementView',
    component: () => import('../views/APIManagementView.vue')
  },
  {
    path: '/api-monitor',
    name: 'ApiMonitorView',
    component: () => import('../views/ApiMonitorView.vue')
  },
  {
    path: '/permission-management',
    name: 'PermissionManagementView',
    component: () => import('../views/PermissionManagementView.vue')
  },
  {
    path: '/group-user-management',
    name: 'GroupUserManagementView',
    component: () => import('../views/GroupUserManagementView.vue')
  },
  {
    path: '/dataset-management',
    name: 'DatasetManagementView',
    component: () => import('../views/DatasetManagementView.vue')
  },
  {
    path: '/group-dataset-management',
    name: 'GroupDatasetManagementView',
    component: () => import('../views/GroupDatasetManagementView.vue')
  },
  {
    path: '/user-approval',
    name: 'UserApprovalView',
    component: () => import('../views/UserApprovalView.vue')
  },
  {
    path: '/dashboard',
    name: 'DataXDashboardView',
    component: () => import('../views/DashboardView.vue')
  },
  {
    path: '/dataset-permission-monitor',
    name: 'DatasetPermissionMonitorView',
    component: () => import('../views/DatasetPermissionMonitorView.vue')
  },
  {
    path: '/favorites',
    name: 'FavoritesView',
    component: () => import('../views/FavoritesView.vue')
  },
  {
    path: '/organization-management',
    name: 'OrganizationManagementView',
    component: () => import('../views/OrganizationManagementView.vue')
  },
  {
    path: '/category-management',
    name: 'CategoryManagementView',
    component: () => import('../views/CategoryManagementView.vue')
  },
  {
    path: '/monitor',
    name: 'MonitorView',
    component: () => import('../views/MonitorView.vue')
  },
  {
    path: '/analytics',
    name: 'AnalyticsView',
    component: () => import('../views/AnalyticsView.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const publicPages = ['/login', '/register', '/apps/pmis'];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem('sso_user');

  if (authRequired && !loggedIn) {
    return next('/login');
  }

  // Prevent logged in users from going back to login
  if (to.path === '/login' && loggedIn) {
    return next('/');
  }

  next();
});

export default router
