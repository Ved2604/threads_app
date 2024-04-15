import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ThreadComponent from '@/components/thread_component';
import CommentComponent from '@/components/comment_component';
import { useMutation } from 'react-query';
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
    thread?: ThreadDatatype | null;
  };
  errors?: {
    message: string;
  }[];
}

const ThreadPage = () => {
  const router = useRouter();
  const { threadid } = router.query;
  const [responseData, setResponsedata] = useState<ApiResponse | null>(null);
  const [threadData, setThreadData] = useState<ThreadDatatype | null>(null);
  const [jsonerrors, setJsonerrors] = useState<ApiResponse['errors'] | null>(null);
  const [newcomment, setNewComment] = useState<string>('');
  const [isLoading,setisLoading]=useState(false)
  useEffect(() => {
    const fetchThreadData = async () => {
      if (!threadid) return;
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `query GetThreadData($threadId:ID!){
            thread(id:$threadId){
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
              comments{
                id
                content
                postedby{
                  id
                  username
                  avatar}
              }
           }}
          `,
          variables: { threadId: String(threadid) }
        })
      });

      if (response.ok) {
        const responseData: ApiResponse = await response.json();
        setResponsedata(responseData);
        if (responseData?.data?.thread) {
          setThreadData(responseData.data.thread);
        } else if (responseData?.errors) {
          setJsonerrors(responseData.errors);
        }
      }
    };
    fetchThreadData();
  }, [threadid]);

  const newcommentmutation = useMutation(async () => {
    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `mutation Newcomment($content:String!,$parentThread:ID!){
                        createComment(content:$content,parentThread:$parentThread) {
                            id
                            content
                            postedby {
                                id
                                username
                                avatar
                            }
                        }
                    }`,
        variables: { content: newcomment, parentThread: threadid }
      })
    });
    

    if (!response.ok) {
      throw new Error('Failed to add comment');
    }

    const responseData: { data: { createComment: ThreadDatatype['comments'][0] } } = await response.json();
    console.log(responseData)
    return responseData.data.createComment;
  });

  const handlenewcomment = async () => { 
    setisLoading(true)
    try {
      const newComment: ThreadDatatype['comments'][0] | null = await newcommentmutation.mutateAsync();

      // Update state to add the new comment
      if (threadData && newComment) {
        setThreadData(prevState => ({
          ...prevState!,
          comments: [newComment, ...(prevState!.comments || [])]
      }));
      
      }
      // Clear the input field
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewComment(event.target.value);
  };

  if (responseData && threadData) {
    return (
      <div className="flex">
       <Sidebar/> 
       <div className="ml-64 p-4 bg-white rounded-lg flex-1 h-100 mr-20 shadow">
        <ThreadComponent
          id={threadData.id}
          content={threadData.content}
          owner={threadData.owner}
          liked_by={threadData.liked_by}
          
        />
        <br /><br /><br />
        <div>
          <h3 className="text-lg font-bold">Comments </h3>
        <form onSubmit={(e) => { e.preventDefault(); handlenewcomment(); }} className="mb-4">
        <input type="text" placeholder='Add new comment' value={newcomment} onChange={handleChange} className="border-gray-400 border rounded-lg p-2 mr-2 w-3/4" />
        <button
  type="submit"
  disabled={!newcomment.trim()}
  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
>
  {isLoading ? (
    <FontAwesomeIcon icon={faSpinner} spin className="text-blue-500 text-xl" />
  ) : (
    "Submit"
  )}
</button>

           </form>
          
          {threadData.comments.map(comment => {
            return <CommentComponent
              key={comment.id}
              id={comment.id}
              content={comment.content}
              postedby={comment.postedby}
              setThreadData={setThreadData}
               />
          })}
          </div>
        </div>
      </div>
    )
  }
  if (jsonerrors) { 
    return (<div className="flex">
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
      <FontAwesomeIcon icon={faSpinner} spin className="text-blue-500 text-xl"/> 
    </div>
  </div>
);
}
export default ThreadPage;