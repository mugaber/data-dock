import { HardDrive } from "lucide-react";
import SignIn from "./signin";

export default function Auth() {
  return (
    <div className="flex min-h-screen">
      <div className="relative w-1/2 bg-navy p-20 flex flex-col justify-center">
        <SignIn />

        <div className="absolute bottom-10 left-0 right-0 text-center text-gray-400 text-base">
          © 2025 DataDock
        </div>
      </div>

      <div className="w-1/2 bg-primary p-20 flex flex-col justify-center">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center space-x-2.5 mb-8">
            <HardDrive className="w-7 h-7 text-white" />
            <h3 className="text-2xl font-semibold text-white">DataDock</h3>
          </div>

          <h2 className="text-4xl text-white mb-6 font-extrabold">
            Export your core metrics directly from the source
          </h2>
          <p className="text-lg text-gray-300">
            The ultimate hub for integrating project management, payroll,
            accounting, and more—empowering you to calculate core metrics for
            smarter budgeting and business intelligence.
          </p>
        </div>
      </div>
    </div>
  );
}
