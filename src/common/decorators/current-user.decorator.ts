import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface IAuthUser {
  userId: number;
  phoneNumber?: string;
  email?: string;
  role: 'FARMER' | 'field_officer' | 'admin';
  districtId?: number;
}

export const CurrentUser = createParamDecorator(
  (data: keyof IAuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
