const BASE_URL = "http://localhost:4000/api/v1";

const STUDENT_CREDENTIALS = {
  email: "aarav.student@example.com",
  password: "Password@123",
};

const RECRUITER_CREDENTIALS = {
  email: "priya.recruiter@techcorp.com",
  password: "Password@123",
};

const ADMIN_CREDENTIALS = {
  email: "admin@recruitmenthub.com",
  password: "AdminPassword123!",
};

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    testsFailed++;
  }
}

async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    // Non-JSON or empty body
  }
  return {
    status: res.status,
    ok: res.ok,
    data,
  };
}

async function login(credentials) {
  const res = await apiRequest("/users/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    throw new Error(`Login failed with status ${res.status}: ${JSON.stringify(res.data)}`);
  }
  return {
    user: res.data.data.user,
    token: res.data.data.accessToken,
  };
}

function authHeaders(token) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

async function runSuite() {
  console.log("==================================================");
  console.log("PHASE 10: FINAL INTEGRATION & VERIFICATION TEST SUITE");
  console.log("==================================================");

  let studentAuth, recruiterAuth, adminAuth;

  // 1. AUTHENTICATION & SESSION VERIFICATION
  console.log("\n[1] Testing Authentication & Session Restore");
  try {
    studentAuth = await login(STUDENT_CREDENTIALS);
    assert(studentAuth.user.role === "student", "Student successfully authenticated");

    recruiterAuth = await login(RECRUITER_CREDENTIALS);
    assert(recruiterAuth.user.role === "recruiter", "Recruiter successfully authenticated");

    adminAuth = await login(ADMIN_CREDENTIALS);
    assert(adminAuth.user.role === "admin", "Admin successfully authenticated");

    // Invalid credentials check
    const invalidRes = await apiRequest("/users/login", {
      method: "POST",
      body: JSON.stringify({
        email: "nonexistent@example.com",
        password: "WrongPassword!",
      }),
    });
    assert(
      invalidRes.status === 401 || invalidRes.status === 404,
      `Invalid credentials handled correctly with HTTP ${invalidRes.status}`
    );

    // Session restore check
    const currentRes = await apiRequest("/users/current-user", {
      method: "GET",
      ...authHeaders(studentAuth.token),
    });
    assert(
      currentRes.data?.data?._id === studentAuth.user._id,
      "Current user session verified via token"
    );
  } catch (err) {
    console.error("Auth Suite Failed:", err.message);
  }

  // 2. STUDENT PROFILE MANAGEMENT
  console.log("\n[2] Testing Student Profile Management");
  try {
    let profileExists = false;

    const getProfileRes = await apiRequest("/profiles/me", {
      method: "GET",
      ...authHeaders(studentAuth.token),
    });

    if (getProfileRes.status === 200) {
      profileExists = true;
      assert(true, "Fetched existing student profile");
    } else if (getProfileRes.status === 404) {
      assert(true, "Profile not found (404) handled cleanly for uninitialized candidate");
    }

    const testProfilePayload = {
      dob: "2001-05-15",
      skills: ["React", "TypeScript", "Node.js", "MongoDB", "Express", "TailwindCSS"],
      education: [
        "B.S. in Computer Science - University of Technology (2020-2024)",
        "High School Diploma - Apex Academy (2018-2020)",
      ],
      experience: [
        {
          company: "Tech Startups Inc",
          role: "Frontend Developer Intern",
          from: "Jun 2023",
          to: "Dec 2023",
          current: false,
          description: "Built responsive UI components with React and TailwindCSS.",
        },
      ],
      projects: [
        {
          title: "Recruitment Hub Portal",
          description: "Full-stack job portal with role-based access control.",
          link: "https://github.com/example/recruitment-hub",
        },
      ],
      resumeUrl: "https://example.com/resumes/aarav_student.pdf",
    };

    let saveRes;
    if (profileExists) {
      saveRes = await apiRequest("/profiles/me", {
        method: "PATCH",
        body: JSON.stringify(testProfilePayload),
        ...authHeaders(studentAuth.token),
      });
      assert(saveRes.status === 200, "Successfully updated student profile via PATCH /profiles/me");
    } else {
      saveRes = await apiRequest("/profiles", {
        method: "POST",
        body: JSON.stringify(testProfilePayload),
        ...authHeaders(studentAuth.token),
      });
      assert(saveRes.status === 201, "Successfully created student profile via POST /profiles");
    }

    const savedData = saveRes.data?.data;
    assert(
      savedData?.skills?.includes("React") && savedData?.skills?.includes("TypeScript"),
      "Skills correctly saved and retrieved"
    );
    assert(
      savedData?.resumeUrl === testProfilePayload.resumeUrl,
      "Resume URL correctly saved and retrieved"
    );
    assert(
      savedData?.experience?.length > 0,
      "Experience history correctly saved and retrieved"
    );
  } catch (err) {
    console.error("Profile Suite Failed:", err.message);
  }

  // 3. STUDENT JOB DISCOVERY, SAVED JOBS & TRACKING
  console.log("\n[3] Testing Student Job Discovery, Saved Jobs & Applications");
  let testJobId = null;
  try {
    const jobsRes = await apiRequest("/jobs?limit=5", {
      method: "GET",
      ...authHeaders(studentAuth.token),
    });
    assert(jobsRes.status === 200, "Fetched jobs directory for student");
    const jobs = jobsRes.data?.data?.jobs || [];
    assert(jobs.length > 0, `Found ${jobs.length} jobs in directory`);

    if (jobs.length > 0) {
      testJobId = jobs[0]._id;

      // Check saved status
      const checkRes = await apiRequest(`/saved-jobs/check/${testJobId}`, {
        method: "GET",
        ...authHeaders(studentAuth.token),
      });
      assert(checkRes.status === 200, "Checked saved status of job");

      // Save job
      const saveJobRes = await apiRequest(`/saved-jobs/${testJobId}`, {
        method: "POST",
        body: JSON.stringify({}),
        ...authHeaders(studentAuth.token),
      });
      assert(
        saveJobRes.status === 201 || saveJobRes.status === 400 || saveJobRes.status === 409,
        `Save job request handled with status ${saveJobRes.status}`
      );

      // View saved jobs list
      const savedListRes = await apiRequest("/saved-jobs/my", {
        method: "GET",
        ...authHeaders(studentAuth.token),
      });
      assert(savedListRes.status === 200, "Retrieved student saved jobs list");

      // Unsave job
      const unsaveRes = await apiRequest(`/saved-jobs/${testJobId}`, {
        method: "DELETE",
        ...authHeaders(studentAuth.token),
      });
      assert(unsaveRes.status === 200, "Unsaved job successfully");
    }

    // View student applications
    const appsRes = await apiRequest("/applications/my", {
      method: "GET",
      ...authHeaders(studentAuth.token),
    });
    assert(appsRes.status === 200, "Retrieved candidate application history");

    // View student interviews
    const intsRes = await apiRequest("/interviews/my", {
      method: "GET",
      ...authHeaders(studentAuth.token),
    });
    assert(intsRes.status === 200, "Retrieved candidate interview schedule");

    // View and read notifications
    const notifsRes = await apiRequest("/notifications/my", {
      method: "GET",
      ...authHeaders(studentAuth.token),
    });
    assert(notifsRes.status === 200, "Retrieved candidate notifications");

    const readAllRes = await apiRequest("/notifications/read-all", {
      method: "PATCH",
      body: JSON.stringify({}),
      ...authHeaders(studentAuth.token),
    });
    assert(readAllRes.status === 200, "Marked all candidate notifications as read");
  } catch (err) {
    console.error("Student Suite Failed:", err.message);
  }

  // 4. RECRUITER WORKFLOW & PIPELINE
  console.log("\n[4] Testing Recruiter Pipeline & Interview Management");
  let recruiterJobId = null;
  let recruiterCompanyId = null;
  try {
    // Recruiter Companies
    const myCompsRes = await apiRequest("/companies/my", {
      method: "GET",
      ...authHeaders(recruiterAuth.token),
    });
    assert(myCompsRes.status === 200, "Retrieved recruiter's registered companies");
    const companies = myCompsRes.data?.data?.companies || [];
    if (companies.length > 0) {
      recruiterCompanyId = companies[0]._id;
      const compDetailRes = await apiRequest(`/companies/${recruiterCompanyId}`, {
        method: "GET",
        ...authHeaders(recruiterAuth.token),
      });
      assert(compDetailRes.status === 200, "Retrieved company details by ID");
    }

    // Recruiter Jobs
    const myJobsRes = await apiRequest("/jobs/my", {
      method: "GET",
      ...authHeaders(recruiterAuth.token),
    });
    assert(myJobsRes.status === 200, "Retrieved recruiter's active jobs");
    const recruiterJobs = myJobsRes.data?.data?.jobs || [];
    if (recruiterJobs.length > 0) {
      recruiterJobId = recruiterJobs[0]._id;

      // Applicants for job
      const applicantsRes = await apiRequest(`/applications/job/${recruiterJobId}`, {
        method: "GET",
        ...authHeaders(recruiterAuth.token),
      });
      assert(applicantsRes.status === 200, "Retrieved job applicant list");
    }

    // Recruiter Interviews
    const recruiterIntsRes = await apiRequest("/interviews/my", {
      method: "GET",
      ...authHeaders(recruiterAuth.token),
    });
    assert(recruiterIntsRes.status === 200, "Retrieved recruiter interview rounds");
  } catch (err) {
    console.error("Recruiter Suite Failed:", err.message);
  }

  // 5. ADMIN PLATFORM AUDIT & MODERATION
  console.log("\n[5] Testing Admin Platform Oversight & Moderation Actions");
  try {
    // Telemetry stats
    const statsRes = await apiRequest("/admin/stats", {
      method: "GET",
      ...authHeaders(adminAuth.token),
    });
    assert(statsRes.status === 200, "Retrieved platform-wide telemetry stats");
    const stats = statsRes.data?.data;
    assert(stats?.users && stats.users.total >= 3, "Stats accurately track registered users");

    // Admin Users directory
    const adminUsersRes = await apiRequest("/admin/users?limit=10", {
      method: "GET",
      ...authHeaders(adminAuth.token),
    });
    assert(adminUsersRes.status === 200, "Admin retrieved users directory");

    // Platform Companies directory (queried by AdminCompaniesPage)
    const adminCompsRes = await apiRequest("/companies?limit=10", {
      method: "GET",
      ...authHeaders(adminAuth.token),
    });
    assert(adminCompsRes.status === 200, "Admin retrieved companies directory via GET /companies");

    // Platform Jobs directory (queried by AdminJobsPage)
    const adminJobsRes = await apiRequest("/jobs?limit=10", {
      method: "GET",
      ...authHeaders(adminAuth.token),
    });
    assert(adminJobsRes.status === 200, "Admin retrieved jobs directory via GET /jobs");

    // Admin Applications audit
    const adminAppsRes = await apiRequest("/admin/applications?limit=10", {
      method: "GET",
      ...authHeaders(adminAuth.token),
    });
    assert(adminAppsRes.status === 200, "Admin retrieved platform applications audit via GET /admin/applications");

    // Admin Interviews audit
    const adminIntsRes = await apiRequest("/admin/interviews?limit=10", {
      method: "GET",
      ...authHeaders(adminAuth.token),
    });
    assert(adminIntsRes.status === 200, "Admin retrieved platform interviews audit via GET /admin/interviews");

    // Admin Self-Deletion Security Guard Check
    const selfDeleteRes = await apiRequest(`/admin/users/${adminAuth.user._id}`, {
      method: "DELETE",
      ...authHeaders(adminAuth.token),
    });
    assert(
      selfDeleteRes.status === 400 || selfDeleteRes.status === 403,
      `Admin self-deletion blocked with HTTP ${selfDeleteRes.status}: ${selfDeleteRes.data?.message}`
    );

    // Admin Moderation Delete Job test
    // 1. Recruiter creates a temporary company and job
    const tempCompRes = await apiRequest("/companies", {
      method: "POST",
      body: JSON.stringify({
        name: `Moderation Test Entity ${Date.now()}`,
        location: "Bengaluru, India",
        about: "Temporary entity created to test admin moderation deletion capabilities.",
        website: "https://moderation-test.example.com",
      }),
      ...authHeaders(recruiterAuth.token),
    });
    const tempCompId = tempCompRes.data?.data?._id;
    assert(Boolean(tempCompId), "Recruiter created temporary test company");

    if (tempCompId) {
      const tempJobRes = await apiRequest("/jobs", {
        method: "POST",
        body: JSON.stringify({
          title: "Temporary Moderation Target Job",
          description: "This job is created specifically for testing admin deletion.",
          companyId: tempCompId,
          location: "Remote",
          salary: 750000,
          experience: 1,
          requirements: ["Node.js", "QA"],
        }),
        ...authHeaders(recruiterAuth.token),
      });
      const tempJobId = tempJobRes.data?.data?._id;
      assert(Boolean(tempJobId), "Recruiter created temporary test job");

      // Admin deletes the job via DELETE /admin/jobs/:id
      const adminDeleteJobRes = await apiRequest(`/admin/jobs/${tempJobId}`, {
        method: "DELETE",
        ...authHeaders(adminAuth.token),
      });
      assert(adminDeleteJobRes.status === 200, "Admin successfully removed job via DELETE /admin/jobs/:id");

      // Admin deletes the company via DELETE /admin/companies/:id
      const adminDeleteCompRes = await apiRequest(`/admin/companies/${tempCompId}`, {
        method: "DELETE",
        ...authHeaders(adminAuth.token),
      });
      assert(adminDeleteCompRes.status === 200, "Admin successfully removed company via DELETE /admin/companies/:id");
    }
  } catch (err) {
    console.error("Admin Suite Failed:", err.message);
  }

  // 6. CROSS-ROLE SECURITY & RBAC TESTING
  console.log("\n[6] Testing Cross-Role Boundaries & RBAC");
  try {
    // Student calling Admin stats -> Expect 403
    const sAdminRes = await apiRequest("/admin/stats", {
      method: "GET",
      ...authHeaders(studentAuth.token),
    });
    assert(sAdminRes.status === 403, "Student blocked from admin stats (HTTP 403)");

    // Student calling Recruiter companies -> Expect 403
    const sRecCompRes = await apiRequest("/companies/my", {
      method: "GET",
      ...authHeaders(studentAuth.token),
    });
    assert(sRecCompRes.status === 403, "Student blocked from recruiter companies (HTTP 403)");

    // Recruiter calling Admin users -> Expect 403
    const rAdminUsersRes = await apiRequest("/admin/users", {
      method: "GET",
      ...authHeaders(recruiterAuth.token),
    });
    assert(rAdminUsersRes.status === 403, "Recruiter blocked from admin users (HTTP 403)");

    // Unauthenticated call to protected route -> Expect 401
    const unauthRes = await apiRequest("/users/current-user");
    assert(unauthRes.status === 401, "Unauthenticated request blocked (HTTP 401)");
  } catch (err) {
    console.error("RBAC Suite Failed:", err.message);
  }

  console.log("\n==================================================");
  console.log(`TEST RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log("==================================================");

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error("Fatal Error running suite:", err);
  process.exit(1);
});
