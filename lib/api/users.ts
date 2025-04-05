import { User } from "@/types/interfaces";

/**
 * API client for user-related operations
 * Updated to work with our simplified wallet authentication
 */
export const usersApi = {
  /**
   * Fetch user by ID
   */
  async getUser(id: string): Promise<User> {
    const response = await fetch(`/api/users/${id}`);

    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }

    return response.json();
  },

  /**
   * Fetch user by wallet address
   */
  async getUserByAddress(address: string): Promise<User> {
    const response = await fetch(`/api/users?address=${address}`);

    if (!response.ok) {
      throw new Error("Failed to fetch user by address");
    }

    return response.json();
  },

  /**
   * Update user profile
   */
  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to update user");
    }

    return response.json();
  },
};
