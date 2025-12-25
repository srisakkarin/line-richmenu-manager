// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { TokenForm } from '@/components/token-form';
import { RichMenuList } from '@/components/richmenu-list';
import { RichMenuBuilder } from '@/components/richmenu-builder';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage() {
  const [token, setToken] = useState<string | null>(null);
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ฟังก์ชันโหลดรายการเมนู
  const fetchMenus = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch menus');
      const data = await res.json();
      setMenus(data.richmenus || []);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchMenus();
  }, [token]);

  return (
    <div className="container mx-auto py-8 space-y-8 w-full">
      {!token ? (
        <TokenForm onTokenSubmit={setToken} />
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">LINE Rich Menu Manager</h1>
            <Button variant="outline" onClick={() => setToken(null)}>
              Change Token
            </Button>
          </div>

          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold mb-2">Existing Rich Menus</h2>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <RichMenuList menus={menus} token={token} onDeleted={fetchMenus} />
              )}
            </CardContent>
          </Card>

          {/* เรียกใช้ Builder โดยส่ง token และฟังก์ชัน refresh ไปให้ */}
          <RichMenuBuilder token={token} onSuccess={fetchMenus} />
        </div>
      )}
    </div>
  );
}