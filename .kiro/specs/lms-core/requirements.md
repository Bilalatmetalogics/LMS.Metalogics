# Requirements Document

## Introduction

This document defines the requirements for the LMS Core — a full Learning Management System built on Next.js 16 App Router, React 19, TypeScript, MongoDB/Mongoose, NextAuth v5, Cloudinary, Socket.io, Tailwind CSS v4, shadcn/ui, Zod, and React Hook Form.

The system supports three roles: **admin**, **instructor**, and **student**. Admins manage users and platform-wide data. Instructors create and manage courses, content, assessments, and grades. Students consume assigned course content, take assessments, and track their own progress.

---

## Glossary

- **LMS**: The Learning Management System described in this document.
- **Admin**: A user with the `admin` role who manages users, course assignments, and platform-wide data.
- **Instructor**: A user with the `instructor` role who creates and manages courses, content, assessments, and grades.
- **Student**: A user with the `student` role who consumes course content and takes assessments.
- **Course**: A top-level learning unit with a title, description, category, thumbnail, status, and an ordered list of modules.
- **Module**: A named, ordered section within a course containing an ordered list of content items and an optional assessment.
- **ContentItem**: A single piece of learning material within a module. Types: `video` (Cloudinary upload), `youtube` (YouTube embed URL), `link` (external URL), `pdf` (Cloudinary upload).
- **Assessment**: An evaluation attached to a module. Types: `quiz`, `test`, `assignment`.
- **Quiz**: An auto-graded assessment with MCQ and/or True/False questions; no time limit.
- **Test**: An auto-graded, timed assessment with MCQ and/or True/False questions and a countdown timer.
- **Assignment**: A manually graded assessment where the student submits a text response and/or a file upload.
- **Question**: A single item within a quiz or test. Types: `mcq` (multiple-choice) or `truefalse`.
- **AssessmentResult**: A record of one attempt by a student on an assessment, including answers, score, pass/fail status, and grading metadata.
- **UserProgress**: A record tracking a student's watch time or completion status for a single content item within a course.
- **Notification**: A real-time and persistent message delivered to a specific user via Socket.io and stored in the database.
- **Announcement**: A broadcast message created by an instructor or admin, optionally scoped to a course.
- **PassingScore**: The minimum percentage score (0–100) required to pass an assessment, set per assessment by the instructor (default: 70).
- **ContentUnlock**: The rule by which a content item becomes available to a student only after the preceding item reaches 75% completion.
- **Cloudinary**: The external media storage service used for video and PDF uploads.
- **JWT**: JSON Web Token used by NextAuth v5 for session management.
- **Zod**: The TypeScript-first schema validation library used to validate all API request bodies.
- **API_Route**: A Next.js App Router route handler under `src/app/api/`.
- **Session**: The authenticated user context provided by NextAuth v5, containing `id`, `name`, `email`, and `role`.

---

## Requirements

### Requirement 1: User Authentication

**User Story:** As any user, I want to log in with my email and password, so that I can access the LMS with my assigned role.

#### Acceptance Criteria

1. WHEN a user submits valid credentials, THE Authentication_System SHALL create a JWT session containing the user's `id`, `name`, `email`, and `role`.
2. WHEN a user submits an email that does not match an active account, THE Authentication_System SHALL return an authentication error without revealing whether the email or password was incorrect.
3. WHEN a user submits a correct email but incorrect password, THE Authentication_System SHALL return an authentication error without revealing whether the email or password was incorrect.
4. WHILE a user's `isActive` field is `false`, THE Authentication_System SHALL reject login attempts for that account.
5. THE Authentication_System SHALL never include `passwordHash` in any session token, API response, or client-side data.
6. WHEN an unauthenticated request is made to any protected route, THE Authentication_System SHALL redirect the request to `/login`.
7. THE Login_Page SHALL validate the login form using a Zod schema before submitting credentials to the server.

---

### Requirement 2: Admin — User Management

**User Story:** As an admin, I want to create and manage user accounts, so that I can control who has access to the LMS and in what role.

#### Acceptance Criteria

1. WHEN an admin submits a valid create-user request with `name`, `email`, `password`, and `role` (`instructor` or `student`), THE User_API SHALL create a new user record with `isActive: true` and a bcrypt-hashed password.
2. WHEN an admin submits a create-user request with a duplicate email, THE User_API SHALL return a 409 error with a descriptive message.
3. THE User_API SHALL validate all create-user and edit-user request bodies using a Zod schema before performing any database operation.
4. WHEN an admin submits a valid role-change request for a user, THE User_API SHALL update that user's `role` field to the new value.
5. WHEN an admin submits a deactivate request for a user, THE User_API SHALL set that user's `isActive` field to `false`.
6. WHEN an admin submits an activate request for a user, THE User_API SHALL set that user's `isActive` field to `true`.
7. THE User_API SHALL return user records without the `passwordHash` field in any response.
8. WHEN a non-admin session makes a request to any user management endpoint, THE User_API SHALL return a 403 error.

