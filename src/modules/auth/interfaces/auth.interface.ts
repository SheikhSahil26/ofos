export interface ICreateUser {
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
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