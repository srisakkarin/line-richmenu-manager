import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return Response.json({ error: 'Token required' }, { status: 400 });

  try {
    const formData = await req.formData();
    const jsonStr = formData.get('json') as string;
    const imageFile = formData.get('image') as File;

    if (!jsonStr || !imageFile) return Response.json({ error: 'Missing json or image' }, { status: 400 });

    // Create
    const createRes = await fetch('https://api.line.me/v2/bot/richmenu', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: jsonStr,
    });
    if (!createRes.ok) throw new Error(await createRes.text());
    const { richMenuId } = await createRes.json();

    // Upload image
    const arrayBuf = await imageFile.arrayBuffer();
    const imgRes = await fetch(`https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'image/jpeg' },
      body: Buffer.from(arrayBuf),
    });
    if (!imgRes.ok) throw new Error(await imgRes.text());

    // Apply to all
    const applyRes = await fetch(`https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!applyRes.ok) throw new Error(await applyRes.text());

    return Response.json({ richMenuId });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}