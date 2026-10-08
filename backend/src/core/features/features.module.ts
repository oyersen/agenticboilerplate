import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeatureFlag } from './feature-flag.entity';
import { FeaturesService } from './features.service';
import { FeaturesController } from './features.controller';
import { FeatureFlagGuard } from './guards/feature-flag.guard';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([FeatureFlag])],
  controllers: [FeaturesController],
  providers: [FeaturesService, FeatureFlagGuard],
  exports: [FeaturesService, FeatureFlagGuard],
})
export class FeaturesModule {}
