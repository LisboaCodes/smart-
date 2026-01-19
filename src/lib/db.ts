import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.DB_HOST || '201.23.70.201',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'filehub',
  user: process.env.DB_USER || 'filehub',
  password: process.env.DB_PASSWORD || 'FileHub2024@Secure!Pass',
})

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const result = await pool.query(text, params)
  return result.rows as T[]
}

export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const result = await pool.query(text, params)
  return result.rows[0] as T || null
}

// User queries
export async function findUserByEmail(email: string) {
  return queryOne<{
    id: string
    name: string
    email: string
    password: string
    role: string
    active: boolean
    avatarUrl: string | null
  }>(`
    SELECT id, name, email, password, role, active, "avatarUrl"
    FROM smartloja.users
    WHERE email = $1
  `, [email])
}

export async function updateUserLastLogin(userId: string) {
  await pool.query(`
    UPDATE smartloja.users
    SET "lastLogin" = NOW(), "updatedAt" = NOW()
    WHERE id = $1
  `, [userId])
}

// Store settings
export async function getStoreSettings() {
  return queryOne<{
    id: string
    storeName: string
    cnpj: string
    address: string
    phone: string | null
    email: string | null
    instagram: string | null
    whatsapp: string | null
    logoUrl: string | null
    primaryColor: string
    secondaryColor: string
    receiptMessage: string
  }>(`
    SELECT * FROM smartloja."StoreSettings" LIMIT 1
  `)
}

// Products
export async function getProducts(limit = 50, offset = 0) {
  return query(`
    SELECT p.*, c.name as "categoryName"
    FROM smartloja.products p
    LEFT JOIN smartloja.categories c ON p."categoryId" = c.id
    WHERE p.active = true
    ORDER BY p."createdAt" DESC
    LIMIT $1 OFFSET $2
  `, [limit, offset])
}

export async function getProductById(id: string) {
  return queryOne(`
    SELECT p.*, c.name as "categoryName"
    FROM smartloja.products p
    LEFT JOIN smartloja.categories c ON p."categoryId" = c.id
    WHERE p.id = $1
  `, [id])
}

// Categories
export async function getCategories() {
  return query(`
    SELECT * FROM smartloja.categories
    WHERE active = true
    ORDER BY name
  `)
}

export async function getCategoriesWithCount() {
  const categories = await query(`
    SELECT c.*,
      (SELECT COUNT(*) FROM smartloja.products p WHERE p."categoryId" = c.id) as "productCount"
    FROM smartloja.categories c
    WHERE c.active = true
    ORDER BY c.name
  `)
  return categories.map((c: any) => ({
    ...c,
    _count: { products: parseInt(c.productCount || '0') },
  }))
}

export async function findCategoryByName(name: string, excludeId?: string) {
  if (excludeId) {
    return queryOne(`SELECT id FROM smartloja.categories WHERE name = $1 AND id != $2`, [name, excludeId])
  }
  return queryOne(`SELECT id FROM smartloja.categories WHERE name = $1`, [name])
}

export async function createCategory(data: { name: string; description?: string | null }) {
  const result = await pool.query(`
    INSERT INTO smartloja.categories (id, name, description, active, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), $1, $2, true, NOW(), NOW())
    RETURNING *
  `, [data.name, data.description || null])
  return result.rows[0]
}

export async function updateCategory(id: string, data: { name: string; description?: string | null }) {
  const result = await pool.query(`
    UPDATE smartloja.categories
    SET name = $2, description = $3, "updatedAt" = NOW()
    WHERE id = $1
    RETURNING *
  `, [id, data.name, data.description || null])
  return result.rows[0]
}

export async function countProductsByCategory(categoryId: string) {
  const result = await queryOne<{ count: string }>(`
    SELECT COUNT(*) as count FROM smartloja.products WHERE "categoryId" = $1
  `, [categoryId])
  return parseInt(result?.count || '0')
}

export async function deleteCategory(id: string) {
  await pool.query(`DELETE FROM smartloja.categories WHERE id = $1`, [id])
}

// Customers
export async function getCustomers(limit = 50, offset = 0) {
  return query(`
    SELECT * FROM smartloja.customers
    ORDER BY name
    LIMIT $1 OFFSET $2
  `, [limit, offset])
}

export async function getCustomerById(id: string) {
  return queryOne(`
    SELECT * FROM smartloja.customers WHERE id = $1
  `, [id])
}

export async function getCustomersAPI(search?: string) {
  if (search) {
    return query(`
      SELECT * FROM smartloja.customers
      WHERE active = true AND (
        name ILIKE $1 OR phone LIKE $1 OR email ILIKE $1 OR cpf LIKE $1
      )
      ORDER BY name
    `, [`%${search}%`])
  }
  return query(`
    SELECT * FROM smartloja.customers
    WHERE active = true
    ORDER BY name
  `)
}

export async function getCustomerByIdWithSales(id: string) {
  const customer = await queryOne(`SELECT * FROM smartloja.customers WHERE id = $1`, [id])
  if (!customer) return null

  const sales = await query(`
    SELECT s.* FROM smartloja.sales s
    WHERE s."customerId" = $1
    ORDER BY s."createdAt" DESC
    LIMIT 10
  `, [id])

  for (const sale of sales) {
    const items = await query(`
      SELECT si.*, p.name as "productName"
      FROM smartloja.sale_items si
      LEFT JOIN smartloja.products p ON si."productId" = p.id
      WHERE si."saleId" = $1
    `, [sale.id])
    sale.items = items.map((item: any) => ({
      ...item,
      product: { name: item.productName },
    }))
  }

  return { ...customer, sales }
}

