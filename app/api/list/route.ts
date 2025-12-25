import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return Response.json({ error: 'Token required' }, { status: 400 });

  try {
    const res = await fetch('https://api.line.me/v2/bot/richmenu/list', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(await res.text());
    return Response.json(await res.json());
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}