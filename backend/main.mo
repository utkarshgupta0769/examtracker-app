import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Types
  type StudyStatus = { #notStarted; #inProgress; #completed };

  type StudyTopic = {
    id : Nat;
    name : Text;
    status : StudyStatus;
  };

  type Exam = {
    id : Nat;
    owner : Principal;
    subject : Text;
    date : Time.Time;
    time : Text;
    topics : [StudyTopic];
    score : ?Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  module Exam {
    public func compare(exam1 : Exam, exam2 : Exam) : Order.Order {
      switch (Text.compare(exam1.subject, exam2.subject)) {
        case (#equal) { Nat.compare(exam1.id, exam2.id) };
        case (order) { order };
      };
    };
  };

  // State
  let exams = Map.empty<Nat, Exam>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextExamId = 1;
  var nextTopicId = 1;

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Helper function to verify exam ownership
  private func verifyExamOwnership(caller : Principal, examId : Nat) : Exam {
    switch (exams.get(examId)) {
      case (null) { Runtime.trap("Exam not found") };
      case (?exam) {
        if (exam.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only modify your own exams");
        };
        exam;
      };
    };
  };

  // Exam Management with Auto-Generated Topics
  public shared ({ caller }) func addExam(subject : Text, date : Time.Time, time : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add exams");
    };

    let topics = generateDefaultTopics(subject);

    let exam : Exam = {
      id = nextExamId;
      owner = caller;
      subject;
      date;
      time;
      topics;
      score = null;
    };

    exams.add(nextExamId, exam);
    nextExamId += 1;
    exam.id;
  };

  // Generate default study topics based on subject/class
  func generateDefaultTopics(subject : Text) : [StudyTopic] {
    let normSubject = subject.toLower();
    switch (normSubject) {
      case ("mathematics" or "math" or "algebra" or "geometry" or "calculus") {
        [
          { id = nextTopicId; name = "Algebra"; status = #notStarted },
          { id = nextTopicId + 1; name = "Geometry"; status = #notStarted },
          { id = nextTopicId + 2; name = "Calculus"; status = #notStarted },
        ];
      };
      case ("science" or "physics" or "chemistry" or "biology") {
        [
          { id = nextTopicId; name = "Physics"; status = #notStarted },
          { id = nextTopicId + 1; name = "Chemistry"; status = #notStarted },
          { id = nextTopicId + 2; name = "Biology"; status = #notStarted },
        ];
      };
      case ("history" or "ancient civilizations" or "modern history" or "geography") {
        [
          { id = nextTopicId; name = "Ancient Civilizations"; status = #notStarted },
          { id = nextTopicId + 1; name = "Modern History"; status = #notStarted },
          { id = nextTopicId + 2; name = "Geography"; status = #notStarted },
        ];
      };
      case ("english" or "language arts" or "literature") {
        [
          { id = nextTopicId; name = "Reading Comprehension"; status = #notStarted },
          { id = nextTopicId + 1; name = "Grammar & Writing"; status = #notStarted },
          { id = nextTopicId + 2; name = "Vocabulary"; status = #notStarted },
        ];
      };
      case ("computer science" or "cs" or "programming") {
        [
          { id = nextTopicId; name = "Algorithms & Data Structures"; status = #notStarted },
          { id = nextTopicId + 1; name = "Programming Fundamentals"; status = #notStarted },
          { id = nextTopicId + 2; name = "Computer Architecture"; status = #notStarted },
        ];
      };
      case ("biology") {
        [
          { id = nextTopicId; name = "Cell Biology"; status = #notStarted },
          { id = nextTopicId + 1; name = "Genetics & Evolution"; status = #notStarted },
          { id = nextTopicId + 2; name = "Human Anatomy & Physiology"; status = #notStarted },
        ];
      };
      case ("chemistry") {
        [
          { id = nextTopicId; name = "Basic Concepts"; status = #notStarted },
          { id = nextTopicId + 1; name = "Chemical Reactions"; status = #notStarted },
          { id = nextTopicId + 2; name = "Organic Chemistry"; status = #notStarted },
        ];
      };
      case ("physics") {
        [
          { id = nextTopicId; name = "Mechanics"; status = #notStarted },
          { id = nextTopicId + 1; name = "Electricity & Magnetism"; status = #notStarted },
          { id = nextTopicId + 2; name = "Waves & Optics"; status = #notStarted },
        ];
      };
      case (_) { [] };
    };
  };

  public shared ({ caller }) func updateExam(id : Nat, subject : Text, date : Time.Time, time : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update exams");
    };

    let existingExam = verifyExamOwnership(caller, id);

    let updatedExam : Exam = {
      id;
      owner = existingExam.owner;
      subject;
      date;
      time;
      topics = existingExam.topics;
      score = existingExam.score;
    };
    exams.add(id, updatedExam);
  };

  public shared ({ caller }) func deleteExam(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete exams");
    };

    let _ = verifyExamOwnership(caller, id);
    exams.remove(id);
  };

  public query ({ caller }) func getExam(id : Nat) : async Exam {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view exams");
    };

    switch (exams.get(id)) {
      case (null) { Runtime.trap("Exam not found") };
      case (?exam) {
        if (exam.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only view your own exams");
        };
        exam;
      };
    };
  };

  public query ({ caller }) func getAllExams() : async [Exam] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view exams");
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    exams.values().filter(func(exam) { isAdmin or exam.owner == caller }).toArray().sort();
  };

  // Study Progress
  public shared ({ caller }) func addStudyTopic(examId : Nat, name : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add study topics");
    };

    let exam = verifyExamOwnership(caller, examId);

    let topic : StudyTopic = {
      id = nextTopicId;
      name;
      status = #notStarted;
    };

    let updatedTopics = exam.topics.concat([topic]);
    let updatedExam : Exam = {
      id = exam.id;
      owner = exam.owner;
      subject = exam.subject;
      date = exam.date;
      time = exam.time;
      topics = updatedTopics;
      score = exam.score;
    };

    exams.add(examId, updatedExam);
    nextTopicId += 1;
    topic.id;
  };

  public shared ({ caller }) func updateTopicStatus(examId : Nat, topicId : Nat, status : StudyStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update topic status");
    };

    let exam = verifyExamOwnership(caller, examId);

    let updatedTopics = exam.topics.map(
      func(topic) {
        if (topic.id == topicId) {
          {
            id = topic.id;
            name = topic.name;
            status;
          };
        } else {
          topic;
        };
      }
    );

    let updatedExam : Exam = {
      id = exam.id;
      owner = exam.owner;
      subject = exam.subject;
      date = exam.date;
      time = exam.time;
      topics = updatedTopics;
      score = exam.score;
    };

    exams.add(examId, updatedExam);
  };

  // Result Tracking
  public shared ({ caller }) func recordExamScore(examId : Nat, score : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record exam scores");
    };

    let exam = verifyExamOwnership(caller, examId);

    let updatedExam : Exam = {
      id = exam.id;
      owner = exam.owner;
      subject = exam.subject;
      date = exam.date;
      time = exam.time;
      topics = exam.topics;
      score = ?score;
    };

    exams.add(examId, updatedExam);
  };

  public query ({ caller }) func getExamResults() : async [Exam] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view exam results");
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    exams.values().filter(func(exam) { isAdmin or exam.owner == caller }).toArray().sort();
  };
};
