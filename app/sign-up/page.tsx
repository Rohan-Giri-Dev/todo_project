"use client";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { useSignUp } from "@clerk/nextjs/legacy";
import { useRouter } from "next/navigation";

function Signup() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setcode] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  // this checks where clerk has finished loading
  //Don’t use signUp yet until Clerk is ready.
  if (!isLoaded) {
    return null;
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    // Prevent the browser from refreshing the page when the form submits.
    e.preventDefault();

    // Clerk must be loaded before we can safely call signUp methods.
    if (!isLoaded) return;

    try {
      // Create a new Clerk signup attempt with the user's email and password.
      await signUp.create({
        emailAddress,
        password,
      });

      // Ask Clerk to send a one-time verification code to the user's email.
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      // Switch the UI from the signup form to the verification-code form.
      setPendingVerification(true);
    } catch (err: unknown) {
      // Clerk usually returns errors as an errors array, so read the first message.
      const clerkError = err as {
        errors?: { message: string }[];
      };

      setError(clerkError.errors?.[0]?.message || "Something went wrong");
    }
  }

  async function onPressVerify(e: React.FormEvent<HTMLFormElement>) {
    // Prevent the verification form from refreshing the page.
    e.preventDefault();

    // Stop here until Clerk is ready to verify the code.
    if (!isLoaded) return;

    try {
      // Send the code entered by the user to Clerk for email verification.
      const completeSignup = await signUp.attemptEmailAddressVerification({
        code,
      });

      // Only a complete signup has a session ID that can be made active.
      if (completeSignup.status === "complete") {
        await setActive({
          session: completeSignup.createdSessionId,
        });

        // After activating the session, move the logged-in user to the app.
        router.push("/dashboard");
      } else {
        // If Clerk still needs more steps, keep the user on this page.
        console.log("Session status", completeSignup.status);
        setError("Signup is not complete. Please finish the required steps.");
      }
    } catch (err) {
      // Log the full Clerk error for debugging, then show a friendly message.
      console.log(JSON.stringify(err, null, 2));

      const clerkErr = err as {
        errors: { message: string }[];
      };

      setError(
        clerkErr.errors?.[0]?.message ||
          "Something went wrong in email attempt verification",
      );
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <section className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            {pendingVerification ? (
              <ShieldCheck className="size-6" />
            ) : (
              <LockKeyhole className="size-6" />
            )}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {pendingVerification ? "Check your email" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {pendingVerification
              ? "Enter the verification code Clerk sent to your inbox."
              : "Sign up to start managing your todos from one clean dashboard."}
          </p>
        </div>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>
              {pendingVerification ? "Verify email" : "Sign up"}
            </CardTitle>
            <CardDescription>
              {pendingVerification
                ? "This keeps your account secure before we send you in."
                : "Use an email and password to create your account."}
            </CardDescription>
            <CardAction>
              <div className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                Step {pendingVerification ? "2" : "1"} of 2
              </div>
            </CardAction>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Signup error</AlertTitle>
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
            )}

            {pendingVerification && !error && (
              <Alert className="mb-4">
                <ShieldCheck className="size-4" />
                <AlertTitle>Verification sent</AlertTitle>
                <AlertDescription>
                  Check your inbox and paste the code below.
                </AlertDescription>
              </Alert>
            )}

            {pendingVerification ? (
              <form className="space-y-5" onSubmit={onPressVerify}>
                <div className="space-y-2">
                  <Label htmlFor="code">Verification code</Label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="code"
                      inputMode="numeric"
                      onChange={(e) => setcode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      required
                      value={code}
                      className="h-10 pl-9"
                    />
                  </div>
                </div>

                <Button className="h-10 w-full" type="submit">
                  Verify and continue
                  <ArrowRight className="size-4" />
                </Button>

                <Button
                  className="h-10 w-full"
                  onClick={() => setPendingVerification(false)}
                  type="button"
                  variant="outline"
                >
                  Change email
                </Button>
              </form>
            ) : (
              <form className="space-y-5" onSubmit={submit}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      autoComplete="email"
                      id="email"
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="you@example.com"
                      required
                      type="email"
                      value={emailAddress}
                      className="h-10 pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      autoComplete="new-password"
                      id="password"
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      required
                      type={showPassword ? "text" : "password"}
                      value={password}
                      className="h-10 pl-9 pr-10"
                    />
                    <button
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
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
                  Create account
                  <ArrowRight className="size-4" />
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <a className="font-medium text-foreground underline" href="/sign-in">
                Sign in
              </a>
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

export default Signup;
