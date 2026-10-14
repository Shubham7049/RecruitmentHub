import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  GraduationCap,
  FolderGit2,
  FileText,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  Save,
  Shield,
  Building2,
  AlertCircle,
  X,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../constants/roles";
import {
  useGetMyProfileQuery,
  useCreateProfileMutation,
  useUpdateMyProfileMutation,
} from "../../store/api/profileApi";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Badge } from "../../components/common/Badge";
import { Avatar } from "../../components/common/Avatar";
import { Spinner } from "../../components/common/Spinner";
import { formatDate } from "../../utils/formatters";

export const ProfilePage = () => {
  const { user, role } = useAuth();
  const isStudent = role === ROLES.STUDENT;

  // Student Profile Query
  const {
    data: profileResponse,
    isLoading: isProfileLoading,
    error: profileError,
    refetch,
  } = useGetMyProfileQuery(undefined, {
    skip: !isStudent,
  });

  const [createProfile, { isLoading: isCreating }] = useCreateProfileMutation();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateMyProfileMutation();

  const isSaving = isCreating || isUpdating;

  // Local state for candidate profile form
  const [dob, setDob] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [education, setEducation] = useState([]);
  const [newEducation, setNewEducation] = useState("");
  const [experience, setExperience] = useState([]);
  const [projects, setProjects] = useState([]);

  // Form states for adding items
  const [showAddExp, setShowAddExp] = useState(false);
  const [expForm, setExpForm] = useState({
    company: "",
    role: "",
    from: "",
    to: "",
    current: false,
    description: "",
  });

  const [showAddProject, setShowAddProject] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    link: "",
  });

  // Track if profile is not initialized (404 on GET)
  const isNewProfile = profileError?.status === 404;

  useEffect(() => {
    if (profileResponse?.data) {
      const p = profileResponse.data;
      if (p.dob) {
        // Format as YYYY-MM-DD for date input
        const d = new Date(p.dob);
        if (!isNaN(d.getTime())) {
          setDob(d.toISOString().split("T")[0]);
        }
      }
      setResumeUrl(p.resumeUrl || "");
      setSkills(Array.isArray(p.skills) ? p.skills : []);
      setEducation(Array.isArray(p.education) ? p.education : []);
      setExperience(Array.isArray(p.experience) ? p.experience : []);
      setProjects(Array.isArray(p.projects) ? p.projects : []);
    }
  }, [profileResponse]);

  // Skill management
  const handleAddSkill = (e) => {
    e?.preventDefault();
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      toast.error(`"${trimmed}" is already added.`);
      return;
    }
    setSkills([...skills, trimmed]);
    setNewSkill("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Education management
  const handleAddEducation = (e) => {
    e?.preventDefault();
    const trimmed = newEducation.trim();
    if (!trimmed) return;
    setEducation([...education, trimmed]);
    setNewEducation("");
  };

  const handleRemoveEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  // Experience management
  const handleAddExperience = (e) => {
    e.preventDefault();
    if (!expForm.company.trim() || !expForm.role.trim()) {
      toast.error("Company and Role are required.");
      return;
    }
    setExperience([...experience, { ...expForm }]);
    setExpForm({
      company: "",
      role: "",
      from: "",
      to: "",
      current: false,
      description: "",
    });
    setShowAddExp(false);
  };

  const handleRemoveExperience = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  // Projects management
  const handleAddProject = (e) => {
    e.preventDefault();
    if (!projectForm.title.trim()) {
      toast.error("Project title is required.");
      return;
    }
    setProjects([...projects, { ...projectForm }]);
    setProjectForm({ title: "", description: "", link: "" });
    setShowAddProject(false);
  };

  const handleRemoveProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  // Save / Update Student Profile
  const handleSaveProfile = async () => {
    const payload = {
      dob: dob ? new Date(dob).toISOString() : undefined,
      resumeUrl: resumeUrl.trim(),
      skills,
      education,
      experience,
      projects,
    };

    try {
      if (isNewProfile) {
        await createProfile(payload).unwrap();
        toast.success("Profile created successfully!");
      } else {
        await updateProfile(payload).unwrap();
        toast.success("Profile updated successfully!");
      }
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save profile.");
    }
  };

  // Render non-student (Recruiter & Admin) Account Profile
  if (!isStudent) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Header Banner */}
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar
                src={user?.avatar}
                name={user?.fullname || user?.username}
                size="xl"
                className="ring-4 ring-white/10"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant={role === ROLES.ADMIN ? "danger" : "primary"}
                    size="sm"
                  >
                    {role === ROLES.ADMIN ? "Platform Administrator" : "Employer Recruiter"}
                  </Badge>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {user?.fullname || user?.username}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                  @{user?.username} • Active Member since {formatDate(user?.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Details & Role Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Details Card */}
          <Card>
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="h-4 w-4 text-primary-600" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Full Name
                </span>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">
                  {user?.fullname || "—"}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Email Address
                </span>
                <p className="text-sm font-semibold text-slate-900 mt-0.5 flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {user?.email}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Phone Number
                </span>
                <p className="text-sm font-semibold text-slate-900 mt-0.5 flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  {user?.phone || "Not provided"}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Account Role
                </span>
                <div className="mt-1">
                  <Badge variant={role === ROLES.ADMIN ? "danger" : "primary"} size="sm">
                    {role}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role & Security Governance Card */}
          <Card>
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-600" />
                Permissions & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {role === ROLES.RECRUITER ? (
                <div className="space-y-2.5">
                  <p className="text-xs text-slate-600 font-medium">
                    As an authenticated recruiter, your account is authorized to:
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      Register and manage company profiles
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      Post and manage job opportunities
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      Review applicant submissions and progress statuses
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      Schedule and moderate interview sessions
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-xs text-slate-600 font-medium">
                    As a platform administrator, your account is authorized to:
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                      Monitor platform-wide telemetry and activity statistics
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                      Audit users, companies, jobs, applications, and interviews
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                      Execute moderation removals on inappropriate records
                    </li>
                  </ul>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] text-slate-400 block">
                  Session Token: Active Bearer Session • Secure HTTP Credentials
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Student Profile Loading State
  if (isProfileLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-8">
        <div className="flex items-center justify-center p-16">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar
              src={user?.avatar}
              name={user?.fullname || user?.username}
              size="xl"
              className="ring-4 ring-white/10"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="success" size="sm">
                  Candidate Profile
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {user?.fullname || user?.username}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                {user?.email} • @{user?.username}
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={handleSaveProfile}
            isLoading={isSaving}
            disabled={isSaving}
            leftIcon={Save}
            className="self-start sm:self-auto bg-primary-600 hover:bg-primary-500 shadow-sm"
          >
            {isNewProfile ? "Initialize Profile" : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* New Profile Notice Banner */}
      {isNewProfile && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-800 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900">Profile Not Initialized Yet</p>
            <p className="mt-0.5 text-amber-700">
              Complete your candidate details, skills, education, and resume link below. Click &quot;Initialize Profile&quot; to activate your recruiter-visible resume profile.
            </p>
          </div>
        </div>
      )}

      {/* Basic Details & Resume Card */}
      <Card>
        <CardHeader className="border-b border-slate-100 pb-3">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="h-4 w-4 text-primary-600" />
            Personal Details & Resume
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <Input value={user?.fullname || ""} disabled readOnly size="sm" />
              <p className="text-[11px] text-slate-400 mt-1">From authentication profile</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <Input value={user?.email || ""} disabled readOnly size="sm" />
              <p className="text-[11px] text-slate-400 mt-1">Verified account email</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="student-dob" className="block text-xs font-semibold text-slate-700 mb-1">
                Date of Birth
              </label>
              <Input
                id="student-dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                size="sm"
              />
            </div>
            <div>
              <label htmlFor="student-resume-url" className="block text-xs font-semibold text-slate-700 mb-1">
                Resume URL (Google Drive, Dropbox, Portfolio, etc.)
              </label>
              <div className="flex gap-2">
                <Input
                  id="student-resume-url"
                  placeholder="https://example.com/resume.pdf"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  size="sm"
                />
                {resumeUrl && (
                  <a
                    href={resumeUrl.startsWith("http") ? resumeUrl : `https://${resumeUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-medium shrink-0"
                    title="Open resume link"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Card */}
      <Card>
        <CardHeader className="border-b border-slate-100 pb-3">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-indigo-600" />
              Technical & Professional Skills
            </span>
            <Badge variant="neutral" size="sm">
              {skills.length} Skills
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <form onSubmit={handleAddSkill} className="flex gap-2 max-w-md">
            <Input
              placeholder="e.g. React, Node.js, Python..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              size="sm"
            />
            <Button type="submit" variant="outline" size="sm" leftIcon={Plus}>
              Add
            </Button>
          </form>

          {skills.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              No skills added yet. Add key skills to improve your recruiter visibility.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary-50 border border-primary-200/80 px-2.5 py-1 text-xs font-semibold text-primary-800"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-primary-400 hover:text-rose-600 transition-colors"
                    title={`Remove ${skill}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Education Card */}
      <Card>
        <CardHeader className="border-b border-slate-100 pb-3">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-emerald-600" />
              Education & Qualifications
            </span>
            <Badge variant="neutral" size="sm">
              {education.length} Entries
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <form onSubmit={handleAddEducation} className="flex gap-2 max-w-lg">
            <Input
              placeholder="e.g. B.Tech Computer Science - Stanford University (2020 - 2024)"
              value={newEducation}
              onChange={(e) => setNewEducation(e.target.value)}
              size="sm"
            />
            <Button type="submit" variant="outline" size="sm" leftIcon={Plus}>
              Add
            </Button>
          </form>

          {education.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No education entries added yet.</p>
          ) : (
            <ul className="space-y-2 pt-1">
              {education.map((edu, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-800"
                >
                  <span className="truncate pr-3">{edu}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveEducation(index)}
                    className="text-slate-400 hover:text-rose-600 transition-colors"
                    title="Remove education entry"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Experience Card */}
      <Card>
        <CardHeader className="border-b border-slate-100 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-blue-600" />
              Work & Internship Experience
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              leftIcon={Plus}
              onClick={() => setShowAddExp(!showAddExp)}
            >
              {showAddExp ? "Cancel" : "Add Experience"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {showAddExp && (
            <form
              onSubmit={handleAddExperience}
              className="p-4 rounded-xl border border-blue-100 bg-blue-50/40 space-y-3"
            >
              <h4 className="text-xs font-bold text-slate-900">Add Experience Entry</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  placeholder="Company Name *"
                  value={expForm.company}
                  onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                  size="sm"
                  required
                />
                <Input
                  placeholder="Role / Job Title *"
                  value={expForm.role}
                  onChange={(e) => setExpForm({ ...expForm, role: e.target.value })}
                  size="sm"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  placeholder="From (e.g. Jan 2022)"
                  value={expForm.from}
                  onChange={(e) => setExpForm({ ...expForm, from: e.target.value })}
                  size="sm"
                />
                <Input
                  placeholder="To (e.g. Present)"
                  value={expForm.to}
                  onChange={(e) => setExpForm({ ...expForm, to: e.target.value })}
                  size="sm"
                />
              </div>
              <textarea
                placeholder="Description of responsibilities and achievements..."
                value={expForm.description}
                onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddExp(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Entry
                </Button>
              </div>
            </form>
          )}

          {experience.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No experience records added.</p>
          ) : (
            <div className="space-y-3 pt-1">
              {experience.map((exp, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 flex items-start justify-between gap-4"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{exp.role}</h4>
                    <p className="text-xs font-semibold text-primary-600 mt-0.5">
                      {exp.company}
                    </p>
                    {(exp.from || exp.to) && (
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {exp.from || "—"} - {exp.to || "Present"}
                      </p>
                    )}
                    {exp.description && (
                      <p className="text-xs text-slate-600 mt-2 whitespace-pre-line">
                        {exp.description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(index)}
                    className="text-slate-400 hover:text-rose-600 transition-colors shrink-0"
                    title="Remove experience"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projects Card */}
      <Card>
        <CardHeader className="border-b border-slate-100 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FolderGit2 className="h-4 w-4 text-purple-600" />
              Projects & Portfolios
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              leftIcon={Plus}
              onClick={() => setShowAddProject(!showAddProject)}
            >
              {showAddProject ? "Cancel" : "Add Project"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {showAddProject && (
            <form
              onSubmit={handleAddProject}
              className="p-4 rounded-xl border border-purple-100 bg-purple-50/40 space-y-3"
            >
              <h4 className="text-xs font-bold text-slate-900">Add Project Entry</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  placeholder="Project Title *"
                  value={projectForm.title}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, title: e.target.value })
                  }
                  size="sm"
                  required
                />
                <Input
                  placeholder="Project URL (e.g. https://github.com/...)"
                  value={projectForm.link}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, link: e.target.value })
                  }
                  size="sm"
                />
              </div>
              <textarea
                placeholder="Description of the project, tech stack, and results..."
                value={projectForm.description}
                onChange={(e) =>
                  setProjectForm({ ...projectForm, description: e.target.value })
                }
                rows={2}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:ring-1 focus:ring-primary-500 focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddProject(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Project
                </Button>
              </div>
            </form>
          )}

          {projects.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No projects added yet.</p>
          ) : (
            <div className="space-y-3 pt-1">
              {projects.map((proj, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 flex items-start justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{proj.title}</h4>
                      {proj.link && (
                        <a
                          href={
                            proj.link.startsWith("http")
                              ? proj.link
                              : `https://${proj.link}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Demo / Repo <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    {proj.description && (
                      <p className="text-xs text-slate-600 mt-1 whitespace-pre-line">
                        {proj.description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveProject(index)}
                    className="text-slate-400 hover:text-rose-600 transition-colors shrink-0"
                    title="Remove project"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom Sticky Save Floating Bar */}
      <div className="flex justify-end pt-4">
        <Button
          variant="primary"
          onClick={handleSaveProfile}
          isLoading={isSaving}
          disabled={isSaving}
          leftIcon={Save}
          size="lg"
          className="bg-primary-600 hover:bg-primary-500 shadow-md"
        >
          {isNewProfile ? "Initialize Profile" : "Save All Profile Changes"}
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
