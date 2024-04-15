import React, { useEffect, useState } from 'react'; 
import Image from 'next/image';
import { useMutation } from 'react-query'; 
import { useRouter } from 'next/router';

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
interface CommentComponentProps {
    id: string;
    content: string;
    postedby: {
        id: string;
        username: string;
        avatar: string;
    };
    setThreadData?:React.Dispatch<React.SetStateAction<ThreadDatatype | null>>
}

const CommentComponent: React.FC<CommentComponentProps> = ({ id, content, postedby,setThreadData }) => {
    const [loggedInUser, setLoggedInUser] = useState<{ id: string; username: string } | null>(null);
    const [isOwnComment, setIsOwnComment] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editedContent, setEditedContent] = useState<string>(content); 
    const [Commentcontent,setCommentcontent]=useState(content)

    const router = useRouter();
    
    useEffect(() => {
        const loggedInUserId = localStorage.getItem('userId');
        const loggedInUsername = localStorage.getItem('username');

        if (loggedInUserId && loggedInUsername) {
            setLoggedInUser({ id: loggedInUserId, username: loggedInUsername });
        }
    }, []); 

    useEffect(() => {
        if (loggedInUser) {
            setIsOwnComment(loggedInUser.id === postedby.id);
        }
    }, [loggedInUser]);

    const deleteCommentMutation = useMutation(async () => {
        return fetch('/api/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: 'mutation DeleteComment($commentId: String!) { deleteComment(commentId: $commentId) }',
                variables: { commentId: id },
            }),
        }).then((res) => res.json());
    });

    const updateCommentMutation = useMutation(async () => {
        return fetch('/api/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: 'mutation UpdateComment($content: String!, $commentId: String!) { updateComment(content: $content, commentId: $commentId) }',
                variables: { content: editedContent, commentId: id },
            }),
        }).then((res) => res.json());
    });

    const handleEditClick = () => {
        setEditedContent(content);
        setIsEditing(true);
    };

    const handleDeleteComment = async () => {
        try {
            await deleteCommentMutation.mutateAsync(); 
            // Handle deletion success, like removing the comment from UI
            if(setThreadData){
            setThreadData(prevThreadData => {
                if (!prevThreadData) return null;
    
                const updatedComments = prevThreadData.comments.filter(comment => comment.id !== id);
    
                return {
                    ...prevThreadData,
                    comments: updatedComments
                };
            })};
            
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const handleUpdateComment = async () => {
        try {
            await updateCommentMutation.mutateAsync();
            setIsEditing(false); 
            setCommentcontent(editedContent)
           
        } catch (error) {
            console.error('Error updating comment:', error);
        }
    };

    return (
        <div className="flex items-center mb-4">
            <div className="relative rounded-full overflow-hidden h-12 w-12 bg-gray-200">
                <Image src={postedby.avatar} alt='User Avatar' width={48} height={48} className="" />
            </div>
            <div className="ml-3 flex-1">
                <h3 className="text-sm font-semibold">@{postedby.username}</h3>
                {isEditing ? (
                    <div className="mt-1">
                        <input type="text" value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1 w-full" />
                        <button onClick={handleUpdateComment} className="mt-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg" disabled={!editedContent.trim()}>Save</button>
                    </div>
                ) : (
                    <>
                        <p className="mt-1">{Commentcontent}</p>
                        {isOwnComment && (
                            <div className="mt-1">
                                <button onClick={handleDeleteComment} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg mr-2">Delete</button>
                                <button onClick={handleEditClick} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded-lg">Edit</button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CommentComponent;
