export type Participant = {id: string; name: string; initials: string; tint: string};

export const PARTICIPANTS: Participant[] = [
  {id: 'marc', name: 'Marc Alvarez', initials: 'MA', tint: '#E4E6FB'},
  {id: 'sarah', name: 'Sarah Chen', initials: 'SC', tint: '#E3ECF4'},
  {id: 'justin', name: 'Justin', initials: 'J', tint: '#ECE9F2'},
];

export const MEETING = {
  title: 'Product call',
  day: 'Tuesday',
  speaker: 'marc',
  timestamp: '32:14',
  // `key` marks the words Sparrow extracts. `tight` = no space before.
  words: [
    {text: 'I’ll'},
    {text: 'send'},
    {text: 'Sarah', key: 'person'},
    {text: 'the'},
    {text: 'revised proposal', key: 'object'},
    {text: 'by'},
    {text: 'Friday', key: 'due'},
    {text: '.', tight: true},
  ] as {text: string; key?: 'person' | 'object' | 'due'; tight?: boolean}[],
};
