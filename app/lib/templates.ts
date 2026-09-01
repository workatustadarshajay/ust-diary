export type DiaryTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string;
};

export const diaryTemplates: DiaryTemplate[] = [
  {
    id: "blank",
    name: "Blank page",
    description: "Start with a clean page and your own direction.",
    category: "Personal",
    content: "",
  },
  {
    id: "reflection",
    name: "Daily reflection",
    description: "A gentle structure for noticing the day.",
    category: "Personal",
    content: "<h2>Today I noticed...</h2><p></p><h2>What went well?</h2><p></p><h2>What was difficult?</h2><p></p><h2>What am I grateful for?</h2><p></p>",
  },
  {
    id: "gratitude",
    name: "Gratitude",
    description: "Capture the small things that made today meaningful.",
    category: "Personal",
    content: "<h2>Three things I am grateful for</h2><ol><li></li><li></li><li></li></ol><h2>A moment I want to remember</h2><p></p>",
  },
  {
    id: "workday",
    name: "Workday review",
    description: "Record progress, blockers, and your next move.",
    category: "Work",
    content: "<h2>What I completed</h2><ul><li></li></ul><h2>What is still blocked?</h2><p></p><h2>Tomorrow's priorities</h2><ol><li></li></ol>",
  },
  {
    id: "study",
    name: "Study session",
    description: "Turn a learning session into useful notes.",
    category: "Learning",
    content: "<h2>What I studied</h2><p></p><h2>Key ideas</h2><ul><li></li></ul><h2>Questions to explore</h2><ul><li></li></ul><h2>Next study step</h2><p></p>",
  },
  {
    id: "planning",
    name: "Tomorrow planning",
    description: "Finish today with a clear plan for tomorrow.",
    category: "Planning",
    content: "<h2>Tomorrow I want to...</h2><ul><li></li></ul><h2>One thing that matters most</h2><p></p><h2>How I will make space for it</h2><p></p>",
  },
  {
    id: "weekly",
    name: "Weekly review",
    description: "Look back, learn, and choose what comes next.",
    category: "Planning",
    content: "<h2>My week in a sentence</h2><p></p><h2>Wins worth keeping</h2><ul><li></li></ul><h2>What I learned</h2><p></p><h2>Next week's focus</h2><p></p>",
  },
];

export const diaryTemplateMap = Object.fromEntries(diaryTemplates.map((template) => [template.id, template]));
