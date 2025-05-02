export interface IUser {
  id: string;
  username: string;
  email: string;
  role: "patient" | "doctor" | "admin";
  authentication?: {
    password?: string;
    salt?: string;
  };
  createdAt: Date;
}

// Interface for user creation where authentication is required
export interface ICreateUser extends Omit<IUser, "id" | "createdAt"> {
  authentication: {
    password: string;
    salt: string;
  };
}

export interface IUserRepository {
  getUsers(): Promise<IUser[]>;
  getUserById(id: string): Promise<IUser | null>;
  getUserByEmail(email: string): Promise<IUser | null>;
  createUser(user: ICreateUser): Promise<IUser>;
  updateUser(id: string, user: Partial<IUser>): Promise<IUser | null>;
  deleteUser(id: string): Promise<boolean>;
  getUserWithAuth(email: string): Promise<IUser | null>;
  getUsersByRole(role: "doctor" | "patient" | "admin"): Promise<IUser[]>;
}
