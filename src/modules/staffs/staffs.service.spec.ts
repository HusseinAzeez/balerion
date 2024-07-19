import { StaffRole, StaffStatus } from './../../common/enums/staff.eum';
import { Staff } from '@/db/entities/staff.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { StaffsService } from './staffs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3FileService } from '@/services';
import { InviteStaffDto, ResendInviteStaffDto } from './dto/invite-staff.dto';
import { SetupStaffDto } from './dto/setup-staff-account.dto';

const staff: Staff = {
  id: 1,
  firstName: 'jane',
  lastName: 'jansuda',
  password: 'password',
  email: 'jane@sennalabs.com',
  status: StaffStatus.INVITED,
  role: StaffRole.SUPER_ADMIN,
  createdAt: null,
  updatedAt: null,
  deletedAt: null,
};
const staffTwo: Staff = {
  id: 2,
  firstName: 'nat',
  lastName: 'bunsuwan',
  password: 'password',
  email: 'nat@sennalabs.com',
  status: StaffStatus.INVITED,
  role: StaffRole.MARKETING,
  createdAt: null,
  updatedAt: null,
  deletedAt: null,
};
describe('StaffsService', () => {
  let service: StaffsService;
  let s3FileService: S3FileService;
  let staffRepository: Repository<Staff>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffsService,
        S3FileService,
        {
          provide: getRepositoryToken(Staff),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<StaffsService>(StaffsService);
    s3FileService = module.get<S3FileService>(S3FileService);
    staffRepository = module.get<Repository<Staff>>(getRepositoryToken(Staff));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should be invite staff', async () => {
    const dto: InviteStaffDto = {
      staffs: [
        {
          email: 'jane@sennalabs.com',
          role: StaffRole.SUPER_ADMIN,
        },
        {
          email: 'nat@sennalabs.com',
          role: StaffRole.MARKETING,
        },
      ],
    };
    jest.spyOn(staffRepository, 'findOne').mockResolvedValueOnce(staff);
    jest.spyOn(staffRepository, 'findOne').mockResolvedValueOnce(staffTwo);
    jest.spyOn(staffRepository, 'create').mockReturnValueOnce(staff);
    jest.spyOn(staffRepository, 'save').mockResolvedValueOnce(staff);
    expect(await service.inviteStaff(dto)).toEqual({ message: 'Success' });
  });

  it('should be setup account', async () => {
    const dto: SetupStaffDto = {
      firstName: 'Sawanya',
      lastName: 'Chantarakana',
      phoneNumber: null,
      password: 'Password',
    };
    staff.role = StaffRole.SUPER_ADMIN;
    const image = null;
    const output: Staff = {
      id: 1,
      firstName: 'Sawanya',
      lastName: 'Chantarakana',
      email: 'jane@sennalabs.com',
      password:
        '$argon2id$v=19$m=65536,t=3,p=4$4jA1nkii1yG+1ZAaEFFKNA$6D+mzS5xH/eHsOpbcJvaILOL6i13K/xea1HxowomTrU',
      status: StaffStatus.VERIFIED,
      phoneNumber: null,
      createdAt: null,
      updatedAt: null,
      deletedAt: null,
      role: StaffRole.SUPER_ADMIN,
    };
    const id = 1;
    jest.spyOn(staffRepository, 'findOne').mockResolvedValueOnce(staff);
    jest.spyOn(staffRepository, 'preload').mockResolvedValueOnce(staff);
    jest.spyOn(staffRepository, 'save').mockResolvedValueOnce(output);
    expect(await service.setupStaffAccount(id, dto, image)).toEqual(output);
  });

  it('should be resent invite staff', async () => {
    const dto: ResendInviteStaffDto = {
      ids: [1, 2],
    };
    jest.spyOn(staffRepository, 'findOne').mockResolvedValueOnce(staff);
    jest.spyOn(staffRepository, 'findOne').mockResolvedValueOnce(staffTwo);
    expect(await service.resendInvite(dto)).toEqual({ message: 'Success' });
  });
});
