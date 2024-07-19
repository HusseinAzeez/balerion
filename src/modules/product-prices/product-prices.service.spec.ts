import { ProductPriceType } from '@/common/enums/product-price.enum';
import { ProductPrice } from '@/db/entities/product-price.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryProductPriceDto } from './dto/product-price.dto';
import { ProductPricesService } from './product-prices.service';

const productPricesHotDeal: ProductPrice[] = [
  {
    id: 1,
    productType: ProductPriceType.HOT_DEAL,
    quantity: 1,
    price: 399,
    createdAt: null,
    updatedAt: null,
  },
  {
    id: 2,
    productType: ProductPriceType.HOT_DEAL,
    quantity: 5,
    price: 1795,
    createdAt: null,
    updatedAt: null,
  },
  {
    id: 3,
    productType: ProductPriceType.HOT_DEAL,
    quantity: 10,
    price: 2900,
    createdAt: null,
    updatedAt: null,
  },
  {
    id: 4,
    productType: ProductPriceType.HOT_DEAL,
    quantity: 20,
    price: 4980,
    createdAt: null,
    updatedAt: null,
  },
  {
    id: 5,
    productType: ProductPriceType.HOT_DEAL,
    quantity: 50,
    price: 9950,
    createdAt: null,
    updatedAt: null,
  },
  {
    id: 6,
    productType: ProductPriceType.HOT_DEAL,
    quantity: 100,
    price: 9900,
    createdAt: null,
    updatedAt: null,
  },
];

describe('ProductPricesService', () => {
  let service: ProductPricesService;
  let productPriceRepository: Repository<ProductPrice>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductPricesService,
        {
          provide: getRepositoryToken(ProductPrice),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ProductPricesService>(ProductPricesService);
    productPriceRepository = module.get<Repository<ProductPrice>>(
      getRepositoryToken(ProductPrice),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be find product price by type', async () => {
    const query: QueryProductPriceDto = {
      productPriceType: ProductPriceType.BUMPS,
    };

    jest
      .spyOn(productPriceRepository, 'find')
      .mockResolvedValueOnce(productPricesHotDeal);
    expect(await service.findAll(query)).toEqual(productPricesHotDeal);
  });
});
