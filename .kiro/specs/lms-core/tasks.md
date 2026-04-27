# Implementation Plan: LMS Core

## Overview

This implementation plan breaks down the LMS Core feature into discrete coding tasks. The system is a full-stack Learning Management System built on Next.js 16 App Router with TypeScript, MongoDB/Mongoose, NextAuth v5, Cloudinary, Socket.io, and Tailwind CSS v4. The implementation follows a layered approach: data models → authentication → API routes → UI components → real-time features → testing.

## Tasks

- [ ] 1. Set up project infrastructure and data models
  - [ ] 1.1 Create Mongoose schemas and models for all entities
    - Implement User, Course, Assessment, AssessmentResult, UserProgress, Notification, and Announcement models in `src/models/`
    - Add indexes: User.email (unique), UserProgress compound index (userId, videoId), AssessmentResult compound index (userId, assessmentId)
    - Configure passwordHash field with `select: false` in User model
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7_
  - [ ] 1.2 Create Zod validation schemas for all API endpoints
    - Implement schemas in `src/lib/schemas/`: userSchemas, courseSchemas, assessmentSchemas, gradeSchemas, progressSchemas, notificationSchemas, announcementSchemas, uploadSchemas
    - Enforce passingScore range (0-100), timeLimit positive integer, email format validation
    - _Requirements: 2.3, 3.3, 5.4, 6.8, 7.5, 8.2, 11.6, 12.7, 13.5, 15.6, 16.4, 17.3, 18.4, 7.8, 7.9, 8.5_
  - [ ]\* 1.3 Write property test for Zod validation schemas
    - **Property 8: Zod validation rejects malformed input**
    - **Validates: Requirements 2.3, 3.3, 5.4, 6.8, 7.5, 8.2, 11.6, 12.7, 13.5, 15.6, 16.4, 17.3, 18.4**
    - Use fast-check to generate arbitrary objects and verify schemas reject invalid inputs

- [ ] 2. Implement authentication system
  - [ ] 2.1 Configure NextAuth v5 with Credentials provider
    - Create `src/lib/auth.config.ts` with edge-compatible JWT/session callbacks
    - Create `src/lib/auth.ts` with Credentials provider and bcrypt password verification
    - Implement login handler that checks email (case-insensitive), password, and isActive status
    - Return generic "Invalid credentials" message for all login failures
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  - [ ] 2.2 Create authentication middleware
    - Implement `middleware.ts` that imports auth from auth.config.ts
    - Redirect unauthenticated requests to protected routes to `/login`
    - _Requirements: 1.6_
  - [ ] 2.3 Create login page with form validation
    - Implement `src/app/login/page.tsx` with React Hook Form and Zod validation
    - _Requirements: 1.7_
  - [ ]\* 2.4 Write property test for password hash exclusion
    - **Property 2: Password hash never leaks**
    - **Validates: Requirements 1.5, 2.7, 17.4**
    - Generate random API responses and verify passwordHash field never appears

- [ ] 3. Checkpoint - Ensure authentication works
  - Ensure all tests pass, verify login flow works, ask the user if questions arise.

- [ ] 4. Implement User Management API (Admin)
  - [ ] 4.1 Create User CRUD API routes
    - Implement POST `/api/users` for user creation with bcrypt password hashing
    - Implement GET `/api/users` for user list retrieval
    - Implement PATCH `/api/users/[id]` for role change, activate/deactivate
    - Enforce admin-only access with 403 for non-admin sessions
    - Return 409 for duplicate email, exclude passwordHash from all responses
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6, 2.7, 2.8_
  - [ ]\* 4.2 Write unit tests for User API
    - Test valid user creation, duplicate email rejection, role change, activate/deactivate
    - Test 403 for non-admin access, verify passwordHash exclusion
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6, 2.7, 2.8_

- [ ] 5. Implement Course Assignment API (Admin)
  - [ ] 5.1 Create course assignment endpoints
    - Implement POST `/api/courses/[id]/assign` for assigning courses to students
    - Add courseId to assignedCourses array for each studentId
    - Handle idempotent assignment (no duplicates in array)
    - Implement unassign functionality to remove courseId from assignedCourses
    - Enforce admin-only access with 403 for non-admin sessions
    - _Requirements: 3.1, 3.2, 3.4, 3.5_
  - [ ]\* 5.2 Write property test for course assignment idempotence
    - **Property 13: Course assignment idempotence**
    - **Validates: Requirements 3.5**
    - Generate random (studentId, courseId) pairs, call assign multiple times, verify courseId appears exactly once

- [ ] 6. Implement Admin Overview Page
  - [ ] 6.1 Create admin overview API and page
    - Implement GET `/api/admin/overview` that returns user counts by role, course counts by status, aggregate assessment stats
    - Create `src/app/(app)/admin/overview/page.tsx` that displays these statistics
    - Redirect non-admin users to `/dashboard` via middleware
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 7. Checkpoint - Ensure admin features work
  - Ensure all tests pass, verify admin can manage users and view overview, ask the user if questions arise.

- [ ] 8. Implement Course Management API (Instructor)
  - [ ] 8.1 Create Course CRUD API routes
    - Implement POST `/api/courses` for course creation with status: draft, createdBy: session.user.id
    - Implement GET `/api/courses` with role-aware filtering (instructor: owned courses, student: assigned published courses)
    - Implement PATCH `/api/courses/[id]` for updating course fields with ownership check
    - Implement DELETE `/api/courses/[id]` for course deletion with ownership check and cascade delete of modules/assessments
    - Enforce instructor/admin access for write operations, 403 for unauthorized
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 5.6, 5.7, 10.1, 10.2, 10.3_
  - [ ]\* 8.2 Write property test for student course visibility
    - **Property 9: Student course visibility**
    - **Validates: Requirements 10.1**
    - Generate random assignedCourses arrays and course catalogs with mixed statuses, verify filtered result contains only published assigned courses
  - [ ]\* 8.3 Write unit tests for Course API
    - Test course creation, update, delete, ownership enforcement
    - Test role-based filtering for instructor vs student
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 5.6, 5.7, 10.1, 10.2_

- [ ] 9. Implement Module and Content Management API (Instructor)
  - [ ] 9.1 Create Module API routes
    - Implement POST `/api/courses/[id]/modules` for adding modules with auto-assigned order
    - Implement PATCH `/api/courses/[id]/modules/[moduleId]` for updating module title/order
    - Implement DELETE `/api/courses/[id]/modules/[moduleId]` for removing module and its content items
    - Enforce ownership check (instructor must own the course)
    - _Requirements: 6.1, 6.2, 6.3, 6.9_
  - [ ] 9.2 Create Content API routes
    - Implement POST `/api/courses/[id]/modules/[moduleId]/videos` for adding content items with auto-assigned order
    - Support content types: video, youtube, link, pdf
    - Implement DELETE for content items with Cloudinary asset cleanup if publicId exists
    - Enforce ownership check (instructor must own the course)
    - _Requirements: 6.4, 6.5, 6.7, 6.9_
  - [ ]\* 9.3 Write property test for Cloudinary asset cleanup
    - **Property 11: Cloudinary asset cleanup on content deletion**
    - **Validates: Requirements 6.7**
    - Generate content items with publicId, verify Cloudinary deletion call is made on content deletion
  - [ ]\* 9.4 Write unit tests for Module and Content APIs
    - Test module add/update/delete, content add/delete
    - Test ownership enforcement, Cloudinary cleanup
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.7, 6.9_

- [ ] 10. Implement Upload API for Cloudinary
  - [ ] 10.1 Create signed upload endpoint
    - Implement GET `/api/upload` that generates signed Cloudinary upload parameters (signature, timestamp, cloudName, apiKey, folder)
    - Scope folder based on upload context (course content vs assignment submission)
    - Enforce authentication (401 for unauthenticated)
    - _Requirements: 6.6, 13.2, 18.1, 18.2, 18.3, 18.4_
  - [ ]\* 10.2 Write unit tests for Upload API
    - Test signed parameter generation, folder scoping, 401 for unauthenticated
    - _Requirements: 18.1, 18.2, 18.3, 18.4_

