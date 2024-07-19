import { Test, TestingModule } from '@nestjs/testing';
import { CmuCertifiedRequestsService } from './cmu-certified-requests.service';

describe('CmuCertifiedRequestsService', () => {
  let service: CmuCertifiedRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CmuCertifiedRequestsService],
    }).compile();

    service = module.get<CmuCertifiedRequestsService>(
      CmuCertifiedRequestsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
