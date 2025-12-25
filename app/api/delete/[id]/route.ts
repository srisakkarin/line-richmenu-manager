// app/api/delete/[id]/route.ts
import { NextRequest } from 'next/server';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ⬅️ params เป็น Promise แล้ว
) {
  // ✅ ต้อง await params ก่อนใช้
  const { id } = await params;

  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return Response.json({ error: 'Token required' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.line.me/v2/bot/richmenu/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`LINE API error: ${text}`);
    }

    return new Response(null, { status: 204 });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}