- [ ] 11. Checkpoint - Ensure course and content management works
  - Ensure all tests pass, verify instructor can create courses and add content, ask the user if questions arise.

- [ ] 12. Implement Assessment Builder API (Instructor)
  - [ ] 12.1 Create Assessment CRUD API routes
    - Implement POST `/api/assessments` for creating assessments with type (quiz/test/assignment), passingScore, optional timeLimit/instructions
    - Store assessmentId on the corresponding module record
    - Implement POST `/api/assessments/[id]/questions` for adding questions (mcq/truefalse) with correctAnswer
    - Implement PATCH `/api/assessments/[id]` for updating assessment fields and questions
    - Enforce ownership check (instructor must own the course)
    - Enforce passingScore range (0-100), timeLimit positive integer for tests
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6, 7.7, 7.8, 7.9_
  - [ ]\* 12.2 Write unit tests for Assessment API
    - Test assessment creation for quiz/test/assignment, question add/update
    - Test ownership enforcement, passingScore and timeLimit validation
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6, 7.7, 7.8, 7.9_

- [ ] 13. Implement Assessment Submission API (Student)
  - [ ] 13.1 Create quiz and test submission endpoint
    - Implement POST `/api/assessments/[id]/submit` for quiz/test submissions
    - Calculate score as (correct answers / total questions) \* 100
    - Set passed: true if score >= passingScore, else passed: false
    - For tests, validate submission timestamp against timeLimit
    - Reject submission with 403 if student has prior passed attempt
    - Accept new submission with incremented attemptNumber if prior attempt failed
    - Return questions without correctAnswer field when student requests assessment
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.8_
  - [ ] 13.2 Create assignment submission endpoint
    - Implement POST `/api/assessments/[id]/submit` for assignment submissions with submissionText and/or fileUrl
    - Create AssessmentResult with type: assignment, passed: false pending grading
    - Reject submission with 403 if student has prior passed attempt
    - Accept new submission with incremented attemptNumber if prior attempt not passed
    - _Requirements: 13.1, 13.3, 13.4_
  - [ ]\* 13.3 Write property test for score calculation
    - **Property 1: Score calculation correctness**
    - **Validates: Requirements 12.1, 12.3, 12.4**
    - Generate random answer arrays with isCorrect flags and passingScore, verify computed score and passed flag match formula
  - [ ]\* 13.4 Write property test for attempt number monotonicity
    - **Property 5: Attempt number monotonicity**
    - **Validates: Requirements 12.6, 13.4, 19.4**
    - Generate sequences of submission events for same (userId, assessmentId), verify each new attemptNumber is strictly greater
  - [ ]\* 13.5 Write property test for passing attempt blocks re-submission
    - **Property 6: Passing attempt blocks re-submission**
    - **Validates: Requirements 12.5, 13.3**
    - Generate prior result with passed: true, verify submission handler returns 403 for subsequent attempt
  - [ ]\* 13.6 Write property test for assignment round-trip
    - **Property 12: Assignment submission round-trip**
    - **Validates: Requirements 13.1**
    - Generate random submissionText and fileUrl, verify stored AssessmentResult contains exact values with passed: false
  - [ ]\* 13.7 Write unit tests for Assessment Submission API
    - Test quiz/test grading, timeLimit validation, attempt blocking
    - Test assignment submission, correctAnswer field exclusion
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.8, 13.1, 13.3, 13.4_

- [ ] 14. Implement Manual Grading API (Instructor)
  - [ ] 14.1 Create grading endpoint for assignments
    - Implement PATCH `/api/grades/[resultId]` for manual grading with score (0-100), optional feedback
    - Set passed based on score >= passingScore, set gradedAt, gradedBy
    - Enforce ownership check (instructor must own the course)
    - Create Notification record and emit Socket.io event to student
    - _Requirements: 8.1, 8.3, 8.4, 8.5_
  - [ ]\* 14.2 Write unit tests for Grading API
    - Test manual grade save, passed flag calculation, ownership enforcement
    - Test notification creation and Socket.io emit
    - _Requirements: 8.1, 8.3, 8.4, 8.5_

