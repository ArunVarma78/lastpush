"use client";
import { UserDetailContext } from "@/context/UserDetailContext";
import { supabase } from "@/services/supabaseClient";
import { useContext, useEffect, useState } from "react";

function Provider({ children }) {
  const [user, setUser] = useState();

  useEffect(() => {
    CreateNewUser();
  }, []);

  const CreateNewUser = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      // Check if user already exists
      const { data: Users, error: fetchError } = await supabase
        .from("Users")
        .select("*")
        .eq("email", authUser?.email);

      if (fetchError) {
        console.error("Error fetching user:", fetchError);
        return;
      }

      // If not, create new user
      if (Users?.length === 0) {
        const { data: newUser, error: insertError } = await supabase
          .from("Users")
          .insert([
            {
              name: authUser?.user_metadata?.name,
              email: authUser?.email,
              picture: authUser?.user_metadata?.picture,
            },
          ])
          .select()
          .single();

        if (insertError) {
          console.error("Error creating user:", insertError);
          return;
        }

        setUser(newUser);
        return;
      }
      setUser(Users[0]);
    } catch (error) {
      console.error("Unexpected error in CreateNewUser:", error);
    }
  };

  return (
    <UserDetailContext.Provider value={{ user, setUser }}>
      <div>{children}</div>
    </UserDetailContext.Provider>
  );
}

export default Provider;

export const useUser = () => {
  const context = useContext(UserDetailContext);
  return context;
};
