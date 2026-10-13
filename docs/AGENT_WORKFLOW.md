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
import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Table, Column } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { productApi } from '../../api/product.api';
import { Product } from '../../types/product';
import { useLiveSync } from '../../core/socket/useLiveSync';

export const ProductListPage: React.FC = () => {
  const queryClient = useQueryClient();

  // 1. TanStack Query ile otomatik cache & sunucu state'i
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productApi.getAll(),
  });

  // 2. Canlı WebSocket senkronizasyonu (başka kullanıcı veri değiştirdiğinde anında taze)
  useLiveSync('products', () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
  });

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
        isLoading={isLoading}
        keyExtractor={(p) => p.id}
      />
    </Card>
  );
};
```

### 7. Çekirdek Yeteneklerin Kullanımı (Core Recipes)

#### A. Dinamik Ayar Okuma (Hardcoding'den Kaçınma):
```typescript
@Injectable()
export class OrdersService {
  constructor(private readonly settings: SystemSettingsService) {}

  async calculateShipping(total: number) {
    const freeShippingThreshold = this.settings.getNumber('FREE_SHIPPING_THRESHOLD', 500);
    return total >= freeShippingThreshold ? 0 : 50;
  }
}
```

#### B. Özelliği Dinamik Bayrağa Bağlama (Feature Flag):
```typescript
// Backend:
@Get('export')
@RequireFeature('PRODUCT_EXPORT')
exportExcel() { ... }

// Frontend:
<FeatureGate flag="PRODUCT_EXPORT">
  <Button onClick={handleExport}>Excel İndir</Button>
</FeatureGate>
```

#### C. Kritik Eylemi Loglama (Audit Log):
```typescript
await this.auditLog.log({
  userId: currentUser.sub,
  username: currentUser.preferred_username,
  action: 'PRICE_UPDATE',
  resource: 'PRODUCT',
  resourceId: product.id,
  oldValues: { price: oldPrice },
  newValues: { price: newPrice },
});
```

#### D. Canlı WebSocket Bildirimi Fırlatma:
```typescript
// Backend'de veri değişince tüm istemcilere sinyal gönder:
this.eventsGateway.broadcastEvent('ENTITY_UPDATED', updatedProduct, 'products');
```

#### E. React Hook Form + Zod ile Tip Güvenli Form:
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2, 'En az 2 karakter olmalıdır'),
  price: z.number().min(0, 'Fiyat 0 veya büyük olmalıdır'),
});

type FormValues = z.infer<typeof schema>;

export const ProductForm = ({ onSubmit }: { onSubmit: (data: FormValues) => void }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input label="Ürün Adı" error={errors.name?.message} {...register('name')} />
      <Input label="Fiyat" type="number" error={errors.price?.message} {...register('price', { valueAsNumber: true })} />
      <Button type="submit">Kaydet</Button>
    </form>
  );
};
```

### 8. Adım: Doğrulama (Verification)

Ajan her modülü bitirdiğinde mutlaka kök dizinden şu kontrolü koşturmalıdır:
```bash
npm run check
```
