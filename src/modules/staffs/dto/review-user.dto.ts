import { UserReviewStatus } from '@/common/enums/user.enum';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class ReviewUserDto {
  @IsEnum(UserReviewStatus)
  @IsNotEmpty()
  status: UserReviewStatus = UserReviewStatus.APPROVED;

  @IsNotEmpty()
  userId: number;

  @IsOptional()
  rejectReason: string;

  postLimit = 0;
}
