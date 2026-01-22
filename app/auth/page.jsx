"use client";
import { Button } from "@/components/ui/button";
import { supabase } from "@/services/supabaseClient";
import Image from "next/image";

function Login() {
  // Used to Sign in With Google
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) {
      console.error("Error:", error.message);
    }
  };

  return (
    <div className="flex items-col items-center justify-center h-screen">
      <div className="flex flex-col items-center border rounded-2xl p-8">
        <Image
          src={"/logo.jpeg"}
          alt="logo"
          width={400}
          height={100}
          className="w-[180px] "
        />

        <div className="flex item-center flex-col">
          <Image
            src={"/login.jpg"}
            alt="login"
            width={600}
            height={400}
            className="w-[400px] h-[250px] rounded-2xl"
          />

          <h2 className="text-2xl font-bold text-center mt-5">
            Welcome to LastPush
          </h2>

          <p className="text-gray-500 text-center text-sm mt-2">
            Sign In With Google Authentication
          </p>

          <Button className="mt-4 w-full" onClick={signInWithGoogle}>
            Login with Google
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Login;
