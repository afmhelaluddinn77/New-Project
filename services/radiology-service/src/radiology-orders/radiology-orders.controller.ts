import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RadiologyOrdersService } from './radiology-orders.service';
import { CreateRadiologyOrderDto } from './dto/create-radiology-order.dto';
import { CreateRadiologyReportDto } from './dto/create-radiology-report.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  UserContext,
  RequestUserContext,
} from '../common/decorators/user-context.decorator';
import { MinioService } from '../storage/minio.service';

@Controller('orders')
@UseGuards(RolesGuard)
export class RadiologyOrdersController {
  constructor(
    private readonly radiologyOrdersService: RadiologyOrdersService,
    private readonly minioService: MinioService,
  ) {}

  @Post()
  @Roles('CLINICAL_WORKFLOW', 'PROVIDER')
  create(
    @Body() dto: CreateRadiologyOrderDto,
    @UserContext() user: RequestUserContext,
  ) {
    return this.radiologyOrdersService.create(dto, user);
  }

  @Get('pending')
  @Roles('RADIOLOGIST')
  findPending() {
    return this.radiologyOrdersService.findPending();
  }

  @Post(':id/report')
  @Roles('RADIOLOGIST')
  submitReport(
    @Param('id') id: string,
    @Body() dto: CreateRadiologyReportDto,
    @UserContext() user: RequestUserContext,
  ) {
    return this.radiologyOrdersService.submitReport(id, dto, user);
  }

  @Get(':id')
  @Roles('RADIOLOGIST', 'PROVIDER')
  findOne(@Param('id') id: string) {
    return this.radiologyOrdersService.findOne(id);
  }

  @Post(':id/images')
  @Roles('RADIOLOGIST', 'RADIOLOGY_TECH')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Param('id') orderId: string,
    @UploadedFile() file: Express.Multer.File,
    @UserContext() user: RequestUserContext,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    // Upload to MinIO
    const storagePath = await this.minioService.uploadImage(file, orderId);

    // Generate presigned URL for access
    const imageUrl = await this.minioService.getPreSignedUrl(storagePath, 24 * 60 * 60); // 24 hours

    // Create ImagingAsset record
    return this.radiologyOrdersService.createImagingAsset(orderId, {
      uri: imageUrl,
      mimeType: file.mimetype,
    });
  }
}
