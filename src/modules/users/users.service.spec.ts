import { InviteUserDto, ResendInviteDto } from '../staffs/dto/invite-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PaginationsService } from './../paginations/paginations.service';
import { S3FileService } from './../../services/s3-file.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { ModuleMocker } from 'jest-mock';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/db/entities/user.entity';
import { UserRole, UserStatus } from '@/common/enums/user.enum';
import { QueryUserDto, SetupAccountDto, UpdateUserDto } from './dto';
import { EmailService } from '../email/email.service';
import { RegisterUserDto } from './dto/register-user.dto';

const moduleMocker = new ModuleMocker(global);
const user: User = {
  id: 1,
  firstName: 'Sawanya',
  lastName: 'Chantarakana',
  email: 'jane@sennalabs.com',
  password: 'AAAA',
  status: UserStatus.UNVERIFIED,
  phoneNumber: null,
  profileImageUrl: null,
  hashedRefreshToken: null,
  lastSignInAt: null,
  createdAt: null,
  updatedAt: null,
  role: UserRole.DEALER,
  isNewsLetter: true,
  uid: 'O000001',
  deletedAt: new Date(),
  reports: [],
  resetPasswordToken: null,
  resetPasswordExpiredAt: null,
  province: 'Bangkok',
  district: 'Bangook noi',
  zipCode: '13200',
  inviteToken: null,
  verifiedAt: null,
  verifiedToken: null,
};
const userTwo: User = {
  id: 1,
  firstName: 'Nattaphon',
  lastName: 'Bunsuwan',
  email: 'nat@sennalabs.com',
  password: 'AAAA',
  status: UserStatus.UNVERIFIED,
  phoneNumber: null,
  profileImageUrl: null,
  hashedRefreshToken: null,
  lastSignInAt: null,
  createdAt: null,
  updatedAt: null,
  role: UserRole.DEALER,
  isNewsLetter: true,
  uid: 'O000001',
  deletedAt: new Date(),
  reports: [],
  resetPasswordToken: null,
  resetPasswordExpiredAt: null,
  province: 'Bangkok',
  district: 'Bangook noi',
  zipCode: '13200',
  inviteToken: null,
  verifiedAt: null,
  verifiedToken: null,
};
describe('UsersService', () => {
  let service: UsersService;
  let s3FileService: S3FileService;
  let paginationsService: PaginationsService;
  let emailService: EmailService;
  let configService: ConfigService;
  let userRepo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        S3FileService,
        PaginationsService,
        EmailService,
        ConfigService,
        JwtService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    s3FileService = module.get<S3FileService>(S3FileService);
    paginationsService = module.get<PaginationsService>(PaginationsService);
    emailService = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Register', () => {
    describe('Register in role private', () => {
      it('should be register user in role private', async () => {
        const registerUser: RegisterUserDto = {
          firstName: 'Sawanya',
          lastName: 'Chantarakana',
          email: 'jane@sennalabs.com',
          isNewsLetter: true,
          phoneNumber: null,
          role: UserRole.PRIVATE,
        };
        user.role = UserRole.PRIVATE;

        const output: User = {
          id: 1,
          firstName: 'Sawanya',
          lastName: 'Chantarakana',
          email: 'jane@sennalabs.com',
          password: 'AAAA',
          status: UserStatus.UNVERIFIED,
          phoneNumber: null,
          profileImageUrl: null,
          hashedRefreshToken: null,
          lastSignInAt: null,
          createdAt: null,
          updatedAt: null,
          role: UserRole.PRIVATE,
          isNewsLetter: true,
          uid: 'O000001',
          deletedAt: new Date(),
          reports: [],
          resetPasswordToken: null,
          resetPasswordExpiredAt: null,
          inviteToken: null,
          verifiedAt: null,
          verifiedToken: null,
        };
        jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(null);
        jest.spyOn(userRepo, 'create').mockReturnValueOnce(user);
        jest.spyOn(userRepo, 'save').mockResolvedValueOnce(output);
        expect(await service.register(registerUser)).toEqual(output);
      });
    });
  });

  describe('Setup account', () => {
    it('should be setup account', async () => {
      const dto: SetupAccountDto = {
        firstName: 'Sawanya',
        lastName: 'Chantarakana',
        phoneNumber: null,
        password: 'Password',
      };
      user.role = UserRole.DEALER;
      const image = null;
      const output: User = {
        id: 1,
        firstName: 'Sawanya',
        lastName: 'Chantarakana',
        email: 'jane@sennalabs.com',
        password:
          '$argon2id$v=19$m=65536,t=3,p=4$4jA1nkii1yG+1ZAaEFFKNA$6D+mzS5xH/eHsOpbcJvaILOL6i13K/xea1HxowomTrU',
        status: UserStatus.WAITING_APPROVE,
        phoneNumber: null,
        profileImageUrl: null,
        hashedRefreshToken: null,
        lastSignInAt: null,
        createdAt: null,
        updatedAt: null,
        role: UserRole.DEALER,
        isNewsLetter: true,
        uid: 'O000001',
        deletedAt: new Date(),
        reports: [],
        resetPasswordToken: null,
        resetPasswordExpiredAt: null,
        inviteToken: null,
        verifiedAt: null,
        verifiedToken: null,
      };
      const id = 1;
      jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(user);
      jest.spyOn(userRepo, 'preload').mockResolvedValueOnce(user);
      jest.spyOn(userRepo, 'save').mockResolvedValueOnce(output);
      expect(await service.setupAccount(id, dto, image)).toEqual(output);
    });
  });
  it('should be not setup account because token not match', async () => {
    const dto: SetupAccountDto = {
      firstName: 'Sawanya',
      lastName: 'Chantarakana',
      phoneNumber: null,
      password: 'Password',
      inviteToken: 'tokenA',
    };
    user.role = UserRole.DEALER;
    const image = null;
    const output: User = {
      id: 1,
      firstName: 'Sawanya',
      lastName: 'Chantarakana',
      email: 'jane@sennalabs.com',
      password:
        '$argon2id$v=19$m=65536,t=3,p=4$4jA1nkii1yG+1ZAaEFFKNA$6D+mzS5xH/eHsOpbcJvaILOL6i13K/xea1HxowomTrU',
      status: UserStatus.WAITING_APPROVE,
      phoneNumber: null,
      profileImageUrl: null,
      hashedRefreshToken: null,
      lastSignInAt: null,
      createdAt: null,
      updatedAt: null,
      role: UserRole.DEALER,
      isNewsLetter: true,
      uid: 'O000001',
      deletedAt: new Date(),
      reports: [],
      resetPasswordToken: null,
      resetPasswordExpiredAt: null,
      inviteToken: 'TokenB',
      verifiedAt: null,
      verifiedToken: null,
    };
    const id = 1;
    jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(user);
    await expect(service.setupAccount(id, dto, image)).rejects.toThrow(
      `Token is not match`,
    );
  });

  it('should be sent request reset password', async () => {
    const email = 'carmeup.private@gmail.com';
    jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(user);
    jest.spyOn(userRepo, 'save').mockResolvedValueOnce(user);
    expect(await service.forgetPassword(email)).toEqual({
      message: 'Success',
    });
  });

  it('should be  return success when request reset password even user not found', async () => {
    const email = 'carmeup.private@gmail.com';
    jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(null);
    expect(await service.forgetPassword(email)).toEqual({
      message: 'Success',
    });
  });

  it('should update user', async () => {
    const id = 1;
    const image = null;
    const dto: UpdateUserDto = {
      firstName: 'Sawanya',
      lastName: 'Chantarakana',
      status: UserStatus.WAITING_APPROVE,
      phoneNumber: null,
      deleteImage: null,
      lineId: 'sawanya123',
      province: 'Bangkok',
      district: 'Bangook noi',
      zipCode: '13200',
    };
    const output: User = {
      id: 1,
      firstName: 'Sawanya',
      lastName: 'Chantarakana',
      email: 'jane@sennalabs.com',
      password:
        '$argon2id$v=19$m=65536,t=3,p=4$4jA1nkii1yG+1ZAaEFFKNA$6D+mzS5xH/eHsOpbcJvaILOL6i13K/xea1HxowomTrU',
      status: UserStatus.WAITING_APPROVE,
      phoneNumber: null,
      profileImageUrl: null,
      hashedRefreshToken: null,
      lastSignInAt: null,
      createdAt: null,
      updatedAt: null,
      role: UserRole.DEALER,
      isNewsLetter: true,
      uid: 'O000001',
      deletedAt: new Date(),
      reports: [],
      resetPasswordToken: null,
      resetPasswordExpiredAt: null,
      lineId: 'sawanya123',
      province: 'Bangkok',
      district: 'Bangook noi',
      zipCode: '13200',
      inviteToken: null,
      verifiedAt: null,
      verifiedToken: null,
    };
    jest.spyOn(userRepo, 'preload').mockResolvedValueOnce(user);
    jest.spyOn(userRepo, 'save').mockResolvedValueOnce(output);
    expect(await service.update(id, image, dto)).toEqual(output);
  });

  it('should be find all users', async () => {
    const query: QueryUserDto = {
      limitPerPage: 20,
      page: 1,
      all: false,
      search: null,
      sortDirection: 'DESC',
      sortBy: 'user.id',
      status: [UserStatus.VERIFIED],
      role: UserRole.PRIVATE,
    };
    const qb: any = {
      createQueryBuilder: () => qb,
      andWhere: () => qb,
      orderBy: () => qb,
    };
    const output = {
      data: [user],
      meta: {
        totalItems: 1,
        itemsPerPage: '20',
        totalPages: 1,
        currentPage: '1',
      },
    };
    jest
      .spyOn(userRepo, 'createQueryBuilder')
      .mockImplementationOnce(jest.fn().mockReturnValueOnce(qb));
    jest
      .spyOn(paginationsService, 'paginate')
      .mockImplementationOnce(jest.fn().mockReturnValueOnce(output));

    expect(await service.findAll(query)).toEqual(output);
  });
});
