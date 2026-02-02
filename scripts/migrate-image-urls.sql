-- Migrar URLs de imagens antigas para usar API route
-- Execute este script no banco de dados se houver imagens antigas

-- Atualizar URLs em product_images
UPDATE smartloja.product_images
SET url = REPLACE(url, '/uploads/', '/api/uploads/')
WHERE url LIKE '/uploads/%'
AND url NOT LIKE '/api/uploads/%';

-- Verificar resultados
SELECT id, url FROM smartloja.product_images LIMIT 10;
