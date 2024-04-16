import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const NewPost = () => {
  const [newThread, setNewThread] = useState('');
  const [isLoading,setisLoading]=useState(false);
  const router = useRouter();

  const handleChange = (e:React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewThread(e.target.value);
  };

  const handleSubmit = async () => { 
    setisLoading(true)
    try {
      const response = await fetch('/api/graphql', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation CreateThread($content: String!) {
              createThread(content: $content) {
                id
              }
            }
          `,
          variables: { content: newThread }
        })
      });

      const responseData = await response.json();

      // Check if response has the thread ID
      if (responseData.data && responseData.data.createThread && responseData.data.createThread.id) {
        const threadId = responseData.data.createThread.id;
        // Redirect to the thread page with the obtained thread ID
        if(threadId){router.push(`/homepage`);}
        
      }

      // Clear the textarea after successful submission
      
      setNewThread('');
    } catch (error) {
      // Handle errors here
      console.error('Error submitting new post:', error);
    }
  };

  const handleKeyPress = (e:React.KeyboardEvent<HTMLTextAreaElement>) => {
    
    if (e.key === 'Enter' && newThread.trim() !== '') {
      handleSubmit();
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-4 ml-64 ">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Create New Post</h1>
          <textarea
            className="w-full h-40 px-4 py-2 border rounded-lg resize-none focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Write your post here..."
            value={newThread}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
          ></textarea>
          <div className="flex justify-end mt-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300"
            onClick={handleSubmit}
             disabled={isLoading}>
       {isLoading ? (
    <FontAwesomeIcon icon={faSpinner} spin className="text-white-500 text-xl" />
  ) : (
    "Submit"
  )}
</button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPost;