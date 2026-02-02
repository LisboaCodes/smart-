'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('busca') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (search.trim()) {
      params.set('busca', search.trim());
      // Remove categoria ao buscar
    } else {
      // Se busca vazia, mantém categoria
      const categoria = searchParams.get('categoria');
      if (categoria) {
        params.set('categoria', categoria);
      }
    }

    router.push(`/loja?${params.toString()}`);
  };

  const handleClear = () => {
    setSearch('');
    const params = new URLSearchParams();
    const categoria = searchParams.get('categoria');
    if (categoria) {
      params.set('categoria', categoria);
    }
    router.push(`/loja?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative max-w-md w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Buscar produtos..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="pl-9 pr-20"
      />
      {search && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-10 top-1/2 -translate-y-1/2 h-7 w-7"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      <Button
        type="submit"
        size="sm"
        className="absolute right-1 top-1/2 -translate-y-1/2 bg-gold-600 hover:bg-gold-700"
      >
        Buscar
      </Button>
    </form>
  );
}