export async function findCustomerByCpf(cpf: string, excludeId?: string) {
  if (excludeId) {
    return queryOne(`SELECT id FROM smartloja.customers WHERE cpf = $1 AND id != $2`, [cpf, excludeId])
  }
  return queryOne(`SELECT id FROM smartloja.customers WHERE cpf = $1`, [cpf])
}

export async function findCustomerByEmail(email: string, excludeId?: string) {
  if (excludeId) {
    return queryOne(`SELECT id FROM smartloja.customers WHERE email = $1 AND id != $2`, [email, excludeId])
  }
  return queryOne(`SELECT id FROM smartloja.customers WHERE email = $1`, [email])
}

export async function createCustomer(data: {
  name: string
  email?: string | null
  cpf?: string | null
  phone?: string | null
  whatsapp?: string | null
  instagram?: string | null
  birthDate?: Date | null
  type?: string
  notes?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  acceptsMarketing?: boolean
}) {
  const result = await pool.query(`
    INSERT INTO smartloja.customers (
      id, name, email, cpf, phone, whatsapp, instagram, "birthDate",
      type, notes, address, city, state, "zipCode", "acceptsMarketing",
      active, "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, true, NOW(), NOW()
    ) RETURNING *
  `, [
    data.name,
    data.email || null,
    data.cpf || null,
    data.phone || null,
    data.whatsapp || null,
    data.instagram || null,
    data.birthDate || null,
    data.type || 'REGULAR',
    data.notes || null,
    data.address || null,
    data.city || null,
    data.state || null,
    data.zipCode || null,
    data.acceptsMarketing ?? true,
  ])
  return result.rows[0]
}

export async function updateCustomer(id: string, data: {
  name?: string
  email?: string | null
  cpf?: string | null
  phone?: string | null
  whatsapp?: string | null
  instagram?: string | null
  birthDate?: Date | null
  type?: string
  notes?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  acceptsMarketing?: boolean
  active?: boolean
}) {
  const result = await pool.query(`
    UPDATE smartloja.customers SET
      name = COALESCE($2, name),
      email = $3,
      cpf = $4,
      phone = $5,
      whatsapp = $6,
      instagram = $7,
      "birthDate" = $8,
      type = COALESCE($9, type),
      notes = $10,
      address = $11,
      city = $12,
      state = $13,
      "zipCode" = $14,
      "acceptsMarketing" = COALESCE($15, "acceptsMarketing"),
      active = COALESCE($16, active),
      "updatedAt" = NOW()
    WHERE id = $1
    RETURNING *
  `, [
    id,
    data.name,
    data.email,
    data.cpf,
    data.phone,
    data.whatsapp,
    data.instagram,
    data.birthDate,
    data.type,
    data.notes,
    data.address,
    data.city,
    data.state,
    data.zipCode,
    data.acceptsMarketing,
    data.active,
  ])
  return result.rows[0]
}

export async function deactivateCustomer(id: string) {
  await pool.query(`UPDATE smartloja.customers SET active = false, "updatedAt" = NOW() WHERE id = $1`, [id])
}

// Suppliers
export async function getSuppliersWithCount() {
  const suppliers = await query(`
    SELECT s.*,
      (SELECT COUNT(*) FROM smartloja.products p WHERE p."supplierId" = s.id) as "productCount"
    FROM smartloja.suppliers s
    WHERE s.active = true
    ORDER BY s.name
  `)
  return suppliers.map((s: any) => ({
    ...s,
    _count: { products: parseInt(s.productCount || '0') },
  }))
}

export async function createSupplier(data: {
  name: string
  cnpj?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  notes?: string | null
}) {
  const result = await pool.query(`
    INSERT INTO smartloja.suppliers (id, name, cnpj, phone, email, address, notes, active, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, true, NOW(), NOW())
    RETURNING *
  `, [data.name, data.cnpj || null, data.phone || null, data.email || null, data.address || null, data.notes || null])
  return result.rows[0]
}

export async function updateSupplier(id: string, data: {
  name?: string
  cnpj?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  notes?: string | null
}) {
  const result = await pool.query(`
    UPDATE smartloja.suppliers SET
      name = COALESCE($2, name),
      cnpj = $3,
      phone = $4,
      email = $5,
      address = $6,
      notes = $7,
      "updatedAt" = NOW()
    WHERE id = $1
    RETURNING *
  `, [id, data.name, data.cnpj, data.phone, data.email, data.address, data.notes])
  return result.rows[0]
}

export async function unlinkProductsFromSupplier(supplierId: string) {
  await pool.query(`UPDATE smartloja.products SET "supplierId" = NULL WHERE "supplierId" = $1`, [supplierId])
}

export async function deleteSupplier(id: string) {
  await pool.query(`DELETE FROM smartloja.suppliers WHERE id = $1`, [id])
}

