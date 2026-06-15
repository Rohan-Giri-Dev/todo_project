"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs/legacy";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  LogIn,
  Mail,
  ShieldCheck,
} from "lucide-react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Signin() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  if (!isLoaded) {
    return null;
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!isLoaded) return;

    try {
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (result.status === "complete") {
        await setActive({
          session: result.createdSessionId,
        });

        router.push("/dashboard");
        return;
      }

      console.log("Sign-in status", result.status);
      setError("Sign in is not complete. Please finish the required steps.");
    } catch (err: unknown) {
      const clerkError = err as {
        errors?: { message: string }[];
      };

      setError(clerkError.errors?.[0]?.message || "Something went wrong");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <section className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <LogIn className="size-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to continue to your todo dashboard.
          </p>
        </div>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Use your email and password to access your account.
            </CardDescription>
            <CardAction>
              <div className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                Secure
              </div>
            </CardAction>
          </CardHeader>

          <CardContent>
            {error ? (
              <Alert className="mb-4" variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Sign in error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
                <AlertAction>
                  <Button
                    onClick={() => setError("")}
                    size="xs"
                    type="button"
                    variant="ghost"
                  >
                    Dismiss
                  </Button>
                </AlertAction>
              </Alert>
            ) : (
              <Alert className="mb-4">
                <ShieldCheck className="size-4" />
                <AlertTitle>Protected route</AlertTitle>
                <AlertDescription>
                  You need an active Clerk session to open protected pages.
                </AlertDescription>
              </Alert>
            )}

            <form className="space-y-5" onSubmit={submit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    autoComplete="email"
                    className="h-10 pl-9"
                    id="email"
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="you@example.com"
                    required
                    type="email"
                    value={emailAddress}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    autoComplete="current-password"
                    className="h-10 pl-9 pr-10"
                    id="password"
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                  />
                  <button
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    onClick={() => setShowPassword((value) => !value)}
                    type="button"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                className="h-10 w-full"
                disabled={!emailAddress || !password}
                type="submit"
              >
                Sign in
                <ArrowRight className="size-4" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-xs text-muted-foreground">
              Do not have an account?{" "}
              <Link
                className="font-medium text-foreground underline"
                href="/sign-up"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Protected by Clerk authentication.
        </p>
      </section>
    </main>
  );
}

export default Signin;
