import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Simple in-memory DB for now. Replace with Prisma later
let users: any[] = [];

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url } = req;

  if (url === '/api/health') {
    return res.status(200).json({ ok: true, message: "API is running" });
  }

  if (url === '/api/signup' && req.method === 'POST') {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing fields" });
    
    const user = { id: Date.now(), email, password };
    users.push(user);
    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    return res.status(200).json({ token, user: { id: user.id, email } });
  }

  if (url === '/api/login' && req.method === 'POST') {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    
    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    return res.status(200).json({ token, user: { id: user.id, email } });
  }

  return res.status(404).json({ error: "Route not found" });
}
