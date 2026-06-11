import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PortalLayout } from '../../components/PortalLayout';
import { AdminHome, HQHome, BranchHome } from './dashboards';
import { WaiterHome, KitchenHome, CashierHome, DeliveryHome } from './operations';
import { CustomerHome, CustomerOrders } from './customer';
import { AdminUsers, Branches, BranchMenu, BranchStaff, OrdersPage } from './management';
import type { Role } from '../../lib/types';

function RoleHome() {
  const { user } = useAuth();
  if (!user) return null;
  const homes: Record<Role, React.ReactNode> = {
    ADMIN: <AdminHome />,
    HQ_MANAGER: <HQHome />,
    BRANCH_MANAGER: <BranchHome />,
    WAITER: <WaiterHome />,
    CHEF: <KitchenHome />,
    CASHIER: <CashierHome />,
    DELIVERY: <DeliveryHome />,
    CUSTOMER: <CustomerHome />,
  };
  return homes[user.role];
}

export default function Portal() {
  return (
    <PortalLayout>
      <Routes>
        <Route index element={<RoleHome />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="branches" element={<Branches />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="menu" element={<BranchMenu />} />
        <Route path="staff" element={<BranchStaff />} />
        <Route path="my-orders" element={<CustomerOrders />} />
        <Route path="*" element={<Navigate to="/portal" replace />} />
      </Routes>
    </PortalLayout>
  );
}
