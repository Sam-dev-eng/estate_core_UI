import React, { useState, useEffect } from "react";
import { AuthProvider } from "./presentation/context/AuthContext";
import Navbar from "./presentation/components/Navbar";
import Footer from "./presentation/components/Footer";
import LandingPage from "./presentation/pages/LandingPage";
import LoginPage from "./presentation/pages/LoginPage";
import SignUpPage from "./presentation/pages/SignUpPage";
import AdminDashboard from "./presentation/pages/AdminDashboard";
import AdminLoginPage, { isAdminAuthenticated } from "./presentation/pages/AdminLoginPage";
import PropertyDetailPage from "./presentation/pages/PropertyDetailPage";
import PurchasePropertyPage from "./presentation/pages/PurchasePropertyPage";


function MainApp() {
  const [currentPage, setCurrentPage] = useState("landing");
  const [routeParams, setRouteParams] = useState({});

  // Resolve page from URL path
  const resolveFromPath = (path) => {
    if (path === "/admin") {
      // Always require admin session — independent of regular user auth
      if (isAdminAuthenticated()) {
        setCurrentPage("admin-dashboard");
      } else {
        window.history.replaceState(null, "", "/admin/login");
        setCurrentPage("admin-login");
      }
    } else if (path === "/admin/login") {
      // If already admin-authenticated, go straight to dashboard
      if (isAdminAuthenticated()) {
        window.history.replaceState(null, "", "/admin");
        setCurrentPage("admin-dashboard");
      } else {
        setCurrentPage("admin-login");
      }
    } else if (path === "/login") {
      setCurrentPage("login");
    } else if (path === "/signup") {
      setCurrentPage("signup");
    } else if (path.startsWith("/property/")) {
      const parts = path.split("/");
      const id = parts[2];
      if (parts[3] === "purchase") {
        setCurrentPage("purchase-property");
        setRouteParams({ propertyId: id });
      } else {
        setCurrentPage("property-detail");
        setRouteParams({ propertyId: id });
      }
    } else {
      setCurrentPage("landing");
    }
  };

  // Sync with browser history (deep links + back/forward)
  useEffect(() => {
    resolveFromPath(window.location.pathname);
    const onPop = () => resolveFromPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigateTo = (page, params = {}) => {
    let path = "/";

    if (page === "admin" || page === "admin-dashboard") {
      if (!isAdminAuthenticated()) {
        // Always redirect to admin login, never to regular login
        window.history.pushState(null, "", "/admin/login");
        setCurrentPage("admin-login");
        return;
      }
      path = "/admin";
      window.history.pushState(null, "", path);
      setCurrentPage("admin-dashboard");
      setRouteParams({});
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    } else if (page === "admin-login") {
      path = "/admin/login";
    } else if (page === "login") {
      path = "/login";
    } else if (page === "signup") {
      path = "/signup";
    } else if (page === "property-detail") {
      path = `/property/${params.propertyId || params.id}`;
    } else if (page === "purchase-property") {
      path = `/property/${params.propertyId || params.id}/purchase`;
    }


    window.history.pushState(null, "", path);
    setCurrentPage(page);
    setRouteParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#080b13] text-slate-100">
      {/* Navbar — hidden on admin login page for a clean gate experience */}
      {currentPage !== "admin-login" && (
        <Navbar currentPage={currentPage} navigateTo={navigateTo} />
      )}

      {/* Page Outlet */}
      <main className="flex-grow">
        {currentPage === "landing" && (
          <LandingPage navigateTo={navigateTo} routeParams={routeParams} />
        )}
        {currentPage === "login" && <LoginPage navigateTo={navigateTo} />}
        {currentPage === "signup" && <SignUpPage navigateTo={navigateTo} />}

        {/* Admin gate — password-protected, separate from user auth */}
        {currentPage === "admin-login" && (
          <AdminLoginPage navigateTo={navigateTo} />
        )}

        {/* Admin dashboard — only if admin session is valid */}
        {currentPage === "admin-dashboard" && isAdminAuthenticated() && (
          <AdminDashboard navigateTo={navigateTo} />
        )}

        {currentPage === "property-detail" && (
          <PropertyDetailPage
            propertyId={routeParams.propertyId}
            navigateTo={navigateTo}
            routeParams={routeParams}
          />
        )}

        {currentPage === "purchase-property" && (
          <PurchasePropertyPage
            propertyId={routeParams.propertyId}
            navigateTo={navigateTo}
          />
        )}
      </main>

      {/* Footer — hidden on admin pages */}
      {currentPage !== "admin-login" && currentPage !== "admin-dashboard" && (
        <Footer />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
