import { useState, createContext, useContext } from "react";
import type { ReactNode } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FileText, BarChart3, PenLine, FolderOpen, TrendingUp, Brain, Sparkles, BookOpen, RefreshCw, ArrowUpCircle, Zap, LayoutDashboard, GraduationCap, Moon, Sun, Menu, X } from "lucide-react";
import { useAuth } from "../utils/auth.js";
import { useTheme } from "../hooks/useTheme.js";
import { useFocusMode } from "../hooks/useFocusMode.js";
import { useStudySession } from "../hooks/useStudySession.js";

interface NavItem {
  to: string;
  icon: ReactNode;
  label: string;
  highlight?: boolean;
}

const NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: "Writing",
    items: [
      { to: "/writing/task2", icon: <FileText size={18} />, label: "Task 2 Essays" },
      { to: "/writing/task1", icon: <BarChart3 size={18} />, label: "Task 1 Reports" },
      { to: "/writing/free", icon: <PenLine size={18} />, label: "Free Practice" },
      { to: "/writing/history", icon: <FolderOpen size={18} />, label: "My Writings" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { to: "/analytics", icon: <TrendingUp size={18} />, label: "Performance Analytics" },
    ],
  },
  {
    label: "Skills",
    items: [
      { to: "/skills", icon: <Brain size={18} />, label: "Skills Overview" },
      { to: "/skills?module=writing-techniques", icon: <Sparkles size={18} />, label: "Writing Techniques" },
    ],
  },
  {
    label: "Vocabulary",
    items: [
      { to: "/vocabulary", icon: <BookOpen size={18} />, label: "Collocations" },
      { to: "/vocabulary/paraphrase", icon: <RefreshCw size={18} />, label: "Paraphrasing" },
      { to: "/vocabulary/upgrades", icon: <ArrowUpCircle size={18} />, label: "Band Upgrades" },
    ],
  },
  {
    label: "Practice",
    items: [
      { to: "/daily-challenge", icon: <Zap size={18} />, label: "Daily Challenge", highlight: true },
    ],
  },
];

interface FocusModeContextType {
  focusMode: boolean;
  enter: () => void;
  exit: () => void;
  toggle: () => void;
}

const FocusModeContext = createContext<FocusModeContextType>({
  focusMode: false,
  enter: () => {},
  exit: () => {},
  toggle: () => {},
});

export const useFocusModeContext = () => useContext(FocusModeContext);

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggle: toggleTheme } = useTheme();
  const focusModeState = useFocusMode();
  const { focusMode, exit: exitFocus } = focusModeState;
  const { showBreakReminder, dismissBreak } = useStudySession();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <FocusModeContext.Provider value={focusModeState}>
      <div className={`app-shell${focusMode ? " focus-mode" : ""}`}>
        {!focusMode && (
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        )}

        {!focusMode && (
          <div
            className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {!focusMode && (
          <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
            <div className="sidebar-header">
              <span className="sidebar-logo"><GraduationCap size={24} /></span>
              <div>
                <div className="sidebar-title">IELTS Writing</div>
                <div className="sidebar-subtitle">Mastery Platform</div>
              </div>
            </div>

            <nav className="sidebar-nav">
              <div style={{ padding: "0.5rem 1rem 0.25rem" }}>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="nav-item-icon"><LayoutDashboard size={18} /></span>
                  Dashboard
                </NavLink>
              </div>

              {NAV_SECTIONS.map((section) => (
                <div key={section.label} className="nav-section">
                  <span className="nav-section-label">{section.label}</span>
                  {section.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `nav-item ${isActive ? "active" : ""}${item.highlight ? " nav-item-highlight" : ""}`
                      }
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="nav-item-icon">{item.icon}</span>
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              ))}
            </nav>

            <div className="sidebar-footer">
              <div className="sidebar-user">
                {user?.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt={user.firstName}
                    className="sidebar-user-avatar"
                    style={{ borderRadius: "50%", width: "2rem", height: "2rem", objectFit: "cover" }}
                  />
                ) : (
                  <div className="sidebar-user-avatar">{user?.firstName?.[0]?.toUpperCase() ?? "U"}</div>
                )}
                <div className="sidebar-user-info">
                  <div className="sidebar-user-name">{user?.firstName ?? "Student"}</div>
                  <div className="sidebar-user-role">Student</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                >
                  {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
                </button>
                <button className="btn btn-ghost btn-sm sidebar-logout-btn" onClick={handleLogout}>
                  Sign out
                </button>
              </div>
            </div>
          </aside>
        )}

        <div className="main-content">
          {showBreakReminder && (
            <div className="break-reminder-banner">
              <span>Time for a quick break — you've been studying for 45 minutes.</span>
              <button className="btn btn-ghost btn-sm" onClick={dismissBreak}>Dismiss</button>
            </div>
          )}
          <div className="page-content">
            <Outlet />
          </div>
        </div>

        {focusMode && (
          <button className="focus-exit-btn" onClick={exitFocus} title="Exit focus mode" aria-label="Exit focus mode">
            <X size={16} /> <span className="focus-exit-hint">Press Esc to exit</span>
          </button>
        )}
      </div>
    </FocusModeContext.Provider>
  );
}
