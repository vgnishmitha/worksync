import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button, Loading, Textbox } from "../components";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation } from "../redux/slices/api/authApiSlice";
import { setCredentials } from "../redux/slices/authSlice";


const Login = () => {
  const { user } = useSelector((state) => state.auth);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async (data) => {
    try {
      const res = await login(data).unwrap();

      dispatch(setCredentials(res));
      navigate("/");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  useEffect(() => {
    user && navigate("/dashboard");
  }, [user]);

  return (

      
      <div className='w-full min-h-screen flex items-center justify-center flex-col lg:flex-row bg-[#f3f4f6] dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#302943] via-slate-900 to-black'>
        <div className='w-full md:w-auto flex gap-0 md:gap-40 flex-col md:flex-row items-center justify-center'>
          {/* left side */}
          <div className='h-full w-full lg:w-2/3 flex flex-col items-center justify-center'>
            <div className='w-full md:max-w-lg 2xl:max-w-3xl flex flex-col items-center justify-center gap-5 md:gap-y-10 2xl:-mt-20'>
              <h1 className='text-4xl md:text-6xl 2xl:text-7xl font-black text-center text-blue-700 dark:text-white'>
                Team Flow
              </h1>
              <p className='text-center text-lg text-gray-600 dark:text-gray-400'>
                Manage your team and task in one place.
              </p>


            </div>
          </div>

          {/* right side */}
          <div className='w-full md:w-1/3 p-4 md:p-1 flex flex-col justify-center items-center'>
            <form
              onSubmit={handleSubmit(handleLogin)}
              className='form-container w-full md:w-[400px] flex flex-col gap-y-8 bg-white dark:bg-slate-900 px-10 pt-14 pb-14'
            >
              <div className=''>
                <p className='text-blue-600 text-3xl font-bold text-center'>
                  Welcome back!
                </p>
                <p className='text-center text-base text-gray-700 dark:text-gray-500'>
                  Keep all your credential safge.
                </p>
              </div>

              <div className='flex flex-col gap-y-5'>
                <Textbox
                  placeholder='email@example.com'
                  type='email'
                  name='email'
                  label='Email Address'
                  className='w-full rounded-full'
                  register={register("email", {
                    required: "Email Address is required!",
                  })}
                  error={errors.email ? errors.email.message : ""} />
                <Textbox
                  placeholder='your password'
                  type='password'
                  name='password'
                  label='Password'
                  className='w-full rounded-full'
                  register={register("password", {
                    required: "Password is required!",
                  })}
                  error={errors.password ? errors.password.message : ""} />

                <span className='text-sm text-gray-600 hover:underline cursor-pointer'>
                  Forget Password?
                </span>

                {isLoading ? (
                  <Loading />
                ) : (
                  <Button
                    type='submit'
                    label='Log in'
                    className='w-full h-10 bg-blue-700 text-white rounded-full' />
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
  );
};

export default Login;
