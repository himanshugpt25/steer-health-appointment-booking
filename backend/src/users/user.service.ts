import { MongoDBUserRepository } from "./repositories/mongodb.user.repository";
import { IUser, ICreateUser } from "./interfaces/user.repository.interface";
import {
  ValidationError,
  NotFoundError,
  InternalServerError,
  CustomError,
} from "../errors/custom.error";

class UserService {
  constructor(private readonly userRepository: MongoDBUserRepository) {}

  async getUsers(): Promise<IUser[]> {
    try {
      return await this.userRepository.getUsers();
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error("Error fetching users:", error);
      throw new InternalServerError("Failed to fetch users");
    }
  }

  async getUserById(id: string): Promise<IUser> {
    try {
      if (!id) {
        throw new ValidationError("User ID is required");
      }
      const user = await this.userRepository.getUserById(id);
      if (!user) {
        throw new NotFoundError("User not found");
      }
      return user;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error("Error fetching user:", error);
      throw new InternalServerError("Failed to fetch user");
    }
  }

  async getUserByEmail(email: string): Promise<IUser> {
    try {
      if (!email) {
        throw new ValidationError("Email is required");
      }
      const user = await this.userRepository.getUserByEmail(email);
      if (!user) {
        throw new NotFoundError("User not found");
      }
      return user;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error("Error fetching user:", error);
      throw new InternalServerError("Failed to fetch user");
    }
  }

  async updateUser(id: string, userData: Partial<IUser>): Promise<IUser> {
    try {
      if (!id) {
        throw new ValidationError("User ID is required");
      }
      const user = await this.userRepository.updateUser(id, userData);
      if (!user) {
        throw new NotFoundError("User not found");
      }
      return user;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error("Error updating user:", error);
      throw new InternalServerError("Failed to update user");
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      if (!id) {
        throw new ValidationError("User ID is required");
      }
      const deleted = await this.userRepository.deleteUser(id);
      if (!deleted) {
        throw new NotFoundError("User not found");
      }
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error("Error deleting user:", error);
      throw new InternalServerError("Failed to delete user");
    }
  }

  async createUser(userData: ICreateUser): Promise<IUser> {
    try {
      if (
        !userData.email ||
        !userData.username ||
        !userData.role ||
        !userData.authentication
      ) {
        throw new ValidationError("Missing required fields");
      }
      return await this.userRepository.createUser(userData);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error("Error creating user:", error);
      throw new InternalServerError("Failed to create user");
    }
  }

  async getUserWithAuth(email: string): Promise<IUser> {
    try {
      if (!email) {
        throw new ValidationError("Email is required");
      }
      const user = await this.userRepository.getUserWithAuth(email);
      if (!user) {
        throw new NotFoundError("User not found");
      }
      return user;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error("Error fetching user with auth:", error);
      throw new InternalServerError("Failed to fetch user");
    }
  }

  async getUsersByRole(role: "doctor" | "patient" | "admin"): Promise<IUser[]> {
    try {
      return await this.userRepository.getUsersByRole(role);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error("Error fetching users by role:", error);
      throw new InternalServerError("Failed to fetch users");
    }
  }
}

export default UserService;
