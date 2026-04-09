# ExamTracker App

## Overview
A student exam tracking application that helps students manage upcoming exams, track study progress, record results, and get reminders for important dates. The application is packaged as a standalone Android APK using a WebView wrapper for mobile distribution.

## Core Features

### Exam Management
- Add new exams with subject/class name, exam date, and time
- Subject/class selection is required when creating a new exam
- Edit existing exam details
- View list of all upcoming exams
- Delete exams when no longer needed

### Study Progress Tracking
- For each exam, study topics are automatically generated based on the selected subject/class
- AI-powered topic generation creates relevant study topics:
  - Mathematics: "Algebra", "Geometry", "Calculus"
  - Science: "Physics", "Chemistry", "Biology"
  - History: "Ancient Civilizations", "Modern History", "Geography"
  - Similar topic sets for other subjects
- Mark each topic with status: "not started," "in progress," or "completed"
- View overall study progress percentage for each exam

### Result Tracking
- Record exam scores after completion
- View historical exam results by subject
- Display performance trends and average scores by subject

### Reminders and Alerts
- Show countdown timers for upcoming exams
- Display alerts for exams approaching within a specified timeframe

### Dashboard Overview
- Summary view showing:
  - Number of upcoming exams
  - Overall study progress across all exams
  - Average score across all subjects
  - Recent exam results

### Advertisement Integration
- Integrate Google AdSense ad component across every page of the application automatically
- Ensure ads appear on all main pages including Dashboard, ResultsView, Profile, and Landing without duplicating script loads
- Use the specific ad unit with client ID `ca-pub-3725056311782462` and slot ID `1633957277`
- Display autorelaxed format ads that adapt to content and screen size
- Keep ads responsive across mobile and desktop layouts
- Maintain compliance with AdSense placement guidelines
- Prevent script load delays and ensure proper rendering within all routes
- Ads must remain fully functional within the Android WebView wrapper
- Application content language: English

### Google AdSense Site Verification
- Include the Google AdSense verification script in the global `<head>` section to verify site ownership
- The verification script must load on every page globally using the publisher ID `ca-pub-3725056311782462`
- Use the async AdSense script with crossorigin="anonymous" attribute for proper verification
- Ensure the verification script loads only once globally to avoid duplicates

### Android APK Packaging
- Package the web application as a standalone Android APK using WebView wrapper
- Include full Internet access permissions for proper functionality
- Display splash screen with app logo during app startup
- APK must be signed and ready for distribution on Android devices
- Application content language: English
- Ensure all web features work seamlessly within the WebView environment

### Production Backend Connection and Error Handling
- Implement robust backend actor initialization that automatically detects and connects to the correct deployed canister ID in production environment
- Update `useActor` and `useActorWithStatus` hooks to properly detect production environment and use the active canister principal from the deployed Internet Computer canister
- Add environment detection logic to distinguish between local development and production deployment
- Implement fallback retry system with exponential backoff that refreshes actor initialization if it fails due to missing canister ID or network mismatch
- Display clear user-facing error message if the backend actor cannot be initialized after multiple retries
- Include "Retry Connection" button that triggers re-binding to the correct production backend canister when connection fails
- Automatically reattempt connection when authentication state changes (user logs in/out)
- Ensure proper sequencing of Internet Identity authentication before initializing backend actors
- Prevent "actor not available" errors by implementing proper connection state management with production canister ID validation
- Add error messaging to indicate if the production backend canister is unreachable or if the actor failed to initialize
- Verify deployed Internet Computer canister ID is correctly referenced in both build configuration and runtime environments
- Handle canister ID mismatch errors between build-time and runtime environments gracefully

## Data Storage (Backend)
The backend must store:
- Exam records (subject/class, date, time, status)
- Study topics for each exam with progress status (auto-generated based on subject)
- Exam results and scores
- User preferences for reminder settings

## Key Operations (Backend)
- Create, read, update, delete exam records
- Auto-generate study topics based on subject/class using AI logic in the addExam function
- Manage study topics and progress status
- Store and retrieve exam results
- Calculate performance statistics and averages
- Provide health check endpoint for connection verification with production canister ID validation
- Handle authentication state changes and actor re-initialization in production environment
- Validate canister principal matches deployed production environment
