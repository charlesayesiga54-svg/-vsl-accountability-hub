import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') return res.status(200).end()

  const path = req.url || ''

  // Health check - no auth needed
  if (path.includes('/api/health')) {
    return res.status(200).json({ ok: true, time: new Date().toISOString() })
  }

  return res.status(404).json({ error: 'Not found' })
}
