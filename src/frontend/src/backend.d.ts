import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface NoteLiker {
    principal: Principal;
    name: string;
    college: string;
}
export interface UserProfile {
    name: string;
    college: string;
}
export interface Note {
    id: bigint;
    likeCount: bigint;
    owner: Principal;
    isStarred: boolean;
    year: string;
    answer: string;
    author: string;
    questionText: string;
    questionNo: string;
    isPinned: boolean;
    college: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createNote(author: string, year: string, college: string, questionNo: string, questionText: string, answer: string, isStarred: boolean, isPinned: boolean): Promise<bigint>;
    deleteNote(noteId: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCurrentUserRole(): Promise<UserRole>;
    getNote(noteId: bigint): Promise<Note | null>;
    getNoteLikers(noteId: bigint): Promise<Array<NoteLiker>>;
    getNotesByQuestionNo(questionNo: string): Promise<Array<Note>>;
    getUserNotesByCollege(target: string): Promise<Array<Note>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    likeNote(noteId: bigint): Promise<void>;
    listNotesSortedByQuestionNo(): Promise<Array<Note>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggleStarPin(noteId: bigint, isStarred: boolean, isPinned: boolean): Promise<void>;
    updateNote(noteId: bigint, author: string, year: string, college: string, questionNo: string, questionText: string, answer: string, isStarred: boolean, isPinned: boolean): Promise<void>;
}
