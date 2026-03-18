// Mock data store — replaces MongoDB for frontend-only mode
// All data lives in localStorage and Zustand

export type Role = "admin" | "instructor" | "student";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string; // plain text for mock only
  role: Role;
  assignedCourses: string[];
  isActive: boolean;
}

export interface MockVideo {
  id: string;
  title: string;
  url: string;
  duration: number;
  order: number;
}

export interface MockModule {
  id: string;
  title: string;
  order: number;
  videos: MockVideo[];
}

export interface MockCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "draft" | "published";
  createdBy: string;
  modules: MockModule[];
  thumbnail?: string;
}

export interface MockQuestion {
  id: string;
  type: "mcq" | "truefalse" | "short";
  text: string;
  options: string[];
  correctAnswer: string;
}

export interface MockAssessment {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  passingScore: number;
  questions: MockQuestion[];
}

export interface MockProgress {
  userId: string;
  videoId: string;
  courseId: string;
  watchedSeconds: number;
  totalSeconds: number;
  completed: boolean;
}

export interface MockResult {
  id: string;
  userId: string;
  assessmentId: string;
  courseId: string;
  score: number;
  passed: boolean;
  gradedAt: string;
}

export interface MockNotification {
  id: string;
  userId: string;
  type: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

// ── Seed data ──────────────────────────────────────────────

export const SEED_USERS: MockUser[] = [
  {
    id: "user-admin",
    name: "Admin User",
    email: "admin@company.com",
    password: "Admin@123",
    role: "admin",
    assignedCourses: [],
    isActive: true,
  },
  {
    id: "user-instructor",
    name: "Jane Instructor",
    email: "instructor@company.com",
    password: "Instructor@123",
    role: "instructor",
    assignedCourses: [],
    isActive: true,
  },
  {
    id: "user-student",
    name: "John Student",
    email: "student@company.com",
    password: "Student@123",
    role: "student",
    assignedCourses: ["course-1"],
    isActive: true,
  },
];

export const SEED_COURSES: MockCourse[] = [
  {
    id: "course-1",
    title: "Onboarding Fundamentals",
    description: "Everything new staff need to know in their first week.",
    category: "HR",
    status: "published",
    createdBy: "user-instructor",
    modules: [
      {
        id: "mod-1",
        title: "Company Overview",
        order: 1,
        videos: [
          {
            id: "vid-1",
            title: "Welcome to the Team",
            url: "https://www.w3schools.com/html/mov_bbb.mp4",
            duration: 60,
            order: 1,
          },
          {
            id: "vid-2",
            title: "Our Mission & Values",
            url: "https://www.w3schools.com/html/movie.mp4",
            duration: 90,
            order: 2,
          },
        ],
      },
      {
        id: "mod-2",
        title: "Tools & Systems",
        order: 2,
        videos: [
          {
            id: "vid-3",
            title: "Using the Internal Portal",
            url: "https://www.w3schools.com/html/mov_bbb.mp4",
            duration: 120,
            order: 1,
          },
        ],
      },
    ],
  },
];

export const SEED_ASSESSMENTS: MockAssessment[] = [
  {
    id: "assess-1",
    courseId: "course-1",
    moduleId: "mod-1",
    title: "Company Overview Quiz",
    passingScore: 70,
    questions: [
      {
        id: "q-1",
        type: "mcq",
        text: "What is the primary goal of onboarding?",
        options: [
          "Get paid",
          "Integrate into the team",
          "Learn to code",
          "None of the above",
        ],
        correctAnswer: "Integrate into the team",
      },
      {
        id: "q-2",
        type: "truefalse",
        text: "Our company values include integrity and collaboration.",
        options: [],
        correctAnswer: "True",
      },
      {
        id: "q-3",
        type: "short",
        text: "Describe one thing you are excited to learn in your role.",
        options: [],
        correctAnswer: "",
      },
    ],
  },
];

// ── localStorage helpers ───────────────────────────────────

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Store accessors ────────────────────────────────────────

export const db = {
  users: {
    getAll: () => load<MockUser[]>("lms:users", SEED_USERS),
    save: (users: MockUser[]) => save("lms:users", users),
    findByEmail: (email: string) =>
      db.users.getAll().find((u) => u.email === email),
    findById: (id: string) => db.users.getAll().find((u) => u.id === id),
    upsert: (user: MockUser) => {
      const all = db.users.getAll();
      const idx = all.findIndex((u) => u.id === user.id);
      if (idx >= 0) all[idx] = user;
      else all.push(user);
      db.users.save(all);
    },
  },
  courses: {
    getAll: () => load<MockCourse[]>("lms:courses", SEED_COURSES),
    save: (courses: MockCourse[]) => save("lms:courses", courses),
    findById: (id: string) => db.courses.getAll().find((c) => c.id === id),
    upsert: (course: MockCourse) => {
      const all = db.courses.getAll();
      const idx = all.findIndex((c) => c.id === course.id);
      if (idx >= 0) all[idx] = course;
      else all.push(course);
      db.courses.save(all);
    },
    delete: (id: string) =>
      db.courses.save(db.courses.getAll().filter((c) => c.id !== id)),
  },
  assessments: {
    getAll: () => load<MockAssessment[]>("lms:assessments", SEED_ASSESSMENTS),
    save: (a: MockAssessment[]) => save("lms:assessments", a),
    findById: (id: string) => db.assessments.getAll().find((a) => a.id === id),
    findByModule: (moduleId: string) =>
      db.assessments.getAll().find((a) => a.moduleId === moduleId),
    upsert: (a: MockAssessment) => {
      const all = db.assessments.getAll();
      const idx = all.findIndex((x) => x.id === a.id);
      if (idx >= 0) all[idx] = a;
      else all.push(a);
      db.assessments.save(all);
    },
  },
  progress: {
    getAll: () => load<MockProgress[]>("lms:progress", []),
    save: (p: MockProgress[]) => save("lms:progress", p),
    get: (userId: string, videoId: string) =>
      db.progress
        .getAll()
        .find((p) => p.userId === userId && p.videoId === videoId),
    upsert: (p: MockProgress) => {
      const all = db.progress.getAll();
      const idx = all.findIndex(
        (x) => x.userId === p.userId && x.videoId === p.videoId,
      );
      if (idx >= 0) all[idx] = p;
      else all.push(p);
      db.progress.save(all);
    },
    forCourse: (userId: string, courseId: string) =>
      db.progress
        .getAll()
        .filter((p) => p.userId === userId && p.courseId === courseId),
  },
  results: {
    getAll: () => load<MockResult[]>("lms:results", []),
    save: (r: MockResult[]) => save("lms:results", r),
    findByUser: (userId: string, assessmentId: string) =>
      db.results
        .getAll()
        .find((r) => r.userId === userId && r.assessmentId === assessmentId),
    add: (r: MockResult) => db.results.save([...db.results.getAll(), r]),
    forCourse: (courseId: string) =>
      db.results.getAll().filter((r) => r.courseId === courseId),
  },
  notifications: {
    getAll: () => load<MockNotification[]>("lms:notifications", []),
    save: (n: MockNotification[]) => save("lms:notifications", n),
    forUser: (userId: string) =>
      db.notifications.getAll().filter((n) => n.userId === userId),
    add: (n: MockNotification) =>
      db.notifications.save([...db.notifications.getAll(), n]),
    markRead: (userId: string, ids: string[]) => {
      const all = db.notifications
        .getAll()
        .map((n) =>
          n.userId === userId && ids.includes(n.id) ? { ...n, read: true } : n,
        );
      db.notifications.save(all);
    },
  },
};
