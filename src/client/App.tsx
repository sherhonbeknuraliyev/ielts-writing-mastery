import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import superjson from "superjson";
import { trpc } from "./utils/trpc.js";
import { AuthProvider, useAuth } from "./utils/auth.js";
import { ToastProvider } from "./utils/toast.js";
import { Layout } from "./components/Layout.js";
import { ErrorBoundary } from "./components/ErrorBoundary.js";
import { LoginPage } from "./pages/LoginPage.js";
import { DashboardPage } from "./pages/DashboardPage.js";
import { TaskPromptsPage } from "./pages/TaskPromptsPage.js";
import { WritingPracticePage } from "./pages/WritingPracticePage.js";
import { WritingHistoryPage } from "./pages/WritingHistoryPage.js";
import { SkillsOverviewPage } from "./pages/SkillsOverviewPage.js";
import { SkillDetailPage } from "./pages/SkillDetailPage.js";
import { VocabularyPage } from "./pages/VocabularyPage.js";
import { ParaphrasePage } from "./pages/ParaphrasePage.js";
import { BandUpgradesPage } from "./pages/BandUpgradesPage.js";
import { DailyChallengePage } from "./pages/DailyChallengePage.js";
import { AnalyticsPage } from "./pages/AnalyticsPage.js";
import type { ReactNode } from "react";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/writing/task1" element={<TaskPromptsPage type="task1-academic" />} />
        <Route path="/writing/task2" element={<TaskPromptsPage type="task2" />} />
        <Route path="/writing/practice/:promptId" element={<WritingPracticePage />} />
        <Route path="/writing/free" element={<WritingPracticePage />} />
        <Route path="/writing/history" element={<WritingHistoryPage />} />
        <Route path="/skills" element={<SkillsOverviewPage />} />
        <Route path="/skills/:id" element={<SkillDetailPage />} />
        <Route path="/vocabulary" element={<VocabularyPage />} />
        <Route path="/vocabulary/paraphrase" element={<ParaphrasePage />} />
        <Route path="/vocabulary/upgrades" element={<BandUpgradesPage />} />
        <Route path="/daily-challenge" element={<DailyChallengePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function TrpcProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
          headers() {
            const token = localStorage.getItem("token");
            return token ? { authorization: `Bearer ${token}` } : {};
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

export function App() {
  return (
    <AuthProvider>
      <TrpcProvider>
        <ToastProvider>
          <BrowserRouter>
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
          </BrowserRouter>
        </ToastProvider>
      </TrpcProvider>
    </AuthProvider>
  );
}
