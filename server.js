import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from the Vite build output with proper MIME types
app.use(express.static(join(__dirname, 'dist'), {
    setHeaders: (res, filePath) => {
        // Ensure JS files always get the correct MIME type
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        }
    }
}));

// SPA fallback — ONLY for routes without a file extension (client-side routing)
// This prevents returning index.html for missing .js/.css asset requests
app.get('*', (req, res) => {
    const ext = extname(req.path);
    if (ext && ext !== '.html') {
        // If a static asset was requested but not found, return 404 instead of index.html
        return res.status(404).send('Not found');
    }
    res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Chambómetro server running on port ${PORT}`);
});
