import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useMutation } from 'react-query';
import { useRouter } from 'next/router';

interface UserComponentProps {
  id: string;
  username: string;
  avatar: string;
  followers: string[];
  following: string[];
}

const UserComponent: React.FC<UserComponentProps> = ({ id, username, avatar, followers, following }) => {
  const [loggedInUser, setLoggedInUser] = useState<{ id: string; username: string } | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>();
  const [isOwnProfile, setIsOwnProfile] = useState<boolean | null>(null);
  const [followerCount, setFollowerCount] = useState(followers.length);
  const router = useRouter();

  useEffect(() => {
    // Retrieve logged-in user's data from local storage
    const loggedInUserId = localStorage.getItem('userId');
    const loggedInUsername = localStorage.getItem('username');

    if (loggedInUserId && loggedInUsername) {
      setLoggedInUser({ id: loggedInUserId, username: loggedInUsername });
    }
  }, []);

  useEffect(() => {
    if (loggedInUser) {
      if (loggedInUser.id === id) {
        setIsOwnProfile(true);
      } else {
        setIsOwnProfile(false);
        setIsFollowing(followers.includes(loggedInUser.id));
      }
    }
  }, [loggedInUser]);

  const followMutation = useMutation(async () => {
    return fetch('/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'mutation Follow($user_followed: String!) { followUser(user_followed: $user_followed) }',
        variables: { user_followed: username },
      }),
    }).then((res) => res.json());
  });

  const unfollowMutation = useMutation(async () => {
    return fetch('/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'mutation Unfollow($user_unfollowed: String!) { unfollowUser(user_unfollowed: $user_unfollowed) }',
        variables: { user_unfollowed: username },
      }),
    }).then((res) => res.json());
  });

  const toggleFollow = async () => {
    if (isFollowing) {
      try {
        await unfollowMutation.mutateAsync();
        setIsFollowing(false);
        setFollowerCount(followerCount - 1);
      } catch (error) {
        console.error('Error unfollowing user:', error);
      }
    } else {
      try {
        await followMutation.mutateAsync();
        setIsFollowing(true);
        setFollowerCount(followerCount + 1);
      } catch (error) {
        console.error('Error following user:', error);
      }
    }
  };

  const handleEditProfile = () => {
    router.push('/changepassword');
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center mb-4">
      <div className="relative rounded-full overflow-hidden h-20 w-20 bg-gray-200">
          <Image src={avatar} alt="User avatar" layout="fill" objectFit="cover" />
        </div>
        <div className="ml-4">
          <h2 className="text-xl font-bold">@{username}</h2>
          <h2 className="text-gray-600">Followers: {followerCount}</h2>
          <h2 className="text-gray-600">Following: {following.length}</h2>
        </div>
      </div>
      {!isOwnProfile && (
        <>
          {isFollowing ? (
            <button className="bg-gray-200 text-gray-700 py-2 px-4 rounded-full" onClick={toggleFollow}>
              Unfollow
            </button>
          ) : (
            <button className="bg-blue-500 text-white py-2 px-4 rounded-full" onClick={toggleFollow}>
              Follow
            </button>
          )}
        </>
      )}
      {isOwnProfile && (
        <button className="bg-blue-500 text-white py-2 px-4 rounded-full" onClick={handleEditProfile}>
          Change Password
        </button>
      )}
    </div>
  );
};
export default UserComponent;