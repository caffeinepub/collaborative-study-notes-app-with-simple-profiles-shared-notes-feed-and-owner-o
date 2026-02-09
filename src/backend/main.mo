import Map "mo:core/Map";
import Set "mo:core/Set";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  public type ProfilePhoto = {
    mimeType : Text;
    data : [Nat8];
  };

  public type UserProfile = {
    name : Text;
    college : Text;
    photo : ?ProfilePhoto;
  };

  public type PublicProfile = {
    name : Text;
    college : Text;
    photo : ?ProfilePhoto;
  };

  public type Note = {
    id : Nat;
    owner : Principal;
    author : Text;
    year : Text;
    college : Text;
    questionNo : Text;
    questionText : Text;
    answer : Text;
    isStarred : Bool;
    isPinned : Bool;
    likeCount : Nat;
  };

  module Note {
    public func compareByQuestionNo(note1 : Note, note2 : Note) : Order.Order {
      Text.compare(note1.questionNo, note2.questionNo);
    };
  };

  public type NoteLiker = {
    principal : Principal;
    name : Text;
    college : Text;
  };

  public type ExtendedUserProfile = {
    principal : Principal;
    name : Text;
    college : Text;
    photo : ?ProfilePhoto;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var nextNoteId = 0;
  let profiles = Map.empty<Principal, UserProfile>();
  let notes = Map.empty<Nat, Note>();
  let noteLikes = Map.empty<Nat, Set.Set<Principal>>();
  let noteReports = Map.empty<Nat, Set.Set<Principal>>();

  public query ({ caller }) func listAllUsers() : async [ExtendedUserProfile] {
    profiles.toArray().map(
      func((principal, profile)) {
        {
          principal;
          name = profile.name;
          college = profile.college;
          photo = profile.photo;
        };
      }
    );
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    profiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    // Allow anyone (including guests) to view public profiles
    // This is needed to display profile photos next to notes and comments
    profiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    profiles.add(caller, profile);
  };

  public query ({ caller }) func getCurrentUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  // Notes
  public shared ({ caller }) func createNote(author : Text, year : Text, college : Text, questionNo : Text, questionText : Text, answer : Text, isStarred : Bool, isPinned : Bool) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create notes");
    };
    let noteId = nextNoteId;
    let newNote : Note = {
      id = noteId;
      owner = caller;
      author;
      year;
      college;
      questionNo;
      questionText;
      answer;
      isStarred;
      isPinned;
      likeCount = 0;
    };
    notes.add(noteId, newNote);
    nextNoteId += 1;
    noteId;
  };

  public query ({ caller }) func getNote(noteId : Nat) : async ?Note {
    notes.get(noteId);
  };

  public query ({ caller }) func listNotesSortedByQuestionNo() : async [Note] {
    notes.values().toArray().sort(Note.compareByQuestionNo);
  };

  public shared ({ caller }) func updateNote(noteId : Nat, author : Text, year : Text, college : Text, questionNo : Text, questionText : Text, answer : Text, isStarred : Bool, isPinned : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update notes");
    };
    switch (notes.get(noteId)) {
      case (null) { Runtime.trap("Note not found") };
      case (?note) {
        if (note.owner != caller) {
          Runtime.trap("Unauthorized: Only the note owner can edit");
        };
        let updatedNote : Note = {
          id = note.id;
          owner = note.owner;
          author;
          year;
          college;
          questionNo;
          questionText;
          answer;
          isStarred;
          isPinned;
          likeCount = note.likeCount;
        };
        notes.add(noteId, updatedNote);
      };
    };
  };

  public shared ({ caller }) func deleteNote(noteId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete notes");
    };
    switch (notes.get(noteId)) {
      case (null) { Runtime.trap("Note not found") };
      case (?note) {
        if (note.owner != caller) {
          Runtime.trap("Unauthorized: Only the note owner can delete");
        };
        notes.remove(noteId);
        noteReports.remove(noteId);
      };
    };
  };

  public shared ({ caller }) func toggleStarPin(noteId : Nat, isStarred : Bool, isPinned : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update notes");
    };
    switch (notes.get(noteId)) {
      case (null) { Runtime.trap("Note not found") };
      case (?note) {
        if (note.owner != caller) {
          Runtime.trap("Unauthorized: Only the note owner can update");
        };
        let updatedNote : Note = {
          id = note.id;
          owner = note.owner;
          author = note.author;
          year = note.year;
          college = note.college;
          questionNo = note.questionNo;
          questionText = note.questionText;
          answer = note.answer;
          isStarred;
          isPinned;
          likeCount = note.likeCount;
        };
        notes.add(noteId, updatedNote);
      };
    };
  };

  public query ({ caller }) func getNotesByQuestionNo(questionNo : Text) : async [Note] {
    notes.values().toArray().filter(
      func(note) {
        note.questionNo == questionNo;
      }
    );
  };

  public query ({ caller }) func getUserNotesByCollege(target : Text) : async [Note] {
    let targetLower = target.toLower();
    notes.values().toArray().filter(
      func(note) {
        let collegeLower = note.college.toLower();
        collegeLower.contains(#text targetLower); // FIXED: Was """"wasText"" in extracted code (typo)
      }
    );
  };

  // Like/Upvote system
  public shared ({ caller }) func likeNote(noteId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Must be a registered user to like");
    };

    switch (notes.get(noteId)) {
      case (null) { Runtime.trap("Note not found") };
      case (?note) {
        let likes = switch (noteLikes.get(noteId)) {
          case (null) { Set.empty<Principal>() };
          case (?existing) { existing };
        };

        if (likes.contains(caller)) {
          Runtime.trap("This user has already liked the note. Cannot like again");
        } else {
          likes.add(caller);
          noteLikes.add(noteId, likes);
          notes.add(noteId, { note with likeCount = note.likeCount + 1 });
        };
      };
    };
  };

  public query ({ caller }) func getNoteLikers(noteId : Nat) : async [NoteLiker] {
    // No authentication required - anyone can see who liked a note
    switch (notes.get(noteId)) {
      case (null) { Runtime.trap("Note not found") };
      case (?_note) {
        switch (noteLikes.get(noteId)) {
          case (null) { [] };
          case (?likersSet) {
            likersSet.toArray().map(
              func(principal) {
                switch (profiles.get(principal)) {
                  case (null) { { principal; name = "Unknown"; college = "Unknown" } };
                  case (?profile) { { principal; name = profile.name; college = profile.college } };
                };
              }
            );
          };
        };
      };
    };
  };

  // Reporting logic - on first report, note is deleted immediately
  public shared ({ caller }) func reportAndDeleteNote(noteId : Nat) : async () {
    // Only authenticated users can report notes
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can report notes");
    };

    switch (notes.get(noteId)) {
      case (null) {
        Runtime.trap("Note not found. Already deleted?");
      };
      case (?note) {
        // Check if this note has already been reported
        let reports = switch (noteReports.get(noteId)) {
          case (null) { Set.empty<Principal>() };
          case (?existing) { existing };
        };

        // Check if caller has already reported this note
        if (reports.contains(caller)) {
          Runtime.trap("You have already reported this note");
        };

        // Add the report
        reports.add(caller);
        noteReports.add(noteId, reports);

        // On first report, delete the note immediately
        notes.remove(noteId);
        noteLikes.remove(noteId);
        noteReports.remove(noteId);
      };
    };
  };
};
