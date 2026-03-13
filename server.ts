import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import Database from 'better-sqlite3';

const db = new Database('orders.db');

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customerName TEXT,
    orderNumber TEXT,
    items TEXT,
    status TEXT DEFAULT 'pending',
    total REAL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/orders', (req, res) => {
    const orders = db.prepare('SELECT * FROM orders ORDER BY createdAt DESC').all();
    res.json(orders.map((o: any) => ({
      ...o,
      items: JSON.parse(o.items)
    })));
  });

  app.post('/api/orders', (req, res) => {
    const { customerName, orderNumber, items, total } = req.body;
    const stmt = db.prepare('INSERT INTO orders (customerName, orderNumber, items, total) VALUES (?, ?, ?, ?)');
    const info = stmt.run(customerName, orderNumber, JSON.stringify(items), total);
    res.json({ id: info.lastInsertRowid });
  });

  app.patch('/api/orders/:id', (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
    res.json({ success: true });
  });

  app.delete('/api/orders/:id', (req, res) => {
    const { id } = req.params;
    db.prepare('DELETE FROM orders WHERE id = ?').run(id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
