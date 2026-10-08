import { SetMetadata } from '@nestjs/common';

export const META_UNPROTECTED = 'unprotected';
export const Public = () => SetMetadata(META_UNPROTECTED, true);
