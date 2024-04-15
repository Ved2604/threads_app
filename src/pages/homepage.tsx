import React, { useEffect, useState } from 'react';
import ThreadComponent from '@/components/thread_component'; 
import Sidebar from '@/components/sidebar'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

interface ThreadDatatype {
  id: string;
  content: string;
  owner: {
    id: string;
    username: string;
    avatar: string;
  };
  liked_by: {
    id: string;
    username: string;
    avatar: string;
  }[];
  comments: {
    id: string;
    content: string;
    postedby: {
      id: string;
      username: string;
      avatar: string;
    };
  }[];
}

interface ApiResponse {
  data: {
    threads?: ThreadDatatype[] | null;
  };
  errors?: {
    message: string;
  }[];
}

const Homepage = () =>{
  const [responseData, setResponsedata] = useState<ApiResponse | null>(null);
  const [threads, setThreads] = useState<ThreadDatatype[] | null>(null);
  const [jsonerrors, setJsonerrors] = useState<ApiResponse['errors'] | null>(null);

  useEffect(() => {
    const fetchThreadsData = async () => {
      try {
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `query {
              threads {
                id
                content
                owner {
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
            }`,
          }),
        });

        if (response.ok) {
          const responseData: ApiResponse = await response.json();
          setResponsedata(responseData);
          if (responseData?.data?.threads) {
            setThreads(responseData.data.threads);
          } else if (responseData?.errors) {
            setJsonerrors(responseData.errors);
          }
        } else {
          throw new Error('Network response was not ok');
        }
      } catch (error) {
        console.error('Error fetching threads:', error);
        setJsonerrors([{ message: 'Error fetching threads' }]);
      }
    };

    fetchThreadsData();
  }, []);
  if(threads){
    return(<>
     <Sidebar/> 
     <div className="ml-64 p-4 bg-white rounded-lg flex-1 h-100 mr-20 shadow h-screen"> 
      {threads.map(thread=>{
        return <ThreadComponent 
            key={thread.id}
            id={thread.id}
            content={thread.content}
            owner={thread.owner}
            liked_by={thread.liked_by}
            setThreads={setThreads}
        />
      })}
      </div>
    </>)
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
  <div className="flex h-screen"> 
  <Sidebar />
  <div className="flex-1 flex items-center justify-center bg-white rounded-lg shadow h-screen">
    <FontAwesomeIcon icon={faSpinner} spin className="text-blue-500 text-xl" /> {/* Display loading spinner */}
  </div>
</div>

);
};

export default Homepage;