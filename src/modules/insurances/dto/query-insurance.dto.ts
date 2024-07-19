import { ApiProperty } from '@nestjs/swagger';

import { PaginateDto } from '@/modules/paginations/dto/paginate.dto';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

enum BoltInsuranceStatus {
  NEW = '1 - New',
  QUOTED = '2 - Quoted',
  PENDING_SALE = '4 - Pending Sale',
  PENDING_APPROVAL_TEAM_LEADER = '5 - Pending Approval - Team Leader',
  PENDING_APPROVAL_CALL_CENTER_MANAGER = '6 - Pending Aproval - Call Center Manager',
  REJECTED_SALE_TEAM_LEADER = '4.1 Rejected Sale (Team Leader)',
  REJECTED_SALE_CALL_CENTER_MANAGER = '4.1 Rejected Sale (CALL Center Manager)',
  LOST = 'Lost',
  WON = 'Won',
}

export class QueryInsuranceDto extends PaginateDto {
  @ApiProperty({
    description:
      'Search by insuranceType, insuranceCompany, productType, packageName, firstName, lastName, applicantEmail ',
  })
  search?: string;

  @ApiProperty({ description: 'Filter insurances by insuredAt start date' })
  @IsOptional()
  @IsDateString()
  insuredAtStart?: string;

  @ApiProperty({ description: 'Filter insurances by insuredAt end date' })
  @IsOptional()
  @IsDateString()
  insuredAtEnd?: string;

  @ApiProperty({ description: 'Filter insurances by status' })
  @IsEnum(BoltInsuranceStatus, { each: true })
  @IsOptional()
  status?: string[] = [
    BoltInsuranceStatus.WON,
    BoltInsuranceStatus.LOST,
    BoltInsuranceStatus.NEW,
    BoltInsuranceStatus.QUOTED,
    BoltInsuranceStatus.PENDING_SALE,
    BoltInsuranceStatus.PENDING_APPROVAL_TEAM_LEADER,
    BoltInsuranceStatus.PENDING_APPROVAL_CALL_CENTER_MANAGER,
    BoltInsuranceStatus.REJECTED_SALE_TEAM_LEADER,
    BoltInsuranceStatus.REJECTED_SALE_CALL_CENTER_MANAGER,
  ];

  @ApiProperty({
    description:
      'ex. insurance.insuranceType, insurance.insuranceCompany, insurance.productType, insurance.insuredAt, insurance.policyNumber',
  })
  sortBy?: string = 'insurance.insuredAt';

  @ApiProperty({
    description: 'ASC or DESC',
  })
  sortDirection?: string = 'DESC';
}
