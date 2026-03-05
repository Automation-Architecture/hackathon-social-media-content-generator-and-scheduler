import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Topics from "./pages/Topics";
import Feed from "./pages/Feed";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-gray-100">
        {/* Nav */}
        <nav className="border-b border-gray-800 px-6 py-4 flex items-center gap-8">
          <h1 className="text-xl font-bold tracking-tight">Scriptora</h1>
          <div className="flex gap-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  isActive ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white"
                }`
              }
            >
              Content Feed
            </NavLink>
            <NavLink
              to="/topics"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  isActive ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white"
                }`
              }
            >
              Topics
            </NavLink>
          </div>
        </nav>

        {/* Pages */}
        <main className="max-w-6xl mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/topics" element={<Topics />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
