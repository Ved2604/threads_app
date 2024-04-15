import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUser, faSignOutAlt, faHome } from '@fortawesome/free-solid-svg-icons';
import { useMutation } from 'react-query';
import { useRouter } from 'next/router';

const Sidebar = () => {
  const router = useRouter();
  const [loggedInUser, setLoggedInUser] = useState<{ id: string; username: string } | null>(null);

  useEffect(() => {
    const loggedInUserId = localStorage.getItem('userId');
    const loggedInUsername = localStorage.getItem('username');

    if (loggedInUserId && loggedInUsername) {
      setLoggedInUser({ id: loggedInUserId, username: loggedInUsername });
    }
  }, []);

  const logoutMutation = useMutation(async () => {
    return fetch('/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `mutation {
                logout
              }`,
      }),
    });
  });

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {}

    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    router.push(`/`);
    setLoggedInUser(null);
  };

  return (
    <div className="w-64 bg-white shadow h-screen fixed top-0 left-0">
      <div className="p-4 border-b">
        <p className="text-2xl font-bold">Threads</p>
      </div>
      <div className="p-4">
        {loggedInUser ? (
          <ul>
            <li className="mb-4">
              <Link href={`/homepage`} className="flex items-center">
                <FontAwesomeIcon icon={faHome} className="mr-4 text-blue-500 hover:text-blue-600 cursor-pointer" />
                <h4 className="text-lg cursor-pointer text-blue-500 hover:underline">Home</h4>
              </Link>
            </li>
            <li className="mb-4">
              <Link href={`/newpost`} className="flex items-center">
                <FontAwesomeIcon icon={faPlus} className="mr-4 text-blue-500 hover:text-blue-600 cursor-pointer" />
                <h4 className="text-lg cursor-pointer text-blue-500 hover:underline">New Post</h4>
              </Link>
            </li>
            <li className="mb-4">
              <Link href={`/user/${loggedInUser.username}`} className="flex items-center">
                <FontAwesomeIcon icon={faUser} className="mr-4 text-blue-500 hover:text-blue-600 cursor-pointer" />
                <h4 className="text-lg cursor-pointer text-blue-500 hover:underline">Profile</h4>
              </Link>
            </li>
            <li className="mb-4 flex items-center">
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-4 text-blue-500 hover:text-blue-600 cursor-pointer" />
              <h4
                className="text-lg cursor-pointer text-blue-500 hover:underline"
                onClick={handleLogout}
              >
                Log Out
              </h4>
            </li>
          </ul>
        ) : (
          <Link href={`/login`}>
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-4 text-blue-500 hover:text-blue-600 cursor-pointer" />
            <h4 className="text-lg cursor-pointer text-blue-500 hover:underline">Login</h4>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
