// components/richmenu-builder.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { TEMPLATES, Template } from './templates';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const RICHMENU_WIDTH = 2500;
const RICHMENU_HEIGHT = 1686;

export type Area = {
    id: string;
    bounds: { x: number; y: number; width: number; height: number };
    action: { type: 'uri' | 'postback' | 'message'; uri?: string; data?: string; text?: string };
};

export type RichMenuConfig = {
    size: { width: number; height: number };
    selected: boolean;
    name: string;
    chatBarText: string;
    areas: Area[];
};

export function RichMenuBuilder({
    onConfigChange,
    imageFile,
}: {
    onConfigChange: (config: RichMenuConfig) => void;
    imageFile: File | null;
}) {
    const [name, setName] = useState('My Rich Menu');
    const [chatBarText, setChatBarText] = useState('Menu');
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [areas, setAreas] = useState<Area[]>([]);
    const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

    const applyTemplate = (template: Template) => {
        const newAreas = template.areas.map((area, index) => ({
            id: `area-${index + 1}`,
            bounds: { x: area.x, y: area.y, width: area.width, height: area.height },
            action: { ...area.action },
        }));
        setAreas(newAreas);
        setSelectedTemplate(template);
        setIsTemplateDialogOpen(false);
        toast.success(`Template "${template.name}" applied`);
    };

    const updateAction = (id: string, field: string, value: any) => {
        setAreas(areas.map(a => {
            if (a.id !== id) return a;
            return { ...a, action: { ...a.action, [field]: value } };
        }));
    };

    const validateBounds = (b: any) => {
        return b.x >= 0 && b.y >= 0 && b.width > 0 && b.height > 0 &&
            b.x + b.width <= RICHMENU_WIDTH && b.y + b.height <= RICHMENU_HEIGHT;
    };

    const applyConfig = () => {
        for (const area of areas) {
            if (!validateBounds(area.bounds)) {
                toast.error('Invalid area bounds');
                return;
            }
            if (area.action.type === 'uri' && !area.action.uri?.trim()) {
                toast.error('Missing URI');
                return;
            }
            if (area.action.type === 'message' && !area.action.text?.trim()) {
                toast.error('Missing Message');
                return;
            }
            if (area.action.type === 'postback' && !area.action.data?.trim()) {
                toast.error('Missing Postback Data');
                return;
            }
        }

        const config: RichMenuConfig = {
            size: { width: RICHMENU_WIDTH, height: RICHMENU_HEIGHT },
            selected: false,
            name,
            chatBarText,
            areas,
        };
        onConfigChange(config);
        toast.success('Rich menu layout is ready!');
    };

    // Preview Image URL
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (imageFile) {
            const url = URL.createObjectURL(imageFile);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [imageFile]);

    // แยก template เป็น "ใหญ่" และ "เล็ก"
    const largeTemplates = TEMPLATES.filter(t => t.id.startsWith('large-'));
    const smallTemplates = TEMPLATES.filter(t => t.id.startsWith('small-'));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Rich Menu Builder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Template Selector */}
                <div>
                    <Label>เลือกเทมเพลต</Label>
                    <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                                เลือกเทมเพลต
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl p-6">
                            <DialogHeader>
                                <DialogTitle>เลือกเทมเพลต</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold mb-2">ใหญ่</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {largeTemplates.map((template) => (
                                            <Button
                                                key={template.id}
                                                variant="outline"
                                                onClick={() => applyTemplate(template)}
                                                className="h-auto p-3 flex flex-col items-center justify-center text-xs rounded-lg"
                                            >
                                                <div
                                                    className="border rounded mb-1 w-full aspect-[2500/1686] bg-gray-100 flex flex-wrap"
                                                    style={{ maxHeight: '80px' }}
                                                >
                                                    {template.areas.map((area, i) => (
                                                        <div
                                                            key={i}
                                                            className="border border-gray-300 m-0.5 flex-grow flex-shrink-0"
                                                            style={{
                                                                width: `${(area.width / template.width) * 100}%`,
                                                                height: `${(area.height / template.height) * 100}%`,
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="flex items-center justify-center space-x-1 mt-1">
                                                    <span className="text-xs">✅</span>
                                                    <span className="text-xs">Check</span>
                                                </div>
                                                <span className="mt-1 text-sm font-medium">{template.name}</span>
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-2">เล็ก</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {smallTemplates.map((template) => (
                                            <Button
                                                key={template.id}
                                                variant="outline"
                                                onClick={() => applyTemplate(template)}
                                                className="h-auto p-3 flex flex-col items-center justify-center text-xs rounded-lg"
                                            >
                                                <div
                                                    className="border rounded mb-1 w-full aspect-[2500/843] bg-gray-100 flex flex-wrap"
                                                    style={{ maxHeight: '80px' }}
                                                >
                                                    {template.areas.map((area, i) => (
                                                        <div
                                                            key={i}
                                                            className="border border-gray-300 m-0.5 flex-grow flex-shrink-0"
                                                            style={{
                                                                width: `${(area.width / template.width) * 100}%`,
                                                                height: `${(area.height / template.height) * 100}%`,
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="flex items-center justify-center space-x-1 mt-1">
                                                    <span className="text-xs">✅</span>
                                                    <span className="text-xs">Check</span>
                                                </div>
                                                <span className="mt-1 text-sm font-medium">{template.name}</span>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Name & Chat Bar Text */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label>ชื่อ</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div>
                        <Label>ข้อความแถบเมนู</Label>
                        <Input value={chatBarText} onChange={e => setChatBarText(e.target.value)} />
                    </div>
                </div>

                {/* Preview */}
                <div>
                    <Label>ตัวอย่าง</Label>
                    <div
                        className="relative bg-gray-100 border rounded mt-1 overflow-hidden"
                        style={{
                            width: '100%',
                            aspectRatio: '2500 / 1686',
                            maxHeight: '300px',
                        }}
                    >
                        {previewUrl && (
                            <img
                                src={previewUrl}
                                alt="Background"
                                className="absolute inset-0 w-full h-full object-cover opacity-50"
                            />
                        )}

                        {areas.map((area, index) => {
                            const left = (area.bounds.x / RICHMENU_WIDTH) * 100;
                            const top = (area.bounds.y / RICHMENU_HEIGHT) * 100;
                            const width = (area.bounds.width / RICHMENU_WIDTH) * 100;
                            const height = (area.bounds.height / RICHMENU_HEIGHT) * 100;

                            return (
                                <div
                                    key={area.id}
                                    className="absolute border-2 border-green-500 bg-green-200/40 pointer-events-none"
                                    style={{
                                        left: `${left}%`,
                                        top: `${top}%`,
                                        width: `${width}%`,
                                        height: `${height}%`,
                                        zIndex: 10,
                                    }}
                                >
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                                        {String.fromCharCode(65 + index)} {/* A, B, C, D, E, F */}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Green boxes = clickable areas (overlay on your uploaded image)
                    </p>
                </div>

                {/* Actions */}
                <div>
                    <Label>แอ็กชัน</Label>
                    <div className="space-y-3">
                        {areas.map((area, index) => (
                            <div key={area.id} className="p-3 border rounded">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium">Section {String.fromCharCode(65 + index)}</span>
                                    <select
                                        className="p-1 border rounded text-xs"
                                        value={area.action.type}
                                        onChange={(e) => updateAction(area.id, 'type', e.target.value)}
                                    >
                                        <option value="uri">URI</option>
                                        <option value="message">Message</option>
                                        <option value="postback">Postback</option>
                                    </select>
                                </div>
                                {area.action.type === 'uri' && (
                                    <Input
                                        placeholder="https://example.com"
                                        value={area.action.uri || ''}
                                        onChange={(e) => updateAction(area.id, 'uri', e.target.value)}
                                        className="mt-1 h-7"
                                    />
                                )}
                                {area.action.type === 'message' && (
                                    <Input
                                        placeholder="Hello World"
                                        value={area.action.text || ''}
                                        onChange={(e) => updateAction(area.id, 'text', e.target.value)}
                                        className="mt-1 h-7"
                                    />
                                )}
                                {area.action.type === 'postback' && (
                                    <Input
                                        placeholder="data=order"
                                        value={area.action.data || ''}
                                        onChange={(e) => updateAction(area.id, 'data', e.target.value)}
                                        className="mt-1 h-7"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Menu Bar Settings */}
                <div>
                    <Label>ตั้งค่าเมนูบาร์</Label>
                    <div className="space-y-3 mt-2">
                        <div className="flex items-center space-x-2">
                            <Label>ข้อความบนเมนูบาร์</Label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id="menuText"
                                    name="menuBar"
                                    checked={true}
                                    className="w-4 h-4"
                                />
                                <Label htmlFor="menuText">เมนู</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id="customText"
                                    name="menuBar"
                                    className="w-4 h-4"
                                />
                                <Label htmlFor="customText">ข้อความอื่นๆ</Label>
                                <Input
                                    placeholder="ใส่ข้อความ"
                                    className="ml-2 w-32 h-7"
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Label>การแสดงเมนูบนเริ่มต้น</Label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id="showMenu"
                                    name="showMenu"
                                    checked={true}
                                    className="w-4 h-4"
                                />
                                <Label htmlFor="showMenu">แสดง</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id="hideMenu"
                                    name="showMenu"
                                    className="w-4 h-4"
                                />
                                <Label htmlFor="hideMenu">ซ่อน</Label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex space-x-2">
                    <Button variant="outline" className="w-full">
                        บันทึกที่ร่าง
                    </Button>
                    <Button className="w-full" onClick={applyConfig}>
                        บันทึก
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}