---

### Requirement 3: Admin — Course Assignment

**User Story:** As an admin, I want to assign and unassign courses to students, so that students only see the courses they are enrolled in.

#### Acceptance Criteria

1. WHEN an admin submits a valid assign request with a `courseId` and a list of `studentIds`, THE Assignment_API SHALL add the `courseId` to the `assignedCourses` array of each specified student.
2. WHEN an admin submits an unassign request with a `courseId` and a list of `studentIds`, THE Assignment_API SHALL remove the `courseId` from the `assignedCourses` array of each specified student.
3. THE Assignment_API SHALL validate all request bodies using a Zod schema before performing any database operation.
4. WHEN a non-admin session makes a request to the assignment endpoint, THE Assignment_API SHALL return a 403 error.
5. WHEN an admin assigns a course that is already in a student's `assignedCourses`, THE Assignment_API SHALL treat the operation as a no-op for that student and return a success response.

---

### Requirement 4: Admin — Platform Overview

**User Story:** As an admin, I want to view platform-wide statistics, so that I can monitor overall usage and progress.

#### Acceptance Criteria

1. THE Admin_Overview_Page SHALL display the total number of registered users, broken down by role.
2. THE Admin_Overview_Page SHALL display the total number of courses, broken down by status (`draft` and `published`).
3. THE Admin_Overview_Page SHALL display aggregate assessment results across all courses, including total submissions and overall pass rate.
4. WHEN a non-admin session navigates to any `/admin/*` page, THE LMS SHALL redirect the user to `/dashboard`.

---

### Requirement 5: Instructor — Course Management

**User Story:** As an instructor, I want to create and manage my courses, so that I can deliver structured learning content to students.

#### Acceptance Criteria

1. WHEN an instructor submits a valid create-course request with `title`, `description`, `category`, and optional `thumbnail`, THE Course_API SHALL create a new course record with `status: draft` and `createdBy` set to the instructor's user ID.
2. WHEN an instructor submits a valid update-course request for a course they own, THE Course_API SHALL update the specified fields (`title`, `description`, `category`, `thumbnail`, `status`).
3. WHEN an instructor submits a delete request for a course they own, THE Course_API SHALL delete the course record and all associated modules, content items, and assessments.
4. THE Course_API SHALL validate all create and update request bodies using a Zod schema before performing any database operation.
5. WHEN an instructor requests their course list, THE Course_API SHALL return only courses where `createdBy` matches the instructor's user ID.
6. WHEN an instructor attempts to modify or delete a course they do not own, THE Course_API SHALL return a 403 error.
7. WHEN a non-instructor and non-admin session makes a request to instructor course management endpoints, THE Course_API SHALL return a 403 error.

---

### Requirement 6: Instructor — Module and Content Management

**User Story:** As an instructor, I want to add modules and content items to my courses, so that I can organize learning material into structured sections.

#### Acceptance Criteria

1. WHEN an instructor submits a valid add-module request for a course they own, THE Module_API SHALL append a new module with the given `title` and an auto-assigned `order` value to the course's `modules` array.
2. WHEN an instructor submits a valid update-module request, THE Module_API SHALL update the module's `title` or `order` within the course document.
3. WHEN an instructor submits a delete-module request, THE Module_API SHALL remove the module and all its content items from the course document.
4. WHEN an instructor submits a valid add-content request with `title`, `type`, `url`, and optional `duration` and `description`, THE Content_API SHALL append a new content item with an auto-assigned `order` value to the specified module's content array.
5. THE Content_API SHALL accept content items of type `video`, `youtube`, `link`, and `pdf`.
6. WHEN an instructor uploads a video or PDF file, THE Upload_API SHALL return a signed Cloudinary upload URL and `publicId` for direct client-side upload to Cloudinary.
7. WHEN an instructor submits a delete-content request, THE Content_API SHALL remove the content item from the module and, if the content item has a `publicId`, THE Content_API SHALL delete the corresponding asset from Cloudinary.
8. THE Module_API SHALL validate all request bodies using a Zod schema before performing any database operation.
9. WHEN an instructor attempts to modify content in a course they do not own, THE Content_API SHALL return a 403 error.

---

