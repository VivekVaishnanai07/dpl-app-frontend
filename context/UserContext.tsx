import React, { createContext, useContext, useState, useEffect } from "react";
import { decodeJWT } from "@/services/tokenService";
import { getUserDetails } from "@/services/userService";

const UserContext = createContext<any>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);

  const fetchUserData = async () => {
    try {
      let decodedUser: any = await decodeJWT();

      // If no token found, return early to avoid errors
      if (!decodedUser || !decodedUser.id) {
        console.warn("User not logged in. Skipping fetchUserData.");
        return;
      }

      const userDetails = await getUserDetails(decodedUser.id);
      setUser(userDetails);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    const checkUserToken = async () => {
      let decodedUser: any = await decodeJWT();
      if (decodedUser && decodedUser.id) {
        fetchUserData();
      }
    };
    checkUserToken();
  }, []);


  return (
    <UserContext.Provider value={{ user, setUser, fetchUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