// Payment Methods
export async function getPaymentMethods() {
  return query(`
    SELECT * FROM smartloja.payment_methods
    WHERE active = true
    ORDER BY name
  `)
}

// Sales
export async function getSalesAPI(options: {
  startDate?: string
  endDate?: string
  status?: string
}) {
  let sql = `
    SELECT s.*,
      c.name as "customerName",
      u.name as "userName"
    FROM smartloja.sales s
    LEFT JOIN smartloja.customers c ON s."customerId" = c.id
    LEFT JOIN smartloja.users u ON s."userId" = u.id
    WHERE 1=1
  `
  const params: any[] = []
  let paramIndex = 1

  if (options.startDate) {
    sql += ` AND s."createdAt" >= $${paramIndex}`
    params.push(new Date(options.startDate))
    paramIndex++
  }

  if (options.endDate) {
    sql += ` AND s."createdAt" <= $${paramIndex}`
    params.push(new Date(options.endDate))
    paramIndex++
  }

  if (options.status) {
    sql += ` AND s.status = $${paramIndex}`
    params.push(options.status)
    paramIndex++
  }

  sql += ` ORDER BY s."createdAt" DESC LIMIT 100`

  const sales = await query(sql, params)

  // Get items and payments for each sale
  for (const sale of sales) {
    const items = await query(`
      SELECT si.*, p.name as "productName", p.sku as "productSku"
      FROM smartloja.sale_items si
      LEFT JOIN smartloja.products p ON si."productId" = p.id
      WHERE si."saleId" = $1
    `, [sale.id])
    sale.items = items.map((item: any) => ({
      ...item,
      product: { name: item.productName, sku: item.productSku },
    }))

    const payments = await query(`
      SELECT sp.*, pm.name as "paymentMethodName", pm.type as "paymentMethodType"
      FROM smartloja.sale_payments sp
      LEFT JOIN smartloja.payment_methods pm ON sp."paymentMethodId" = pm.id
      WHERE sp."saleId" = $1
    `, [sale.id])
    sale.payments = payments.map((payment: any) => ({
      ...payment,
      paymentMethod: { name: payment.paymentMethodName, type: payment.paymentMethodType },
    }))

    sale.customer = sale.customerName ? { name: sale.customerName } : null
    sale.user = sale.userName ? { name: sale.userName } : null
  }

  return sales
}

export async function getProductForSale(productId: string) {
  return queryOne(`SELECT * FROM smartloja.products WHERE id = $1`, [productId])
}

export async function getPaymentMethodById(id: string) {
  return queryOne(`SELECT * FROM smartloja.payment_methods WHERE id = $1`, [id])
}

export async function getActiveCardMachine() {
  return queryOne(`SELECT * FROM smartloja.card_machines WHERE active = true LIMIT 1`)
}

export async function createSaleTransaction(data: {
  code: string
  customerId?: string
  userId: string
  subtotal: number
  discountType?: string | null
  discountValue?: number | null
  discountAmount: number
  total: number
  totalCost: number
  profit: number
  netProfit: number
  totalFees: number
  items: Array<{
    productId: string
    quantity: number
    unitPrice: number
    costPrice: number
    discount: number
    total: number
  }>
  payments: Array<{
    paymentMethodId: string
    amount: number
    installments?: number
  }>
}) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Create sale
    const saleResult = await client.query(`
      INSERT INTO smartloja.sales (
        id, code, "customerId", "userId", status, subtotal,
        "discountType", "discountValue", "discountAmount", total,
        "totalCost", profit, "netProfit", "totalFees", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, 'COMPLETED', $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()
      ) RETURNING *
    `, [
      data.code,
      data.customerId || null,
      data.userId,
      data.subtotal,
      data.discountType,
      data.discountValue,
      data.discountAmount,
      data.total,
      data.totalCost,
      data.profit,
      data.netProfit,
      data.totalFees,
    ])
    const sale = saleResult.rows[0]

    // Create sale items and update stock
    for (const item of data.items) {
      await client.query(`
        INSERT INTO smartloja.sale_items (
          id, "saleId", "productId", quantity, "unitPrice", "costPrice", discount, total, "createdAt"
        ) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW())
      `, [sale.id, item.productId, item.quantity, item.unitPrice, item.costPrice, item.discount, item.total])

      // Get current stock
      const productResult = await client.query(`SELECT stock FROM smartloja.products WHERE id = $1`, [item.productId])
      const currentStock = productResult.rows[0]?.stock || 0

      // Update stock
      await client.query(`UPDATE smartloja.products SET stock = stock - $2, "updatedAt" = NOW() WHERE id = $1`, [item.productId, item.quantity])

      // Create stock movement
      await client.query(`
        INSERT INTO smartloja.stock_movements (
          id, "productId", type, quantity, "previousStock", "newStock", reason, "userId", "saleId", "createdAt"
        ) VALUES (gen_random_uuid(), $1, 'SALE', $2, $3, $4, $5, $6, $7, NOW())
      `, [item.productId, item.quantity, currentStock, currentStock - item.quantity, `Venda #${sale.code}`, data.userId, sale.id])
    }

    // Create sale payments
    for (const payment of data.payments) {
      await client.query(`
        INSERT INTO smartloja.sale_payments (
          id, "saleId", "paymentMethodId", amount, installments, fee, "netAmount", "createdAt"
        ) VALUES (gen_random_uuid(), $1, $2, $3, $4, 0, $3, NOW())
      `, [sale.id, payment.paymentMethodId, payment.amount, payment.installments || 1])
    }

    // Update customer
    if (data.customerId) {
      await client.query(`
        UPDATE smartloja.customers SET
          "totalPurchases" = COALESCE("totalPurchases", 0) + $2,
          "lastPurchase" = NOW(),
          "updatedAt" = NOW()
        WHERE id = $1
      `, [data.customerId, data.total])
    }

    // Create financial entry
    await client.query(`
      INSERT INTO smartloja.financial_entries (
        id, type, status, description, amount, "dueDate", "paidDate", "paidAmount", category, "saleId", "createdAt", "updatedAt"
      ) VALUES (gen_random_uuid(), 'INCOME', 'PAID', $1, $2, NOW(), NOW(), $2, 'Vendas', $3, NOW(), NOW())
    `, [`Venda #${sale.code}`, data.total, sale.id])

    await client.query('COMMIT')

    // Get items and payments
    const items = await query(`SELECT * FROM smartloja.sale_items WHERE "saleId" = $1`, [sale.id])
    const payments = await query(`SELECT * FROM smartloja.sale_payments WHERE "saleId" = $1`, [sale.id])

    return { ...sale, items, payments }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// Store products (for public store)
