import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import LoginPage from "./features/auth/pages/LoginPage";
import AuthLayout from "./features/auth/layouts/AuthLayout";
import RegisterPage from "./features/auth/pages/RegisterPage";
import NotFoundPage from "./features/common/pages/NotFoundPage";

// Halaman dashboard dimuat lazy (code-splitting) agar bundle awal halaman publik lebih kecil
const LostFoundLayout = lazy(() =>
  import("./features/lost-founds/layouts/LostFoundLayout")
);
const HomePage = lazy(() => import("./features/lost-founds/pages/HomePage"));
const DetailPage = lazy(() => import("./features/lost-founds/pages/DetailPage"));
const UsersPage = lazy(() => import("./features/users/pages/UsersPage"));
const ProfilePage = lazy(() => import("./features/users/pages/ProfilePage"));

function PageLoader() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <p role="status" aria-live="polite" className="text-sm font-medium text-slate-600">
        Memuat halaman...
      </p>
    </main>
  );
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Auth routes */}
        <Route path="auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* Dashboard routes */}
        <Route path="/" element={<LostFoundLayout />}>
          <Route index element={<HomePage />} />
          <Route path="lost-founds/:lostFoundId" element={<DetailPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
