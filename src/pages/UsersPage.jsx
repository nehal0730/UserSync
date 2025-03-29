import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import UsersList from "../components/UsersList"
import toast from "react-hot-toast"

const UsersPage = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    toast.success("Logged out successfully")
    navigate("/login")
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      {/* <div className="w-full mx-auto flex flex-col flex-grow"> */}
      <div className="mx-auto w-full">
        <div className="mb-4 flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">User Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-teal-500 text-teal-600 rounded-lg hover:bg-teal-50 hover:cursor-pointer transition-colors"
          >
            Logout
          </button>
        </div>

        <UsersList />

      </div>
    </div>
  )
}

export default UsersPage