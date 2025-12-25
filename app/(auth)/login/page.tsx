import AuthHeader from "./auth-header";
import LoginForm from "./login-form";
import LoginImage from "./login-image";
import { Suspense } from 'react';

interface Props {
  searchParams: Promise<{ from?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const redirectTo = params.from;

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center items-center p-4 sm:p-6 md:p-8">
          <div className="layout-content-container flex flex-col w-full max-w-6xl flex-1">
            
            {/* Main Card Container */}
            <div className="flex w-full grow rounded-2xl overflow-hidden shadow-2xl shadow-black/10">
              
              {/* Left Side - Image (Hidden on mobile) */}
              <LoginImage />
              
              {/* Right Side - Form */}
              <div className="w-full lg:w-1/2 bg-white p-8 sm:p-12 md:p-16 flex flex-col justify-center">
                <AuthHeader />

                <Suspense fallback={
                  <div className="mt-8 text-center text-gray-600">
                    Loading...
                  </div>
                }>
                  <LoginForm redirectTo={redirectTo}/>
                </Suspense>
                {/* Footer */}
                <div className="mt-auto pt-16">
                  <p className="text-center text-sm text-black">
                    © 2025 RORO MUA. All Rights Reserved.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}