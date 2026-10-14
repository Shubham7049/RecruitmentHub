import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Search,
  MapPin,
  Building2,
  Users,
  CheckCircle2,
  Calendar,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Target,
  FileCheck,
} from "lucide-react";
import { Button } from "../components/common/Button";
import { Card, CardContent } from "../components/common/Card";
import { Badge } from "../components/common/Badge";

export const LandingPage = () => {
  const navigate = useNavigate();
  const [searchTitle, setSearchTitle] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchTitle) query.set("keyword", searchTitle);
    if (searchLocation) query.set("location", searchLocation);
    navigate(`/jobs?${query.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200/80 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-200/80 bg-primary-50/70 px-3.5 py-1 text-xs font-semibold text-primary-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary-600" />
              <span>The Next-Gen Career & Recruitment Network</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Where Exceptional Talent Meets{" "}
              <span className="text-primary-600 bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
                Visionary Teams
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Streamline your hiring lifecycle. Discover verified opportunities, track applications in real-time, and schedule round-by-round interviews on one unified platform.
            </p>

            {/* 2. SEARCH JOBS CTA FORM */}
            <div className="mt-8 pt-4">
              <form
                onSubmit={handleSearch}
                className="flex flex-col sm:flex-row items-center gap-2.5 p-2 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 max-w-2xl mx-auto"
              >
                <div className="relative flex-1 w-full">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    placeholder="Job title, skill, or company..."
                    className="w-full pl-10 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 rounded-xl focus:outline-none focus:bg-slate-50 transition-colors"
                  />
                </div>

                <div className="hidden sm:block w-px h-8 bg-slate-200" />

                <div className="relative flex-1 w-full">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    placeholder="City, state, or 'Remote'..."
                    className="w-full pl-10 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 rounded-xl focus:outline-none focus:bg-slate-50 transition-colors"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto shrink-0 py-2.5 px-6"
                  rightIcon={ArrowRight}
                >
                  Find Jobs
                </Button>
              </form>

              {/* Popular tags */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-slate-500">
                <span className="font-medium text-slate-700">Trending:</span>
                {["Software Engineer", "Full Stack", "DevOps", "Product Manager", "Remote"].map(
                  (tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => navigate(`/jobs?keyword=${encodeURIComponent(tag)}`)}
                      className="rounded-full bg-slate-100 hover:bg-slate-200 px-3 py-1 font-medium text-slate-600 transition-colors"
                    >
                      {tag}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 border-t border-slate-100 mt-12 max-w-4xl mx-auto">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">5,000+</p>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Verified Openings</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">1,200+</p>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Hiring Companies</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">98%</p>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Interview Rate</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">24h</p>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Avg Recruiter Review</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PLATFORM BENEFITS */}
      <section id="features" className="py-20 bg-slate-50/70 border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary-600 mb-2">
              Engineered For Modern Recruitment
            </h2>
            <p className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need to hire and get hired
            </p>
            <p className="mt-4 text-base text-slate-600">
              Eliminate friction across sourcing, screening, scheduling, and notifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-md transition-shadow bg-white">
              <CardContent className="p-8 space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Verified Companies & Jobs</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Every company and position is moderated and authenticated. Zero spam postings or phantom listings.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow bg-white">
              <CardContent className="p-8 space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <FileCheck className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Transparent Pipeline</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Real-time status updates as your application moves from Submitted to Shortlisted, Interviewing, or Accepted.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow bg-white">
              <CardContent className="p-8 space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Integrated Interviews</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Schedule rounds, join meetings with direct video links, and receive automated schedule alerts in one place.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-white border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary-600 mb-2">
              Simple Workflow
            </h2>
            <p className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              How Recruitment Hub Works
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="flex flex-col items-center text-center p-6 space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white font-extrabold text-xl shadow-lg">
                1
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Create Your Profile</h3>
              <p className="text-sm text-slate-500">
                Register as a Student or Recruiter in under 30 seconds with complete role protection.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white font-extrabold text-xl shadow-lg shadow-primary-600/30">
                2
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Discover & Apply</h3>
              <p className="text-sm text-slate-500">
                Filter by salary, experience, or role type. Submit one-click applications and bookmark jobs.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white font-extrabold text-xl shadow-lg shadow-emerald-600/30">
                3
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Interview & Get Hired</h3>
              <p className="text-sm text-slate-500">
                Receive round updates, join scheduled interview calls, and manage offers transparently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5 & 6. ROLE FEATURES (Student vs Recruiter) */}
      <section className="py-20 bg-slate-50/80 border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Student Features Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">For Candidates & Students</h3>
                  <p className="text-xs text-slate-500">Accelerate your early and mid-career growth</p>
                </div>
              </div>

              <ul className="space-y-3.5 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Customizable developer and professional profiles with bio, skills, and portfolio.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Bookmark interesting opportunities to review and apply later.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Real-time notifications whenever your application status updates.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Direct meeting links for upcoming technical and HR interview rounds.</span>
                </li>
              </ul>

              <div className="pt-4">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => navigate("/register?role=student")}
                >
                  Create Candidate Account
                </Button>
              </div>
            </div>

            {/* Recruiter Features Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">For Hiring Teams & Recruiters</h3>
                  <p className="text-xs text-slate-500">Build world-class engineering and product teams</p>
                </div>
              </div>

              <ul className="space-y-3.5 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary-600 shrink-0 mt-0.5" />
                  <span>Create verified company profiles with brand logos, website, and locations.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary-600 shrink-0 mt-0.5" />
                  <span>Publish targeted job openings with experience level, salary range, and requirements.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary-600 shrink-0 mt-0.5" />
                  <span>Review applicants and update statuses: Pending, Shortlisted, Accepted, or Rejected.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary-600 shrink-0 mt-0.5" />
                  <span>Schedule multi-round technical interviews with automatic candidate alerts.</span>
                </li>
              </ul>

              <div className="pt-4">
                <Button
                  variant="primary"
                  className="w-full sm:w-auto"
                  onClick={() => navigate("/register?role=recruiter")}
                >
                  Start Hiring Today
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION BANNER */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Ready to Take Your Next Career Step?
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Join hundreds of companies and thousands of qualified professionals who connect, interview, and grow on Recruitment Hub.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/register")}
              className="w-full sm:w-auto px-8"
            >
              Get Started Now
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/jobs")}
              className="w-full sm:w-auto bg-transparent border-slate-700 text-white hover:bg-slate-800"
            >
              Explore Open Positions
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
