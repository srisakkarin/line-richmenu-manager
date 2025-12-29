//app/api/setdefault/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
    req: NextRequest,
    // รองรับ Next.js 15+ (params เป็น Promise)
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing token' }, { status: 401 });
        }

        // รอรับ params
        const resolvedParams = await params;
        const richMenuId = resolvedParams.id;

        if (!richMenuId) {
            return NextResponse.json({ error: 'Rich Menu ID required' }, { status: 400 });
        }

        // ยิง API ไปที่ LINE เพื่อ Set Default Rich Menu
        // (POST https://api.line.me/v2/bot/user/all/richmenu/{richMenuId})
        const res = await fetch(
            `https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`,
            {
                method: 'POST',
                headers: {
                    Authorization: authHeader,
                    // LINE API บางครั้งต้องการ Content-Length: 0 หากไม่มี body
                },
            }
        );

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData.message || 'Failed to set default rich menu' },
                { status: res.status }
            );
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json(
            { error: (e as Error).message },
            { status: 500 }
        );
    }
}