import { Test, TestingModule } from '@nestjs/testing';
import { CmuCertifiedRequestsController } from './cmu-certified-requests.controller';
import { CmuCertifiedRequestsService } from './cmu-certified-requests.service';

describe('CmuCertifiedRequestsController', () => {
  let controller: CmuCertifiedRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CmuCertifiedRequestsController],
      providers: [CmuCertifiedRequestsService],
    }).compile();

    controller = module.get<CmuCertifiedRequestsController>(
      CmuCertifiedRequestsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