export async function getFeaturedStoreProducts() {
  return query(`
    SELECT p.*, c.name as "categoryName", c.id as "categoryId"
    FROM smartloja.products p
    LEFT JOIN smartloja.categories c ON p."categoryId" = c.id
    WHERE p.active = true AND p."showInStore" = true AND p.featured = true AND p.stock > 0
    ORDER BY p."createdAt" DESC
    LIMIT 4
  `)
}

export async function getStoreProducts(categorySlug?: string) {
  if (categorySlug) {
    return query(`
      SELECT p.*, c.name as "categoryName", c.id as "categoryId"
      FROM smartloja.products p
      LEFT JOIN smartloja.categories c ON p."categoryId" = c.id
      WHERE p.active = true AND p."showInStore" = true AND p.stock > 0
        AND LOWER(c.name) LIKE LOWER($1)
      ORDER BY p."createdAt" DESC
      LIMIT 20
    `, [`%${categorySlug}%`])
  }

  return query(`
    SELECT p.*, c.name as "categoryName", c.id as "categoryId"
    FROM smartloja.products p
    LEFT JOIN smartloja.categories c ON p."categoryId" = c.id
    WHERE p.active = true AND p."showInStore" = true AND p.stock > 0
    ORDER BY p."createdAt" DESC
    LIMIT 20
  `)
}

export async function getStoreCategoriesWithCount() {
  return query(`
    SELECT c.*,
      (SELECT COUNT(*) FROM smartloja.products p
       WHERE p."categoryId" = c.id AND p.active = true AND p."showInStore" = true AND p.stock > 0) as "productCount"
    FROM smartloja.categories c
    WHERE c.active = true
    ORDER BY c.name
  `)
}

export async function getStoreProductById(id: string) {
  const product = await queryOne(`
    SELECT p.*, c.name as "categoryName"
    FROM smartloja.products p
    LEFT JOIN smartloja.categories c ON p."categoryId" = c.id
    WHERE p.id = $1 AND p.active = true AND p."showInStore" = true
  `, [id])

  if (product) {
    const images = await query(`
      SELECT * FROM smartloja.product_images
      WHERE "productId" = $1
      ORDER BY "order"
    `, [id])
    return { ...product, images }
  }

  return null
}

export async function getRelatedStoreProducts(categoryId: string, excludeId: string) {
  const products = await query(`
    SELECT p.*, c.name as "categoryName"
    FROM smartloja.products p
    LEFT JOIN smartloja.categories c ON p."categoryId" = c.id
    WHERE p."categoryId" = $1 AND p.id != $2
      AND p.active = true AND p."showInStore" = true AND p.stock > 0
    ORDER BY p."createdAt" DESC
    LIMIT 4
  `, [categoryId, excludeId])

  // Get first image for each product
  for (const product of products) {
    const images = await query(`
      SELECT * FROM smartloja.product_images
      WHERE "productId" = $1
      ORDER BY "order"
      LIMIT 1
    `, [product.id])
    product.images = images
  }

  return products
}

// Products API functions
export async function getProductsAPI(options: {
  search?: string
  categoryId?: string
  active?: boolean | null
}) {
  let sql = `
    SELECT p.*, c.name as "categoryName", c.id as "category_id",
      (SELECT url FROM smartloja.product_images pi WHERE pi."productId" = p.id ORDER BY pi."order" LIMIT 1) as "imageUrl"
    FROM smartloja.products p
    LEFT JOIN smartloja.categories c ON p."categoryId" = c.id
    WHERE 1=1
  `
  const params: any[] = []
  let paramIndex = 1

  if (options.search) {
    sql += ` AND (p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex} OR p.barcode ILIKE $${paramIndex})`
    params.push(`%${options.search}%`)
    paramIndex++
  }

  if (options.categoryId) {
    sql += ` AND p."categoryId" = $${paramIndex}`
    params.push(options.categoryId)
    paramIndex++
  }

  if (options.active !== null && options.active !== undefined) {
    sql += ` AND p.active = $${paramIndex}`
    params.push(options.active)
    paramIndex++
  }

  sql += ` ORDER BY p.name`

  const products = await query(sql, params)
  return products.map((p: any) => ({
    ...p,
    category: p.categoryName ? { id: p.category_id, name: p.categoryName } : null,
    images: p.imageUrl ? [{ url: p.imageUrl }] : [],
  }))
}