- [ ] 15. Implement Grade Book API and UI (Instructor)
  - [ ] 15.1 Create grade book endpoints
    - Implement GET `/api/grades?courseId=X` that returns all AssessmentResult records for the course with student names, assessment titles
    - Implement GET `/api/progress?courseId=X&userId=Y` that returns per-student progress with completion percentages
    - Enforce ownership check (instructor must own the course)
    - _Requirements: 9.1, 9.2, 9.3_
  - [ ] 15.2 Create GradeBook UI component
    - Implement `src/components/instructor/GradeBook.tsx` with tabular view of all student results
    - Add inline grade input for assignments
    - _Requirements: 9.1, 9.2_
  - [ ]\* 15.3 Write unit tests for Grade Book API
    - Test grade book retrieval, per-student progress, ownership enforcement
    - _Requirements: 9.1, 9.2, 9.3_

- [ ] 16. Checkpoint - Ensure assessment and grading features work
  - Ensure all tests pass, verify students can submit assessments and instructors can grade, ask the user if questions arise.

- [ ] 17. Implement User Progress Tracking API (Student)
  - [ ] 17.1 Create progress update endpoint
    - Implement POST `/api/progress` for updating watchedSeconds for video content items
    - Calculate completed: true when watchedSeconds / totalSeconds >= 0.75
    - For pdf/youtube/link, set completed: true on first view
    - Use unique compound index (userId, videoId) to prevent duplicate records
    - _Requirements: 11.3, 11.4, 19.2_
  - [ ] 17.2 Create content unlock logic
    - Implement unlock check that verifies prior content item has completed: true
    - First content item in first module is unlocked by default
    - Return 403 for locked content access attempts
    - _Requirements: 11.1, 11.2, 11.7_
  - [ ] 17.3 Create notification on content unlock
    - When content item is unlocked, create Notification record and emit Socket.io event
    - _Requirements: 11.5_
  - [ ]\* 17.4 Write property test for video completion threshold
    - **Property 4: Video completion threshold**
    - **Validates: Requirements 11.3**
    - Generate random (watchedSeconds, totalSeconds) pairs, verify completed equals watchedSeconds / totalSeconds >= 0.75
  - [ ]\* 17.5 Write property test for content unlock sequencing
    - **Property 3: Content unlock sequencing**
    - **Validates: Requirements 11.1, 11.2**
    - Generate random course structures and UserProgress states, verify unlock predicate matches sequential rule
  - [ ]\* 17.6 Write unit tests for Progress API
    - Test progress update, completion threshold, unlock logic, locked content 403
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.7_

- [ ] 18. Implement Student Grades and Progress API
  - [ ] 18.1 Create student grades endpoint
    - Implement GET `/api/grades?userId=X&courseId=Y` that returns student's own AssessmentResult records for assigned course
    - Return 403 if course not in student's assignedCourses
    - _Requirements: 14.1, 14.3_
  - [ ] 18.2 Create student progress endpoint
    - Implement GET `/api/progress?userId=X&courseId=Y` that returns completion status per content item and overall course completion percentage
    - Return 403 if course not in student's assignedCourses
    - _Requirements: 14.2, 14.3_
  - [ ]\* 18.3 Write unit tests for Student Grades and Progress API
    - Test grade retrieval, progress retrieval, 403 for unassigned courses
    - _Requirements: 14.1, 14.2, 14.3_

