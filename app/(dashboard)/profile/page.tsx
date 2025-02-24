'use client'

import { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function Profile() {
  const [files, setFiles] = useState<File[]>([])
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    phone: '',
    institution: '',
    fieldOfStudy: '',
    gpa: '',
  })

  useEffect(() => {
    const fetchUserData = async () => {
      const response = await fetch('/api/user'); // Adjust the endpoint as needed
      const data = await response.json();
      console.log(` user data called`, data);
      setUserData(data);
    };

    fetchUserData();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files)
      setFiles(prevFiles => [...prevFiles, ...newFiles])
    }
  }

  const handleRemoveFile = (fileName: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.name !== fileName))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/user', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      toast.success('Profile updated successfully!');
    } else {
      const errorData = await response.json();
      toast.error(`Error: ${errorData.message || 'Failed to update profile.'}`);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <ToastContainer />
      <form onSubmit={handleSubmit}>
        <div className="flex items-center mb-6">
          <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-4xl text-gray-500">📷</span>
          </div>
          <div className="ml-6">
            <h1 className="text-2xl font-semibold">John Doe</h1>
            <p className="text-gray-600">Student ID: ST2024001</p>
            <p className="text-green-500">Verified</p>
            <div className="mt-2">
              <div className="h-2 bg-gray-200 rounded">
                <div className="h-full bg-blue-500" style={{ width: '75%' }}></div>
              </div>
              <p className="text-sm text-gray-500">75% Complete</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Full Name</label>
                <input
                  type="text"
                  className="border rounded w-full p-3"
                  value={userData.fullName}
                  onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1">Email</label>
                <input
                  type="email"
                  className="border rounded w-full p-3"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1">Phone</label>
                <input
                  type="tel"
                  className="border rounded w-full p-3"
                  value={userData.phone}
                  onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Academic Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Current Institution</label>
                <input
                  type="text"
                  className="border rounded w-full p-3"
                  value={userData.institution}
                  onChange={(e) => setUserData({ ...userData, institution: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1">Field of Study</label>
                <input
                  type="text"
                  className="border rounded w-full p-3"
                  value={userData.fieldOfStudy}
                  onChange={(e) => setUserData({ ...userData, fieldOfStudy: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1">Current GPA</label>
                <input
                  type="text"
                  className="border rounded w-full p-3"
                  value={userData.gpa}
                  onChange={(e) => setUserData({ ...userData, gpa: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Documents</h2>
          <div className="border-dashed border-2 border-gray-300 rounded-lg p-4 flex flex-col items-center">
            <div className="mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-gray-500 text-center mb-4">Drag and drop files here or click to upload</p>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="border rounded w-full p-3 cursor-pointer"
            />
          </div>
          <ul className="mt-4">
            {files.map(file => (
              <li key={file.name} className="flex justify-between items-center">
                <span>{file.name}</span>
                <button onClick={() => handleRemoveFile(file.name)} className="text-red-500">Remove</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end space-x-4">
          <button type="button" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
} 