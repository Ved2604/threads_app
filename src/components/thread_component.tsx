import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useMutation } from 'react-query';
import { useRouter } from 'next/router'; 
import Link from 'next/link';

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
interface ThreadComponentProps {
    id: string;
    content: string;
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
    setThreads?:React.Dispatch<React.SetStateAction<ThreadDatatype[] | null>>
    setUser?: React.Dispatch<React.SetStateAction<UserDatatype | null>>
}

const ThreadComponent: React.FC<ThreadComponentProps> = ({ id, content, owner, liked_by,setThreads,setUser }) => {
    const [loggedInUser, setLoggedInUser] = useState<{ id: string; username: string } | null>(null);
    const [isLiked, setIsLiked] = useState<boolean | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editedContent, setEditedContent] = useState<string>(content);
    const [isOwnThread, setIsOwnThread] = useState<boolean>(false);
    const [likecount,setlikecount]=useState(liked_by.length) 
    const [threadcontent,setThreadcontent]=useState(content)
    const router=useRouter();
    useEffect(() => {
        const loggedInUserId = localStorage.getItem('userId');
        const loggedInUsername = localStorage.getItem('username');

        if (loggedInUserId && loggedInUsername) {
            setLoggedInUser({ id: loggedInUserId, username: loggedInUsername });
        }
    }, []);

    useEffect(() => {
        if (loggedInUser) {
            setIsOwnThread(loggedInUser.id === owner.id);
            setIsLiked(liked_by.some(item => item.id === loggedInUser.id));
        }
    }, [loggedInUser]);

  const likeMutation = useMutation(async () => {
    return fetch('/api/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: 'mutation LikeThread($thread_id: String!) { likeThread(threadId: $thread_id) }',
                variables: { thread_id: id },
            }),
        }).then((res) => res.json());
    });

 const unlikeMutation = useMutation(async () => {
    return fetch('/api/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: 'mutation DislikeThread($thread_id: String!) { dislikeThread(threadId: $thread_id) }',
                variables: { thread_id: id },
            }),
        }).then((res) => res.json());
    });

 const editThreadMutation = useMutation(async () => {
    return fetch('/api/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: 'mutation EditThread($thread_id: String!, $content: String!) { changeThread(threadId: $thread_id, content: $content) }',
                variables: { thread_id: id, content: editedContent },
            }),
        }).then((res) => res.json());
    });
  const deleteThreadMutation = useMutation(async () => {
        return fetch('/api/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: 'mutation DeleteThread($thread_id: String!) { deleteThread(threadId: $thread_id) }',
                variables: { thread_id: id },
            }),
        }).then((res) => res.json());
    });



    
    const toggleLike = async () => {
        if (isLiked) {
            try {
                let respone=await unlikeMutation.mutateAsync();
                console.log(respone)
                setIsLiked(false); 
                setlikecount(likecount-1)
            } catch (error) {
                console.error('Error unliking thread:', error);
            }
        } else {
            try {
                await likeMutation.mutateAsync();
                setIsLiked(true);
                setlikecount(likecount+1)
            } catch (error) {
                console.error('Error liking thread:', error);
            }
        }
    };

    const toggleEdit = () => {
        setIsEditing(!isEditing);
    };

    const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditedContent(event.target.value);
    };

    const handleSubmitEdit = async () => {
        try {
            let respone=await editThreadMutation.mutateAsync();
            setIsEditing(false);
            setThreadcontent(editedContent)
            
        } catch (error) {
            console.error('Error editing thread:', error);
        }
    };

    const handleDeleteThread = async () => {
        try {
            let respone=await deleteThreadMutation.mutateAsync();
            const { pathname } = router;
            if(pathname==="/thread/[threadid]"){
                router.push('/homepage')
            }
            if(pathname==="/user/[username]"){
                if (setUser) {
                    setUser(prevUser => {
                        if (!prevUser) return null;
                        // Filter out the deleted thread by its ID
                        const updatedThreads = prevUser.threads.filter(thread => thread.id !== id);
                        return {
                            ...prevUser,
                            threads: updatedThreads
                        };
                    });
                } 
            }
            if(pathname==="/homepage"){
                if (setThreads) {
                    setThreads(prevThreads => {
                        // Filter out the deleted thread by its ID
                        return prevThreads ? prevThreads.filter(thread => thread.id !== id) : null;
                    });
                } 
            }
        } catch (error) {
            console.error('Error deleting thread:', error);
        }
    };

    return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center mb-4">
        <Link href={`/user/${owner.username}`}>
          <div className="relative rounded-full overflow-hidden h-20 w-20 bg-gray-200">
            <Image src={owner.avatar} alt="User avatar" layout="fill" objectFit="cover" />
          </div>
        </Link>
        <div className="ml-4">
          <Link href={`/user/${owner.username}`}>
            <h2 className="text-xl font-bold">@{owner.username}</h2>
          </Link>
        </div>
      </div>
      {isEditing ? (
        <>
          <textarea
            value={editedContent}
            onChange={handleContentChange}
            className="w-full border border-gray-300 rounded-md p-2 mb-2"
            style={{ resize: 'none' }}
          />
          <div className="flex justify-end">
            <button
              onClick={handleSubmitEdit}
              className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2"
              disabled={!editedContent.trim()}
            >
              Submit
            </button>
            <button onClick={toggleEdit} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md">
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <p onClick={() => router.push(`/thread/${id}`)} className="text-gray-800 cursor-pointer">
            {threadcontent}
          </p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-gray-600">Likes: {likecount}</p>
            <div className="flex space-x-2">
              <button
                onClick={toggleLike}
                className={`px-4 py-2 rounded-md ${
                  isLiked ? 'bg-gray-300 text-gray-700' : '  bg-blue-500 text-white'
                }`}
              >
                {isLiked ? 'Unlike' : 'Like'}
              </button>
              {isOwnThread && (
                <>
                  <button
                    onClick={toggleEdit}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteThread}
                    className="bg-red-500 text-white px-4 py-2 rounded-md"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ThreadComponent;
