import Link from "next/link";
import { AlertTriangle, ArrowLeft, Home, RefreshCcw } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <section className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <AlertTriangle className="size-7" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Authentication required
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You cannot visit this page without proper authentication.
          </p>
        </div>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Access blocked</CardTitle>
            <CardDescription>
              Sign in with the right account before opening this protected page.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertTitle>Not authenticated</AlertTitle>
              <AlertDescription>
                This route is protected. You need a valid session and the
                required role or permission to continue.
              </AlertDescription>
            </Alert>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 sm:flex-row">
            <Button asChild className="w-full sm:flex-1">
              <Link href="/">
                <Home className="size-4" />
                Go home
              </Link>
            </Button>

            <Button asChild className="w-full sm:flex-1" variant="outline">
              <Link href="/sign-up">
                <ArrowLeft className="size-4" />
                Sign up
              </Link>
            </Button>

            <Button asChild className="w-full sm:flex-1" variant="secondary">
              <Link href="/test-page">
                <RefreshCcw className="size-4" />
                Retry
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </section>
    </main>
  );
}
