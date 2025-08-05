import React, { useState, useEffect } from 'react';
import { db } from '@/lib/github-sdk';

interface PostProps {
  post: any;
}

const Post: React.FC<PostProps> = ({ post }) => {
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await db.getItem('users', post.userId);
      setUser(userData);
    };

    fetchUser();
  }, [post.userId]);

  return (
    <div className="border-b p-4">
      <div className="flex items-center mb-2">
        <div className="font-bold">{user?.name || '...'}</div>
        <div className="text-xs text-muted-foreground ml-2">
          {new Date(post.createdAt).toLocaleString()}
        </div>
      </div>
      <p>{post.content}</p>
    </div>
  );
};

export default Post;