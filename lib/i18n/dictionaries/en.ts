const en = {
  nav: {
    audit: "Audit Log",
    staff: "Staff",
    search: "Search",
  },
  common: {
    language: "Language",
    english: "English",
    urdu: "Urdu",
    signOut: "Sign out",
  },
  pages: {
    auditTitle: "Audit Log",
    staffTitle: "Staff",
    searchTitle: "Global Search",
  },
} as const;

export type Dictionary = typeof en;
export default en;
