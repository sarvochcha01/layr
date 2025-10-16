"use client";

import { useForm } from "react-hook-form";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ForgotPasswordForm {
  email: string;
}

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>();

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      await sendPasswordResetEmail(auth, data.email);
      alert("Password reset email sent!");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 p-8 w-full max-w-md border rounded-lg"
      >
        <h1 className="text-2xl font-bold">Forgot Password</h1>

        <div className="space-y-1">
          <Label>Email</Label>
          <Input
            type="email"
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && (
            <p className="text-red-600 text-sm">{errors.email.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full">
          Send Reset Email
        </Button>

        <div className="text-sm text-center">
          Back to{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </div>
      </form>
    </div>
  );
}
