// components/richmenu-list.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "sonner"

export function RichMenuList({
    menus,
    token,
    onDeleted,
}: {
    menus: Array<{ richMenuId: string; name: string }>;
    token: string;
    onDeleted: () => void;
}) {
    const handleDelete = async (id: string) => {
        if (!confirm('Delete this rich menu? This cannot be undone.')) return;
        try {
            const res = await fetch(`/api/delete/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                // toast({ title: 'Deleted', description: 'Rich menu removed' });
                toast.success('Rich menu removed');
                onDeleted();
            } else {
                throw new Error('Failed to delete');
            }
        } catch (err) {
            //   toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
            toast.error((err as Error).message);
        }
    };

    if (menus.length === 0) return <p className="text-muted-foreground text-sm">No rich menus found.</p>;

    return (
        <div className="space-y-2">
            {menus.map((menu) => (
                <Card key={menu.richMenuId} className="text-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium truncate">{menu.name || menu.richMenuId}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(menu.richMenuId)}
                        >
                            Delete
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}