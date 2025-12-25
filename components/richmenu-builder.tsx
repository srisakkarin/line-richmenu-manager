// components/richmenu-builder.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TEMPLATES, Template } from "./templates";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import {
    LayoutGrid,
    Save,
    ImagePlus,
    Loader2,
    MousePointerClick,
    Download,
    Upload,
    Link as LinkIcon,
    MessageSquare,
    Webhook
} from "lucide-react";

// Interface
interface ExtendedTemplate extends Template {
    image?: string;
}

interface RichMenuBuilderProps {
    token: string | null;
    onSuccess: () => void;
}

export function RichMenuBuilder({ token, onSuccess }: RichMenuBuilderProps) {
    // --- Helper: แปลงข้อมูล Area ให้เป็น Format กลาง (Flat x,y,width,height) เสมอ ---
    const normalizeAreas = (rawAreas: any[]) => {
        return rawAreas.map((a: any) => ({
            // ถ้ามี bounds ให้ดึงไส้ในออกมา ถ้าไม่มีให้ใช้ค่าเดิม
            x: a.bounds ? a.bounds.x : a.x,
            y: a.bounds ? a.bounds.y : a.y,
            width: a.bounds ? a.bounds.width : a.width,
            height: a.bounds ? a.bounds.height : a.height,
            action: a.action || { type: 'uri', uri: '' }
        }));
    };

    // --- State ---
    const templates = TEMPLATES as ExtendedTemplate[];
    const [selectedTemplate, setSelectedTemplate] = useState<ExtendedTemplate>(templates[0]);

    // ใช้ normalizeAreas ตั้งแต่เริ่มต้น เพื่อกันพลาดกรณี Template ไฟล์เขียนมาไม่เหมือนกัน
    const [areas, setAreas] = useState<any[]>(normalizeAreas(templates[0].areas || []));

    const [menuName, setMenuName] = useState("");
    const [chatBarText, setChatBarText] = useState("เมนูหลัก");

    // UI States
    const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
    const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
    const [editingAreaIndex, setEditingAreaIndex] = useState<number | null>(null);
    const [tempAction, setTempAction] = useState<any>({ type: 'uri', uri: '' });

    // Image & Processing States
    const [userImageFile, setUserImageFile] = useState<File | null>(null);
    const [userImagePreview, setUserImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);
    const importInputRef = useRef<HTMLInputElement>(null);

    const largeTemplates = templates.filter((t) => t.height > 1000);
    const smallTemplates = templates.filter((t) => t.height < 1000);

    // --- Handlers ---

    const handleSelectTemplate = (template: ExtendedTemplate) => {
        setSelectedTemplate(template);
        // Reset Action แต่ยังคงพิกัดไว้ และ Normalize ให้ชัวร์
        const resetAreas = template.areas.map(a => ({ ...a, action: { type: 'uri', uri: '' } }));
        setAreas(normalizeAreas(resetAreas));
        setIsTemplateDialogOpen(false);
        toast.success(`เปลี่ยนเป็นแบบ ${template.name} แล้ว`);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUserImageFile(file);
            const objectUrl = URL.createObjectURL(file);
            setUserImagePreview(objectUrl);
            toast.success("อัปโหลดรูปภาพเรียบร้อย");
        }
    };

    const openActionEditor = (index: number) => {
        setEditingAreaIndex(index);
        const currentAction = areas[index].action || { type: 'uri', uri: '' };
        setTempAction({ ...currentAction });
        setIsActionDialogOpen(true);
    };

    const saveAction = () => {
        if (editingAreaIndex === null) return;

        if (tempAction.type === 'uri' && !tempAction.uri) {
            return toast.error('กรุณาระบุ URL');
        }
        if (tempAction.type === 'message' && !tempAction.text) {
            return toast.error('กรุณาระบุข้อความ');
        }

        const newAreas = [...areas];
        newAreas[editingAreaIndex].action = tempAction;
        setAreas(newAreas);
        setIsActionDialogOpen(false);
        toast.success(`บันทึก Action จุด ${String.fromCharCode(65 + editingAreaIndex)} แล้ว`);
    };

    // --- Import / Export Logic ---

    const handleExportJson = () => {
        // Construct JSON ตาม Format ที่ใช้งานจริง (มี bounds)
        const config = {
            size: { width: selectedTemplate.width, height: selectedTemplate.height },
            selected: true,
            name: menuName || "Rich Menu",
            chatBarText: chatBarText || "Menu",
            areas: areas.map(area => ({
                bounds: { x: area.x, y: area.y, width: area.width, height: area.height },
                action: area.action
            }))
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `richmenu-${menuName || 'config'}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        toast.success('Export JSON เรียบร้อย');
    };

    const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);

                if (json.name) setMenuName(json.name);
                if (json.chatBarText) setChatBarText(json.chatBarText);

                // Match Template logic
                if (json.size && json.areas) {
                    const matchedTemplate = templates.find(t =>
                        t.width === json.size.width &&
                        t.height === json.size.height &&
                        t.areas.length === json.areas.length
                    );

                    if (matchedTemplate) setSelectedTemplate(matchedTemplate);

                    // *** สำคัญ: แปลง JSON ที่มี bounds กลับมาเป็น flat x,y เพื่อใช้ใน State ***
                    setAreas(normalizeAreas(json.areas));
                }
                toast.success('Import JSON เรียบร้อย');
            } catch (error) {
                console.error(error);
                toast.error('ไฟล์ JSON ไม่ถูกต้อง');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    // --- Save to API ---

    const handleSave = async () => {
        if (!token) return toast.error("Token invalid");
        if (!userImageFile) return toast.error("กรุณาอัปโหลดรูปภาพริชเมนู");
        if (!menuName) return toast.error("กรุณาระบุชื่อริชเมนู");

        setIsSubmitting(true);

        try {
            // *** สำคัญ: แปลง State กลับเป็นโครงสร้างที่มี bounds เพื่อส่ง API ***
            const richMenuConfig = {
                size: { width: selectedTemplate.width, height: selectedTemplate.height },
                selected: true,
                name: menuName,
                chatBarText: chatBarText,
                areas: areas.map(area => ({
                    bounds: { x: area.x, y: area.y, width: area.width, height: area.height },
                    action: area.action
                }))
            };

            const formData = new FormData();
            formData.append('json', JSON.stringify(richMenuConfig));
            formData.append('image', userImageFile);

            const res = await fetch('/api/create', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (res.ok) {
                toast.success('สร้างริชเมนูและเริ่มใช้งานสำเร็จ!');
                setMenuName("");
                setUserImageFile(null);
                setUserImagePreview(null);
                if (onSuccess) onSuccess();
            } else {
                const err = await res.json();
                // แสดง Error ชัดเจน
                throw new Error(err.error || err.message || JSON.stringify(err));
            }
        } catch (e) {
            toast.error((e as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full p-1 md:p-0">

            {/* --- Action Editor Dialog --- */}
            <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>ตั้งค่า Action จุด {editingAreaIndex !== null ? String.fromCharCode(65 + editingAreaIndex) : ''}</DialogTitle>
                        <DialogDescription>
                            กำหนดสิ่งที่เกิดขึ้นเมื่อผู้ใช้กดที่จุดนี้
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue={tempAction.type} onValueChange={(val) => setTempAction({ ...tempAction, type: val })} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="uri">เปิดลิ้งค์</TabsTrigger>
                            <TabsTrigger value="message">ข้อความ</TabsTrigger>
                            <TabsTrigger value="postback">Postback</TabsTrigger>
                        </TabsList>

                        <div className="py-4 space-y-4">
                            <div className="space-y-1">
                                <Label>ป้ายกำกับ (Label) <span className="text-xs text-slate-400 font-normal">(Optional)</span></Label>
                                <Input
                                    placeholder="เช่น สั่งอาหาร, โปรโมชั่น"
                                    value={tempAction.label || ''}
                                    onChange={(e) => setTempAction({ ...tempAction, label: e.target.value })}
                                />
                            </div>

                            {/* Type: URI */}
                            <TabsContent value="uri" className="space-y-3 mt-0">
                                <div className="space-y-1">
                                    <Label>ลิ้งค์ปลายทาง (URL)</Label>
                                    <Input
                                        placeholder="https://example.com"
                                        value={tempAction.uri || ''}
                                        onChange={(e) => setTempAction({ ...tempAction, uri: e.target.value })}
                                    />
                                    <p className="text-xs text-slate-500">ต้องขึ้นต้นด้วย http:// หรือ https://</p>
                                </div>
                            </TabsContent>

                            {/* Type: Message */}
                            <TabsContent value="message" className="space-y-3 mt-0">
                                <div className="space-y-1">
                                    <Label>ข้อความที่จะส่ง</Label>
                                    <Input
                                        placeholder="ใส่ข้อความที่ต้องการ"
                                        value={tempAction.text || ''}
                                        onChange={(e) => setTempAction({ ...tempAction, text: e.target.value })}
                                    />
                                </div>
                            </TabsContent>

                            {/* Type: Postback */}
                            <TabsContent value="postback" className="space-y-3 mt-0">
                                <div className="space-y-1">
                                    <Label>Data (ส่งไปหลังบ้าน)</Label>
                                    <Input
                                        placeholder="action=buy&itemid=111"
                                        value={tempAction.data || ''}
                                        onChange={(e) => setTempAction({ ...tempAction, data: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>DisplayText (ตัวเลือก)</Label>
                                    <Input
                                        placeholder="ข้อความที่แสดงในแชท (Optional)"
                                        value={tempAction.displayText || ''}
                                        onChange={(e) => setTempAction({ ...tempAction, displayText: e.target.value })}
                                    />
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>ยกเลิก</Button>
                        <Button onClick={saveAction}>บันทึก</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            {/* --- Main Header --- */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">ออกแบบริชเมนู</h2>
                    <p className="text-slate-500 mt-1">เลือกเทมเพลต กำหนด Action และอัปโหลดรูปภาพ</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => importInputRef.current?.click()}>
                        <Upload className="w-4 h-4" /> Import JSON
                    </Button>
                    <input type="file" ref={importInputRef} accept=".json" className="hidden" onChange={handleImportJson} />

                    <Button variant="outline" size="sm" className="gap-2" onClick={handleExportJson}>
                        <Download className="w-4 h-4" /> Export JSON
                    </Button>

                    <Button
                        className="gap-2 bg-green-600 hover:bg-green-700 min-w-[140px]"
                        onClick={handleSave}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        บันทึกและใช้งาน
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- Left Column: Visualizer --- */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-1 overflow-hidden bg-slate-50 border-slate-200 shadow-inner min-h-[500px] flex flex-col items-center justify-center relative gap-4 py-8">
                        <div
                            className="relative bg-white shadow-xl transition-all duration-500 ease-in-out select-none overflow-hidden rounded-lg border border-blue-200"
                            style={{
                                width: '100%',
                                maxWidth: '600px',
                                aspectRatio: `${selectedTemplate.width}/${selectedTemplate.height}`,
                            }}
                        >
                            {/* Background Image Layer */}
                            <div
                                className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-100"
                                style={{
                                    backgroundImage: userImagePreview
                                        ? `url(${userImagePreview})`
                                        : (selectedTemplate.image ? `url(${selectedTemplate.image})` : 'none'),
                                    backgroundSize: '100% 100%',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                }}
                            >
                                {!userImagePreview && !selectedTemplate.image && (
                                    <div className="text-center text-slate-400 z-0 px-4">
                                        <p className="text-sm">โปรดเลือกเทมเพลตแล้วอัปโหลดรูปพื้นหลัง</p>
                                    </div>
                                )}
                            </div>

                            {/* Grid Overlay Layer */}
                            <div className="absolute inset-0 w-full h-full">
                                {areas.map((area, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            "absolute flex items-center justify-center transition-all cursor-pointer group",
                                            "bg-black/10 hover:bg-blue-500/30",
                                            "border border-blue-400/30"
                                        )}
                                        style={{
                                            left: `${(area.x / selectedTemplate.width) * 100}%`,
                                            top: `${(area.y / selectedTemplate.height) * 100}%`,
                                            width: `${(area.width / selectedTemplate.width) * 100}%`,
                                            height: `${(area.height / selectedTemplate.height) * 100}%`,
                                            boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.2)'
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openActionEditor(index);
                                        }}
                                    >
                                        <span className="text-white text-3xl font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all">
                                            {String.fromCharCode(65 + index)}
                                        </span>
                                        <div className="absolute bottom-2 right-2 bg-slate-900/80 p-1 rounded-full text-white text-xs">
                                            {area.action?.type === 'uri' && <LinkIcon className="w-3 h-3" />}
                                            {area.action?.type === 'message' && <MessageSquare className="w-3 h-3" />}
                                            {area.action?.type === 'postback' && <Webhook className="w-3 h-3" />}
                                            {!area.action?.type && <MousePointerClick className="w-3 h-3" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-2 z-10 mt-2">
                            <Button
                                variant="outline"
                                className="gap-2 bg-white border-slate-300 hover:bg-slate-50 text-slate-700 shadow-sm min-w-[200px]"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <ImagePlus className="w-4 h-4" />
                                {userImagePreview ? 'เปลี่ยนรูปภาพพื้นหลัง' : 'อัปโหลดรูปพื้นหลัง'}
                            </Button>
                            <p className="text-xs text-slate-400">
                                ขนาด {selectedTemplate.width} x {selectedTemplate.height} px (JPG/PNG)
                            </p>
                        </div>

                        <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg" onChange={handleImageUpload} />
                    </Card>
                </div>

                {/* --- Right Column: Settings --- */}
                <div className="space-y-6">
                    <Card className="p-6 space-y-6">

                        {/* Template Selector */}
                        <div>
                            <Label className="text-base font-semibold mb-2 block">เลือกเทมเพลต (Template)</Label>
                            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                                <DialogTrigger asChild>
                                    <div className="cursor-pointer border-2 border-dashed border-slate-300 rounded-xl p-4 hover:border-blue-500 hover:bg-slate-50 transition-all group text-center bg-white">
                                        <div className="aspect-[2/1] w-full bg-slate-100 mb-3 rounded-lg overflow-hidden relative border">
                                            {selectedTemplate.image ? (
                                                <img src={selectedTemplate.image} className="w-full h-full object-cover opacity-80" alt="Template" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center flex-col gap-2">
                                                    <LayoutGrid className="text-slate-300 w-8 h-8" />
                                                    <span className="text-xs text-slate-400">คลิกเพื่อเลือก</span>
                                                </div>
                                            )}
                                        </div>
                                        <Button variant="secondary" className="w-full pointer-events-none group-hover:bg-blue-600 group-hover:text-white">
                                            เปลี่ยนรูปแบบ (Change Template)
                                        </Button>
                                    </div>
                                </DialogTrigger>

                                <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto p-0 gap-0">
                                    <DialogHeader className="p-6 pb-2 border-b bg-white sticky top-0 z-10">
                                        <DialogTitle>เลือกรูปแบบริชเมนู</DialogTitle>
                                        <DialogDescription>Action ที่ตั้งค่าไว้จะถูกรีเซ็ตเมื่อเปลี่ยนเทมเพลต</DialogDescription>
                                    </DialogHeader>

                                    <div className="p-6 space-y-8 bg-slate-50/50">
                                        <div>
                                            <h4 className="font-semibold mb-4 flex items-center gap-2">แบบใหญ่ (Large)</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {largeTemplates.map((t) => (
                                                    <div key={t.id} onClick={() => handleSelectTemplate(t)} className={cn("cursor-pointer border rounded-lg overflow-hidden bg-white hover:ring-2 ring-blue-500 transition-all", selectedTemplate.id === t.id ? "ring-2 ring-blue-500 border-blue-500" : "")}>
                                                        <div className="aspect-[2500/1686] bg-slate-100 relative border-b">
                                                            {t.image && <img src={t.image} className="w-full h-full object-contain p-2" />}
                                                        </div>
                                                        <div className="p-3 text-center text-sm font-medium">{t.name}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-4 pt-4 border-t flex items-center gap-2">แบบเล็ก (Compact)</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {smallTemplates.map((t) => (
                                                    <div key={t.id} onClick={() => handleSelectTemplate(t)} className={cn("cursor-pointer border rounded-lg overflow-hidden bg-white hover:ring-2 ring-blue-500 transition-all", selectedTemplate.id === t.id ? "ring-2 ring-blue-500 border-blue-500" : "")}>
                                                        <div className="aspect-[2500/843] bg-slate-100 relative border-b">
                                                            {t.image && <img src={t.image} className="w-full h-full object-contain p-2" />}
                                                        </div>
                                                        <div className="p-3 text-center text-sm font-medium">{t.name}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Meta Data */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>ชื่อริชเมนู <span className="text-red-500">*</span></Label>
                                <Input placeholder="เช่น โปรโมชั่นเดือนมกราคม" value={menuName} onChange={(e) => setMenuName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>ข้อความที่แถบเมนู (Chat Bar Text)</Label>
                                <Input placeholder="เช่น เมนูหลัก, คลิกเลย" value={chatBarText} onChange={(e) => setChatBarText(e.target.value)} maxLength={14} />
                            </div>
                        </div>

                        {/* Action List */}
                        <div className="pt-4 border-t">
                            <Label className="mb-3 block">ตั้งค่า Action ({areas.length} จุด)</Label>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                                {areas.map((area, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => openActionEditor(idx)}
                                        className="flex items-center gap-3 p-3 rounded-lg border bg-slate-50 text-sm hover:bg-white hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                                    >
                                        <div className="flex-none w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-slate-700 flex items-center gap-2">
                                                Area {String.fromCharCode(65 + idx)}
                                                <span className="text-xs font-normal text-slate-400 bg-slate-100 px-1.5 rounded">
                                                    {area.action?.type || 'Not set'}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-500 truncate mt-0.5">
                                                {area.action?.label || area.action?.uri || area.action?.text || area.action?.data || 'คลิกเพื่อตั้งค่า'}
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 group-hover:text-blue-600">
                                            <MousePointerClick className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}