import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import EditUserDialog from "./EditUserDialog"

const UsersList = ({ searchTerm = "" }) => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editingUser, setEditingUser] = useState(null)
  const [showDialog, setShowDialog] = useState(false)
  const [allUsers, setAllUsers] = useState([]) 
  const [isSearching, setIsSearching] = useState(false) 
  const [deletedUserIds, setDeletedUserIds] = useState([]) 
  const [editedUsers, setEditedUsers] = useState({}) 
  const [usersPerPage, setUsersPerPage] = useState(6) 

  useEffect(() => {
    const storedDeletedUsers = localStorage.getItem('deletedUserIds')
    const storedEditedUsers = localStorage.getItem('editedUsers')
    
    if (storedDeletedUsers) {
      setDeletedUserIds(JSON.parse(storedDeletedUsers))
    }
    
    if (storedEditedUsers) {
      setEditedUsers(JSON.parse(storedEditedUsers))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('deletedUserIds', JSON.stringify(deletedUserIds))
  }, [deletedUserIds])
  
  useEffect(() => {
    localStorage.setItem('editedUsers', JSON.stringify(editedUsers))
  }, [editedUsers])

  const filterOutDeletedUsers = (userList) => {
    return userList.filter(user => !deletedUserIds.includes(user.id));
  };

  const applyStoredEdits = (userList) => {
    return userList.map(user => {

      return editedUsers[user.id] ? { ...user, ...editedUsers[user.id] } : user;
    });
  };

  const fetchAllPaginatedUsers = async () => {
    setIsLoading(true)
    try {
      let allUsersData = []
      let currentPageData = []
      let page = 1
      let totalPages = 1
      
      do {
        const response = await fetch(`https://reqres.in/api/users?page=${page}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch users from page ${page}`)
        }
        
        const data = await response.json()
        totalPages = data.total_pages
        
        allUsersData = [...allUsersData, ...data.data]
        
        const availableUsers = filterOutDeletedUsers(allUsersData);
        
        const startIndex = (currentPage - 1) * usersPerPage
        currentPageData = availableUsers.slice(startIndex, startIndex + usersPerPage)
        
        page++
      } while (currentPageData.length < usersPerPage && page <= totalPages)
      
      const processedAllUsers = applyStoredEdits(allUsersData)
      
      setTotalPages(totalPages)

      const availableProcessedUsers = filterOutDeletedUsers(processedAllUsers)
      const startIndex = (currentPage - 1) * usersPerPage
      const visibleUsers = availableProcessedUsers.slice(startIndex, startIndex + usersPerPage)
      
      setUsers(visibleUsers)
      setFilteredUsers(searchTerm.trim() === "" ? visibleUsers : filterUsersBySearchTerm(visibleUsers, searchTerm))
      
      setAllUsers(processedAllUsers)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch users")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUsers = async (page) => {
    if (searchTerm.trim() === "") {
      fetchAllPaginatedUsers()
      return
    }
    
    setIsLoading(true)
    try {
      const response = await fetch(`https://reqres.in/api/users?page=${page}`)
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }
      const data = await response.json()
      
      const filteredData = filterOutDeletedUsers(data.data);
      
      const updatedData = applyStoredEdits(filteredData);
      
      setUsers(updatedData)
      setFilteredUsers(searchTerm.trim() === "" ? updatedData : filterUsersBySearchTerm(updatedData, searchTerm))
      setTotalPages(data.total_pages)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch users")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAllUsers = async () => {
    setIsSearching(true)
    setIsLoading(true)
    try {
      let allUsersData = []
      
      const initialResponse = await fetch(`https://reqres.in/api/users?page=1`)
      if (!initialResponse.ok) {
        throw new Error("Failed to fetch users")
      }
      const initialData = await initialResponse.json()
      const pages = initialData.total_pages
      
      allUsersData = [...initialData.data]
      
      const remainingRequests = []
      for (let page = 2; page <= pages; page++) {
        remainingRequests.push(fetch(`https://reqres.in/api/users?page=${page}`).then(res => res.json()))
      }
      
      const results = await Promise.all(remainingRequests)
      results.forEach(result => {
        allUsersData = [...allUsersData, ...result.data]
      })
      
      const filteredAllUsers = filterOutDeletedUsers(allUsersData);
      
      const updatedAllUsers = applyStoredEdits(filteredAllUsers);
      
      setAllUsers(updatedAllUsers)
      
      const searchFiltered = filterUsersBySearchTerm(updatedAllUsers, searchTerm)
      setFilteredUsers(searchFiltered)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to search across all pages")
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsersBySearchTerm = (usersToFilter, term) => {
    if (!term || term.trim() === "") {
      return usersToFilter
    }
    
    return usersToFilter.filter(
      (user) =>
        user.first_name.toLowerCase().includes(term.toLowerCase()) ||
        user.last_name.toLowerCase().includes(term.toLowerCase()) ||
        user.email.toLowerCase().includes(term.toLowerCase())
    )
  }

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setIsSearching(false)
      fetchAllPaginatedUsers()
    } else {
      fetchAllUsers()
    }
  }, [currentPage, searchTerm, deletedUserIds, editedUsers])

  useEffect(() => {
    const calculateUsersPerPage = async () => {
      try {
        const response = await fetch(`https://reqres.in/api/users?page=1`)
        if (response.ok) {
          const data = await response.json()
          if (data.data && data.data.length > 0) {
            setUsersPerPage(data.data.length)
          }
        }
      } catch (error) {
        console.error("Failed to determine users per page:", error)
      }
    }
    
    calculateUsersPerPage()
  }, [])

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

      setDeletedUserIds(prevIds => [...prevIds, id]);
      
      if (editedUsers[id]) {
        const updatedEditedUsers = { ...editedUsers };
        delete updatedEditedUsers[id];
        setEditedUsers(updatedEditedUsers);
      }

      if (searchTerm.trim() === "") {
        fetchAllPaginatedUsers();
      } else {
        fetchAllUsers();
      }

      toast.success("User deleted successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete user")
    }
  }

  const handleUpdateUser = (updatedUser) => {
    setEditedUsers(prev => ({
      ...prev,
      [updatedUser.id]: {
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        email: updatedUser.email
      }
    }));
    
    const updatedUsers = users.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    setUsers(updatedUsers)
    
    if (isSearching) {
      const updatedAllUsers = allUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      setAllUsers(updatedAllUsers)
      
      setFilteredUsers(filterUsersBySearchTerm(updatedAllUsers, searchTerm))
    } else {
      setFilteredUsers(filterUsersBySearchTerm(updatedUsers, searchTerm))
    }
    
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
      {searchTerm.trim() !== "" && (
        <div className="flex items-center text-sm text-gray-500 bg-white p-4 rounded-xl shadow-md">
          <span>
            Found {filteredUsers.length} {filteredUsers.length === 1 ? "result" : "results"} for "{searchTerm}" across all pages
          </span>
        </div>
      )}

      {filteredUsers.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
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
      ) : (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl shadow-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-gray-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p className="text-xl text-gray-600 font-medium">No users found</p>
          <p className="text-gray-500 mt-1">Try adjusting your search criteria</p>
        </div>
      )}

      {searchTerm.trim() === "" && (
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
      )}

      {showDialog && editingUser && (
        <EditUserDialog user={editingUser} onClose={handleCloseDialog} onUpdate={handleUpdateUser} />
      )}
    </div>
  )
}

export default UsersList