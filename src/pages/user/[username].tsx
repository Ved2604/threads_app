import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import UserComponent from '@/components/usercomponent'; 
import ThreadComponent from '@/components/thread_component'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '@/components/sidebar';

interface UserDatatype {
  id: string;
  username: string;
  avatar: string;
  followers: string[];
  following: string[]; 
  threads: {
    id:string,
    content:string,
    owner: {
      id: string;
      username: string;
      avatar: string;
  };
  liked_by: {
    id:string,
    username:string,
    avatar:string
}[];
  }[]
}

interface ApiResponse {
  data: {
    user?: UserDatatype | null;
  };
  errors?: {
    message: string;
  }[];
}

const UserProfile = () => {
  const router = useRouter();
  const { username } = router.query;
  const [Responsedata, setResponsedata] = useState<ApiResponse | null>(null);
  const [user, setUser] = useState<UserDatatype | null>(null);
  const [jsonerrors, setJsonerrors] = useState<ApiResponse["errors"] | null>(null);
  
  useEffect(() => {
    const fetchData = async () => { 
      if(!username) return
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetUserData($username: String!) {
              user(username: $username) {
                id
                username
                avatar
                followers
                following
                threads{
                  id
                  content
                  owner{
                    id
                    username
                    avatar                    
                  }
                  liked_by{
                    id
                    username
                    avatar
                  }

                }
              }
            }`,
          variables: { username }
        })
      });

      if (response.ok) {
        const responseData: ApiResponse = await response.json();
        setResponsedata(responseData);
        if (responseData?.data?.user) {
          setUser(responseData.data.user);
        } else if (responseData.errors) {
          setJsonerrors(responseData.errors);
        }
      }
    };
    fetchData();
  }, [username]);

  if (Responsedata && user) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <div className="ml-64 p-4 bg-white rounded-lg flex-1 h-100 mr-20 shadow">
            <div className="">
              <UserComponent
                id={user.id}
                username={user.username}
                avatar={user.avatar}
                followers={user.followers}
                following={user.following}
              />
            </div>
            <div className="mt-8">
              <h3 className="text-lg font-bold">User Threads</h3>
              {user.threads.map((thread) => (
                <ThreadComponent
                  key={thread.id}
                  id={thread.id}
                  content={thread.content}
                  owner={thread.owner}
                  liked_by={thread.liked_by}
                  setUser={setUser}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (jsonerrors) { 
        return (<div> 
          <Sidebar/>
          <div className="ml-64 p-4 bg-white rounded-lg flex-1 h-100 mr-20 shadow">
          <h3>{jsonerrors[0]?.message}</h3>
          </div>
          </div>);
  }

  
    return (
      <div> 
        <Sidebar />
        <div className="flex-1 flex items-center justify-center bg-white rounded-lg shadow h-screen">
          <FontAwesomeIcon icon={faSpinner} spin className="text-blue-500 text-xl" /> 
        </div>
      </div>
    );
  
}

export default UserProfile;