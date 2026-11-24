const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const formatted = rows.map((row) => ({
      ...row,
      isPrime: Boolean(row.isPrime),
      specs: JSON.parse(row.specs || '[]')
    }));
    res.json(formatted);
  });
});

app.get('/api/cart', (req, res) => {
  db.all('SELECT * FROM cart_items', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map((r) => ({ ...r, isPrime: Boolean(r.isPrime) })));
  });
});

app.post('/api/cart', (req, res) => {
  const { id, title, price, image, isPrime, quantity = 1 } = req.body;
  db.get('SELECT * FROM cart_items WHERE id = ?', [id], (err, existing) => {
    if (err) return res.status(500).json({ error: err.message });
    if (existing) {
      const nextQty = existing.quantity + quantity;
      db.run('UPDATE cart_items SET quantity = ? WHERE id = ?', [nextQty, id], (updateErr) => {
        if (updateErr) return res.status(500).json({ error: updateErr.message });
        res.json({ id, quantity: nextQty });
      });
    } else {
      db.run(
        'INSERT INTO cart_items (id, title, price, image, isPrime, quantity) VALUES (?, ?, ?, ?, ?, ?)',
        [id, title, price, image, isPrime ? 1 : 0, quantity],
        (insertErr) => {
          if (insertErr) return res.status(500).json({ error: insertErr.message });
          res.status(201).json({ id, quantity });
        }
      );
    }
  });
});

app.patch('/api/cart/:id', (req, res) => {
  const { delta } = req.body;
  const { id } = req.params;
  db.get('SELECT * FROM cart_items WHERE id = ?', [id], (err, item) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const nextQty = item.quantity + delta;
    if (nextQty <= 0) {
      db.run('DELETE FROM cart_items WHERE id = ?', [id], (delErr) => {
        if (delErr) return res.status(500).json({ error: delErr.message });
        res.json({ deleted: true, id });
      });
    } else {
      db.run('UPDATE cart_items SET quantity = ? WHERE id = ?', [nextQty, id], (updErr) => {
        if (updErr) return res.status(500).json({ error: updErr.message });
        res.json({ id, quantity: nextQty });
      });
    }
  });
});

app.delete('/api/cart/:id', (req, res) => {
  db.run('DELETE FROM cart_items WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: true });
  });
});

app.get('/api/wishlist', (req, res) => {
  db.all('SELECT * FROM wishlist_items', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/wishlist/toggle', (req, res) => {
  const { id, title, price, image, brand } = req.body;
  db.get('SELECT * FROM wishlist_items WHERE id = ?', [id], (err, existing) => {
    if (err) return res.status(500).json({ error: err.message });
    if (existing) {
      db.run('DELETE FROM wishlist_items WHERE id = ?', [id], (delErr) => {
        if (delErr) return res.status(500).json({ error: delErr.message });
        res.json({ wishlisted: false, id });
      });
    } else {
      db.run(
        'INSERT INTO wishlist_items (id, title, price, image, brand) VALUES (?, ?, ?, ?, ?)',
        [id, title, price, image, brand],
        (insErr) => {
          if (insErr) return res.status(500).json({ error: insErr.message });
          res.json({ wishlisted: true, id });
        }
      );
    }
  });
});

app.get('/api/reviews', (req, res) => {
  db.all('SELECT * FROM reviews ORDER BY date DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const grouped = {};
    rows.forEach((r) => {
      if (!grouped[r.productId]) grouped[r.productId] = [];
      grouped[r.productId].push(r);
    });
    res.json(grouped);
  });
});

app.post('/api/reviews', (req, res) => {
  const { id, productId, userName, rating, title, comment, date } = req.body;
  db.run(
    'INSERT INTO reviews (id, productId, userName, rating, title, comment, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, productId, userName, rating, title, comment, date],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json(req.body);
    }
  );
});

app.get('/api/orders', (req, res) => {
  db.all('SELECT * FROM orders', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const parsed = rows.map((o) => ({
      ...o,
      items: JSON.parse(o.items || '[]'),
      shippingAddress: JSON.parse(o.shippingAddress || '{}')
    }));
    res.json(parsed.reverse());
  });
});

app.post('/api/orders', (req, res) => {
  const { id, date, items, total, shippingAddress, status } = req.body;
  db.run(
    'INSERT INTO orders (id, date, items, total, shippingAddress, status) VALUES (?, ?, ?, ?, ?, ?)',
    [id, date, JSON.stringify(items), total, JSON.stringify(shippingAddress), status],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      db.run('DELETE FROM cart_items', [], (clearErr) => {
        if (clearErr) return res.status(500).json({ error: clearErr.message });
        res.status(201).json(req.body);
      });
    }
  );
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('Amazon.in server running at http://localhost:' + PORT);
});