### Requirement 7: Instructor — Assessment Builder

**User Story:** As an instructor, I want to build assessments for each module, so that I can evaluate student understanding.

#### Acceptance Criteria

1. WHEN an instructor submits a valid create-assessment request for a module they own, THE Assessment_API SHALL create a new assessment record with the given `title`, `type`, `passingScore`, and optional `timeLimit` (for tests) or `instructions` (for assignments).
2. THE Assessment_API SHALL accept assessment types of `quiz`, `test`, and `assignment`.
3. WHEN an instructor adds a question to a quiz or test, THE Assessment_API SHALL store the question with `type` (`mcq` or `truefalse`), `text`, `options` (for MCQ), and `correctAnswer`.
4. WHEN an instructor submits a valid update-assessment request, THE Assessment_API SHALL update the assessment's fields and question list.
5. THE Assessment_API SHALL validate all request bodies using a Zod schema before performing any database operation.
6. WHEN an instructor attempts to modify an assessment for a course they do not own, THE Assessment_API SHALL return a 403 error.
7. WHEN an assessment is created for a module, THE Assessment_API SHALL store the `assessmentId` on the corresponding module record.
8. THE Assessment_API SHALL enforce that `passingScore` is a number between 0 and 100 inclusive.
9. THE Assessment_API SHALL enforce that `timeLimit` for a test is a positive integer representing minutes.

---

### Requirement 8: Instructor — Manual Grading

**User Story:** As an instructor, I want to manually grade assignment submissions, so that I can provide scores and feedback to students.

#### Acceptance Criteria

1. WHEN an instructor submits a valid grade request with `score` (0–100) and optional `feedback` for an assignment result they are authorized to grade, THE Grades_API SHALL update the `AssessmentResult` record with the `score`, `passed` (based on `passingScore`), `feedback`, `gradedAt`, and `gradedBy` fields.
2. THE Grades_API SHALL validate all grade request bodies using a Zod schema before performing any database operation.
3. WHEN an instructor submits a grade for an assignment in a course they do not own, THE Grades_API SHALL return a 403 error.
4. WHEN a grade is saved for an assignment, THE Grades_API SHALL create a `Notification` record for the student and emit a real-time Socket.io event to the student's socket room.
5. THE Grades_API SHALL enforce that `score` is a number between 0 and 100 inclusive.

---

### Requirement 9: Instructor — Grade Book

**User Story:** As an instructor, I want to view a grade book for each of my courses, so that I can see all student scores across all assessments.

#### Acceptance Criteria

1. WHEN an instructor requests the grade book for a course they own, THE Grades_API SHALL return all `AssessmentResult` records for that course, including student name, assessment title, score, passed status, and submission date.
2. WHEN an instructor requests per-student progress for a course they own, THE Grades_API SHALL return the student's completion percentage per content item and overall course completion percentage.
3. WHEN an instructor requests grade data for a course they do not own, THE Grades_API SHALL return a 403 error.

---

### Requirement 10: Student — Course Access

**User Story:** As a student, I want to see only the courses assigned to me, so that my learning experience is focused on relevant content.

#### Acceptance Criteria

1. WHEN a student requests their course list, THE Course_API SHALL return only courses where the course ID is in the student's `assignedCourses` array and the course `status` is `published`.
2. WHEN a student requests the detail of a course not in their `assignedCourses`, THE Course_API SHALL return a 403 error.
3. WHEN a non-student and non-admin session makes a request to student course endpoints, THE Course_API SHALL return a 403 error.

---

### Requirement 11: Student — Sequential Content Unlock

**User Story:** As a student, I want content items to unlock progressively as I complete each one, so that I follow the intended learning sequence.

#### Acceptance Criteria

1. THE LMS SHALL treat the first content item in the first module of an assigned course as unlocked by default for the student.
2. WHEN a student's `UserProgress` record for a content item shows `completed: true`, THE LMS SHALL mark the next content item in sequence as unlocked.
3. WHEN a student's video watch time reaches 75% of the total duration, THE Progress_API SHALL set `completed: true` on the corresponding `UserProgress` record.
4. WHEN a student views a `pdf`, `youtube`, or `link` content item for the first time, THE Progress_API SHALL set `completed: true` on the corresponding `UserProgress` record immediately upon first view.
5. WHEN a content item is unlocked for a student, THE LMS SHALL create a `Notification` record for the student and emit a real-time Socket.io event to the student's socket room.
6. THE Progress_API SHALL validate all progress update request bodies using a Zod schema before performing any database operation.
7. WHEN a student attempts to access a locked content item via the API, THE Progress_API SHALL return a 403 error.