export async function getProductByIdWithDetails(id: string) {
  const product = await queryOne(`
    SELECT p.*, c.name as "categoryName", c.id as "category_id",
      s.id as "supplier_id", s.name as "supplierName"
    FROM smartloja.products p
    LEFT JOIN smartloja.categories c ON p."categoryId" = c.id
    LEFT JOIN smartloja.suppliers s ON p."supplierId" = s.id
    WHERE p.id = $1
  `, [id])

  if (!product) return null

  const images = await query(`
    SELECT * FROM smartloja.product_images WHERE "productId" = $1 ORDER BY "order"
  `, [id])

  const stockMovements = await query(`
    SELECT sm.*, u.name as "userName"
    FROM smartloja.stock_movements sm
    LEFT JOIN smartloja.users u ON sm."userId" = u.id
    WHERE sm."productId" = $1
    ORDER BY sm."createdAt" DESC
    LIMIT 10
  `, [id])

  return {
    ...product,
    category: product.categoryName ? { id: product.category_id, name: product.categoryName } : null,
    supplier: product.supplierName ? { id: product.supplier_id, name: product.supplierName } : null,
    images,
    stockMovements: stockMovements.map((sm: any) => ({
      ...sm,
      user: sm.userName ? { name: sm.userName } : null,
    })),
  }
}

export async function findProductBySku(sku: string, excludeId?: string) {
  if (excludeId) {
    return queryOne(`SELECT id FROM smartloja.products WHERE sku = $1 AND id != $2`, [sku, excludeId])
  }
  return queryOne(`SELECT id FROM smartloja.products WHERE sku = $1`, [sku])
}

export async function findProductByBarcode(barcode: string, excludeId?: string) {
  if (excludeId) {
    return queryOne(`SELECT id FROM smartloja.products WHERE barcode = $1 AND id != $2`, [barcode, excludeId])
  }
  return queryOne(`SELECT id FROM smartloja.products WHERE barcode = $1`, [barcode])
}

export async function createProduct(data: {
  sku: string
  barcode?: string | null
  name: string
  description?: string | null
  categoryId: string
  supplierId?: string | null
  costPrice: number
  salePrice: number
  stock?: number
  minStock?: number
  active?: boolean
  showInStore?: boolean
  featured?: boolean
}) {
  const result = await pool.query(`
    INSERT INTO smartloja.products (
      id, sku, barcode, name, description, "categoryId", "supplierId",
      "costPrice", "salePrice", stock, "minStock", active, "showInStore", featured,
      "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()
    ) RETURNING *
  `, [
    data.sku,
    data.barcode || null,
    data.name,
    data.description || null,
    data.categoryId,
    data.supplierId || null,
    data.costPrice,
    data.salePrice,
    data.stock || 0,
    data.minStock || 5,
    data.active ?? true,
    data.showInStore ?? true,
    data.featured ?? false,
  ])

  const product = result.rows[0]
  const category = await queryOne(`SELECT id, name FROM smartloja.categories WHERE id = $1`, [data.categoryId])
  return { ...product, category }
}

export async function updateProduct(id: string, data: {
  sku?: string
  barcode?: string | null
  name?: string
  description?: string | null
  categoryId?: string
  supplierId?: string | null
  costPrice?: number
  salePrice?: number
  stock?: number
  minStock?: number
  active?: boolean
  showInStore?: boolean
  featured?: boolean
}) {
  const result = await pool.query(`
    UPDATE smartloja.products SET
      sku = COALESCE($2, sku),
      barcode = $3,
      name = COALESCE($4, name),
      description = $5,
      "categoryId" = COALESCE($6, "categoryId"),
      "supplierId" = $7,
      "costPrice" = COALESCE($8, "costPrice"),
      "salePrice" = COALESCE($9, "salePrice"),
      stock = COALESCE($10, stock),
      "minStock" = COALESCE($11, "minStock"),
      active = COALESCE($12, active),
      "showInStore" = COALESCE($13, "showInStore"),
      featured = COALESCE($14, featured),
      "updatedAt" = NOW()
    WHERE id = $1
    RETURNING *
  `, [
    id,
    data.sku,
    data.barcode,
    data.name,
    data.description,
    data.categoryId,
    data.supplierId,
    data.costPrice,
    data.salePrice,
    data.stock,
    data.minStock,
    data.active,
    data.showInStore,
    data.featured,
  ])

  const product = result.rows[0]
  if (product) {
    const category = await queryOne(`SELECT id, name FROM smartloja.categories WHERE id = $1`, [product.categoryId])
    return { ...product, category }
  }
  return null
}

