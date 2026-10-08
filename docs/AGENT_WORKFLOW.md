# Yapay Zekâ Ajanı Feature Geliştirme Kılavuzu (Vertical Slice Örneği)

Bu belge, ajanın yeni bir iş alanı (domain) modülünü sıfırdan eklerken izlemesi gereken kod şablonlarını ve standartları gösterir.

---

## Örnek: `Product` (Ürün) Modülü Eklenişi

### 1. Adım: Entity Tanımı (`backend/src/modules/products/entities/product.entity.ts`)

```typescript
import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../core/entities/base.entity';

@Entity('products')
export class Product extends BaseEntity {
  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'int', default: 0 })
  stock!: number;
}
```

### 2. Adım: Migration Üretimi ve Çalıştırılması

```bash
cd backend
npm run migration:generate --name=CreateProductsTable
npm run migration:run
```

### 3. Adım: DTO'lar (`backend/src/modules/products/dto/create-product.dto.ts`)

```typescript
import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsNumber()
  @Min(0)
  stock!: number;
}
```

### 4. Adım: Controller (`backend/src/modules/products/products.controller.ts`)

```typescript
import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../core/auth/decorators/roles.decorator';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';

@ApiTags('Products')
@ApiBearerAuth('bearer')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Roles('ADMIN', 'USER')
  findAll() {
    return this.productsService.findAll();
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }
}
```

### 5. Adım: Frontend Tipi ve API (`frontend/src/types/product.ts` & `api/product.api.ts`)

```typescript
// frontend/src/types/product.ts
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  createdAt: string;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  price: number;
  stock: number;
}

// frontend/src/api/product.api.ts
import api from './client';
import { Product, CreateProductPayload } from '../types/product';

export const productApi = {
  getAll: () => api.get<Product[]>('/products').then((res) => res.data),
  create: (data: CreateProductPayload) => api.post<Product>('/products', data).then((res) => res.data),
};
```

### 6. Adım: Frontend Ekranı (`frontend/src/pages/products/ProductListPage.tsx`)

```tsx
import React, { useEffect, useState } from 'react';
import { Table, Column } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { productApi } from '../../api/product.api';
import { Product } from '../../types/product';

export const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    productApi.getAll().then(setProducts).finally(() => setLoading(false));
  }, []);

  const columns: Column<Product>[] = [
    { key: 'name', header: 'Ürün Adı' },
    { key: 'price', header: 'Fiyat (TL)', render: (p) => `${p.price} ₺` },
    { key: 'stock', header: 'Stok' },
  ];

  return (
    <Card title="Ürün Yönetimi" action={<Button size="sm">Yeni Ürün Ekle</Button>}>
      <Table
        columns={columns}
        data={products}
        isLoading={loading}
        keyExtractor={(p) => p.id}
      />
    </Card>
  );
};
```

### 7. Adım: Doğrulama (Verification)

Ajan her modülü bitirdiğinde mutlaka şu kontrolleri çalıştırıp sıfır hata almalıdır:
- Backend: `npm run typecheck`
- Frontend: `npm run typecheck`
