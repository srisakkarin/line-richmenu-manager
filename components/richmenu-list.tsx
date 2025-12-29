// components/richmenu-list.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from "sonner";
import { Check, Trash2, Loader2, MousePointerClick } from "lucide-react";

export function RichMenuList({
    menus,
    token,
    onDeleted,
}: {
    menus: Array<{ richMenuId: string; name: string }>;
    token: string;
    onDeleted: () => void;
}) {
    // เก็บ ID ที่กำลังทำการโหลด (ทั้งลบและเลือกใช้)
    const [loadingId, setLoadingId] = useState<string | null>(null);

    // ฟังก์ชันตั้งค่าริชเมนูหลัก (Set Default)
    const handleSetDefault = async (id: string, name: string) => {
        setLoadingId(id);
        try {
            // เรียก API Route ที่เราจะสร้างในข้อ 2
            const res = await fetch(`/api/setdefault/${id}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                toast.success(`ตั้งค่า "${name}" เป็นเมนูหลักเรียบร้อยแล้ว`);
            } else {
                const err = await res.json();
                throw new Error(err.error || 'Failed to set default');
            }
        } catch (err) {
            toast.error((err as Error).message);
        } finally {
            setLoadingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('ยืนยันการลบริชเมนูนี้? (ไม่สามารถกู้คืนได้)')) return;
        setLoadingId(id);
        try {
            const res = await fetch(`/api/delete/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                toast.success('ลบริชเมนูเรียบร้อยแล้ว');
                onDeleted();
            } else {
                throw new Error('Failed to delete');
            }
        } catch (err) {
            toast.error((err as Error).message);
        } finally {
            setLoadingId(null);
        }
    };

    if (menus.length === 0) {
        return (
            <div className="text-center p-8 border-2 border-dashed rounded-lg text-slate-400">
                <p>ไม่พบรายการริชเมนู</p>
                <small>สร้างริชเมนูใหม่ได้ที่แบบฟอร์มด้านล่าง</small>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menus.map((menu) => (
                <Card key={menu.richMenuId} className="group hover:shadow-md transition-shadow bg-white">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold truncate flex items-center gap-2">
                            <MousePointerClick className="w-4 h-4 text-blue-500" />
                            {menu.name || 'ไม่มีชื่อ'}
                        </CardTitle>
                        <CardDescription className="text-xs font-mono text-slate-400 truncate">
                            {menu.richMenuId}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 flex gap-2">
                        {/* ปุ่มเลือกใช้งาน */}
                        <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            size="sm"
                            onClick={() => handleSetDefault(menu.richMenuId, menu.name)}
                            disabled={loadingId === menu.richMenuId}
                        >
                            {loadingId === menu.richMenuId ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Check className="w-4 h-4 mr-1" /> ใช้งาน
                                </>
                            )}
                        </Button>

                        {/* ปุ่มลบ */}
                        <Button
                            variant="destructive"
                            size="icon"
                            className="shrink-0"
                            onClick={() => handleDelete(menu.richMenuId)}
                            disabled={loadingId === menu.richMenuId}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}