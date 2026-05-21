const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Supabase Configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
let supabase = null;

if (SUPABASE_URL && SUPABASE_KEY) {
    console.log("Supabase credentials detected. Running in cloud database mode.");
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // One-time automated migration logic
    async function performMigration() {
        try {
            console.log("=== STARTING ONE-TIME DATA MIGRATION TO SUPABASE ===");
            const localData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '[]');
            
            if (localData && localData.length > 0) {
                const { error } = await supabase
                    .from('eastsat_management')
                    .upsert({ id: 1, data: localData, updated_at: new Date() });

                if (error) {
                    console.error("Migration Failed:", error);
                } else {
                    console.log("=== MIGRATION COMPLETED SUCCESSFULLY ===");
                    console.log(`Migrated ${localData.length} rows to Supabase.`);
                }
            } else {
                console.log("Migration skipped: Local data.json is empty.");
            }
        } catch (err) {
            console.error("Migration Error:", err);
        }
    }
    performMigration();
} else {
    console.log("Supabase credentials not found. Running in local JSON file mode.");
}

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(__dirname));

// Ensure data.json exists for local fallback
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Read API
app.get('/api/data', async (req, res) => {
    try {
        if (supabase) {
            // Fetch from Supabase table 'eastsat_management'
            const { data, error } = await supabase
                .from('eastsat_management')
                .select('data')
                .eq('id', 1)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // Row does not exist yet, return empty array
                    return res.json([]);
                }
                throw error;
            }
            res.json(data.data || []);
        } else {
            // Local file mode fallback
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            res.json(JSON.parse(data || '[]'));
        }
    } catch (error) {
        console.error("Read/Parse Error:", error);
        // Fallback to empty array to prevent client lockup
        res.json([]);
    }
});

// Write API
app.post('/api/data', async (req, res) => {
    try {
        const rows = req.body;
        if (!rows) {
            return res.status(400).json({ error: "Invalid or empty data payload" });
        }

        if (supabase) {
            // Upsert into Supabase table 'eastsat_management'
            const { error } = await supabase
                .from('eastsat_management')
                .upsert({ id: 1, data: rows, updated_at: new Date() });

            if (error) throw error;
            res.json({ success: true });
        } else {
            // Local file mode fallback
            fs.writeFileSync(DATA_FILE, JSON.stringify(rows, null, 2));
            res.json({ success: true });
        }
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
