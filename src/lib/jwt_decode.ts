import { jwtDecode } from "jwt-decode";

export interface DecodedUser {
  id: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
  name: string;
  profile_picture: string | null;
}

export const JwtDecode = (payload: string): DecodedUser => {
  return jwtDecode<DecodedUser>(payload);
};
export interface DecodedUser {
  email: string;
  exp: number;
  iat: number;
  id: string;
  name: string;
  profile_picture: string | null;
  role: "USER" | "ADMIN" | string;
}
