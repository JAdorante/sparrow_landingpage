export const SARAH = {
  name: 'Sarah Chen',
  initials: 'SC',
  org: 'Meridian',
  rows: [
    {label: 'LAST SPOKE', value: 'Tuesday'},
    {label: 'MEETINGS', value: '6'},
    {label: 'OPEN COMMITMENTS', value: '2'},
    {label: 'INTRODUCED BY', value: 'Marc'},
  ],
};

export const SOURCES = [
  {kind: 'MEETING', title: 'Product call', meta: 'Tuesday · 32:14'},
  {kind: 'CALENDAR', title: 'Product review', meta: 'Tue · 2:00 PM'},
  {kind: 'MEETING', title: 'Pilot planning', meta: 'Sep 18'},
  {kind: 'EMAIL', title: 'Sarah → Justin', meta: '10:42 AM'},
];

export const EMAIL = {from: 'Sarah Chen', to: 'Justin', time: '10:42 AM'};

export const CALENDAR = {
  title: 'Product review',
  people: ['Sarah Chen', 'Justin', 'Marc'],
  when: 'Tuesday · 2:00 PM',
};

export const CHAT = {
  q1: 'What did Sarah and I agree to last time?',
  a1: ['You agreed to run the pilot with two teams', 'before expanding it.'],
  source: 'Tuesday · Product call · 32:14 ↗',
  q2: 'What do I still owe her?',
  q3: 'Draft the follow-up.',
};

export const DRAFT = {
  to: 'Sarah Chen',
  subject: 'Pilot next steps',
  body: [
    'Sarah —',
    '',
    'Great speaking Tuesday. As promised, I’m',
    'sending over the security overview and the',
    'next steps for the pilot…',
  ],
  based: ['Tuesday · Product call', 'Pilot planning · Sep 18'],
  cta: 'Review draft →',
};