- [ ] 19. Implement Socket.io real-time layer
  - [ ] 19.1 Create custom server entry point
    - Implement `server.ts` that wraps Next.js request handler and attaches Socket.io server at `/api/socketio`
    - Store io instance in module-level singleton `src/lib/socket.ts`
    - _Requirements: 15.2, 15.3_
  - [ ] 19.2 Implement Socket.io room management
    - Handle `join` event to add socket to `user:{userId}` room
    - _Requirements: 15.3_
  - [ ] 19.3 Create notification emit helper
    - Implement `emitNotification(userId, payload)` in `src/lib/socket.ts` that emits to `user:{userId}` room
    - Handle case where io is null (e.g., during tests) gracefully
    - _Requirements: 15.2_
  - [ ]\* 19.4 Write property test for notification delivery consistency
    - **Property 10: Notification delivery consistency**
    - **Validates: Requirements 8.4, 11.5, 15.1, 15.2, 16.2, 16.3**
    - Generate notification events, verify Notification document persisted AND Socket.io event emitted before API response
  - [ ]\* 19.5 Write integration tests for Socket.io
    - Test socket connection, room join, event emission using test Socket.io client
    - _Requirements: 15.2, 15.3_

- [ ] 20. Implement Notification API
  - [ ] 20.1 Create notification endpoints
    - Implement GET `/api/notifications` that returns user's notifications ordered by createdAt descending
    - Implement PATCH `/api/notifications/[id]` to mark notification as read
    - Enforce ownership check (user can only access their own notifications)
    - _Requirements: 15.4, 15.5, 15.7_
  - [ ]\* 20.2 Write unit tests for Notification API
    - Test notification retrieval, mark as read, ownership enforcement
    - _Requirements: 15.4, 15.5, 15.7_

- [ ] 21. Implement Announcement API
  - [ ] 21.1 Create announcement endpoints
    - Implement POST `/api/announcements` for creating announcements with title, body, optional courseId
    - Set createdBy to session.user.id
    - Create Notification records and emit Socket.io events for all affected students (course-scoped or platform-wide)
    - Implement GET `/api/announcements` that returns announcements where courseId is null or in student's assignedCourses
    - Enforce instructor/admin access for create, 403 for non-instructor/non-admin
    - _Requirements: 16.1, 16.2, 16.3, 16.5, 16.6_
  - [ ]\* 21.2 Write unit tests for Announcement API
    - Test announcement creation, notification/emit for course-scoped and platform-wide
    - Test announcement retrieval filtering, 403 for non-instructor/non-admin
    - _Requirements: 16.1, 16.2, 16.3, 16.5, 16.6_

- [ ] 22. Checkpoint - Ensure real-time features work
  - Ensure all tests pass, verify notifications and announcements are delivered in real-time, ask the user if questions arise.

- [ ] 23. Implement role-based access control enforcement
  - [ ] 23.1 Add role checks to all API routes
    - Review all API routes and ensure proper role checks are in place
    - Return 401 for missing session, 403 for insufficient role
    - _Requirements: 17.1, 17.2, 17.5, 17.6_
  - [ ]\* 23.2 Write property test for role-based access enforcement
    - **Property 7: Role-based access enforcement**
    - **Validates: Requirements 17.1, 17.2, 17.5, 17.6**
    - Generate random (role, endpoint) pairs, verify authorization check returns correct status code

- [ ] 24. Implement UI components for learning experience
  - [ ] 24.1 Create VideoPlayer component
    - Implement `src/components/learn/VideoPlayer.tsx` that renders Cloudinary/YouTube video
    - Integrate with useProgress hook to report watch progress
    - _Requirements: 11.3_
  - [ ] 24.2 Create ContentViewer component
    - Implement `src/components/learn/ContentViewer.tsx` that dispatches to VideoPlayer, PDF embed, link redirect, or YouTube embed based on type
    - _Requirements: 11.4_
  - [ ] 24.3 Create CourseSidebar component
    - Implement `src/components/learn/CourseSidebar.tsx` that renders module/content tree with lock/unlock state
    - Highlight current item
    - _Requirements: 11.1, 11.2_
  - [ ] 24.4 Create AssessmentTaker component
    - Implement `src/components/learn/AssessmentTaker.tsx` that renders quiz/test questions
    - Add countdown timer for tests that auto-submits when timer reaches zero
    - Handle answer submission
    - _Requirements: 12.1, 12.2, 12.9_

