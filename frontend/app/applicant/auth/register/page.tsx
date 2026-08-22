import Image from "next/image";
import ApplicantRegisterForm from "./register-form";
import AuthHeader from "@/app/components/dashboard/AuthHeader";

export default function ApplicantRegisterPage() {
  return (
    <section className="relative min-h-screen flex overflow-hidden">
      <AuthHeader />
      {/* Left side */}
      <div className="w-1/2 bg-white relative">
        <div className="absolute bottom-0 left-0">
          <Image
            src="/images/illustrations/person-standing.svg"
            alt=""
            width={259}
            height={471}
          />
        </div>
      </div>

      {/* Right side - Green */}
      <div className="w-1/2 bg-[#087F5B] relative">
        <div className="absolute bottom-0 right-0">
          <Image
            src="/images/illustrations/person-sitting.svg"
            alt=""
            width={390}
            height={776}
          />
        </div>
      </div>

      {/* Centered Register Card */}
      <div className="absolute inset-0 top-[70px] flex items-center justify-center overflow-y-auto py-8">
        <div className="bg-white rounded-[10px] shadow-xl p-6 sm:p-8 w-full max-w-[460px] mx-4 max-h-[90vh] overflow-y-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-sm text-gray-500 mb-6">Join as an applicant to start applying</p>
          <ApplicantRegisterForm />
        </div>
      </div>
    </section>
  );
}
