const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(__dirname));

// Ensure data.json exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Read API
app.get('/api/data', (req, res) => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error("Read Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Write API
app.post('/api/data', (req, res) => {
    try {
        const rows = req.body;
        fs.writeFileSync(DATA_FILE, JSON.stringify(rows, null, 2));
        res.json({ success: true });
    } catch (error) {
        console.error("Write Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`\n=== EASTSAT 웹 서버 시작 ===`);
    console.log(`Port: ${port}`);
    console.log(`Data File: ${DATA_FILE}`);
});
