/* Mock catalogue for the student portal (courses, modules, lectures, quizzes, exercises, badges,
   rewards, announcements, notifications). Ported unchanged from the old main-ui/script.js.
   open = published by the admin; closed modules show as 'Coming soon'.
   Later, replace the exports of services/studentCatalog.js with API calls and this file can go away. */
  const M = (id, courseId, name, open) => ({ id, courseId, name, open });
  const L = (id, moduleId, title, mins, video, desc) => ({ id, moduleId, title, mins, video, desc });
  const Q = (text, opts, correct) => ({ text, opts, correct });

  export const DATA = {
    courses: [
      { id: 1, title: 'Python Basics', level: 'Beginner', icon: 'python', tone: 'c-blue', desc: 'Learn the fundamentals of Python programming: syntax, variables, data types, operators, control flow and functions.' },
      { id: 2, title: 'Python Data Structures', level: 'Intermediate', icon: 'layers', tone: 'c-green', desc: 'Work with Python lists, tuples, dictionaries and sets, and learn when to use each one.' },
      { id: 3, title: 'Object-Oriented Python', level: 'Intermediate', icon: 'cube', tone: 'c-orange', desc: 'Model real things in Python with classes, objects, methods and inheritance.' }
    ],
    /* open = published by the admin. Closed modules show as "Coming soon". */
    modules: [
      M(11, 1, 'Introduction to Python', true), M(12, 1, 'Variables and Data Types', true), M(13, 1, 'Operators', true),
      M(14, 1, 'Conditional Statements', true), M(15, 1, 'Loops', true), M(16, 1, 'Functions', false),
      M(17, 1, 'Lists and Tuples', false), M(18, 1, 'Dictionaries and Sets', false), M(19, 1, 'File Handling', false), M(20, 1, 'Error Handling', false),
      M(21, 2, 'Lists in Depth', true), M(22, 2, 'Stacks and Queues', true), M(23, 2, 'Dictionaries in Depth', false), M(24, 2, 'Sets and Hashing', false), M(25, 2, 'Sorting Basics', false),
      M(31, 3, 'Classes and Objects', true), M(32, 3, 'Attributes and Methods', true), M(33, 3, 'Inheritance', false), M(34, 3, 'Polymorphism', false)
    ],
    /* video: a YouTube link, or '' if the admin has not added one yet */
    lectures: [
      L(101, 11, 'What is Python?', 10, 'https://www.youtube.com/watch?v=kqtD5dpn9C8', 'A friendly tour of what Python is and where it is used.'),
      L(102, 11, 'Your First Python Program', 8, '', 'Install Python, open the editor and print your first line of text.'),
      L(103, 12, 'Variables and Naming Rules', 9, '', 'Store values in variables and learn which names Python allows.'),
      L(104, 12, 'Numbers, Strings and Booleans', 12, '', 'Meet the basic data types and convert between them.'),
      L(105, 13, 'Types of Operators', 11, 'https://www.youtube.com/watch?v=v5MR5JnKcZI', 'Arithmetic, comparison and logical operators.'),
      L(106, 13, 'Operator Precedence', 7, '', 'Find out which part of an expression Python works out first.'),
      L(107, 14, 'Writing if Statements', 10, 'https://youtu.be/DZwmZ8Usvnk', 'Make decisions in code with if, elif and else.'),
      L(108, 14, 'Nested Conditions', 8, '', 'Put conditions inside conditions and keep them readable.'),
      L(109, 15, 'for Loops and range()', 12, '', 'Repeat code a set number of times with for and range().'),
      L(110, 15, 'while Loops, break and continue', 11, '', 'Loop until a condition changes, and control the loop from inside.'),
      L(111, 21, 'List Methods', 10, '', 'Add, remove, sort and search items in a list.'),
      L(112, 22, 'Stacks and Queues with Lists', 9, '', 'Use lists as stacks (last in, first out) and queues (first in, first out).'),
      L(113, 31, 'Your First Class', 12, '', 'Write a class, create objects from it and give them data.'),
      L(114, 32, 'Methods and self', 10, '', 'Add behaviour to your objects with methods.')
    ],
    quizzes: [
      { id: 1, title: 'Python Basics Quiz', moduleId: 11, diff: 'Easy', due: 'Oct 24, 2026', qs: [
        Q('What is Python?', ['A web browser', 'A programming language', 'A database', 'An operating system'], 1),
        Q('Which function is used to display output in Python?', ['input()', 'print()', 'display()', 'output()'], 1),
        Q('Which symbol starts a comment in Python?', ['//', '#', '--', '/*'], 1)] },
      { id: 2, title: 'Variables Quiz', moduleId: 12, diff: 'Easy', due: 'Oct 27, 2026', qs: [
        Q('Which is a valid variable name?', ['1name', 'my-var', 'my_var', 'class'], 2),
        Q('What type is the value 3.14?', ['int', 'str', 'float', 'bool'], 2)] },
      { id: 3, title: 'Operators Quiz', moduleId: 13, diff: 'Medium', due: 'Oct 30, 2026', qs: [
        Q('What is 7 // 2?', ['3.5', '3', '4', '2'], 1),
        Q('Which operator checks equality?', ['=', '==', '!=', '=>'], 1),
        Q('What does the % operator return?', ['Percentage', 'Remainder', 'Quotient', 'Power'], 1)] },
      { id: 4, title: 'Loops Quiz', moduleId: 15, diff: 'Hard', due: 'Nov 4, 2026', qs: [
        Q('How many times does range(3) loop?', ['2', '3', '4', 'Forever'], 1),
        Q('Which keyword exits a loop early?', ['stop', 'exit', 'break', 'return'], 2)] }
    ],
    /* type: Coding | Multiple choice | Open answer.  expect = the output a Coding answer must print */
    exercises: [
      { id: 1, title: 'Print Hello, World!', moduleId: 11, type: 'Coding', diff: 'Beginner', pts: 10, due: 'Oct 23, 2026', instr: 'Write a program that displays Hello, Python!', code: '# Write your code below\n', expect: 'Hello, Python!' },
      { id: 2, title: 'Swap Two Variables', moduleId: 12, type: 'Coding', diff: 'Beginner', pts: 15, due: 'Oct 26, 2026', instr: 'Swap the values of a and b without a third variable, then print a and b.', code: 'a, b = 1, 2\n# your code here\n', expect: '2 1' },
      { id: 3, title: 'Pick the Right Operator', moduleId: 13, type: 'Multiple choice', diff: 'Beginner', pts: 10, due: 'Oct 29, 2026', instr: 'Which operator gives the remainder of a division?', opts: ['/', '//', '%', '**'], correct: 2 },
      { id: 4, title: 'Even or Odd', moduleId: 14, type: 'Coding', diff: 'Intermediate', pts: 20, due: 'Nov 2, 2026', instr: 'Read a number and print whether it is even or odd.', code: 'n = int(input())\n' },
      { id: 7, title: 'Fibonacci Generator', moduleId: 15, type: 'Coding', diff: 'Advanced', pts: 40, due: 'Nov 9, 2026', instr: 'Return the first n Fibonacci numbers as a list.', code: 'def fib(n):\n    pass\n' },
      { id: 8, title: 'Explain a Loop', moduleId: 15, type: 'Open answer', diff: 'Intermediate', pts: 15, due: 'Nov 6, 2026', instr: 'In your own words, explain the difference between a for loop and a while loop.' }
    ],
    badges: [
      { id: 1, name: 'Python Beginner', pts: 500, color: 't-blue', desc: 'Finish your first module.' },
      { id: 4, name: 'Code Warrior', pts: 750, color: 't-yellow', desc: 'Solve 25 practice exercises.' },
      { id: 2, name: 'Loop Master', pts: 850, color: 't-green', desc: 'Finish the Loops module.' },
      { id: 3, name: 'Quiz Master', pts: 900, color: 't-purple', desc: 'Score 90% or higher on five quizzes.' },
      { id: 5, name: 'Consistency', pts: 1000, color: 't-red', desc: 'Learn for seven days in a row.' }
    ],
    rewards: [
      { id: 1, name: 'Python Beginner Badge', cost: 500, stock: 999, icon: 'award', tone: 't-blue' },
      { id: 2, name: 'Python Master Badge', cost: 1000, stock: 999, icon: 'trophy', tone: 't-purple' },
      { id: 3, name: 'Python Hoodie', cost: 2000, stock: 24, icon: 'gift', tone: 't-orange' }
    ],
    rules: { lesson: 10, quiz: 50, streak: 5 },
    announcements: [
      { id: 1, title: 'System Maintenance', msg: 'The system will undergo maintenance on September 20, 2026 (Sunday) from 8:00 AM to 12:00 NN. During this time, the platform may be temporarily unavailable.', date: 'Sep 17, 2026', icon: 'megaphone', tone: 'blue' },
      { id: 2, title: 'New Learning Materials Available', msg: 'Additional learning materials for the Python Basics course are now available. Please check the Learning Materials section.', date: 'Sep 15, 2026', icon: 'book', tone: 'green' },
      { id: 3, title: 'Upcoming Quiz', msg: 'There will be a quiz on Python Data Structures on September 22, 2026 (Tuesday). Make sure to review the lessons and practice exercises.', date: 'Sep 14, 2026', icon: 'bell', tone: 'purple' },
      { id: 4, title: 'Points and Rewards Update', msg: 'We are now introducing new rewards! You can redeem exclusive items with your earned points. Check the Points & Rewards section for more details.', date: 'Sep 10, 2026', icon: 'star', tone: 'gold' },
      { id: 5, title: 'Welcome to PyPath!', msg: 'We\'re excited to have you on board! Explore the platform, complete lessons, practice exercises, and start earning points!', date: 'Sep 1, 2026', icon: 'help', tone: 'red' }
    ],
    notes: [
      { t: 'New module available!', s: 'Loops is now open in Python Basics.', ago: '2h ago' },
      { t: 'Quiz completed!', s: 'You earned 50 points.', ago: '5h ago' },
      { t: 'Achievement unlocked!', s: 'You got the Code Warrior badge.', ago: '1d ago' },
      { t: 'System maintenance', s: 'Scheduled for Sep 20, 2026.', ago: '2d ago' }
    ]
  };
