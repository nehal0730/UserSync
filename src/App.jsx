import { Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import LoginPage from "./pages/LoginPage"
import UsersPage from "./pages/UsersPage"
import ProtectedRoute from "./components/ProtectedRoute"
import { AuthProvider } from "./context/AuthContext"

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </AuthProvider>
  )
}

export default App