export async function createStockMovement(data: {
  productId: string
  type: string
  quantity: number
  previousStock: number
  newStock: number
  reason: string
  userId: string
}) {
  await pool.query(`
    INSERT INTO smartloja.stock_movements (
      id, "productId", type, quantity, "previousStock", "newStock", reason, "userId", "createdAt"
    ) VALUES (
      gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW()
    )
  `, [data.productId, data.type, data.quantity, data.previousStock, data.newStock, data.reason, data.userId])
}

export async function countSaleItemsByProduct(productId: string) {
  const result = await queryOne<{ count: string }>(`
    SELECT COUNT(*) as count FROM smartloja.sale_items WHERE "productId" = $1
  `, [productId])
  return parseInt(result?.count || '0')
}

export async function deactivateProduct(id: string) {
  await pool.query(`UPDATE smartloja.products SET active = false, "updatedAt" = NOW() WHERE id = $1`, [id])
}

export async function deleteProduct(id: string) {
  // Delete stock movements
  await pool.query(`DELETE FROM smartloja.stock_movements WHERE "productId" = $1`, [id])
  // Delete images
  await pool.query(`DELETE FROM smartloja.product_images WHERE "productId" = $1`, [id])
  // Delete product
  await pool.query(`DELETE FROM smartloja.products WHERE id = $1`, [id])
}

// Dashboard stats
export async function getDashboardStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todaySales = await queryOne<{ count: string; total: string }>(`
    SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total
    FROM smartloja.sales
    WHERE "createdAt" >= $1 AND status = 'COMPLETED'
  `, [today])

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const monthSales = await queryOne<{ count: string; total: string }>(`
    SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total
    FROM smartloja.sales
    WHERE "createdAt" >= $1 AND status = 'COMPLETED'
  `, [monthStart])

  const totalCustomers = await queryOne<{ count: string }>(`
    SELECT COUNT(*) as count FROM smartloja.customers
  `)

  const lowStockProducts = await queryOne<{ count: string }>(`
    SELECT COUNT(*) as count FROM smartloja.products
    WHERE stock <= "minStock" AND active = true
  `)

  return {
    todaySales: {
      count: parseInt(todaySales?.count || '0'),
      total: parseFloat(todaySales?.total || '0'),
    },
    monthSales: {
      count: parseInt(monthSales?.count || '0'),
      total: parseFloat(monthSales?.total || '0'),
    },
    totalCustomers: parseInt(totalCustomers?.count || '0'),
    lowStockProducts: parseInt(lowStockProducts?.count || '0'),
  }
}

// Financial
export async function getFinancialSummary() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const todayIncome = await queryOne<{ sum: string }>(`
    SELECT COALESCE(SUM("paidAmount"), 0) as sum FROM smartloja.financial_entries
    WHERE type = 'INCOME' AND status = 'PAID' AND "paidDate" >= $1
  `, [today])

  const todayExpense = await queryOne<{ sum: string }>(`
    SELECT COALESCE(SUM("paidAmount"), 0) as sum FROM smartloja.financial_entries
    WHERE type = 'EXPENSE' AND status = 'PAID' AND "paidDate" >= $1
  `, [today])

  const monthIncome = await queryOne<{ sum: string }>(`
    SELECT COALESCE(SUM("paidAmount"), 0) as sum FROM smartloja.financial_entries
    WHERE type = 'INCOME' AND status = 'PAID' AND "paidDate" >= $1
  `, [startOfMonth])

  const monthExpense = await queryOne<{ sum: string }>(`
    SELECT COALESCE(SUM("paidAmount"), 0) as sum FROM smartloja.financial_entries
    WHERE type = 'EXPENSE' AND status = 'PAID' AND "paidDate" >= $1
  `, [startOfMonth])

  const pendingIncome = await queryOne<{ sum: string }>(`
    SELECT COALESCE(SUM(amount), 0) as sum FROM smartloja.financial_entries
    WHERE type = 'INCOME' AND status IN ('PENDING', 'OVERDUE')
  `)

  const pendingExpense = await queryOne<{ sum: string }>(`
    SELECT COALESCE(SUM(amount), 0) as sum FROM smartloja.financial_entries
    WHERE type = 'EXPENSE' AND status IN ('PENDING', 'OVERDUE')
  `)

  const incomeValue = parseFloat(monthIncome?.sum || '0')
  const expenseValue = parseFloat(monthExpense?.sum || '0')

  return {
    todayIncome: parseFloat(todayIncome?.sum || '0'),
    todayExpense: parseFloat(todayExpense?.sum || '0'),
    monthIncome: incomeValue,
    monthExpense: expenseValue,
    balance: incomeValue - expenseValue,
    pendingIncome: parseFloat(pendingIncome?.sum || '0'),
    pendingExpense: parseFloat(pendingExpense?.sum || '0'),
  }
}

export async function getFinancialEntries(options: { type?: string; status?: string }) {
  let sql = `SELECT * FROM smartloja.financial_entries WHERE 1=1`
  const params: any[] = []
  let paramIndex = 1

  if (options.type) {
    sql += ` AND type = $${paramIndex}`
    params.push(options.type)
    paramIndex++
  }

  if (options.status) {
    sql += ` AND status = $${paramIndex}`
    params.push(options.status)
    paramIndex++
  }

  sql += ` ORDER BY "dueDate" DESC LIMIT 50`
  return query(sql, params)
}

