/* PyPath Admin – shared data layer.
   Courses, lessons (formerly "modules"), videos (formerly "lectures") and activities (formerly quizzes + exercises)
   live here so every admin page sees the same records. Saved in this browser's localStorage when available. */
(function (PP) {
  const NS = 'pypath:v2:';
  const mem = {};
  let failed = false;

  const store = {
    load(key, seed) {
      try { const raw = localStorage.getItem(NS + key); if (raw) { mem[key] = JSON.parse(raw); return mem[key]; } } catch (e) { failed = true; }
      if (mem[key]) return mem[key];
      mem[key] = seed();
      this.save(key, mem[key], true);
      return mem[key];
    },
    save(key, val, quiet) {
      mem[key] = val;
      try { localStorage.setItem(NS + key, JSON.stringify(val)); return true; }
      catch (e) { failed = true; if (!quiet && PP.toast) PP.toast('Could not save in this browser. Changes last until you leave this page.', 'error'); return false; }
    },
    nextId(list, base) { return list.reduce((m, x) => Math.max(m, x.id), base || 0) + 1; },
    reset() { Object.keys(mem).forEach((k) => delete mem[k]); try { Object.keys(localStorage).filter((k) => k.indexOf(NS) === 0).forEach((k) => localStorage.removeItem(k)); } catch (e) {} },
    get failed() { return failed; }
  };

  /* ---------- Python highlighter used by lesson + activity previews ---------- */
  function hl(line) {
    let s = PP.esc(line);
    s = s.replace(/(#.*$)/, '<span class="tk-c">$1</span>');
    s = s.replace(/(&quot;.*?&quot;|&#39;.*?&#39;)/g, '<span class="tk-s">$1</span>');
    s = s.replace(/\b(for|in|if|else|elif|while|def|return|import|from|break|continue|and|or|not|True|False|None)\b(?![^<]*>)/g, '<span class="tk-k">$1</span>');
    s = s.replace(/\b(print|input|len|range|int|str|float|type|sum)(?=\()/g, '<span class="tk-f">$1</span>');
    return s;
  }
  PP.codeBlock = function (code) {
    const lines = String(code || '').replace(/\s+$/, '').split('\n');
    return '<div class="editor"><div class="editor-bar"><i></i><i></i><i></i></div><div class="code"><div class="ln">' + lines.map((_, i) => i + 1).join('<br>') + '</div><div class="tx">' + lines.map(hl).join('\n') + '</div></div></div>';
  };

  /* ---------- Seed data ---------- */
  const COURSES = () => [
    { id: 1, title: 'Python Basics', level: 'Beginner', status: 'Published', icon: 'python', tone: 'c-blue', desc: 'Learn the fundamentals of Python programming: syntax, variables, data types, operators, control flow and functions.', students: 520, avg: 85 },
    { id: 2, title: 'Python Data Structures', level: 'Intermediate', status: 'Published', icon: 'layers', tone: 'c-green', desc: 'Work with Python lists, tuples, dictionaries and sets, and learn when to use each one.', students: 420, avg: 71 },
    { id: 3, title: 'Object-Oriented Python', level: 'Intermediate', status: 'Published', icon: 'cube', tone: 'c-orange', desc: 'Model real things in Python with classes, objects, methods and inheritance.', students: 310, avg: 58 },
    { id: 4, title: 'Python Problem Solving', level: 'Advanced', status: 'Draft', icon: 'code', tone: 'c-purple', desc: 'Practice recursion, searching and sorting by solving coding challenges in Python.', students: 0, avg: 0 }
  ];

  const L = (id, courseId, order, title, status, x) => Object.assign({ id, courseId, order, title, status, objectives: '', content: '', code: '', output: '', practice: '' }, x || {});
  const LESSONS = () => [
    L(101, 1, 1, 'Introduction to Python', 'Published', {
      objectives: 'Explain what Python is and where it is used\nRun your first Python program\nUse print() and comments',
      content: 'Python is a popular, beginner-friendly programming language. Its code reads almost like plain English, which makes it a great first language. People use Python for websites, data analysis, automation, games and artificial intelligence.\n\nA Python program is a list of instructions that run from top to bottom. The print() function shows a message on the screen. Anything after a # is a comment: Python ignores it, so you can leave notes for yourself.',
      code: '# My first Python program\nprint("Hello, Python!")\nprint("Welcome to PyPath")',
      output: 'Hello, Python!\nWelcome to PyPath',
      practice: 'Write a program that prints your name on the first line and your favorite food on the second line.'
    }),
    L(102, 1, 2, 'Variables and Data Types', 'Published', {
      objectives: 'Create variables and give them good names\nRecognize str, int, float and bool values\nCheck a value\'s type with type()',
      content: 'A variable is a named box that stores a value. You create one with the = sign: the name goes on the left and the value goes on the right. Variable names use letters, numbers and underscores, cannot start with a number, and cannot contain spaces or dashes.\n\nPython has four basic data types. A str is text in quotes, an int is a whole number, a float is a number with a decimal point, and a bool is either True or False. Python works out the type for you, and type() will tell you what it decided.',
      code: 'name = "Ana"        # str\nage = 15            # int\nheight = 1.58       # float\nis_student = True   # bool\n\nprint(name, age)\nprint(type(height))',
      output: 'Ana 15\n<class \'float\'>',
      practice: 'Create variables for your favorite number and your favorite color, then print them both on one line.'
    }),
    L(103, 1, 3, 'Operators', 'Published', {
      objectives: 'Use arithmetic operators\nCompare values with comparison operators\nCombine conditions with and, or, not',
      content: 'Operators perform actions on values. Arithmetic operators do math: + - * / for the basics, // for floor division, % for the remainder and ** for powers.\n\nComparison operators such as ==, !=, <, > compare two values and give back True or False. Notice that = stores a value while == asks whether two values are equal. Logical operators and, or, not combine several True/False results.',
      code: 'print(7 + 2)\nprint(7 // 2)\nprint(7 % 2)\nprint(2 ** 3)\nprint(7 == 7 and 3 > 5)',
      output: '9\n3\n1\n8\nFalse',
      practice: 'Print the remainder when 29 is divided by 4, then print whether 29 is greater than 25.'
    }),
    L(104, 1, 4, 'Conditional Statements', 'Published', {
      objectives: 'Make decisions with if, elif and else\nUse indentation correctly\nWrite conditions with comparison operators',
      content: 'Conditional statements let a program choose what to do. An if block runs only when its condition is True. Add elif to check another condition, and else to catch everything that is left.\n\nPython uses indentation (four spaces) to show which lines belong inside the block, and the line before the block ends with a colon.',
      code: 'score = 82\n\nif score >= 90:\n    print("Excellent!")\nelif score >= 75:\n    print("Good job!")\nelse:\n    print("Keep practicing")',
      output: 'Good job!',
      practice: 'Set temperature = 31. Print "Hot" if it is above 30, otherwise print "Nice weather".'
    }),
    L(105, 1, 5, 'Loops', 'Published', {
      objectives: 'Repeat code with for loops and range()\nRepeat while a condition is true\nStop a loop early with break',
      content: 'Loops repeat code so you do not have to write it many times. A for loop goes through a sequence one item at a time, and range(n) gives the numbers 0 up to n - 1.\n\nA while loop keeps running as long as its condition stays True, so make sure something inside the loop eventually changes the condition. Use break to leave a loop early.',
      code: 'for i in range(3):\n    print("Round", i)\n\ncount = 3\nwhile count > 0:\n    print(count)\n    count = count - 1',
      output: 'Round 0\nRound 1\nRound 2\n3\n2\n1',
      practice: 'Use a for loop to print the numbers 1 to 5, one per line.'
    }),
    L(106, 1, 6, 'Functions', 'Published', {
      objectives: 'Define a function with def\nPass in parameters and return a result\nCall a function more than once',
      content: 'A function is a reusable block of code with a name. You define it with def, list the inputs (parameters) in parentheses, and use return to send a result back.\n\nDefining a function does not run it. The code runs each time you call the function by name, so you can reuse the same logic with different values.',
      code: 'def greet(name):\n    return "Hello, " + name + "!"\n\nprint(greet("Ana"))\nprint(greet("Ben"))',
      output: 'Hello, Ana!\nHello, Ben!',
      practice: 'Write a function square(n) that returns n multiplied by itself, then print square(6).'
    }),
    L(107, 1, 7, 'Lists and Dictionaries', 'Published', {
      objectives: 'Store many values in a list\nStore labeled values in a dictionary\nAdd, read and loop through items',
      content: 'A list keeps items in order inside square brackets. You read an item by its position, starting from 0, and you can add items with append().\n\nA dictionary stores key-value pairs inside curly braces. You look up a value by its key instead of a position, which is perfect for labeled data such as a student record.',
      code: 'fruits = ["apple", "banana"]\nfruits.append("mango")\nprint(fruits[0], len(fruits))\n\nstudent = {"name": "Ana", "grade": 10}\nstudent["grade"] = 11\nprint(student["name"], student["grade"])',
      output: 'apple 3\nAna 11',
      practice: 'Make a list of three colors, add a fourth one with append(), then print the whole list.'
    }),
    L(108, 1, 8, 'Lists and Tuples', 'Draft'), L(109, 1, 9, 'Dictionaries and Sets', 'Draft'),
    L(110, 1, 10, 'File Handling', 'Draft'), L(111, 1, 11, 'Error Handling', 'Draft'),
    L(112, 2, 1, 'Lists in Depth', 'Published'), L(113, 2, 2, 'Stacks and Queues', 'Published'), L(114, 2, 3, 'Dictionaries in Depth', 'Draft'),
    L(115, 2, 4, 'Sets and Hashing', 'Draft'), L(116, 2, 5, 'Sorting Basics', 'Draft'),
    L(117, 3, 1, 'Classes and Objects', 'Published'), L(118, 3, 2, 'Attributes and Methods', 'Published'), L(119, 3, 3, 'Inheritance', 'Draft'), L(120, 3, 4, 'Polymorphism', 'Draft'),
    L(121, 4, 1, 'Recursion', 'Draft'), L(122, 4, 2, 'Searching Algorithms', 'Draft'), L(123, 4, 3, 'Sorting Algorithms', 'Draft')
  ];

  const VIDEOS = () => [
    { id: 201, title: 'What is Python?', lessonId: 101, video: 'https://www.youtube.com/watch?v=kqtD5dpn9C8', desc: 'A friendly tour of what Python is and where it is used.', status: 'Published' },
    { id: 202, title: 'Types of Operators', lessonId: 103, video: 'https://www.youtube.com/watch?v=v5MR5JnKcZI', desc: 'Arithmetic, comparison and logical operators.', status: 'Published' },
    { id: 203, title: 'Writing if Statements', lessonId: 104, video: 'https://youtu.be/DZwmZ8Usvnk', desc: 'Make decisions in code with if, elif and else.', status: 'Draft' }
  ];

  const Q = (text, opts, correct, kind) => ({ text, kind: kind || 'mc', opts, correct, points: 1, feedback: '' });
  const A = (id, type, title, lessonId, diff, status, x) => Object.assign({ id, type, title, courseId: 1, lessonId, diff, status, pass: 60, qs: [], pts: 0, instr: '', code: '', validation: 'output', expected: '', feedbackOk: '', feedbackBad: '' }, x || {});
  const ACTIVITIES = () => [
    /* from the old Quizzes page */
    A(301, 'quiz', 'Python Basics Quiz', 101, 'Easy', 'Published', { qs: [
      Q('What is Python?', ['A web browser', 'A programming language', 'A database', 'An operating system'], 1),
      Q('Which function is used to display output in Python?', ['input()', 'print()', 'display()', 'output()'], 1),
      Q('Which symbol starts a comment in Python?', ['//', '#', '--', '/*'], 1)] }),
    A(302, 'quiz', 'Variables Quiz', 102, 'Easy', 'Published', { qs: [
      Q('Which is a valid variable name?', ['1name', 'my-var', 'my_var', 'class'], 2),
      Q('What type is the value 3.14?', ['int', 'str', 'float', 'bool'], 2)] }),
    A(303, 'quiz', 'Operators Quiz', 103, 'Medium', 'Published', { qs: [
      Q('What is 7 // 2?', ['3.5', '3', '4', '2'], 1),
      Q('Which operator checks equality?', ['=', '==', '!=', '=>'], 1),
      Q('What does the % operator return?', ['Percentage', 'Remainder', 'Quotient', 'Power'], 1)] }),
    A(304, 'quiz', 'Loops Quiz', 105, 'Hard', 'Published', { qs: [
      Q('How many times does range(3) loop?', ['2', '3', '4', 'Forever'], 1),
      Q('Which keyword exits a loop early?', ['stop', 'exit', 'break', 'return'], 2)] }),
    A(305, 'quiz', 'Functions Quiz', 106, 'Medium', 'Draft', { qs: [
      Q('Which keyword defines a function?', ['func', 'def', 'function', 'lambda'], 1)] }),
    /* from the old Exercises page (Beginner/Intermediate/Advanced became Easy/Medium/Hard) */
    A(306, 'exercise', 'Print Hello, World!', 101, 'Easy', 'Published', { pts: 10, instr: 'Write a program that displays Hello, Python!', code: 'print("Hello, Python!")', expected: 'Hello, Python!' }),
    A(307, 'exercise', 'Swap Two Variables', 102, 'Easy', 'Published', { pts: 15, instr: 'Swap the values of a and b without a third variable, then print a and b.', code: 'a, b = 1, 2\n# your code here', expected: '2 1' }),
    A(308, 'quiz', 'Pick the Right Operator', 103, 'Easy', 'Published', { qs: [Q('Which operator gives the remainder of a division?', ['+', '-', '%', '//'], 2)] }),
    A(309, 'exercise', 'Even or Odd', 104, 'Medium', 'Published', { pts: 20, instr: 'Read a number and print whether it is even or odd.', code: 'n = int(input())\n', validation: 'manual' }),
    A(310, 'exercise', 'Sum of 1 to N', 105, 'Medium', 'Draft', { pts: 25, instr: 'Use a loop to add every number from 1 to N, then print the total.', code: 'n = 10\ntotal = 0\n', expected: '55' }),
    A(311, 'exercise', 'Explain a Function Call', 106, 'Hard', 'Draft', { pts: 30, instr: 'In your own words, describe what happens when a function is called.', code: '', validation: 'manual' }),
    A(312, 'exercise', 'Fibonacci Generator', 106, 'Hard', 'Published', { pts: 40, instr: 'Return the first n Fibonacci numbers as a list.', code: 'def fib(n):\n    pass', validation: 'manual' }),
    /* from the old Learning Materials exercises list (the other two there already existed above, so they are not repeated) */
    A(313, 'exercise', 'Loop through a list', 105, 'Easy', 'Draft', { pts: 10, instr: 'Print each item in the list on its own line.', code: 'items = ["a", "b", "c"]\nfor item in items:\n    print(item)', expected: 'a\nb\nc' })
  ];

  PP.db = {
    courses: { load: () => store.load('courses', COURSES), save: (v) => store.save('courses', v) },
    lessons: { load: () => store.load('lessons', LESSONS), save: (v) => store.save('lessons', v) },
    videos: { load: () => store.load('videos', VIDEOS), save: (v) => store.save('videos', v) },
    activities: { load: () => store.load('activities', ACTIVITIES), save: (v) => store.save('activities', v) },
    reset: () => store.reset()
  };
  PP.store = store;
  PP.quizPoints = (a) => a.qs.reduce((s, q) => s + (+q.points || 0), 0);
  PP.actPoints = (a) => (a.type === 'quiz' ? PP.quizPoints(a) : +a.pts || 0);
})(window.PP);
