"use client";
import React, { useState } from "react";

import { SignUp } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

import { useSignUp } from "@clerk/nextjs/legacy";
import { useRouter } from "next/navigation";

function Signup() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setcode] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState("");

  const router = useRouter();

  // this checks where clerk has finished loading
  //Don’t use signUp yet until Clerk is ready.
  if (!isLoaded) {
    return null;
  }

  async function submit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!isLoaded) return;

    try {
      // Step 1:
      // Create a new signup attempt using the email and password.
      await signUp.create({
        emailAddress,
        password,
      });

      // step 2:
      // Ask clerk to send email verification code to user email
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      // step 3:
      // update the UI

      setPendingVerification(true);
    } catch (err: unknown) {
      const clerkError = err as {
        errors?: { message: string }[];
      };

      setError(clerkError.errors?.[0]?.message || "Something went wrong");
    }
  }

  async function onPressVerify(e: React.SubmitEvent) {
    e.preventDefault()
    if (!isLoaded) return;

    try {
      // the code will be verified by the clerk here
      const completeSignup = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignup.status === "complete") {
        await setActive({
          session: completeSignup.createdSessionId,
        });

        router.push("/dashboard");
      } else {
        console.log("Session status", completeSignup.status);
        setError("Signup is not complete. Please finish the required steps.");
      }
    } catch (err) {
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

  return <div>Meow</div>;
}

export default Signup;
