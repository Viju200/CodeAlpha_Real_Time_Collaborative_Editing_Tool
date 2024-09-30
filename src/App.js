import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:3001'); // Connect to backend server

function App() {
    const [docId, setDocId] = useState('');
    const [document, setDocument] = useState({ title: '', content: '' });
    const [users, setUsers] = useState([]);

    // Load the document
    const loadDocument = async (id) => {
        const res = await axios.get(`http://localhost:3001/document/${id}`);
        setDocument(res.data);
    };

    // Save the document
    const saveDocument = async () => {
        await axios.post('http://localhost:3001/document', document);
        alert('Document saved!');
    };

    // Handle content change
    const handleContentChange = (e) => {
        const updatedContent = e.target.value;
        setDocument((prev) => ({ ...prev, content: updatedContent }));

        // Emit the edit event to other users
        socket.emit('edit', { content: updatedContent });
    };

    // Listen for updates from other users
    useEffect(() => {
        socket.on('update', (data) => {
            setDocument((prev) => ({ ...prev, content: data.content }));
        });

        return () => {
            socket.off('update');
        };
    }, []);

    return (
        <div>
            <h1>Collaborative Editor</h1>
            <input
                type="text"
                value={document.title}
                onChange={(e) => setDocument({ ...document, title: e.target.value })}
                placeholder="Document Title"
            />
            <textarea
                value={document.content}
                onChange={handleContentChange}
                placeholder="Start editing..."
                rows="10"
                cols="30"
            />
            <button onClick={saveDocument}>Save Document</button>
        </div>
    );
}

export default App;
