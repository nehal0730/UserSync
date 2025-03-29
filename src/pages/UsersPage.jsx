import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import UsersList from "../components/UsersList"
import toast from "react-hot-toast"

const UsersPage = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")

  const handleLogout = () => {
    localStorage.removeItem('deletedUserIds');
  localStorage.removeItem('editedUsers');
    logout()
    toast.success("Logged out successfully")
    navigate("/login")
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="mx-auto w-full">
        <div className="mb-4 flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">User Dashboard</h1>
          
          {/* Search Bar - positioned between title and logout button */}
          <div className="relative mx-4 flex-grow max-w-md mb-4 sm:mb-0">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-gray-400" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
            />
          </div>
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-teal-500 text-teal-600 rounded-lg hover:bg-teal-50 hover:cursor-pointer transition-colors"
          >
            Logout
          </button>
        </div>

        <UsersList searchTerm={searchTerm} />

      </div>
    </div>
  )
}

export default UsersPage