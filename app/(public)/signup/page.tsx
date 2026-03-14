"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";

interface SignupForm {
  email: string;
  password: string;
}

export default function Signup() {
  const { signupWithEmail, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>();

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    try {
      await signupWithEmail(data.email, data.password);
      toast.success("Account created!");
      router.push("/projects");
    } catch (err: any) {
      toast.error("Sign up failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      router.push("/projects");
    } catch (err: any) {
      toast.error("Google sign-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-8">
        {/* App logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-foreground rounded-xl flex items-center justify-center shadow-lg">
            <span className="font-bold text-lg text-background">L</span>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight">Create your account</h1>
            <p className="text-sm text-muted-foreground mt-1">Start building with Layr</p>
          </div>
        </div>

        {/* Auth card */}
        <div className="bg-card border rounded-xl p-6 space-y-4 shadow-sm">
          {/* Google */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 h-10"
          >
            <FcGoogle className="text-lg" />
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-3 text-muted-foreground">or</span>
            </div>
          </div>

          {/* Email / Password form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Email</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                className="h-9"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && (
                <p className="text-destructive text-xs">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                className="h-9"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Minimum 6 characters" },
                })}
              />
              {errors.password && (
                <p className="text-destructive text-xs">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full h-9" disabled={isLoading}>
              {isLoading ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-foreground hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
