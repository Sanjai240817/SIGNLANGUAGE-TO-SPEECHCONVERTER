import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { toast } from "sonner";

import {
  Hand,
  Loader2,
  User,
  Mail,
  Lock,
} from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    // ==========================================
    // SIGN UP VALIDATION
    // ==========================================

    if (isSignUp) {
      if (!trimmedUsername) {
        toast.error("Please enter a username.");
        return;
      }

      if (trimmedUsername.length < 3) {
        toast.error("Username must be at least 3 characters.");
        return;
      }

      if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
        toast.error(
          "Username can contain only letters, numbers, and underscore."
        );
        return;
      }

      if (!trimmedEmail) {
        toast.error("Please enter your email.");
        return;
      }

      if (!password) {
        toast.error("Please enter your password.");
        return;
      }

      if (password.length < 8) {
        toast.error("Password must be at least 8 characters.");
        return;
      }
    }

    // ==========================================
    // SIGN IN VALIDATION
    // ==========================================

    if (!isSignUp) {
      if (!trimmedEmail) {
        toast.error("Please enter your email or username.");
        return;
      }

      if (!password) {
        toast.error("Please enter your password.");
        return;
      }

      if (password.length < 8) {
        toast.error("Password must be at least 8 characters.");
        return;
      }
    }

    setLoading(true);

    try {
      // ==========================================
      // SIGN UP
      // ==========================================

      if (isSignUp) {
        // ------------------------------------------
        // Check whether username already exists
        // ------------------------------------------

        const {
          data: usernameExists,
          error: usernameCheckError,
        } = await supabase.rpc("username_exists", {
          input_username: trimmedUsername,
        });

        if (usernameCheckError) {
          console.error(
            "Username check error:",
            usernameCheckError
          );

          throw new Error(
            "Unable to check username availability."
          );
        }

        if (usernameExists) {
          toast.error("This username is already taken.");
          setLoading(false);
          return;
        }

        // ------------------------------------------
        // Create Supabase Auth account
        // ------------------------------------------

        const { data, error } =
          await supabase.auth.signUp({
            email: trimmedEmail,
            password,
            options: {
              data: {
                username: trimmedUsername,
              },
            },
          });

        if (error) {
          throw error;
        }

        if (!data.user) {
          throw new Error(
            "Account could not be created."
          );
        }

        // ------------------------------------------
        // Email confirmation enabled
        // ------------------------------------------

        if (!data.session) {
          toast.success(
            "Account created! Please check your email to verify your account."
          );

          // Clear password
          setPassword("");

          // Switch to Sign In
          setIsSignUp(false);

          setLoading(false);

          return;
        }

        // ------------------------------------------
        // Email confirmation disabled
        // ------------------------------------------

        toast.success(
          "Account created successfully!"
        );

        navigate("/", {
          replace: true,
        });

        return;
      }

      // ==========================================
      // SIGN IN
      // ==========================================

      let loginEmail = trimmedEmail;

      // ------------------------------------------
      // Determine whether user entered:
      // Email OR Username
      // ------------------------------------------

      if (!loginEmail.includes("@")) {
        // User entered username
        const {
          data: foundEmail,
          error: usernameLookupError,
        } = await supabase.rpc(
          "get_email_by_username",
          {
            input_username: loginEmail,
          }
        );

        if (usernameLookupError) {
          console.error(
            "Username lookup error:",
            usernameLookupError
          );

          throw new Error(
            "Unable to find this username."
          );
        }

        if (!foundEmail) {
          throw new Error(
            "Username not found."
          );
        }

        loginEmail = foundEmail;
      }

      // ------------------------------------------
      // Sign in using resolved email
      // ------------------------------------------

      const { error } =
        await supabase.auth.signInWithPassword({
          email: loginEmail,
          password,
        });

      if (error) {
        throw error;
      }

      toast.success(
        "Welcome back to SignSpeak AI!"
      );

      navigate("/", {
        replace: true,
      });

    } catch (error: any) {
      console.error(
        "Authentication error:",
        error
      );

      // Friendly error messages
      if (
        error?.message?.toLowerCase().includes(
          "invalid login credentials"
        )
      ) {
        toast.error(
          "Invalid username/email or password."
        );
      } else if (
        error?.message?.toLowerCase().includes(
          "email already registered"
        )
      ) {
        toast.error(
          "This email is already registered."
        );
      } else {
        toast.error(
          error?.message ||
            "Authentication failed."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // SWITCH SIGN UP / SIGN IN
  // ==========================================

  const switchMode = () => {
    setIsSignUp(!isSignUp);

    // Clear fields
    setUsername("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">

      <div className="w-full max-w-md">

        <div className="rounded-2xl border bg-card p-8 shadow-xl">

          {/* ================================= */}
          {/* LOGO */}
          {/* ================================= */}

          <div className="flex justify-center mb-6">

            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">

              <Hand className="h-8 w-8" />

            </div>

          </div>

          {/* ================================= */}
          {/* HEADING */}
          {/* ================================= */}

          <div className="text-center mb-8">

            <h1 className="text-3xl font-bold">
              SignSpeak AI
            </h1>

            <p className="mt-2 text-muted-foreground">

              {isSignUp
                ? "Create your account"
                : "Welcome back"}

            </p>

          </div>

          {/* ================================= */}
          {/* FORM */}
          {/* ================================= */}

          <form
            onSubmit={handleAuth}
            className="space-y-5"
          >

            {/* ================================= */}
            {/* USERNAME - SIGN UP ONLY */}
            {/* ================================= */}

            {isSignUp && (
              <div className="space-y-2">

                <Label htmlFor="username">
                  Username
                </Label>

                <div className="relative">

                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value)
                    }
                    autoComplete="username"
                    className="pl-10"
                    maxLength={30}
                  />

                </div>

                <p className="text-xs text-muted-foreground">
                  3–30 characters. Letters, numbers and
                  underscore only.
                </p>

              </div>
            )}

            {/* ================================= */}
            {/* EMAIL / USERNAME */}
            {/* ================================= */}

            <div className="space-y-2">

              <Label htmlFor="email">

                {isSignUp
                  ? "Email"
                  : "Email or Username"}

              </Label>

              <div className="relative">

                {isSignUp ? (
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                ) : (
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                )}

                <Input
                  id="email"
                  type={
                    isSignUp
                      ? "email"
                      : "text"
                  }
                  placeholder={
                    isSignUp
                      ? "you@example.com"
                      : "Email or username"
                  }
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  autoComplete={
                    isSignUp
                      ? "email"
                      : "username"
                  }
                  className="pl-10"
                />

              </div>

            </div>

            {/* ================================= */}
            {/* PASSWORD */}
            {/* ================================= */}

            <div className="space-y-2">

              <Label htmlFor="password">
                Password
              </Label>

              <div className="relative">

                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  autoComplete={
                    isSignUp
                      ? "new-password"
                      : "current-password"
                  }
                  className="pl-10"
                />

              </div>

            </div>

            {/* ================================= */}
            {/* SUBMIT BUTTON */}
            {/* ================================= */}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >

              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                  Please wait...
                </>
              ) : isSignUp ? (
                "Create Account"
              ) : (
                "Sign In"
              )}

            </Button>

          </form>

          {/* ================================= */}
          {/* SWITCH MODE */}
          {/* ================================= */}

          <div className="mt-6 text-center text-sm text-muted-foreground">

            {isSignUp
              ? "Already have an account?"
              : "Don't have an account?"}

            <button
              type="button"
              className="ml-1 font-medium text-primary hover:underline"
              onClick={switchMode}
            >

              {isSignUp
                ? "Sign In"
                : "Create Account"}

            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Auth;