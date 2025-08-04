// src/components/CommunityBoard.js
import React, { useState, useEffect } from 'react';

function CommunityBoard({ user }) {
    const [posts, setPosts] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/broadcasts');
                const data = await response.json();
                setPosts(data);
            } catch (error) {
                console.error("Failed to fetch posts", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const handlePost = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const response = await fetch('/api/broadcasts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id, message: newMessage })
            });
            const newPost = await response.json();
            if (response.ok) {
                setPosts([newPost, ...posts]);
                setNewMessage('');
            }
        } catch (error) {
            console.error("Failed to post message", error);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Community Board</h2>
            <form onSubmit={handlePost} className="mb-6">
                <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Share an update with the community..."
                    rows="3"
                ></textarea>
                <button type="submit" className="w-full mt-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold">Post Update</button>
            </form>
            <div className="space-y-4">
                {isLoading ? <p>Loading posts...</p> : posts.map(post => (
                    <div key={post.id} className="p-4 bg-gray-50 rounded-lg border">
                        <p className="font-semibold text-gray-800">{post.author_name}</p>
                        <p className="text-gray-700 my-1">{post.message}</p>
                        <p className="text-xs text-gray-500">{new Date(post.timestamp).toLocaleString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CommunityBoard;