- [ ] 25. Implement UI components for instructor features
  - [ ] 25.1 Create CourseForm component
    - Implement `src/components/instructor/CourseForm.tsx` with React Hook Form + Zod for create/edit course
    - _Requirements: 5.1, 5.2_
  - [ ] 25.2 Create ModuleBuilder component
    - Implement `src/components/instructor/ModuleBuilder.tsx` for add/reorder/delete modules and content items via drag-and-drop
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [ ] 25.3 Create VideoUploader component
    - Implement `src/components/instructor/VideoUploader.tsx` that requests signed upload URL and uploads directly to Cloudinary
    - _Requirements: 6.6, 18.1_
  - [ ] 25.4 Create AssessmentBuilder component
    - Implement `src/components/instructor/AssessmentBuilder.tsx` for building quiz/test/assignment with question editor
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  - [ ] 25.5 Create AssignUsers component
    - Implement `src/components/instructor/AssignUsers.tsx` with multi-select student assignment UI
    - _Requirements: 3.1, 3.2_
  - [ ] 25.6 Create AnnouncementForm component
    - Implement `src/components/instructor/AnnouncementForm.tsx` for creating announcements with optional course scope
    - _Requirements: 16.1_

- [ ] 26. Implement UI components for admin features
  - [ ] 26.1 Create UserTable component
    - Implement `src/components/admin/UserTable.tsx` with paginated user list, role badge, activate/deactivate, and edit actions
    - _Requirements: 2.1, 2.4, 2.5, 2.6_

- [ ] 27. Implement role-aware dashboard pages
  - [ ] 27.1 Create admin dashboard view
    - Implement admin view in `src/app/(app)/dashboard/page.tsx` that displays platform-wide summary and links to user management
    - _Requirements: 20.1_
  - [ ] 27.2 Create instructor dashboard view
    - Implement instructor view in `src/app/(app)/dashboard/page.tsx` that displays owned courses with status and links
    - _Requirements: 20.2_
  - [ ] 27.3 Create student dashboard view
    - Implement student view in `src/app/(app)/dashboard/page.tsx` that displays assigned published courses with progress percentages
    - _Requirements: 20.3_
  - [ ] 27.4 Add role-based rendering logic
    - Use session.user.role to determine which dashboard view to render
    - _Requirements: 20.4_

- [ ] 28. Implement custom hooks
  - [ ] 28.1 Create useAuth hook
    - Implement `src/lib/useAuth.ts` that reads session from NextAuth client
    - _Requirements: 1.1_
  - [ ] 28.2 Create useSocket hook
    - Implement `src/lib/useSocket.ts` that connects to Socket.io, joins user room, exposes event listener
    - _Requirements: 15.3_
  - [ ] 28.3 Create useNotifications hook
    - Implement `src/lib/useNotifications.ts` that fetches notification list and merges real-time events
    - _Requirements: 15.4_
  - [ ] 28.4 Create useProgress hook
    - Implement `src/lib/useProgress.ts` with debounced progress reporting for video watch time
    - _Requirements: 11.3_

- [ ] 29. Checkpoint - Ensure all UI components work
  - Ensure all tests pass, verify all UI components render correctly and interact with APIs, ask the user if questions arise.

- [ ] 30. Final integration and testing
  - [ ] 30.1 Set up integration test environment
    - Configure Vitest with mongodb-memory-server for integration tests
    - Mock Cloudinary SDK in non-integration tests
    - _Requirements: All_
  - [ ]\* 30.2 Write end-to-end integration tests
    - Test complete user flows: login → course access → content viewing → assessment submission → grading
    - Test Socket.io emit verification using test Socket.io client
    - _Requirements: All_
  - [ ]\* 30.3 Write UI snapshot and interaction tests
    - Create snapshot tests for key page components (dashboard, course detail, assessment taker)
    - Use React Testing Library for interaction tests (form submission, timer countdown)
    - _Requirements: All_

- [ ] 31. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, verify complete system functionality, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties defined in the design document
- Unit tests validate specific examples and edge cases
- The implementation uses TypeScript throughout as specified in the design document
- All API routes follow the standard pattern: authenticate → authorize → validate → execute → emit (if needed) → respond
