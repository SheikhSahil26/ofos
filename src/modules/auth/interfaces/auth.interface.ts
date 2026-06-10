export interface IUser {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  passwordHash: string;
  profilePhoto?: string | null;
  isVerified: boolean;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

//Upcoming request Data
export interface ISignupDto {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
}

//What actual database requirement
export interface ICreateUserDto {
  fullName: string;
  email: string;
  mobile: string;
  passwordHash: string;
}

export interface ILoginDto {
  email: string;
  password: string;
}



type SuccessResponse = {
  status: "Success";
  message: string;
  data?: any;
}

type ErrorResponse = {
  status: "Error";
  message: string;
}

export type IApiResponse = SuccessResponse | ErrorResponse;