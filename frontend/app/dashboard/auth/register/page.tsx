import Image from "next/image";
import RegisterForm from "./register-form";
import AuthHeader from "@/app/components/dashboard/AuthHeader";

export default function page() {
  return (
    <section className="relative min-h-screen flex overflow-hidden">
      <AuthHeader />

      {/* Left side*/}
      <div className="w-1/2 bg-white relative">
        <div className="absolute bottom-0 left-0">
          <Image
            src="/images/illustrations/person-standing.svg"
            alt="Person standing"
            width={259}
            height={471}
          />
        </div>
      </div>

      {/* Right side - Blue background */}
      <div className="w-1/2 bg-[#087F5B] relative">
        {/* Right illustration placeholder */}
        <div className="absolute bottom-0 right-0">
          <Image
            src="/images/illustrations/person-sitting.svg"
            alt="Person sitting"
            width={390}
            height={776}
          />
        </div>
      </div>

      {/* Centered Login Card */}
      <div className="absolute inset-0 top-[70px] flex items-center justify-center">
        <div className="bg-white rounded-[10px] shadow-xl p-8 w-[420px]">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Create A New Account
          </h1>

          <RegisterForm />
        </div>
      </div>
    </section>
  );
}