export async function createFinancialEntry(data: {
  type: string
  status?: string
  description: string
  amount: number
  dueDate: Date
  paidDate?: Date | null
  paidAmount?: number | null
  category: string
  notes?: string | null
}) {
  const result = await pool.query(`
    INSERT INTO smartloja.financial_entries (
      id, type, status, description, amount, "dueDate", "paidDate", "paidAmount",
      category, notes, "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
    ) RETURNING *
  `, [
    data.type,
    data.status || 'PENDING',
    data.description,
    data.amount,
    data.dueDate,
    data.paidDate || null,
    data.paidAmount || null,
    data.category,
    data.notes || null,
  ])
  return result.rows[0]
}

export async function getFinancialChartData(startDate: Date, endDate: Date) {
  const income = await queryOne<{ sum: string }>(`
    SELECT COALESCE(SUM("paidAmount"), 0) as sum FROM smartloja.financial_entries
    WHERE type = 'INCOME' AND status = 'PAID' AND "paidDate" >= $1 AND "paidDate" <= $2
  `, [startDate, endDate])

  const expense = await queryOne<{ sum: string }>(`
    SELECT COALESCE(SUM("paidAmount"), 0) as sum FROM smartloja.financial_entries
    WHERE type = 'EXPENSE' AND status = 'PAID' AND "paidDate" >= $1 AND "paidDate" <= $2
  `, [startDate, endDate])

  return {
    income: parseFloat(income?.sum || '0'),
    expense: parseFloat(expense?.sum || '0'),
  }
}

// Accounts (Contas)
export async function getAccounts() {
  return query(`SELECT * FROM smartloja.accounts WHERE active = true ORDER BY name`)
}

export async function createAccount(data: {
  name: string
  type: string
  balance?: number
  description?: string | null
}) {
  const result = await pool.query(`
    INSERT INTO smartloja.accounts (id, name, type, balance, description, active, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), $1, $2, $3, $4, true, NOW(), NOW())
    RETURNING *
  `, [data.name, data.type, data.balance || 0, data.description || null])
  return result.rows[0]
}

export async function getAccountById(id: string) {
  return queryOne(`SELECT * FROM smartloja.accounts WHERE id = $1`, [id])
}

export async function updateAccount(id: string, data: {
  name?: string
  type?: string
  balance?: number
  description?: string | null
  active?: boolean
}) {
  const result = await pool.query(`
    UPDATE smartloja.accounts SET
      name = COALESCE($2, name),
      type = COALESCE($3, type),
      balance = COALESCE($4, balance),
      description = $5,
      active = COALESCE($6, active),
      "updatedAt" = NOW()
    WHERE id = $1
    RETURNING *
  `, [id, data.name, data.type, data.balance, data.description, data.active])
  return result.rows[0]
}

export async function deleteAccount(id: string) {
  await pool.query(`DELETE FROM smartloja.accounts WHERE id = $1`, [id])
}

// Expenses (Contas)
export async function getExpenses() {
  return query(`SELECT * FROM smartloja.expenses ORDER BY name`)
}

export async function createExpense(data: {
  name: string
  description?: string | null
  amount: number
  frequency: string
  dueDay?: number | null
  category: string
  nextDueDate: Date
}) {
  const result = await pool.query(`
    INSERT INTO smartloja.expenses (
      id, name, description, amount, frequency, "dueDay", category, "nextDueDate",
      active, "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW()
    ) RETURNING *
  `, [
    data.name,
    data.description || null,
    data.amount,
    data.frequency,
    data.dueDay || null,
    data.category,
    data.nextDueDate,
  ])
  return result.rows[0]
}

export async function updateExpense(id: string, data: {
  name?: string
  description?: string | null
  amount?: number
  frequency?: string
  dueDay?: number | null
  category?: string
  nextDueDate?: Date
  active?: boolean
}) {
  const result = await pool.query(`
    UPDATE smartloja.expenses SET
      name = COALESCE($2, name),
      description = $3,
      amount = COALESCE($4, amount),
      frequency = COALESCE($5, frequency),
      "dueDay" = $6,
      category = COALESCE($7, category),
      "nextDueDate" = COALESCE($8, "nextDueDate"),
      active = COALESCE($9, active),
      "updatedAt" = NOW()
    WHERE id = $1
    RETURNING *
  `, [
    id,
    data.name,
    data.description,
    data.amount,
    data.frequency,
    data.dueDay,
    data.category,
    data.nextDueDate,
    data.active,
  ])
  return result.rows[0]
}

export async function deleteExpense(id: string) {
  await pool.query(`DELETE FROM smartloja.expenses WHERE id = $1`, [id])
}

// Payment Methods
export async function findPaymentMethodByName(name: string) {
  return queryOne(`SELECT id FROM smartloja.payment_methods WHERE name = $1`, [name])
}

export async function createPaymentMethod(data: { name: string; type: string }) {
  const result = await pool.query(`
    INSERT INTO smartloja.payment_methods (id, name, type, active, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), $1, $2, true, NOW(), NOW())
    RETURNING *
  `, [data.name, data.type])
  return result.rows[0]
}

// Conversations
export async function findCustomerByWhatsapp(phone: string) {
  return queryOne(`
    SELECT * FROM smartloja.customers WHERE whatsapp LIKE $1
  `, [`%${phone}%`])
}