---

### Requirement 12: Student — Quiz and Test Taking

**User Story:** As a student, I want to take quizzes and tests, so that I can demonstrate my understanding of the course material.

#### Acceptance Criteria

1. WHEN a student submits a quiz attempt with answers for all questions, THE Assessment_Submission_API SHALL calculate the score as `(correct answers / total questions) * 100`, store the result, and return the score and pass/fail status.
2. WHEN a student submits a test attempt, THE Assessment_Submission_API SHALL validate that the submission was received before the `timeLimit` expired and then grade it identically to a quiz.
3. WHEN a student's score is greater than or equal to the assessment's `passingScore`, THE Assessment_Submission_API SHALL set `passed: true` on the `AssessmentResult` record.
4. WHEN a student's score is less than the assessment's `passingScore`, THE Assessment_Submission_API SHALL set `passed: false` on the `AssessmentResult` record.
5. WHEN a student has a prior attempt with `passed: true` for a quiz or test, THE Assessment_Submission_API SHALL reject a new submission with a 403 error.
6. WHEN a student has a prior attempt with `passed: false` for a quiz or test, THE Assessment_Submission_API SHALL accept a new submission and store it as a new `AssessmentResult` with an incremented `attemptNumber`.
7. THE Assessment_Submission_API SHALL validate all submission request bodies using a Zod schema before performing any database operation.
8. WHEN a student requests a quiz or test assessment, THE Assessment_API SHALL return the questions without the `correctAnswer` field.
9. THE Test_UI SHALL display a countdown timer initialized to the assessment's `timeLimit` in minutes and SHALL automatically submit the test when the timer reaches zero.

---

### Requirement 13: Student — Assignment Submission

**User Story:** As a student, I want to submit assignments with a text response and optional file, so that my instructor can review and grade my work.

#### Acceptance Criteria

1. WHEN a student submits a valid assignment with `submissionText` and/or a file upload URL, THE Assessment_Submission_API SHALL create an `AssessmentResult` record with `type: assignment`, the submission data, and `passed: false` pending manual grading.
2. WHEN a student uploads a file for an assignment, THE Upload_API SHALL return a signed Cloudinary upload URL for the student to upload directly to Cloudinary.
3. WHEN a student has already submitted an assignment with `passed: true`, THE Assessment_Submission_API SHALL reject a new submission with a 403 error.
4. WHEN a student has already submitted an assignment with `passed: false` (not yet graded or failed), THE Assessment_Submission_API SHALL accept a new submission and store it as a new `AssessmentResult` with an incremented `attemptNumber`.
5. THE Assessment_Submission_API SHALL validate all assignment submission request bodies using a Zod schema before performing any database operation.

---

### Requirement 14: Student — Grades and Progress Visibility

**User Story:** As a student, I want to see my own grades and progress, so that I can track my performance in each course.

#### Acceptance Criteria

1. WHEN a student requests their grades for a course in their `assignedCourses`, THE Grades_API SHALL return all `AssessmentResult` records for that student in that course, including score, passed status, feedback, and graded date.
2. WHEN a student requests progress for a course in their `assignedCourses`, THE Progress_API SHALL return the completion status for each content item and the overall course completion percentage.
3. WHEN a student requests grades or progress for a course not in their `assignedCourses`, THE Grades_API SHALL return a 403 error.

---

### Requirement 15: Real-Time Notifications

**User Story:** As a student, I want to receive real-time notifications for content unlocks, grades, and announcements, so that I am immediately informed of relevant events.

#### Acceptance Criteria

1. WHEN a notification event is triggered (content unlock, grade received, or announcement), THE Notification_System SHALL persist a `Notification` record to the database for the target user.
2. WHEN a notification is persisted, THE Notification_System SHALL emit a Socket.io event to the target user's socket room (`user:{userId}`) with the notification payload.
3. WHEN a student connects to the Socket.io server, THE Socket_Server SHALL add the socket to the room `user:{userId}` upon receiving a `join` event with the user's ID.
4. WHEN a student requests their notifications, THE Notification_API SHALL return all `Notification` records for that user, ordered by `createdAt` descending.
5. WHEN a student marks a notification as read, THE Notification_API SHALL set `read: true` on the specified `Notification` record.
6. THE Notification_API SHALL validate all request bodies using a Zod schema before performing any database operation.
7. WHEN a non-owner session requests or modifies notifications for a user, THE Notification_API SHALL return a 403 error.

---

### Requirement 16: Announcements

**User Story:** As an instructor or admin, I want to post announcements to a course or the entire platform, so that I can communicate important information to students.

