import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { toast } from "sonner";

import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe2,
  Hand,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  Volume2,
  Zap,
} from "lucide-react";


/* =========================================================
   FEATURE CARD
========================================================= */

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

const FeatureCard = ({
  icon,
  title,
  subtitle,
}: FeatureCardProps) => {
  return (
    <div
      className="
        flex
        h-[92px]
        min-w-0
        flex-1
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-teal-300/15
        bg-white/[0.045]
        px-2
        text-center
        transition-all
        duration-300
        hover:bg-white/[0.08]
      "
    >
      <div
        className="
          mb-2
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-xl
          bg-teal-300/10
          text-teal-300
        "
      >
        {icon}
      </div>

      <p
        className="
          text-[12px]
          font-semibold
          leading-tight
          text-white
        "
      >
        {title}
      </p>

      <p
        className="
          mt-1
          text-[10px]
          leading-tight
          text-white/45
        "
      >
        {subtitle}
      </p>
    </div>
  );
};


/* =========================================================
   AUTH PAGE
========================================================= */

const Auth = () => {

  const navigate = useNavigate();

  /* =======================================================
     AUTH MODE
  ======================================================= */

  const [isSignUp, setIsSignUp] = useState(false);


  /* =======================================================
     FORM STATES
  ======================================================= */

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  /* =======================================================
     UI STATES
  ======================================================= */

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);


  /* =======================================================
     CHECK EXISTING SESSION
  ======================================================= */

  useEffect(() => {

    const checkSession = async () => {

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        navigate("/", {
          replace: true,
        });
      }

    };

    checkSession();

  }, [navigate]);


  /* =======================================================
     LOGIN / SIGNUP
  ======================================================= */

  const handleAuth = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();


    const trimmedUsername =
      username.trim();

    const trimmedEmail =
      email.trim();


    /* =====================================================
       SIGNUP VALIDATION
    ===================================================== */

    if (isSignUp) {

      if (!trimmedUsername) {
        toast.error(
          "Please enter a username."
        );
        return;
      }


      if (trimmedUsername.length < 3) {
        toast.error(
          "Username must be at least 3 characters."
        );
        return;
      }


      if (trimmedUsername.length > 30) {
        toast.error(
          "Username must not exceed 30 characters."
        );
        return;
      }


      if (
        !/^[a-zA-Z0-9_]+$/.test(
          trimmedUsername
        )
      ) {
        toast.error(
          "Username can contain only letters, numbers and underscore."
        );
        return;
      }


      if (!trimmedEmail) {
        toast.error(
          "Please enter your email."
        );
        return;
      }


      if (!password) {
        toast.error(
          "Please enter your password."
        );
        return;
      }


      if (password.length < 8) {
        toast.error(
          "Password must be at least 8 characters."
        );
        return;
      }

    }


    /* =====================================================
       LOGIN VALIDATION
    ===================================================== */

    if (!isSignUp) {

      if (!trimmedEmail) {
        toast.error(
          "Please enter your email or username."
        );
        return;
      }


      if (!password) {
        toast.error(
          "Please enter your password."
        );
        return;
      }


      if (password.length < 8) {
        toast.error(
          "Password must be at least 8 characters."
        );
        return;
      }

    }


    setLoading(true);


    try {

      /* ===================================================
         SIGNUP
      =================================================== */

      if (isSignUp) {

        const {
          data: usernameExists,
          error: usernameCheckError,
        } = await supabase.rpc(
          "username_exists",
          {
            input_username:
              trimmedUsername,
          },
        );


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

          toast.error(
            "This username is already taken."
          );

          return;

        }


        const {
          data,
          error,
        } = await supabase.auth.signUp({

          email: trimmedEmail,

          password,

          options: {
            data: {
              username:
                trimmedUsername,
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


        /* ===============================================
           EMAIL CONFIRMATION ENABLED
        =============================================== */

        if (!data.session) {

          toast.success(
            "Account created! Please check your email to verify your account."
          );


          setPassword("");

          setIsSignUp(false);

          return;

        }


        /* ===============================================
           EMAIL CONFIRMATION DISABLED
        =============================================== */

        toast.success(
          "Account created successfully!"
        );


        navigate("/", {
          replace: true,
        });


        return;

      }


      /* ===================================================
         LOGIN
      =================================================== */

      let loginEmail =
        trimmedEmail;


      /* ===================================================
         USERNAME LOGIN
      =================================================== */

      if (!loginEmail.includes("@")) {

        const {
          data: foundEmail,
          error:
            usernameLookupError,
        } = await supabase.rpc(
          "get_email_by_username",
          {
            input_username:
              loginEmail,
          },
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


        loginEmail =
          foundEmail;

      }


      /* ===================================================
         SUPABASE LOGIN
      =================================================== */

      const {
        error,
      } =
        await supabase.auth.signInWithPassword({

          email:
            loginEmail,

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

    }


    catch (error: any) {

      console.error(
        "Authentication error:",
        error
      );


      const message =
        error?.message
          ?.toLowerCase() || "";


      if (
        message.includes(
          "invalid login credentials"
        )
      ) {

        toast.error(
          "Invalid username/email or password."
        );

      }

      else if (
        message.includes(
          "email already registered"
        )
      ) {

        toast.error(
          "This email is already registered."
        );

      }

      else if (
        message.includes(
          "rate limit"
        )
      ) {

        toast.error(
          "Email rate limit reached. Please try again later."
        );

      }

      else {

        toast.error(
          error?.message ||
            "Authentication failed."
        );

      }

    }


    finally {

      setLoading(false);

    }

  };


  /* =========================================================
     FORGOT PASSWORD
  ========================================================= */

  const handleForgotPassword =
    async () => {

      if (!email.trim()) {

        toast.error(
          "Enter your email address first."
        );

        return;

      }


      if (
        !email.includes("@")
      ) {

        toast.error(
          "Password reset requires your email address."
        );

        return;

      }


      setForgotLoading(true);


      try {

        const {
          error,
        } =
          await supabase.auth.resetPasswordForEmail(
            email.trim(),
            {
              redirectTo:
                `${window.location.origin}/settings`,
            },
          );


        if (error) {
          throw error;
        }


        toast.success(
          "Password reset email sent. Please check your inbox."
        );

      }


      catch (error: any) {

        toast.error(
          error?.message ||
            "Unable to send password reset email."
        );

      }


      finally {

        setForgotLoading(false);

      }

    };


  /* =========================================================
     SWITCH LOGIN / SIGNUP
  ========================================================= */

  const switchMode = () => {

    setIsSignUp(
      (previous) => !previous
    );

    setUsername("");
    setEmail("");
    setPassword("");

    setShowPassword(false);

  };


  /* =========================================================
     PAGE
  ========================================================= */

  return (

    <div
      className="
        min-h-screen
        bg-[#eafafa]
        px-2
        py-2
        sm:px-3
        sm:py-3
      "
    >

      {/* =====================================================
          MAIN CONTAINER
      ===================================================== */}

      <div
        className="
          mx-auto
          flex
          h-[calc(100vh-16px)]
          min-h-[700px]
          max-w-[1680px]
          overflow-hidden
          rounded-[28px]
          bg-white
          shadow-[0_20px_60px_rgba(5,55,65,0.12)]
          sm:h-[calc(100vh-24px)]
          sm:min-h-[720px]
          sm:rounded-[32px]
        "
      >


        {/* ===================================================
            LEFT SIDE
        =================================================== */}

        <section
          className="
            relative
            hidden
            h-full
            min-h-0
            w-1/2
            flex-col
            overflow-hidden
            bg-[#073b44]
            px-10
            py-7
            text-white
            lg:flex
            xl:px-11
          "
        >

          {/* =================================================
              BACKGROUND ORBITS
          ================================================= */}

          <div
            className="
              pointer-events-none
              absolute
              -right-[90px]
              -top-[160px]
              h-[500px]
              w-[500px]
              rounded-full
              border
              border-cyan-300/10
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -right-[40px]
              -top-[110px]
              h-[400px]
              w-[400px]
              rounded-full
              border
              border-cyan-300/10
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-[150px]
              left-[15%]
              h-[430px]
              w-[430px]
              rounded-full
              border
              border-teal-300/10
            "
          />


          {/* =================================================
              LOGO
          ================================================= */}

          <div
            className="
              relative
              z-20
              flex
              shrink-0
              items-center
              gap-3
            "
          >

            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-br
                from-cyan-300
                to-teal-400
                text-[#073b44]
                shadow-[0_10px_30px_rgba(45,212,191,0.2)]
              "
            >
              <Hand
                className="
                  h-6
                  w-6
                "
              />
            </div>


            <div>

              <h2
                className="
                  text-[20px]
                  font-bold
                  tracking-tight
                "
              >
                SignSpeak AI
              </h2>

              <p
                className="
                  text-[12px]
                  text-cyan-100/55
                "
              >
                Hands to a Kinder World
              </p>

            </div>

          </div>


          {/* =================================================
              HERO CONTENT
          ================================================= */}

          <div
            className="
              relative
              z-10
              mt-11
              shrink-0
            "
          >

            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-teal-300/25
                bg-teal-300/5
                px-4
                py-2
                text-[14px]
                font-medium
                text-teal-200
              "
            >

              <Sparkles
                className="
                  h-4
                  w-4
                "
              />

              AI-Powered Communication

            </div>


            <h1
              className="
                mt-7
                max-w-[570px]
                text-[45px]
                font-bold
                leading-[0.98]
                tracking-tight
                xl:text-[53px]
              "
            >

              <span className="block">
                Breaking
              </span>

              <span
                className="
                  block
                  text-cyan-300
                "
              >
                Communication
              </span>

              <span className="block">
                Barriers
              </span>

            </h1>


            <p
              className="
                mt-5
                max-w-[570px]
                text-[15px]
                leading-[1.5]
                text-cyan-50/65
                xl:text-[16px]
              "
            >
              Transform sign language into natural
              speech instantly. SignSpeak AI creates
              seamless communication between the
              deaf and hearing communities.
            </p>

          </div>


          {/* =================================================
              AI VISUAL
          ================================================= */}

          <div
            className="
              relative
              z-10
              min-h-0
              flex-1
              mt-1
              flex
              items-center
              justify-center
            "
          >

            {/* Outer orbit */}

            <div
              className="
                absolute
                left-[38%]
                top-1/2
                h-[225px]
                w-[225px]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                border
                border-teal-300/10
              "
            />


            {/* Inner orbit */}

            <div
              className="
                absolute
                left-[38%]
                top-1/2
                h-[175px]
                w-[175px]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                border
                border-teal-300/10
              "
            />


            {/* Center hand */}

            <div
              className="
                absolute
                left-[38%]
                top-1/2
                flex
                h-[125px]
                w-[125px]
                -translate-x-1/2
                -translate-y-1/2
                items-center
                justify-center
                rounded-[26px]
                border
                border-cyan-300/25
                bg-teal-300/10
                shadow-[0_0_50px_rgba(45,212,191,0.08)]
              "
            >

              <Hand
                className="
                  h-[68px]
                  w-[68px]
                  text-teal-300
                "
              />

            </div>


            {/* Decorative dots */}

            <span
              className="
                absolute
                left-[21%]
                top-[43%]
                h-2.5
                w-2.5
                rounded-full
                bg-teal-300
                shadow-[0_0_15px_rgba(45,212,191,0.8)]
              "
            />

            <span
              className="
                absolute
                left-[51%]
                top-[28%]
                h-2
                w-2
                rounded-full
                bg-cyan-300
              "
            />

            <span
              className="
                absolute
                left-[54%]
                bottom-[24%]
                h-2.5
                w-2.5
                rounded-full
                bg-teal-300
              "
            />


            {/* =================================================
                PROCESS CARDS
            ================================================= */}

            <div
              className="
                absolute
                right-[-5%]
                top--1
                w-[165px]
                -translate-y-1/2
                overflow-hidden
                rounded-2xl
                border
                border-teal-300/20
                bg-white/[0.06]
                backdrop-blur-md
              "
            >

              {/* Hand */}

              <div
                className="
                  flex
                  h-[80px]
                  flex-col
                  items-center
                  justify-center
                  border-b
                  border-white/10
                "
              >

                <div
                  className="
                    mb-1
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-xl
                    bg-teal-300/10
                  "
                >
                  <Hand
                    className="
                      h-4
                      w-4
                      text-teal-300
                    "
                  />
                </div>

                <span
                  className="
                    text-[9px]
                    text-white/45
                  "
                >
                  Sign
                </span>

                <span
                  className="
                    text-[13px]
                    font-semibold
                  "
                >
                  Hand Gesture
                </span>

              </div>


              {/* AI */}

              <div
                className="
                  flex
                  h-[80px]
                  flex-col
                  items-center
                  justify-center
                  border-b
                  border-white/10
                  bg-white/[0.025]
                "
              >

                <div
                  className="
                    mb-1
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-400/10
                  "
                >

                  <Brain
                    className="
                      h-4
                      w-4
                      text-blue-300
                    "
                  />

                </div>

                <span
                  className="
                    text-[13px]
                    font-semibold
                  "
                >
                  AI Processing
                </span>

              </div>


              {/* Speech */}

              <div
                className="
                  flex
                  h-[80px]
                  flex-col
                  items-center
                  justify-center
                  bg-white/[0.025]
                "
              >

                <div
                  className="
                    mb-1
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-xl
                    bg-orange-400/10
                  "
                >

                  <Volume2
                    className="
                      h-4
                      w-4
                      text-orange-300
                    "
                  />

                </div>

                <span
                  className="
                    text-[9px]
                    text-white/45
                  "
                >
                  Speech Output
                </span>

                <span
                  className="
                    text-[12px]
                    font-semibold
                  "
                >
                  "Hello!"
                </span>

              </div>

            </div>

          </div>


          {/* =================================================
              FEATURE CARDS
          ================================================= */}

          <div
            className="
              relative
              z-10
              mt-8
              grid
              shrink-0
              grid-cols-4
              gap-2.5
            "
          >

            <FeatureCard
              icon={
                <Zap className="h-4 w-4" />
              }
              title="Real-time"
              subtitle="Translation"
            />


            <FeatureCard
              icon={
                <Users className="h-4 w-4" />
              }
              title="Inclusive"
              subtitle="Communication"
            />


            <FeatureCard
              icon={
                <ShieldCheck className="h-4 w-4" />
              }
              title="AI-Powered"
              subtitle="Accuracy"
            />


            <FeatureCard
              icon={
                <Globe2 className="h-4 w-4" />
              }
              title="Accessible"
              subtitle="For Everyone"
            />

          </div>


          {/* =================================================
              FOOTER
          ================================================= */}

          <div
            className="
              relative
              z-10
              mt-4
              flex
              shrink-0
              items-center
              gap-3
              border-t
              border-white/10
              pt-3
              text-[11px]
              text-white/45
            "
          >

            <span
              className="
                font-semibold
                text-white/80
              "
            >
              SignSpeak AI
            </span>

            <span>
              —
            </span>

            <span>
              Technology for an inclusive tomorrow.
            </span>

          </div>

        </section>


        {/* ===================================================
            RIGHT SIDE
        =================================================== */}

        <section
          className="
            relative
            h-full
            min-h-0
            w-full
            overflow-y-auto
            bg-white
            lg:w-1/2
          "
        >

          {/* =================================================
              TOP RIGHT QUOTE
          ================================================= */}

          <div
            className="
              absolute
              right-7
              top-5
              z-10
              text-right
              font-serif
              text-[16px]
              italic
              leading-[1.05]
              text-slate-500
            "
          >

            <div>
              Different Hands
            </div>

            <div>
              Same World
              <span
                className="
                  ml-1
                  text-teal-400
                  not-italic
                "
              >
                ♡
              </span>
            </div>

          </div>


          {/* =================================================
              RIGHT CONTENT
          ================================================= */}

          <div
            className="
              mx-auto
              flex
              min-h-full
              w-full
              max-w-[650px]
              flex-col
              items-center
              px-8
              py-12
              sm:px-12
              lg:px-14
              lg:py-14
              xl:px-16
            "
          >

            {/* =================================================
                BRAND
            ================================================= */}

            <div
              className="
                flex
                shrink-0
                items-center
                gap-4
              "
            >

              <div
                className="
                  flex
                  h-[68px]
                  w-[68px]
                  items-center
                  justify-center
                  rounded-2xl
                  bg-gradient-to-br
                  from-teal-400
                  to-cyan-500
                  text-white
                  shadow-[0_12px_30px_rgba(20,184,166,0.22)]
                "
              >

                <Hand
                  className="
                    h-9
                    w-9
                  "
                />

              </div>


              <div>

                <h2
                  className="
                    text-[25px]
                    font-bold
                    tracking-tight
                    text-[#12343d]
                  "
                >

                  SignSpeak
                  <span className="text-teal-500">
                    {" "}AI
                  </span>

                </h2>


                <p
                  className="
                    mt-1
                    text-[13px]
                    text-slate-400
                  "
                >
                  Communicate • Include • Empower
                </p>

              </div>

            </div>


            {/* =================================================
                SECURE BADGE
            ================================================= */}

            <div
              className="
                mt-6
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-teal-50
                px-4
                py-2
                text-[12px]
                font-medium
                text-teal-700
              "
            >

              <CheckCircle2
                className="
                  h-4
                  w-4
                "
              />

              Secure AI workspace

            </div>


            {/* =================================================
                WELCOME
            ================================================= */}

            <div
              className="
                mt-7
                text-center
              "
            >

              <h1
                className="
                  text-[35px]
                  font-bold
                  tracking-tight
                  text-[#12343d]
                  sm:text-[38px]
                "
              >

                {isSignUp
                  ? "Create your account"
                  : (
                    <>
                      Welcome back
                      <span className="ml-2">
                        👋
                      </span>
                    </>
                  )}

              </h1>


              <p
                className="
                  mt-2
                  text-[15px]
                  text-slate-500
                "
              >

                {isSignUp
                  ? "Join SignSpeak AI and make communication more inclusive."
                  : "Sign in to continue your communication journey."}

              </p>

            </div>


            {/* =================================================
                FORM
            ================================================= */}

            <form
              onSubmit={handleAuth}
              className="
                mt-8
                w-full
                space-y-5
              "
            >

              {/* =================================================
                  USERNAME - SIGNUP ONLY
              ================================================= */}

              {isSignUp && (

                <div
                  className="
                    space-y-2
                  "
                >

                  <Label
                    htmlFor="username"
                    className="
                      text-[14px]
                      font-semibold
                      text-slate-700
                    "
                  >
                    Username
                  </Label>


                  <div
                    className="
                      relative
                    "
                  >

                    <User
                      className="
                        absolute
                        left-4
                        top-1/2
                        h-5
                        w-5
                        -translate-y-1/2
                        text-slate-400
                      "
                    />


                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) =>
                        setUsername(
                          e.target.value
                        )
                      }
                      autoComplete="username"
                      maxLength={30}
                      className="
                        h-[58px]
                        rounded-2xl
                        border-slate-200
                        bg-white
                        pl-12
                        text-[15px]
                        shadow-[0_1px_3px_rgba(0,0,0,0.04)]
                        focus-visible:border-teal-400
                        focus-visible:ring-teal-100
                      "
                    />

                  </div>


                  <p
                    className="
                      text-[11px]
                      text-slate-400
                    "
                  >
                    3–30 characters. Letters, numbers and underscore only.
                  </p>

                </div>

              )}


              {/* =================================================
                  EMAIL / USERNAME
              ================================================= */}

              <div
                className="
                  space-y-2
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >

                  <Label
                    htmlFor="email"
                    className="
                      text-[14px]
                      font-semibold
                      text-slate-700
                    "
                  >

                    {isSignUp
                      ? "Email"
                      : "Email or Username"}

                  </Label>

                </div>


                <div
                  className="
                    relative
                  "
                >

                  {isSignUp ? (

                    <Mail
                      className="
                        absolute
                        left-4
                        top-1/2
                        h-5
                        w-5
                        -translate-y-1/2
                        text-slate-400
                      "
                    />

                  ) : (

                    <User
                      className="
                        absolute
                        left-4
                        top-1/2
                        h-5
                        w-5
                        -translate-y-1/2
                        text-slate-400
                      "
                    />

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
                        ? "Enter your email address"
                        : "Enter email or username"
                    }
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    autoComplete={
                      isSignUp
                        ? "email"
                        : "username"
                    }
                    className="
                      h-[58px]
                      rounded-2xl
                      border-slate-200
                      bg-white
                      pl-12
                      text-[15px]
                      shadow-[0_1px_3px_rgba(0,0,0,0.04)]
                      focus-visible:border-teal-400
                      focus-visible:ring-teal-100
                    "
                  />

                </div>

              </div>


              {/* =================================================
                  PASSWORD
              ================================================= */}

              <div
                className="
                  space-y-2
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >

                  <Label
                    htmlFor="password"
                    className="
                      text-[14px]
                      font-semibold
                      text-slate-700
                    "
                  >
                    Password
                  </Label>


                  <span
                    className="
                      text-[12px]
                      text-slate-400
                    "
                  >
                    Minimum 8 characters
                  </span>

                </div>


                <div
                  className="
                    relative
                  "
                >

                  <Lock
                    className="
                      absolute
                      left-4
                      top-1/2
                      h-5
                      w-5
                      -translate-y-1/2
                      text-slate-400
                    "
                  />


                  <Input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    autoComplete={
                      isSignUp
                        ? "new-password"
                        : "current-password"
                    }
                    className="
                      h-[58px]
                      rounded-2xl
                      border-slate-200
                      bg-white
                      pl-12
                      pr-12
                      text-[15px]
                      shadow-[0_1px_3px_rgba(0,0,0,0.04)]
                      focus-visible:border-teal-400
                      focus-visible:ring-teal-100
                    "
                  />


                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (previous) =>
                          !previous
                      )
                    }
                    className="
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                      transition-colors
                      hover:text-teal-500
                    "
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >

                    {showPassword ? (

                      <EyeOff
                        className="
                          h-5
                          w-5
                        "
                      />

                    ) : (

                      <Eye
                        className="
                          h-5
                          w-5
                        "
                      />

                    )}

                  </button>

                </div>

              </div>


              {/* =================================================
                  REMEMBER / FORGOT
              ================================================= */}

              {!isSignUp && (

                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >

                  <label
                    className="
                      flex
                      cursor-pointer
                      items-center
                      gap-2.5
                      text-[14px]
                      text-slate-600
                    "
                  >

                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) =>
                        setRememberMe(
                          e.target.checked
                        )
                      }
                      className="
                        h-[19px]
                        w-[19px]
                        rounded
                        border-slate-300
                        accent-teal-500
                      "
                    />

                    Remember me

                  </label>


                  <button
                    type="button"
                    onClick={
                      handleForgotPassword
                    }
                    disabled={forgotLoading}
                    className="
                      text-[14px]
                      font-semibold
                      text-teal-600
                      transition-colors
                      hover:text-teal-700
                      hover:underline
                      disabled:opacity-50
                    "
                  >

                    {forgotLoading
                      ? "Sending..."
                      : "Forgot password?"}

                  </button>

                </div>

              )}


              {/* =================================================
                  SECURITY MESSAGE
              ================================================= */}

              <div
                className="
                  flex
                  h-[50px]
                  items-center
                  gap-3
                  rounded-2xl
                  bg-teal-50
                  px-4
                  text-[13px]
                  text-teal-700
                "
              >

                <ShieldCheck
                  className="
                    h-5
                    w-5
                    shrink-0
                  "
                />

                <span>
                  Secure Supabase authentication
                </span>

              </div>


              {/* =================================================
                  SUBMIT BUTTON
              ================================================= */}

              <Button
                type="submit"
                disabled={loading}
                className="
                  h-[62px]
                  w-full
                  rounded-2xl
                  bg-gradient-to-r
                  from-teal-500
                  to-cyan-500
                  text-[17px]
                  font-bold
                  text-white
                  shadow-[0_14px_30px_rgba(20,184,166,0.20)]
                  transition-all
                  duration-300
                  hover:from-teal-600
                  hover:to-cyan-600
                  hover:shadow-[0_16px_35px_rgba(20,184,166,0.28)]
                "
              >

                {loading ? (

                  <>
                    <Loader2
                      className="
                        mr-2
                        h-5
                        w-5
                        animate-spin
                      "
                    />

                    Please wait...

                  </>

                ) : (

                  <>
                    {isSignUp
                      ? "Create Account"
                      : "Sign In"}

                    <ArrowRight
                      className="
                        ml-2
                        h-5
                        w-5
                      "
                    />
                  </>

                )}

              </Button>


              {/* =================================================
                  DIVIDER
              ================================================= */}

              <div
                className="
                  flex
                  items-center
                  gap-4
                "
              >

                <div
                  className="
                    h-px
                    flex-1
                    bg-slate-200
                  "
                />

                <span
                  className="
                    text-[13px]
                    text-slate-400
                  "
                >
                  or
                </span>

                <div
                  className="
                    h-px
                    flex-1
                    bg-slate-200
                  "
                />

              </div>


              {/* =================================================
                  SWITCH AUTH MODE
              ================================================= */}

              <div
                className="
                  text-center
                  text-[15px]
                  text-slate-500
                "
              >

                {isSignUp
                  ? "Already have an account?"
                  : "Don't have an account?"}


                <button
                  type="button"
                  onClick={switchMode}
                  className="
                    ml-2
                    font-bold
                    text-teal-600
                    transition-colors
                    hover:text-teal-700
                    hover:underline
                  "
                >

                  {isSignUp
                    ? "Sign In"
                    : "Create Account"}

                </button>

              </div>

            </form>


            {/* =================================================
                SECURITY FOOTER
            ================================================= */}

            <div
              className="
                mt-7
                flex
                items-center
                justify-center
                gap-2
                text-center
                text-[12px]
                text-slate-400
              "
            >

              <Lock
                className="
                  h-4
                  w-4
                "
              />

              Your information is securely protected.

            </div>

          </div>

        </section>

      </div>

    </div>

  );

};


export default Auth;