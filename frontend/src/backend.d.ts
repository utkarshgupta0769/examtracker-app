import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface StudyTopic {
    id: bigint;
    status: StudyStatus;
    name: string;
}
export interface UserProfile {
    name: string;
}
export interface Exam {
    id: bigint;
    subject: string;
    owner: Principal;
    date: Time;
    time: string;
    score?: bigint;
    topics: Array<StudyTopic>;
}
export enum StudyStatus {
    notStarted = "notStarted",
    completed = "completed",
    inProgress = "inProgress"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addExam(subject: string, date: Time, time: string): Promise<bigint>;
    addStudyTopic(examId: bigint, name: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteExam(id: bigint): Promise<void>;
    getAllExams(): Promise<Array<Exam>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getExam(id: bigint): Promise<Exam>;
    getExamResults(): Promise<Array<Exam>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    recordExamScore(examId: bigint, score: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateExam(id: bigint, subject: string, date: Time, time: string): Promise<void>;
    updateTopicStatus(examId: bigint, topicId: bigint, status: StudyStatus): Promise<void>;
}