#### Acceptance Criteria

1. WHEN an instructor submits a valid announcement with `title`, `body`, and optional `courseId`, THE Announcement_API SHALL create an `Announcement` record with `createdBy` set to the instructor's user ID.
2. WHEN an announcement is created with a `courseId`, THE Announcement_API SHALL create a `Notification` record and emit a Socket.io event for each student assigned to that course.
3. WHEN an announcement is created without a `courseId`, THE Announcement_API SHALL create a `Notification` record and emit a Socket.io event for all active students on the platform.
4. THE Announcement_API SHALL validate all request bodies using a Zod schema before performing any database operation.
5. WHEN a student requests announcements, THE Announcement_API SHALL return announcements where `courseId` is null or `courseId` is in the student's `assignedCourses`, ordered by `createdAt` descending.
6. WHEN a non-instructor and non-admin session submits a create-announcement request, THE Announcement_API SHALL return a 403 error.

---

### Requirement 17: API Security and Validation

**User Story:** As a system operator, I want all API routes to enforce authentication, role-based authorization, and input validation, so that the system is protected against unauthorized access and malformed data.

#### Acceptance Criteria

1. THE API_Route SHALL call `auth()` from NextAuth v5 and verify the session before executing any database operation.
2. WHEN a request arrives at any API_Route without a valid session, THE API_Route SHALL return a 401 error.
3. THE API_Route SHALL use a Zod schema to parse and validate the request body before executing any database operation, and SHALL return a 400 error with validation details if the body is invalid.
4. THE API_Route SHALL never return the `passwordHash` field in any response payload.
5. WHEN a student makes a request to an instructor-only or admin-only endpoint, THE API_Route SHALL return a 403 error.
6. WHEN an instructor makes a request to an admin-only endpoint, THE API_Route SHALL return a 403 error.
7. THE API_Route SHALL return structured JSON error responses with a consistent shape: `{ error: string, details?: unknown }`.

---

### Requirement 18: Media Upload via Cloudinary

**User Story:** As an instructor or student, I want to upload files directly to Cloudinary, so that large media files are stored reliably without passing through the application server.

#### Acceptance Criteria

1. WHEN an authenticated instructor or student requests upload credentials, THE Upload_API SHALL generate and return signed Cloudinary upload parameters (`signature`, `timestamp`, `cloudName`, `apiKey`, `folder`).
2. THE Upload_API SHALL scope the signed parameters to a specific Cloudinary folder based on the upload context (course content or assignment submission).
3. WHEN an unauthenticated request is made to the upload endpoint, THE Upload_API SHALL return a 401 error.
4. THE Upload_API SHALL validate the upload request query parameters using a Zod schema before generating credentials.

---

### Requirement 19: Data Model Integrity

**User Story:** As a system operator, I want the data models to enforce referential integrity and required fields, so that the database remains consistent.

#### Acceptance Criteria

1. THE User_Model SHALL enforce that `email` is unique and stored in lowercase.
2. THE UserProgress_Model SHALL enforce a unique compound index on `{ userId, videoId }` to prevent duplicate progress records.
3. THE Course_Model SHALL store modules as an embedded array ordered by the `order` field, and each module SHALL store content items as an embedded array ordered by the `order` field.
4. THE AssessmentResult_Model SHALL store `attemptNumber` to distinguish multiple attempts by the same student on the same assessment.
5. THE AssessmentResult_Model SHALL store `type` (`quiz`, `test`, or `assignment`) to allow type-specific query filtering without joining the Assessment collection.
6. THE Assessment_Model SHALL store `type` (`quiz`, `test`, or `assignment`) and SHALL enforce that `timeLimit` is only present when `type` is `test`.
7. THE Assessment_Model SHALL store `instructions` for assignments and SHALL enforce that `questions` is only populated for `quiz` and `test` types.

---

### Requirement 20: Role-Aware Dashboard

**User Story:** As any authenticated user, I want a dashboard that shows information relevant to my role, so that I can quickly access the most important parts of the LMS.

#### Acceptance Criteria

1. WHEN an admin navigates to `/dashboard`, THE Dashboard_Page SHALL display platform-wide summary statistics and links to user management and the overview page.
2. WHEN an instructor navigates to `/dashboard`, THE Dashboard_Page SHALL display the instructor's courses with their status and links to the course editor and grade book.
3. WHEN a student navigates to `/dashboard`, THE Dashboard_Page SHALL display the student's assigned published courses with overall progress percentages.
4. THE Dashboard_Page SHALL determine the user's role from the active session and render the appropriate view without an additional API call for role resolution.
