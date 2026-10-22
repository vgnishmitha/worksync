import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button, Loading, Textbox } from "../components";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation, useRegisterMutation } from "../redux/slices/api/authApiSlice";
import { setCredentials } from "../redux/slices/authSlice";

const Login = () => {
  const { user } = useSelector((state) => state.auth);
  const [isRegister, setIsRegister] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [registerApi, { isLoading: isRegisterLoading }] = useRegisterMutation();

  const isLoading = isLoginLoading || isRegisterLoading;

  const handleFormSubmit = async (data) => {
    try {
      if (isRegister) {
        const res = await registerApi(data).unwrap();
        dispatch(setCredentials(res));
        toast.success("Account registered and logged in successfully!");
        navigate("/");
      } else {
        const res = await login(data).unwrap();
        dispatch(setCredentials(res));
        toast.success("Logged in successfully!");
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || err.error || "Authentication failed.");
    }
  };

  const toggleMode = (mode) => {
    setIsRegister(mode);
    reset();
  };

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className='w-full min-h-screen flex items-center justify-center flex-col lg:flex-row bg-[#f3f4f6] dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#302943] via-slate-900 to-black p-4'>
      <div className='w-full md:w-auto flex gap-0 md:gap-24 lg:gap-36 flex-col md:flex-row items-center justify-center max-w-6xl'>
        {/* left side */}
        <div className='w-full lg:w-1/2 flex flex-col items-center justify-center text-center p-6'>
          <div className='w-full max-w-lg flex flex-col items-center justify-center gap-4'>
            <h1 className='text-4xl md:text-6xl font-black text-blue-700 dark:text-white'>
              Team Flow
            </h1>
            <p className='text-lg text-gray-600 dark:text-gray-300 font-medium'>
              Enterprise Issue Tracker & Team Collaboration Platform.
            </p>
            <div className='mt-4 p-4 rounded-xl bg-blue-50 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700 text-left text-sm text-gray-600 dark:text-gray-400 space-y-1.5 hidden md:block'>
              <p className='font-bold text-gray-800 dark:text-white'>System Roles & Access:</p>
              <p>• <strong className='text-blue-600'>Admin:</strong> Full access to create, assign, and manage issues across all users.</p>
              <p>• <strong className='text-emerald-600'>Members:</strong> Strict issue-level access to their assigned issues and comments.</p>
            </div>
          </div>
        </div>

        {/* right side - Form */}
        <div className='w-full md:w-[420px] p-2 flex flex-col justify-center items-center'>
          <div className='w-full bg-white dark:bg-slate-900 shadow-xl rounded-2xl px-8 pt-8 pb-10 border border-gray-100 dark:border-slate-800'>
            {/* Tab switch */}
            <div className='flex rounded-lg bg-gray-100 dark:bg-slate-800 p-1 mb-6'>
              <button
                type='button'
                onClick={() => toggleMode(false)}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                  !isRegister
                    ? "bg-white dark:bg-blue-600 text-blue-700 dark:text-white shadow"
                    : "text-gray-600 dark:text-gray-400 hover:text-black"
                }`}
              >
                Sign In
              </button>
              <button
                type='button'
                onClick={() => toggleMode(true)}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                  isRegister
                    ? "bg-white dark:bg-blue-600 text-blue-700 dark:text-white shadow"
                    : "text-gray-600 dark:text-gray-400 hover:text-black"
                }`}
              >
                Register
              </button>
            </div>

            <div className='mb-6 text-center'>
              <h2 className='text-2xl font-bold text-gray-800 dark:text-white'>
                {isRegister ? "Create an Account" : "Welcome Back"}
              </h2>
              <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                {isRegister
                  ? "Register to collaborate on your team issues."
                  : "Sign in with your credentials to continue."}
              </p>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className='flex flex-col gap-y-4'>
              {isRegister && (
                <>
                  <Textbox
                    placeholder='John Doe'
                    type='text'
                    name='name'
                    label='Full Name'
                    className='w-full rounded-lg'
                    register={register("name", {
                      required: "Full name is required!",
                    })}
                    error={errors.name ? errors.name.message : ""}
                  />
                  <div className='grid grid-cols-2 gap-3'>
                    <Textbox
                      placeholder='e.g. Developer'
                      type='text'
                      name='title'
                      label='Job Title'
                      className='w-full rounded-lg'
                      register={register("title", {
                        required: "Job Title is required!",
                      })}
                      error={errors.title ? errors.title.message : ""}
                    />
                    <Textbox
                      placeholder='e.g. Frontend'
                      type='text'
                      name='role'
                      label='Role'
                      className='w-full rounded-lg'
                      register={register("role", {
                        required: "Role is required!",
                      })}
                      error={errors.role ? errors.role.message : ""}
                    />
                  </div>
                </>
              )}

              <Textbox
                placeholder='email@example.com'
                type='email'
                name='email'
                label='Email Address'
                className='w-full rounded-lg'
                register={register("email", {
                  required: "Email Address is required!",
                })}
                error={errors.email ? errors.email.message : ""}
              />

              <Textbox
                placeholder='••••••••'
                type='password'
                name='password'
                label='Password'
                className='w-full rounded-lg'
                register={register("password", {
                  required: "Password is required!",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                error={errors.password ? errors.password.message : ""}
              />

              <div className='mt-2'>
                {isLoading ? (
                  <div className='flex justify-center py-2'>
                    <Loading />
                  </div>
                ) : (
                  <Button
                    type='submit'
                    label={isRegister ? "Create Account" : "Sign In"}
                    className='w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition-colors'
                  />
                )}
              </div>

              <div className='text-center mt-2'>
                <p className='text-xs text-gray-500'>
                  {isRegister ? (
                    <>
                      Already registered?{" "}
                      <button
                        type='button'
                        onClick={() => toggleMode(false)}
                        className='text-blue-600 font-semibold hover:underline'
                      >
                        Sign in here
                      </button>
                    </>
                  ) : (
                    <>
                      New team member?{" "}
                      <button
                        type='button'
                        onClick={() => toggleMode(true)}
                        className='text-blue-600 font-semibold hover:underline'
                      >
                        Create an account
                      </button>
                    </>
                  )}
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