export async function upsertConversation(data: {
  channel: string
  externalId: string
  customerPhone?: string
  customerName?: string
  customerId?: string
}) {
  // Try to find existing conversation
  const existing = await queryOne(`
    SELECT * FROM smartloja.conversations WHERE channel = $1 AND "externalId" = $2
  `, [data.channel, data.externalId])

  if (existing) {
    // Update
    const result = await pool.query(`
      UPDATE smartloja.conversations SET
        "customerName" = COALESCE($3, "customerName"),
        "lastMessageAt" = NOW(),
        "updatedAt" = NOW()
      WHERE channel = $1 AND "externalId" = $2
      RETURNING *
    `, [data.channel, data.externalId, data.customerName])
    return result.rows[0]
  } else {
    // Create
    const result = await pool.query(`
      INSERT INTO smartloja.conversations (
        id, channel, "externalId", "customerPhone", "customerName", "customerId",
        status, "lastMessageAt", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, 'OPEN', NOW(), NOW(), NOW()
      ) RETURNING *
    `, [data.channel, data.externalId, data.customerPhone, data.customerName, data.customerId])
    return result.rows[0]
  }
}

export async function createConversationMessage(data: {
  conversationId: string
  direction: string
  type: string
  content: string
  externalId?: string
  mediaUrl?: string
}) {
  const result = await pool.query(`
    INSERT INTO smartloja.conversation_messages (
      id, "conversationId", direction, type, content, "externalId", "mediaUrl",
      status, "createdAt"
    ) VALUES (
      gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'SENT', NOW()
    ) RETURNING *
  `, [
    data.conversationId,
    data.direction,
    data.type,
    data.content,
    data.externalId || null,
    data.mediaUrl || null,
  ])
  return result.rows[0]
}

export async function updateConversationMessageStatus(externalId: string, status: string, deliveredAt?: Date, readAt?: Date) {
  await pool.query(`
    UPDATE smartloja.conversation_messages SET
      status = $2,
      "deliveredAt" = COALESCE($3, "deliveredAt"),
      "readAt" = COALESCE($4, "readAt")
    WHERE "externalId" = $1
  `, [externalId, status, deliveredAt, readAt])
}

export async function getMessageTemplateById(id: string) {
  return queryOne(`SELECT * FROM smartloja.message_templates WHERE id = $1`, [id])
}

export async function updateConversationLastMessage(id: string) {
  await pool.query(`UPDATE smartloja.conversations SET "lastMessageAt" = NOW(), "updatedAt" = NOW() WHERE id = $1`, [id])
}

// N8n and Evolution config
export async function getN8nConfigFromDb() {
  const settings = await queryOne(`SELECT * FROM smartloja."StoreSettings" LIMIT 1`)
  if (!settings?.n8nUrl || !settings?.n8nWebhookUrl) {
    return null
  }
  return {
    url: settings.n8nUrl,
    apiKey: settings.n8nApiKey,
    webhookUrl: settings.n8nWebhookUrl,
  }
}

export async function getEvolutionConfigFromDb() {
  const settings = await queryOne(`SELECT * FROM smartloja."StoreSettings" LIMIT 1`)
  if (!settings?.evolutionApiUrl || !settings?.evolutionApiKey || !settings?.evolutionInstance) {
    return null
  }
  return {
    apiUrl: settings.evolutionApiUrl,
    apiKey: settings.evolutionApiKey,
    instance: settings.evolutionInstance,
  }
}

// Low stock products
export async function getLowStockProducts(maxStock = 10, limit = 10) {
  const products = await query(`
    SELECT p.*, c.name as "categoryName"
    FROM smartloja.products p
    LEFT JOIN smartloja.categories c ON p."categoryId" = c.id
    WHERE p.active = true AND p.stock <= $1
    ORDER BY p.stock ASC
    LIMIT $2
  `, [maxStock, limit])

  return products.map((p: any) => ({
    ...p,
    category: { name: p.categoryName },
  }))
}

// Recent sales
export async function getRecentSales(limit = 5) {
  const sales = await query(`
    SELECT s.*, c.name as "customerName", u.name as "userName"
    FROM smartloja.sales s
    LEFT JOIN smartloja.customers c ON s."customerId" = c.id
    LEFT JOIN smartloja.users u ON s."userId" = u.id
    WHERE s.status = 'COMPLETED'
    ORDER BY s."createdAt" DESC
    LIMIT $1
  `, [limit])

  return sales.map((s: any) => ({
    ...s,
    customer: s.customerName ? { name: s.customerName } : null,
    user: s.userName ? { name: s.userName } : null,
  }))
}

// Dashboard chart data
export async function getDashboardChartData(startDate: Date, endDate: Date) {
  const result = await queryOne<{ total: string; profit: string }>(`
    SELECT COALESCE(SUM(total), 0) as total, COALESCE(SUM(profit), 0) as profit
    FROM smartloja.sales
    WHERE "createdAt" >= $1 AND "createdAt" <= $2 AND status = 'COMPLETED'
  `, [startDate, endDate])

  return {
    total: parseFloat(result?.total || '0'),
    profit: parseFloat(result?.profit || '0'),
  }
}

export default pool
