import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";
import Logout from "./components/Logout";
import AdminLayout from "./components/AdminLayout";
import UserLayout from "./components/UserLayout"; // New layout for users
import { Outlet } from "react-router-dom"; 

// Import shared components
import ManageInvoice from "./components/ManageInvoice";
import AddSupplier from "./components/AddSupplier";
import SalesReport from "./components/SalesReport";
import ManageMedicine from "./components/ManageMedicine";
import Invoicepage from "./components/Invoicepage";
import AddProduct from "./components/AddProduct";
import ManageMedicineStock from "./components/ManageMedicineStock";
import ManagePurchase from "./components/ManagePurchase";
import AddCustomer from "./components/AddCustomer";
import ManageCustomer from "./components/ManageCustomer";
import AddPurchase from "./components/AddPurchase";
import ManageSupplier from "./components/ManageSupplier";
import PurchaseReport from "./components/PurchaseReport";
import ChangeCredentials from "./components/ChangeCredentials";
import ChangeAdminCredentials from "./components/ChangeAdminCredentials";
import AddCredentials from "./components/AddCredentials";
import RackManagement from "./components/RackManagement";
import LoyaltyRedemption from "./components/LoyaltyRedemption";
import Manageusers from "./pages/Manageusers";
import AdvancedChatbot from "./components/AdvancedChatbot";
import FloatingChatbot from './components/FloatingChatbot';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/logout" element={<Logout />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="AdvancedChatbot" element={<AdvancedChatbot />} />
          <Route path="AddProduct" element={<AddProduct />} />
          <Route path="ManageMedicine" element={<ManageMedicine />} />
          <Route path="AddCustomer" element={<AddCustomer />} />
          <Route path="ManageCustomer" element={<ManageCustomer />} />
          <Route path="AddSupplier" element={<AddSupplier />} />
          <Route path="ManageSupplier" element={<ManageSupplier />} />
          <Route path="AddPurchase" element={<AddPurchase />} />
          <Route path="ManagePurchase" element={<ManagePurchase />} />
          <Route path="ManageInvoice" element={<ManageInvoice />} />
          <Route path="Invoicepage" element={<Invoicepage />} />
          <Route path="ManageMedicineStock" element={<ManageMedicineStock />} />
          <Route path="RackManagement" element={<RackManagement />} />
          <Route path="SalesReport" element={<SalesReport />} />
          <Route path="PurchaseReport" element={<PurchaseReport />} />
          <Route path="LoyaltyRedemption" element={<LoyaltyRedemption />} />
          <Route path="ChangeCredentials" element={<ChangeCredentials />} />
          <Route path="ChangeAdminCredentials" element={<ChangeAdminCredentials />} />
          <Route path="AddCredentials" element={<AddCredentials />} />
          <Route path="Manageusers" element={<Manageusers />} />
        </Route>

        {/* User Routes */}
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<UserDashboard />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="AdvancedChatbot" element={<AdvancedChatbot />} />
          <Route path="AddProduct" element={<AddProduct />} />
          <Route path="ManageMedicine" element={<ManageMedicine />} />
          <Route path="AddCustomer" element={<AddCustomer />} />
          <Route path="ManageCustomer" element={<ManageCustomer />} />
          <Route path="AddSupplier" element={<AddSupplier />} />
          <Route path="ManageSupplier" element={<ManageSupplier />} />
          <Route path="AddPurchase" element={<AddPurchase />} />
          <Route path="ManagePurchase" element={<ManagePurchase />} />
          <Route path="ManageInvoice" element={<ManageInvoice />} />
          <Route path="Invoicepage" element={<Invoicepage />} />
          <Route path="ManageMedicineStock" element={<ManageMedicineStock />} />
          <Route path="RackManagement" element={<RackManagement />} />
          <Route path="SalesReport" element={<SalesReport />} />
          <Route path="PurchaseReport" element={<PurchaseReport />} />
          <Route path="LoyaltyRedemption" element={<LoyaltyRedemption />} />
          <Route path="ChangeCredentials" element={<ChangeCredentials />} />
          <Route path="ChangeAdminCredentials" element={<ChangeAdminCredentials />} />
          <Route path="AddCredentials" element={<AddCredentials />} />
          <Route path="Manageusers" element={<Manageusers />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
      
      {/* Floating Chatbot - Available on all pages */}
      <FloatingChatbot />
    </Router>
  );
}

export default App;
