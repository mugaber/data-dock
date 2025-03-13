import Link from "next/link";
import { authPath } from "@/lib/paths";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            DataDock
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            The ultimate hub for integrating project management, payroll,
            accounting, and more.
          </p>
        </header>

        <main>
          <section className="mb-20">
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Export your core metrics directly from the source
              </h2>
              <p className="text-lg text-gray-700 mb-8">
                Empower your business with seamless data integration that
                calculates core metrics for smarter budgeting and business
                intelligence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={authPath()}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  Get Started
                </Link>
                <Link
                  href="/demo"
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  Request Demo
                </Link>
              </div>
            </div>
          </section>

          <section className="mb-20">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
              Streamline Your Business Operations
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-md">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Project Management
                </h3>
                <p className="text-gray-600">
                  Track projects, tasks, and resources in one centralized
                  location for improved efficiency.
                </p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-md">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Payroll Integration
                </h3>
                <p className="text-gray-600">
                  Seamlessly connect your payroll data with other business
                  systems for comprehensive analysis.
                </p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-md">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Accounting Tools</h3>
                <p className="text-gray-600">
                  Connect your accounting software to generate real-time
                  financial insights and reports.
                </p>
              </div>
            </div>
          </section>

          <section className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Ready to transform your business intelligence?
            </h2>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              Join businesses that use DataDock to make smarter decisions with
              integrated data.
            </p>
            <Link
              href={authPath()}
              className="px-8 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Get Started Today
            </Link>
          </section>
        </main>

        <footer className="mt-24 pt-8 border-t border-gray-200 text-center text-gray-600">
          <p>© {new Date().getFullYear()} DataDock. All rights reserved.</p>
          <Link href="/privacy-policy" className="text-blue-500">
            Privacy Policy
          </Link>
        </footer>
      </div>
    </div>
  );
}
