// components/token-form.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function TokenForm({ onTokenSubmit }: { onTokenSubmit: (token: string) => void }) {
  const [token, setToken] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) onTokenSubmit(token.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold text-center">LINE Rich Menu Manager</h1>
      <p className="text-center text-muted-foreground">
        Enter your LINE Channel Access Token to manage rich menus.
      </p>
      <Input
        type="password"
        placeholder="Channel Access Token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        className="text-sm"
      />
      <Button type="submit" className="w-full">Connect</Button>
    </form>
  );
}