// components/richmenu-preview.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function RichMenuPreview({
  imageFile,
  onImageChange,
}: {
  imageFile: File | null;
  onImageChange: (file: File) => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let url: string | null = null;
    if (imageFile) {
      url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
    }
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImageChange(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Rich Menu Image</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          type="file"
          accept="image/jpeg"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
        />
        <Button
          variant="outline"
          className="w-full"
          onClick={handleButtonClick}
        >
          Choose JPG (2500×1686)
        </Button>

        {previewUrl ? (
          <div className="border rounded overflow-hidden">
            <img
              src={previewUrl}
              alt="Rich Menu Preview"
              className="w-full max-h-64 object-contain"
            />
          </div>
        ) : (
          <div className="border-2 border-dashed rounded h-32 flex items-center justify-center text-sm text-muted-foreground">
            No image selected
          </div>
        )}
      </CardContent>
    </Card>
  );
}