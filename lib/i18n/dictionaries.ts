// lib/i18n/dictionaries.ts
export type Locale = 'en' | 'ur';

export const dictionaries: Record<Locale, Record<string, string>> = {
  en: {
    // Lang / a11y
    'lang.label': 'Language',
    'lang.en': 'English',
    'lang.ur': 'Urdu',
    'lang.switchToEnglish': 'Switch to English',
    'lang.switchToUrdu': 'Switch to Urdu',
    'a11y.skip': 'Skip to main content',

    // Common
    'common.loading': 'Loading…',
    'common.signInRequired': 'Please sign in',
    'common.error': 'Error',

    // Staff page
    'staff.title': 'Staff Management',
    'staff.findUser': 'Find user (by email or name)',
    'staff.searchPlaceholder': 'e.g. jane@acme.com',
    'staff.search': 'Search',
    'staff.user': 'User',
    'staff.role': 'Role',
    'staff.lastLogin': 'Last login',
    'staff.actions': 'Actions',
    'staff.promote': 'Promote to Staff',
    'staff.demote': 'Demote to Tenant',
    'staff.forceSignOut': 'Force Sign-out',
    'staff.working': 'Working…',
    'staff.currentStaff': 'Current Staff & Admin',
    'staff.noStaff': 'No staff yet',

    // Audit page
    'audit.title': 'Audit Log',
    'audit.tableFilter': 'Table',
    'audit.actorFilter': 'Actor ID',
    'audit.export': 'Export CSV',
    'audit.time': 'Time',
    'audit.table': 'Table',
    'audit.op': 'Op',
    'audit.actor': 'Actor',
    'audit.pk': 'PK',
    'audit.changes': 'Changes',
    'audit.view': 'View',
    'audit.noRows': 'No audit rows',

    // Search page
    'search.title': 'Search',
    'search.placeholder': 'Email, name, property, invoice id, payment ref…',
    'search.search': 'Search',
    'search.searching': 'Searching…',
    'search.when': 'When',
    'search.kind': 'Kind',
    'search.titleCol': 'Title',
    'search.subtitle': 'Subtitle',
    'search.id': 'ID',
    'search.noResults': 'No results',
  },

  ur: {
    // Lang / a11y
    'lang.label': 'زبان',
    'lang.en': 'انگریزی',
    'lang.ur': 'اردو',
    'lang.switchToEnglish': 'انگریزی منتخب کریں',
    'lang.switchToUrdu': 'اردو منتخب کریں',
    'a11y.skip': 'مرکزی مواد پر جائیں',

    // Common
    'common.loading': 'لوڈ ہو رہا ہے…',
    'common.signInRequired': 'براہِ کرم سائن اِن کریں',
    'common.error': 'خرابی',

    // Staff page
    'staff.title': 'اسٹاف مینجمنٹ',
    'staff.findUser': 'صارف تلاش کریں (ای میل یا نام سے)',
    'staff.searchPlaceholder': 'مثلاً jane@acme.com',
    'staff.search': 'تلاش',
    'staff.user': 'صارف',
    'staff.role': 'کردار',
    'staff.lastLogin': 'آخری لاگ اِن',
    'staff.actions': 'عمل',
    'staff.promote': 'اسٹاف بنائیں',
    'staff.demote': 'کرایہ دار بنائیں',
    'staff.forceSignOut': 'فورس سائن آؤٹ',
    'staff.working': 'کام جاری…',
    'staff.currentStaff': 'موجودہ اسٹاف اور ایڈمن',
    'staff.noStaff': 'ابھی کوئی اسٹاف نہیں',

    // Audit page
    'audit.title': 'آڈٹ لاگ',
    'audit.tableFilter': 'ٹیبل',
    'audit.actorFilter': 'ایکٹر آئی ڈی',
    'audit.export': 'CSV برآمد کریں',
    'audit.time': 'وقت',
    'audit.table': 'ٹیبل',
    'audit.op': 'عمل',
    'audit.actor': 'ایکٹر',
    'audit.pk': 'PK',
    'audit.changes': 'تبدیلیاں',
    'audit.view': 'دیکھیں',
    'audit.noRows': 'کوئی آڈٹ ریکارڈ نہیں',

    // Search page
    'search.title': 'تلاش',
    'search.placeholder': 'ای میل، نام، پراپرٹی، انوائس آئی ڈی، پیمنٹ ریف…',
    'search.search': 'تلاش',
    'search.searching': 'تلاش جاری…',
    'search.when': 'کب',
    'search.kind': 'قسم',
    'search.titleCol': 'عنوان',
    'search.subtitle': 'ضمنی عنوان',
    'search.id': 'شناخت',
    'search.noResults': 'کوئی نتیجہ نہیں',
  },
};
