import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  public type StudyStatus = { #notStarted; #inProgress; #completed };

  public type StudyTopic = {
    id : Nat;
    name : Text;
    status : StudyStatus;
  };

  public type Exam = {
    id : Nat;
    owner : Principal;
    subject : Text;
    date : Int;
    time : Text;
    topics : [StudyTopic];
    score : ?Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  public type OldActor = {
    exams : Map.Map<Nat, Exam>;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextExamId : Nat;
    nextTopicId : Nat;
  };

  public type NewActor = {
    exams : Map.Map<Nat, Exam>;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextExamId : Nat;
    nextTopicId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    {
      exams = old.exams;
      userProfiles = old.userProfiles;
      nextExamId = old.nextExamId;
      nextTopicId = old.nextTopicId;
    };
  };
};
