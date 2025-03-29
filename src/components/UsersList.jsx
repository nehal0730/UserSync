import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import EditUserDialog from "./EditUserDialog"

const UsersList = () => {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editingUser, setEditingUser] = useState(null)
  const [showDialog, setShowDialog] = useState(false)

  const fetchUsers = async (page) => {
    setIsLoading(true)
    try {
      const response = await fetch(`https://reqres.in/api/users?page=${page}`)
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }
      const data = await response.json()
      setUsers(data.data)
      setTotalPages(data.total_pages)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch users")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(currentPage)
  }, [currentPage])

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setShowDialog(true)
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`https://reqres.in/api/users/${id}`, {
        method: "DELETE",
      })

      if (!response.ok && response.status !== 204) {
        throw new Error("Failed to delete user")
      }

      // Remove user from the list (client-side)
      setUsers(users.filter((user) => user.id !== id))

      toast.success("User deleted successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete user")
    }
  }

  const handleUpdateUser = (updatedUser) => {
    setUsers(users.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
    setShowDialog(false)
    setEditingUser(null)
  }

  const handleCloseDialog = () => {
    setShowDialog(false)
    setEditingUser(null)
  }

  if (isLoading && users.length === 0) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            
            <div className="flex justify-center pt-6 pb-3 bg-gradient-to-br from-sky-100 to-blue-200">
              <div className="relative h-28 w-28 rounded-full overflow-hidden border-4 border-white shadow-md">
                <img
                  src={user.avatar || "https://via.placeholder.com/150"}
                  alt={`${user.first_name} ${user.last_name}`}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            
            
            <div className="p-2 text-center">
              <h3 className="font-bold text-xl text-gray-800">{`${user.first_name} ${user.last_name}`}</h3>
              <p className="text-teal-600 mt-1">{user.email}</p>
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-sm text-gray-500">User ID: {user.id}</p>
              </div>
            </div>
            
            
            <div className="flex border-t border-gray-100">
              <button
                className="flex-1 py-3 px-4 flex items-center justify-center text-teal-600 hover:bg-teal-50 hover:text-teal-700 hover:cursor-pointer transition-colors"
                onClick={() => handleEdit(user)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit
              </button>
              <div className="border-r border-gray-100"></div>
              <button
                className="flex-1 py-3 px-4 flex items-center justify-center text-rose-500 hover:text-rose-600 hover:bg-rose-50 hover:cursor-pointer transition-colors"
                onClick={() => handleDelete(user.id)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-md">
        <p className="text-sm text-gray-500 mb-4 sm:mb-0">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex space-x-2">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg border flex items-center hover:cursor-pointer ${
              currentPage === 1
                ? "border-gray-200 text-gray-400 cursor-not-allowed"
                : "border-teal-500 text-teal-600 hover:bg-teal-50 transition-colors"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg border flex items-center hover:cursor-pointer ${
              currentPage === totalPages
                ? "border-gray-200 text-gray-400 cursor-not-allowed"
                : "border-teal-500 text-teal-600 hover:bg-teal-50 transition-colors"
            }`}
          >
            Next
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {showDialog && editingUser && (
        <EditUserDialog user={editingUser} onClose={handleCloseDialog} onUpdate={handleUpdateUser} />
      )}
    </div>
  )
}

export default UsersList