import {
  IUser,
  IUserRepository,
  ICreateUser,
} from "../interfaces/user.repository.interface";
import { UserModel } from "../schemas/users";

export class MongoDBUserRepository implements IUserRepository {
  async getUsers(): Promise<IUser[]> {
    const users = await UserModel.find();
    return users.map((user) => ({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      authentication: user.authentication || undefined,
      createdAt: user.createdAt,
    }));
  }

  async getUserById(id: string): Promise<IUser | null> {
    const user = await UserModel.findById(id);
    if (!user) return null;
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      authentication: user.authentication || undefined,
      createdAt: user.createdAt,
    };
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    const user = await UserModel.findOne({ email });
    if (!user) return null;
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      authentication: user.authentication || undefined,
      createdAt: user.createdAt,
    };
  }

  async createUser(userData: ICreateUser): Promise<IUser> {
    const user = await UserModel.create(userData);
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      authentication: user.authentication || undefined,
      createdAt: user.createdAt,
    };
  }

  async updateUser(
    id: string,
    userData: Partial<IUser>
  ): Promise<IUser | null> {
    const user = await UserModel.findByIdAndUpdate(id, userData, { new: true });
    if (!user) return null;
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      authentication: user.authentication || undefined,
      createdAt: user.createdAt,
    };
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }

  // Additional method to get user with authentication fields when needed
  async getUserWithAuth(email: string): Promise<IUser | null> {
    const user = await UserModel.findOne({ email }).select(
      "+authentication.password +authentication.salt"
    );
    if (!user) return null;
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      authentication: user.authentication,
      createdAt: user.createdAt,
    };
  }

  async getUsersByRole(role: "doctor" | "patient" | "admin"): Promise<IUser[]> {
    const users = await UserModel.find({ role });
    return users.map((user) => ({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      authentication: user.authentication || undefined,
      createdAt: user.createdAt,
    }));
  }
}
