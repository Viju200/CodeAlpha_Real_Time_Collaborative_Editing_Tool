const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/collab-editor', { useNewUrlParser: true, useUnifiedTopology: true });

// Document Schema
const DocumentSchema = new mongoose.Schema({
    title: String,
    content: String,
    version: Number,
});

const Document = mongoose.model('Document', DocumentSchema);

// API to get document
app.get('/document/:id', async (req, res) => {
    const document = await Document.findById(req.params.id);
    res.json(document);
});

// API to save document
app.post('/document', async (req, res) => {
    const { title, content } = req.body;
    const document = new Document({ title, content, version: 1 });
    await document.save();
    res.json(document);
});

// Real-time communication
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('edit', (data) => {
        socket.broadcast.emit('update', data); // Broadcast changes to other users
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
