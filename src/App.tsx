/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import HowItWorks from "./pages/HowItWorks";
import LoanOptions from "./pages/LoanOptions";
import ApplyNow from "./pages/ApplyNow";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import AdminDashboard from "./pages/AdminDashboard";
import FinancialCoach from "./pages/FinancialCoach";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./lib/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="how-it-works" element={<HowItWorks />} />
              <Route path="loan-options" element={<LoanOptions />} />
              <Route path="apply" element={<ApplyNow />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="contact" element={<Contact />} />
              <Route path="coach" element={<FinancialCoach />} />
              <Route path="admin" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
