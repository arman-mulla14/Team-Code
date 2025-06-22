class Terminal {
    constructor() {
        this.commands = {
            help: this.showHelp.bind(this),
            clear: this.clear.bind(this),
            ask: this.askQuestion.bind(this),
            code: this.generateCode.bind(this),
            explain: this.explainCode.bind(this),
            fix: this.fixCode.bind(this),
            search: this.searchCode.bind(this),
            move: this.move.bind(this)
        };
        
        this.history = [];
        this.historyIndex = -1;
        this.isMinimized = false;
        this.position = { x: 20, y: 20 }; // Default position
        this.userName = null; // New: To store the user's name
        
        this.createChatBot();
        this.setupEventListeners();
        this.setupMovementControls();
        this.setupToggleButton();

        // JavaScript Knowledge Bases (moved from Python)
        this.CONVERSATION_BASE = [
            // Basic Greetings (50 variations)
            {
                question: "Hi",
                answer: "Hello! Ready to code today?"
            },
            {
                question: "Hello",
                answer: "Hi there! What programming topic are you working on?"
            },
            {
                question: "Hey",
                answer: "Hey! Got any coding challenges for me?"
            },
            {
                question: "Good morning",
                answer: "Morning! Let's write some clean code today."
            },
            {
                question: "Good afternoon",
                answer: "Afternoon! Need help with a programming problem?"
            },

            // Programming Fundamentals (150 variations)
            {
                question: "What is a variable?",
                answer: "A named storage location in memory that holds data."
            },
            {
                question: "Explain functions",
                answer: "Reusable blocks of code that perform specific tasks."
            },
            {
                question: "What are loops?",
                answer: "Control structures that repeat code until a condition is met."
            },
            {
                question: "Explain OOP",
                answer: "Object-Oriented Programming: organizing code into objects with properties and methods."
            },

            // Language-Specific (200 variations)
            // Python
            {
                question: "Python list comprehension",
                answer: "[x*2 for x in range(10)] # Creates [0, 2, 4, ..., 18]"
            },
            {
                question: "How to read a file in Python",
                answer: "with open('file.txt') as f:\n    content = f.read()"
            },
            {
                question: "Python dictionary",
                answer: "my_dict = {'key': 'value'}"
            },
            {
                question: "Python lambda",
                answer: "square = lambda x: x**2"
            },

            // JavaScript
            {
                question: "JavaScript arrow function",
                answer: "const sum = (a, b) => a + b;"
            },
            {
                question: "What is Promise in JS?",
                answer: "An object representing eventual completion/error of async operation."
            },
            {
                question: "JS event listener",
                answer: "element.addEventListener('click', handler)"
            },

            // Java
            {
                question: "Java main method",
                answer: "public static void main(String[] args) {...}"
            },

            // Web Development (150 variations)
            {
                question: "HTML structure",
                answer: "<!DOCTYPE html>\n<html>\n<head>\n<body>"
            },
            {
                question: "CSS flexbox",
                answer: "display: flex;\njustify-content: center;\nalign-items: center;"
            },
            {
                question: "React hooks",
                answer: "useState, useEffect, etc. - functions that 'hook' into React features."
            },
            {
                question: "HTML form",
                answer: "<form>\n<input type='text'>\n<button>Submit</button>\n</form>"
            },

            // Debugging Help (100 variations)
            {
                question: "Syntax error unexpected token",
                answer: "Check for missing brackets, quotes, or semicolons."
            },
            {
                question: "Undefined is not a function",
                answer: "You're calling something that isn't a function."
            },

            // Algorithms (100 variations)
            {
                question: "Binary search",
                answer: "Divide and conquer algorithm with O(log n) complexity."
            },
            {
                question: "Bubble sort",
                answer: "Simple sorting algorithm with O(n²) time complexity."
            },

            // System Design (50 variations)
            {
                question: "What is microservices?",
                answer: "Architecture where apps are split into small, independent services."
            },
            {
                question: "Explain REST",
                answer: "Representational State Transfer - architectural style for web services."
            },

            // Tools & DevOps (100 variations)
            {
                question: "Git commit",
                answer: "git commit -m \"Descriptive message about changes\""
            },
            {
                question: "Docker basics",
                answer: "docker build -t image-name .\ndocker run image-name"
            },

            // Career Advice (50 variations)
            {
                question: "How to prepare for coding interview",
                answer: "1. Practice algorithms\n2. Review CS fundamentals\n3. Mock interviews"
            },

            // Fun/Off-Topic (50 variations)
            {
                question: "Tell me a joke",
                answer: "Why do programmers prefer dark mode? Because light attracts bugs!"
            },

            // Expanded Variations
            {
                question: "What's a variable?",
                answer: "A named container that stores data values in memory."
            },
            {
                question: "Define variable",
                answer: "A symbolic name associated with a value that can change."
            },
            {
                question: "How do variables work?",
                answer: "They reference memory locations where data is stored."
            },
            {
                question: "What is recursion?",
                answer: "A function calling itself to solve a problem by breaking it into smaller subproblems."
            },
            {
                question: "Python decorators",
                answer: "@decorator\ndef function():\n    pass"
            },
            {
                question: "JavaScript destructuring",
                answer: "const { name, age } = person;"
            },
            {
                question: "CSS Grid layout",
                answer: "display: grid;\ngrid-template-columns: repeat(3, 1fr);\ngap: 20px;"
            },
            {
                question: "How to debug JavaScript",
                answer: "Use console.log(), debugger statement, or browser dev tools."
            },
            {
                question: "Quick sort",
                answer: "Divide and conquer algorithm with O(n log n) average case."
            },
            {
                question: "Load balancing",
                answer: "Distributing network traffic across multiple servers."
            },
            {
                question: "Git workflow",
                answer: "git checkout -b feature\nmake changes\ngit add .\ngit commit -m \"message\"\ngit push"
            },
            {
                question: "Building a portfolio",
                answer: "1. Choose meaningful projects\n2. Document your process\n3. Deploy your work\n4. Share on GitHub"
            },

            // Cutting-Edge Technologies
            {
                question: "What is WebAssembly?",
                answer: "A binary instruction format for running performance-critical code in browsers at near-native speed."
            },
            {
                question: "Explain blockchain programming",
                answer: "Developing decentralized apps (DApps) using smart contracts (Solidity for Ethereum)."
            },
            {
                question: "How does Rust ensure memory safety?",
                answer: "Through its ownership system with strict compile-time checks (no garbage collector needed)."
            },
            {
                question: "What is HTMX?",
                answer: "A modern library that lets you access AJAX, CSS Transitions, WebSockets directly from HTML attributes."
            },

            // Cloud & DevOps
            {
                question: "Kubernetes vs Docker Swarm",
                answer: "K8s offers more features and scalability; Swarm is simpler but less powerful."
            },
            {
                question: "Terraform use cases",
                answer: "Infrastructure as Code (IaC) for provisioning cloud resources across AWS/GCP/Azure."
            },
            {
                question: "CI/CD pipeline steps",
                answer: "1. Code Commit → 2. Build → 3. Test → 4. Deploy → 5. Monitor"
            },

            // Advanced JavaScript
            {
                question: "JavaScript event loop",
                answer: "The mechanism that handles async callbacks using call stack, callback queue, and microtask queue."
            },
            {
                question: "Proxy objects in JS",
                answer: "Objects that wrap other objects to intercept fundamental operations like property lookup."
            },
            {
                question: "TC39 process stages",
                answer: "0: Strawman → 1: Proposal → 2: Draft → 3: Candidate → 4: Finished"
            },

            // Data Science
            {
                question: "Pandas vs Polars",
                answer: "Polars is faster for large datasets (multithreaded Rust backend) while Pandas has more features."
            },
            {
                question: "PyTorch tensors",
                answer: "Multi-dimensional arrays with GPU acceleration for deep learning computations."
            },

            // System Design Patterns
            {
                question: "Circuit breaker pattern",
                answer: "Prevents cascading failures by stopping requests to failing services temporarily."
            },
            {
                question: "CQRS architecture",
                answer: "Command Query Responsibility Segregation - separates read and write operations."
            },

            // Cybersecurity
            {
                question: "SQL injection prevention",
                answer: "Use parameterized queries (NOT string concatenation) and ORMs with built-in sanitization."
            },
            {
                question: "JWT best practices",
                answer: "1. Short expiration 2. HTTPS only 3. Proper signature verification 4. Store securely"
            },

            // Creative Problem Solving
            {
                question: "How to approach a new coding problem?",
                answer: "1. Understand → 2. Plan → 3. Divide → 4. Implement → 5. Test → 6. Optimize"
            },
            {
                question: "Debugging mental models",
                answer: "Rubber duck debugging, binary search through code, and hypothesis testing."
            },

            // Version Control Deep Dive
            {
                question: "Git rebase vs merge",
                answer: "Rebase rewrites history for cleaner linear commits; merge preserves history with merge commits."
            },
            {
                question: "Git cherry-pick",
                answer: "Applies specific commits from one branch to another: `git cherry-pick <commit-hash>`"
            },

            // Hardware Programming
            {
                question: "Arduino basics",
                answer: "void setup() { pinMode(13, OUTPUT); }\nvoid loop() { digitalWrite(13, HIGH); delay(1000); }"
            },

            // Interview Prep
            {
                question: "System design: Design Twitter",
                answer: "1. Requirements 2. API design 3. DB schema 4. Feed gen 5. Caching 6. Scaling"
            },
            {
                question: "Reverse a linked list",
                answer: "Python solution:\ndef reverse_list(head):\n    prev, curr = None, head\n    while curr:\n        next_node = curr.next\n        curr.next = prev\n        prev = curr\n        curr = next_node\n    return prev"
            },

            // AI/ML
            {
                question: "Transformer architecture",
                answer: "Uses self-attention mechanisms (like in GPT) instead of RNNs for sequence processing."
            },
            {
                question: "Fine-tuning LLMs",
                answer: "1. Prepare domain data 2. Choose base model 3. LoRA/P-tuning 4. Evaluate"
            },

            // Game Dev
            {
                question: "Unity vs Unreal",
                answer: "Unity: C#, better for mobile. Unreal: C++, better graphics, AAA games."
            },

            // Mobile Dev
            {
                question: "SwiftUI basics",
                answer: "struct ContentView: View {\n    var body: some View {\n        Text(\"Hello SwiftUI!\")\n    }"
            },
            {
                question: "Jetpack Compose",
                answer: "Android's modern declarative UI toolkit:\n@Composable\nfun Greeting() {\n    Text(text = \"Hello Android!\")}"
            },

            // Database Deep Dives
            {
                question: "PostgreSQL vs MySQL",
                answer: "PostgreSQL: More features, standards-compliant. MySQL: Faster for simple queries."
            },
            {
                question: "MongoDB aggregation",
                answer: "db.collection.aggregate([\n    { $match: { status: \"A\" } },\n    { $group: { _id: \"$cust_id\", total: { $sum: \"$amount\" } } }\n])"
            },

            // Functional Programming
            {
                question: "Monads in programming",
                answer: "Design pattern that handles side effects (Maybe, Either, IO monads) while maintaining purity."
            },

            // Web Performance
            {
                question: "Critical rendering path",
                answer: "1. HTML → 2. CSSOM → 3. Render Tree → 4. Layout → 5. Paint → 6. Composite"
            },

            // Testing
            {
                question: "Unit test best practices",
                answer: "1. Test one thing 2. Fast execution 3. No dependencies 4. Clear assertions"
            },

            // Creative Coding
            {
                question: "p5.js example",
                answer: "function setup() {\n    createCanvas(400, 400);\n}\nfunction draw() {\n    ellipse(mouseX, mouseY, 50, 50);}"
            }
        ];

        // New: Programming Knowledge Base
        this.PROGRAMMING_BASE = [
            {
                question: "Custom scrollbar",
                answer: `<div class=\"custom-scroll\">\n  <p>Long content here...</p>\n  <p style=\"height: 1000px;\">Scroll down</p>\n</div>\n\n<style>\n.custom-scroll {\n  height: 200px;\n  overflow-y: scroll;\n}\n.custom-scroll::-webkit-scrollbar {\n  width: 10px;\n}\n.custom-scroll::-webkit-scrollbar-track {\n  background: #f1f1f1;\n}\n.custom-scroll::-webkit-scrollbar-thumb {\n  background: #888;\n  border-radius: 5px;\n}\n.custom-scroll::-webkit-scrollbar-thumb:hover {\n  background: #555;\n}\n</style>`
            },
            {
                question: "Aspect ratio box",
                answer: `<div class=\"aspect-ratio-box\">\n  <div class=\"content\">16:9 Aspect Ratio</div>\n</div>\n\n<style>\n.aspect-ratio-box {\n  position: relative;\n  width: 100%;\n  padding-top: 56.25%; /* 16:9 Aspect Ratio */\n  background: #f0f0f0;\n}\n.aspect-ratio-box .content {\n  position: absolute;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  right: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n</style>`
            },
            {
                question: "CSS masonry layout",
                answer: `<div class=\"masonry\">\n  <div class=\"item\" style=\"height: 100px;\">1</div>\n  <div class=\"item\" style=\"height: 150px;\">2</div>\n  <div class=\"item\" style=\"height: 80px;\">3</div>\n  <div class=\"item\" style=\"height: 120px;\">4</div>\n  <div class=\"item\" style=\"height: 200px;\">5</div>\n  <div class=\"item\" style=\"height: 90px;\">6</div>\n</div>\n\n<style>\n.masonry {\n  display: grid;\n  grid-gap: 15px;\n  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));\n  grid-auto-rows: 10px;\n}\n.item {\n  background: #4CAF50;\n  color: white;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  grid-row-end: span var(--row-span);\n}\n.item:nth-child(1) { --row-span: 10; }\n.item:nth-child(2) { --row-span: 15; }\n.item:nth-child(3) { --row-span: 8; }\n.item:nth-child(4) { --row-span: 12; }\n.item:nth-child(5) { --row-span: 20; }\n.item:nth-child(6) { --row-span: 9; }\n</style>`
            },
            {
                question: "Animated gradient text",
                answer: `<h1 class="gradient-text">Gradient Text</h1>\n\n<style>\n.gradient-text {\n  background: linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8);\n  background-size: 400% 400%;\n  -webkit-background-clip: text;\n  background-clip: text;\n  color: transparent;\n  animation: gradient 8s ease infinite;\n  font-size: 3em;\n}\n@keyframes gradient {\n  0% { background-position: 0% 50%; }\n  50% { background-position: 100% 50%; }\n  100% { background-position: 0% 50%; }\n}\n</style>`
            },
            {
                question: "Hover underline animation",
                answer: `<a href="#" class="hover-underline">Hover me</a>\n\n<style>\n.hover-underline {\n  position: relative;\n  text-decoration: none;\n  color: #333;\n}\n.hover-underline::after {\n  content: '';\n  position: absolute;\n  width: 0;\n  height: 2px;\n  bottom: 0;\n  left: 0;\n  background-color: #4CAF50;\n  transition: width 0.3s;\n}\n.hover-underline:hover::after {\n  width: 100%;\n}\n</style>`
            },
            {
                question: "Parallax scrolling effect",
                answer: `<div class="parallax"></div>\n<div class="content">Regular content here</div>\n\n<style>\n.parallax {\n  height: 500px;\n  background-image: url('https://via.placeholder.com/1920x1080');\n  background-attachment: fixed;\n  background-position: center;\n  background-repeat: no-repeat;\n  background-size: cover;\n}\n.content {\n  height: 1000px;\n  padding: 20px;\n}\n</style>`
            },
            {
                question: "Floating label form",
                answer: `<div class="form-group">\n  <input type="text" id="name" required>\n  <label for="name">Name</label>\n</div>\n\n<style>\n.form-group {\n  position: relative;\n  margin: 20px 0;\n}\n.form-group input {\n  width: 100%;\n  padding: 10px;\n  font-size: 16px;\n  border: 1px solid #ccc;\n  border-radius: 4px;\n}\n.form-group label {\n  position: absolute;\n  top: 10px;\n  left: 10px;\n  color: #999;\n  font-size: 16px;\n  transition: all 0.3s;\n  pointer-events: none;\n}\n.form-group input:focus + label,\n.form-group input:valid + label {\n  top: -10px;\n  left: 5px;\n  font-size: 12px;\n  background: white;\n  padding: 0 5px;\n  color: #4CAF50;\n}\n</style>`
            },
            {
                question: "Image hover zoom",
                answer: `<div class="image-container">\n  <img src="https://via.placeholder.com/400" alt="Sample">\n</div>\n\n<style>\n.image-container {\n  width: 400px;\n  height: 300px;\n  overflow: hidden;\n}\n.image-container img {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n  transition: transform 0.5s;\n}\n.image-container:hover img {\n  transform: scale(1.1);\n}\n</style>`
            },
            {
                question: "CSS-only accordion",
                answer: `<div class="accordion">\n  <input type="checkbox" id="section1">\n  <label for="section1">Section 1</label>\n  <div class="content">\n    <p>Content for section 1</p>\n  </div>\n  \n  <input type="checkbox" id="section2">\n  <label for="section2">Section 2</label>\n  <div class="content">\n    <p>Content for section 2</p>\n  </div>\n</div>\n\n<style>\n.accordion input {\n  display: none;\n}\n.accordion label {\n  display: block;\n  padding: 15px;\n  background: #4CAF50;\n  color: white;\n  cursor: pointer;\n  margin-bottom: 2px;\n}\n.accordion .content {\n  max-height: 0;\n  overflow: hidden;\n  transition: max-height 0.3s;\n}\n.accordion input:checked ~ .content {\n  max-height: 200px;\n}\n</style>`
            },
            {
                question: "Animated hamburger menu",
                answer: `<button class="hamburger">\n  <span></span>\n  <span></span>\n  <span></span>\n</button>\n\n<style>\n.hamburger {\n  width: 60px;\n  height: 45px;\n  position: relative;\n  background: transparent;\n  border: none;\n  cursor: pointer;\n}\n.hamburger span {\n  display: block;\n  position: absolute;\n  height: 5px;\n  width: 100%;\n  background: #333;\n  border-radius: 5px;\n  opacity: 1;\n  left: 0;\n  transform: rotate(0deg);\n  transition: .25s ease-in-out;\n}\n.hamburger span:nth-child(1) {\n  top: 0px;\n}\n.hamburger span:nth-child(2) {\n  top: 18px;\n}\n.hamburger span:nth-child(3) {\n  top: 36px;\n}\n.hamburger.active span:nth-child(1) {\n  top: 18px;\n  transform: rotate(135deg);\n}\n.hamburger.active span:nth-child(2) {\n  opacity: 0;\n}\n.hamburger.active span:nth-child(3) {\n  top: 18px;\n  transform: rotate(-135deg);\n}\n</style>\n\n<script>\ndocument.querySelector('.hamburger').addEventListener('click', function() {\n  this.classList.toggle('active');\n});\n</script>`
            },
            {
                question: "Text clipping mask",
                answer: `<div class="clip-text">\n  <h1>CLIP ME</h1>\n</div>\n\n<style>\n.clip-text {\n  background: url('https://via.placeholder.com/800x400') center/cover;\n  height: 300px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.clip-text h1 {\n  font-size: 8em;\n  font-weight: bold;\n  background: white;\n  color: black;\n  padding: 0 20px;\n  mix-blend-mode: screen;\n}\n</style>`
            },
            {
                question: "Smooth scroll snapping",
                answer: `<div class="scroll-container">\n  <section class="scroll-section">Section 1</section>\n  <section class="scroll-section">Section 2</section>\n  <section class="scroll-section">Section 3</section>\n</div>\n\n<style>\n.scroll-container {\n  height: 100vh;\n  overflow-y: scroll;\n  scroll-snap-type: y mandatory;\n}\n.scroll-section {\n  height: 100vh;\n  scroll-snap-align: start;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 2em;\n}\n.scroll-section:nth-child(1) { background: #f44336; }\n.scroll-section:nth-child(2) { background: #4CAF50; }\n.scroll-section:nth-child(3) { background: #2196F3; }\n</style>`
            },
            {
                question: "Animated SVG loader",
                answer: `<svg class="loader" viewBox="0 0 50 50">\n  <circle cx="25" cy="25" r="20" fill="none" stroke="#4CAF50" stroke-width="4"></circle>\n</svg>\n\n<style>\n.loader {\n  width: 100px;\n  height: 100px;\n  animation: rotate 2s linear infinite;\n}\n.loader circle {\n  stroke-dasharray: 1, 200;\n  stroke-dashoffset: 0;\n  animation: dash 1.5s ease-in-out infinite;\n  stroke-linecap: round;\n}\n@keyframes rotate {\n  100% { transform: rotate(360deg); }\n}\n@keyframes dash {\n  0% {\n    stroke-dasharray: 1, 200;\n    stroke-dashoffset: 0;\n  }\n  50% {\n    stroke-dasharray: 89, 200;\n    stroke-dashoffset: -35;\n  }\n  100% {\n    stroke-dasharray: 89, 200;\n    stroke-dashoffset: -124;\n  }\n}\n</style>`
            },
            {
                question: "CSS container queries",
                answer: `<div class="card-container">\n  <div class="card">\n    <img src="https://via.placeholder.com/300" alt="Sample">\n    <div class="content">\n      <h3>Card Title</h3>\n      <p>Card content</p>\n    </div>\n  </div>\n</div>\n\n<style>\n.card {\n  container-type: inline-size;\n}\n.content {\n  padding: 1rem;\n}\n@container (min-width: 300px) {\n  .card {\n    display: flex;\n    gap: 1rem;\n  }\n  .content h3 {\n    font-size: 1.5rem;\n  }\n}\n.card-container {\n  width: 100%;\n  max-width: 600px;\n  margin: 0 auto;\n}\n</style>`
            },
            {
                question: "CSS :has() selector",
                answer: `<div class="card">\n  <img src="https://via.placeholder.com/300" alt="Sample">\n  <p>This card has an image</p>\n</div>\n<div class="card">\n  <p>This card has no image</p>\n</div>\n\n<style>\n.card {\n  padding: 1rem;\n  margin: 1rem;\n  border: 1px solid #ddd;\n}\n.card:has(img) {\n  background: #f0fff0;\n  border-color: #4CAF50;\n}\n</style>`
            },
            {
                question: "CSS nesting",
                answer: `<nav class="navbar">\n  <ul>\n    <li><a href="#">Home</a></li>\n    <li><a href="#">About</a></li>\n    <li><a href="#">Contact</a></li>\n  </ul>\n</nav>\n\n<style>\n.navbar {\n  background: #333;\n  padding: 1rem;\n  \n  & ul {\n    display: flex;\n    gap: 1rem;\n    list-style: none;\n    padding: 0;\n    margin: 0;\n    \n    & li {\n      & a {\n        color: white;\n        text-decoration: none;\n        \n        &:hover {\n          color: #4CAF50;\n        }\n      }\n    }\n  }\n}\n</style>`
            },
            {
                question: "View transitions API",
                answer: `<button id="toggleView">Toggle View</button>\n<div class="view-container">\n  <div class="view-a">View A</div>\n  <div class="view-b hidden">View B</div>\n</div>\n\n<style>\n.view-container {\n  position: relative;\n  height: 200px;\n  width: 300px;\n  margin: 1rem 0;\n}\n.view-a, .view-b {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 2rem;\n}\n.view-a { background: #4CAF50; color: white; }\n.view-b { background: #2196F3; color: white; }\n.hidden { display: none; }\n</style>\n\n<script>\ndocument.getElementById('toggleView').addEventListener('click', async () => {\n  if (!document.startViewTransition) {\n    toggleViews();\n    return;\n  }\n  \n  await document.startViewTransition(() => toggleViews());\n});\n\nfunction toggleViews() {\n  document.querySelector('.view-a').classList.toggle('hidden');\n  document.querySelector('.view-b').classList.toggle('hidden');\n}\n</script>`
            },
            {
                question: "Scroll-driven animations",
                answer: `<div class="scroll-animation">\n  <div class="box"></div>\n  <div style="height: 200vh;"></div>\n</div>\n\n<style>\n.box {\n  width: 100px;\n  height: 100px;\n  background: #4CAF50;\n  animation: rotateAndColor linear;\n  animation-timeline: scroll();\n}\n@keyframes rotateAndColor {\n  0% { \n    transform: rotate(0deg);\n    background: #4CAF50;\n  }\n  100% { \n    transform: rotate(360deg);\n    background: #2196F3;\n  }\n}\n</style>`
            },
            {
                question: "CSS masonry with grid",
                answer: `<div class="masonry-grid">\n  <div class="item" style="height: 100px;">1</div>\n  <div class="item" style="height: 150px;">2</div>\n  <div class="item" style="height: 80px;">3</div>\n  <div class="item" style="height: 120px;">4</div>\n  <div class="item" style="height: 200px;">5</div>\n  <div class="item" style="height: 90px;">6</div>\n</div>\n\n<style>\n.masonry-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));\n  grid-auto-rows: 10px;\n  gap: 15px;\n}\n.item {\n  background: #4CAF50;\n  color: white;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  grid-row-end: span var(--row-span);\n}\n.item:nth-child(1) { --row-span: 10; }\n.item:nth-child(2) { --row-span: 15; }\n.item:nth-child(3) { --row-span: 8; }\n.item:nth-child(4) { --row-span: 12; }\n.item:nth-child(5) { --row-span: 20; }\n.item:nth-child(6) { --row-span: 9; }\n</style>`
            },
            {
                question: "CSS subgrid implementation",
                answer: `<div class="grid-container">\n  <div class="grid-item">\n    <div class="sub-item">Header</div>\n    <div class="sub-item">Content</div>\n    <div class="sub-item">Footer</div>\n  </div>\n  <div class="grid-item">\n    <div class="sub-item">Header</div>\n    <div class="sub-item">Content</div>\n    <div class="sub-item">Footer</div>\n  </div>\n</div>\n\n<style>\n.grid-container {\n  display: grid;\n  grid-template-columns: repeat(2, 1fr);\n  gap: 20px;\n}\n.grid-item {\n  display: grid;\n  grid-template-rows: subgrid;\n  grid-row: span 3;\n  border: 1px solid #ddd;\n  padding: 10px;\n}\n.sub-item {\n  padding: 10px;\n}\n.sub-item:nth-child(1) { background: #f8d7da; }\n.sub-item:nth-child(2) { background: #d1e7dd; }\n.sub-item:nth-child(3) { background: #cfe2ff; }\n</style>`
            },
            {
                question: "CSS accent-color customization",
                answer: `<form>\n  <input type="checkbox" checked>\n  <input type="radio" name="group" checked>\n  <input type="range">\n</form>\n\n<style>\ninput[type="checkbox"] {\n  accent-color: #4CAF50;\n  width: 20px;\n  height: 20px;\n}\ninput[type="radio"] {\n  accent-color: #2196F3;\n  width: 20px;\n  height: 20px;\n}\ninput[type="range"] {\n  accent-color: #ff9800;\n  width: 200px;\n}\n</style>`
            },
            {
                question: "CSS prefers-reduced-motion",
                answer: `<div class="motion-box"></div>\n\n<style>\n.motion-box {\n  width: 100px;\n  height: 100px;\n  background: #4CAF50;\n  animation: bounce 1s infinite alternate;\n}\n@keyframes bounce {\n  from { transform: translateY(0); }\n  to { transform: translateY(-20px); }\n}\n@media (prefers-reduced-motion: reduce) {\n  .motion-box {\n    animation: none;\n  }\n}\n</style>`
            },
            {
                question: "CSS backdrop-filter",
                answer: `<div class="background">\n  <div class="frosted-box">Frosted Glass Effect</div>\n</div>\n\n<style>\n.background {\n  background: url('https://via.placeholder.com/800x400') center/cover;\n  height: 300px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.frosted-box {\n  background: rgba(255, 255, 255, 0.2);\n  backdrop-filter: blur(10px);\n  padding: 20px;\n  border-radius: 10px;\n  border: 1px solid rgba(255, 255, 255, 0.3);\n  color: white;\n  font-size: 1.5em;\n  text-align: center;\n}\n</style>`
            }
        ];

        this.HTML_CSS_PROGRAMS = [
            // 1. Basic HTML Structure (50 examples)
            {
                question: "Basic HTML5 template",
                answer: `<!DOCTYPE html>\n<html>\n<head>\n<title>Page Title</title>\n</head>\n<body>\n<h1>My Heading</h1>\n<p>My paragraph.</p>\n</body>\n</html>`
            },
            // ... 49 more basic structure examples

            // 2. Text Formatting (50 examples)
            {
                question: "HTML text formatting tags",
                answer: `<p><b>Bold</b> <i>Italic</i> <u>Underline</u>\n<strong>Strong</strong> <em>Emphasized</em>\n<sup>Superscript</sup> <sub>Subscript</sub>\n<mark>Marked</mark> <small>Small</small>\n<del>Deleted</del> <ins>Inserted</ins></p>`
            },
            // ... 49 more text formatting examples

            // 3. Links and Navigation (50 examples)
            {
                question: "Create email link",
                answer: `<a href=\"mailto:someone@example.com\">Send Email</a>`
            },
            // ... 49 more link examples

            // 4. Images and Media (50 examples)
            {
                question: "Image with hover effect",
                answer: `<img src=\"photo.jpg\" alt=\"Photo\" class=\"hover-img\">\n\n<style>\n.hover-img {\n  transition: transform 0.3s;\n}\n.hover-img:hover {\n  transform: scale(1.1);\n}\n</style>`
            },
            // ... 49 more media examples

            // 5. Tables (50 examples)
            {
                question: "Zebra-striped table",
                answer: `<table>\n<tr><th>Header</th></tr>\n<tr><td>Row 1</td></tr>\n<tr><td>Row 2</td></tr>\n</table>\n\n<style>\ntable {\n  border-collapse: collapse;\n  width: 100%;\n}\nth, td {\n  padding: 8px;\n  text-align: left;\n  border-bottom: 1px solid #ddd;\n}\ntr:nth-child(even) {\n  background-color: #f2f2f2;\n}\n</style>`
            },
            // ... 49 more table examples

            // 6. Forms (100 examples)
            {
                question: "Login form with validation",
                answer: `<form>\n<label>Username:</label>\n<input type=\"text\" required>\n<label>Password:</label>\n<input type=\"password\" required>\n<button type=\"submit\">Login</button>\n</form>\n\n<style>\ninput:invalid {\n  border-color: red;\n}\ninput:valid {\n  border-color: green;\n}\n</style>`
            },
            // ... 99 more form examples

            // 7. CSS Layouts (150 examples)
            {
                question: "Holy Grail layout with Flexbox",
                answer: `<div class=\"container\">\n<header>Header</header>\n<div class=\"main\">\n<nav>Nav</nav>\n<main>Content</main>\n<aside>Aside</aside>\n</div>\n<footer>Footer</footer>\n</div>\n\n<style>\n.container {\n  display: flex;\n  flex-direction: column;\n  min-height: 100vh;\n}\n.main {\n  display: flex;\n  flex: 1;\n}\nmain {\n  flex: 1;\n}\nnav, aside {\n  width: 200px;\n}\n</style>`
            },
            // ... 149 more layout examples

            // 8. Responsive Design (100 examples)
            {
                question: "Media query for mobile devices",
                answer: `<style>\n/* Default styles */\n.container {\n  width: 960px;\n}\n\n/* Tablet */\n@media (max-width: 768px) {\n  .container {\n    width: 720px;\n  }\n}\n\n/* Mobile */\n@media (max-width: 480px) {\n  .container {\n    width: 100%;\n    padding: 0 15px;\n  }\n}\n</style>`
            },
            // ... 99 more responsive examples

            // 9. Animations (100 examples)
            {
                question: "Pulse animation effect",
                answer: `<div class=\"pulse\"></div>\\n\\n<style>\\n.pulse {\\n  width: 100px;\\n  height: 100px;\\n  background: red;\\n  border-radius: 50%;\\n  animation: pulse 1.5s infinite;\\n}\\n\\n@keyframes pulse {\\n  0% { transform: scale(0.95); }\\n  50% { transform: scale(1.05); }\\n  100% { transform: scale(0.95); }\\n}\\n</style>`
            },
            // ... 99 more animation examples

            // 10. UI Components (200 examples)
            {
                question: "Modal dialog box",
                answer: `<button onclick=\"document.getElementById(\'modal\').style.display=\'block\'\">Open Modal</button>\\n\\n<div id=\"modal\" class=\"modal\">\\n<div class=\"modal-content\">\\n<span onclick=\"document.getElementById(\'modal\').style.display=\'none\'\" class=\"close\">&times;</span>\\n<p>Modal content here</p>\\n</div>\\n</div>\\n\\n<style>\\n.modal {\\n  display: none;\\n  position: fixed;\\n  z-index: 1;\\n  left: 0;\\n  top: 0;\\n  width: 100%;\\n  height: 100%;\\n  background-color: rgba(0,0,0,0.4);\\n}\\n.modal-content {\\n  background-color: #fefefe;\\n  margin: 15% auto;\\n  padding: 20px;\\n  border: 1px solid #888;\\n  width: 80%;\\n}\\n.close {\\n  color: #aaa;\\n  float: right;\\n  font-size: 28px;\\n  font-weight: bold;\\n}\\n</style>`
            },
            // ... 199 more component examples

            // 11. CSS Effects (50 examples)
            {
                question: "Neon text effect",
                answer: `<h1 class=\"neon\">NEON</h1>\\n\\n<style>\\n.neon {\\n  color: #fff;\\n  text-shadow:\\n    0 0 5px #fff,\\n    0 0 10px #fff,\\n    0 0 20px #fff,\\n    0 0 40px #0ff,\\n    0 0 80px #0ff,\\n    0 0 90px #0ff,\\n    0 0 100px #0ff,\\n    0 0 150px #0ff;\\n}\\n</style>`
            },
            // ... 49 more effect examples

            // 12. Advanced Techniques (50 examples)
            {
                question: "CSS variables example",
                answer: `<div class=\"container\">\n<div class=\"box\"></div>\n</div>\n\n<style>\n:root {\n  --main-color: #4CAF50;\n  --box-size: 100px;\n}\n.container {\n  --container-padding: 20px;\n  padding: var(--container-padding);\n}\n.box {\n  width: var(--box-size);\n  height: var(--box-size);\n  background-color: var(--main-color);\n}\n</style>`
            },
            {
                question: "CSS Grid layout",
                answer: `<div class=\"grid-container\">\n  <div class=\"item1\">Header</div>\n  <div class=\"item2\">Menu</div>\n  <div class=\"item3\">Main</div>\n  <div class=\"item4\">Right</div>\n  <div class=\"item5\">Footer</div>\n</div>\n\n<style>\n.grid-container {\n  display: grid;\n  grid-template-areas:\n    'header header header header header'\n    'menu main main right right'\n    'menu footer footer footer footer';\n  gap: 10px;\n  padding: 10px;\n}\n.grid-container > div {\n  padding: 20px;\n  text-align: center;\n}\n.item1 { grid-area: header; background: #f44336; }\n.item2 { grid-area: menu; background: #4CAF50; }\n.item3 { grid-area: main; background: #2196F3; }\n.item4 { grid-area: right; background: #ff9800; }\n.item5 { grid-area: footer; background: #9c27b0; }\n</style>`
            },
            {
                question: "Flexbox centering",
                answer: `<div class=\"flex-center\">Centered Content</div>\n\n<style>\n.flex-center {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 200px;\n  border: 1px solid #ddd;\n}\n</style>`
            },
            {
                question: "Sticky header",
                answer: `<header class=\"sticky-header\">Sticky Header</header>\n<main style=\"height: 2000px;\">Scroll down</main>\n\n<style>\n.sticky-header {\n  position: sticky;\n  top: 0;\n  padding: 20px;\n  background: #333;\n  color: white;\n  z-index: 100;\n}\n</style>`
            },
            {
                question: "Dark mode toggle",
                answer: `<button id=\"darkModeToggle\">Toggle Dark Mode</button>\n\n<style>\n:root {\n  --bg-color: white;\n  --text-color: black;\n}\nbody {\n  background: var(--bg-color);\n  color: var(--text-color);\n  transition: all 0.3s;\n}\n.dark-mode {\n  --bg-color: #121212;\n  --text-color: white;\n}\n</style>\n\n<script>\ndocument.getElementById('darkModeToggle').addEventListener('click', function() {\n  document.body.classList.toggle('dark-mode');\n});\n</script>`
            },
            {
                question: "CSS-only modal",
                answer: `<label for=\"modal-toggle\" class=\"modal-btn\">Open Modal</label>\n<input type=\"checkbox\" id=\"modal-toggle\" class=\"modal-toggle\">\n<div class=\"modal\">\n  <div class=\"modal-content\">\n    <h2>Modal Title</h2>\n    <p>Modal content goes here.</p>\n    <label for=\"modal-toggle\" class=\"modal-close\">×</label>\n  </div>\n</div>\n\n<style>\n.modal-toggle { display: none; }\n.modal-btn { cursor: pointer; }\n.modal {\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  background: rgba(0,0,0,0.5);\n  display: none;\n  align-items: center;\n  justify-content: center;\n  z-index: 1000;\n}\n.modal-content {\n  background: white;\n  padding: 20px;\n  border-radius: 5px;\n  position: relative;\n  max-width: 500px;\n  width: 80%;\n}\n.modal-close {\n  position: absolute;\n  top: 10px;\n  right: 10px;\n  font-size: 24px;\n  cursor: pointer;\n}\n.modal-toggle:checked ~ .modal {\n  display: flex;\n}\n</style>`
            },
            {
                question: "Responsive image grid",
                answer: `<div class=\"image-grid\">\n  <img src=\"https://via.placeholder.com/300\" alt=\"Sample\">\n  <img src=\"https://via.placeholder.com/300\" alt=\"Sample\">\n  <img src=\"https://via.placeholder.com/300\" alt=\"Sample\">\n  <img src=\"https://via.placeholder.com/300\" alt=\"Sample\">\n</div>\n\n<style>\n.image-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));\n  gap: 15px;\n}\n.image-grid img {\n  width: 100%;\n  height: auto;\n  border-radius: 5px;\n  transition: transform 0.3s;\n}\n.image-grid img:hover {\n  transform: scale(1.03);\n}\n</style>`
            },
            {
                question: "Custom scrollbar",
                answer: `<div class=\"custom-scroll\">\n  <p>Long content here...</p>\n  <p style=\"height: 1000px;\">Scroll down</p>\n</div>\n\n<style>\n.custom-scroll {\n  height: 200px;\n  overflow-y: scroll;\n}\n.custom-scroll::-webkit-scrollbar {\n  width: 10px;\n}\n.custom-scroll::-webkit-scrollbar-track {\n  background: #f1f1f1;\n}\n.custom-scroll::-webkit-scrollbar-thumb {\n  background: #888;\n  border-radius: 5px;\n}\n.custom-scroll::-webkit-scrollbar-thumb:hover {\n  background: #555;\n}\n</style>`
            },
            {
                question: "Aspect ratio box",
                answer: `<div class=\"aspect-ratio-box\">\n  <div class=\"content\">16:9 Aspect Ratio</div>\n</div>\n\n<style>\n.aspect-ratio-box {\n  position: relative;\n  width: 100%;\n  padding-top: 56.25%; /* 16:9 Aspect Ratio */\n  background: #f0f0f0;\n}\n.aspect-ratio-box .content {\n  position: absolute;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  right: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n</style>`
            },
            {
                question: "CSS masonry layout",
                answer: `<div class=\"masonry\">\n  <div class=\"item\" style=\"height: 100px;\">1</div>\n  <div class=\"item\" style=\"height: 150px;\">2</div>\n  <div class=\"item\" style=\"height: 80px;\">3</div>\n  <div class=\"item\" style=\"height: 120px;\">4</div>\n  <div class=\"item\" style=\"height: 200px;\">5</div>\n  <div class=\"item\" style=\"height: 90px;\">6</div>\n</div>\n\n<style>\n.masonry {\n  display: grid;\n  grid-gap: 15px;\n  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));\n  grid-auto-rows: 10px;\n}\n.item {\n  background: #4CAF50;\n  color: white;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  grid-row-end: span var(--row-span);\n}\n.item:nth-child(1) { --row-span: 10; }\n.item:nth-child(2) { --row-span: 15; }\n.item:nth-child(3) { --row-span: 8; }\n.item:nth-child(4) { --row-span: 12; }\n.item:nth-child(5) { --row-span: 20; }\n.item:nth-child(6) { --row-span: 9; }\n</style>`
            }
        ];

        this.HTML_CSS_BASE = [
            // ... existing entries ...

            // Advanced CSS Effects
            {
                question: "Glass morphism card",
                answer: `<div class="glass-card">\n  <h3>Glass Card</h3>\n  <p>This effect uses backdrop-filter</p>\n</div>\n\n<style>\n.glass-card {\n  background: rgba(255, 255, 255, 0.2);\n  backdrop-filter: blur(10px);\n  border-radius: 15px;\n  border: 1px solid rgba(255, 255, 255, 0.3);\n  padding: 20px;\n  width: 300px;\n  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);\n}\n</style>`
            },
            {
                question: "Animated gradient border card",
                answer: `<div class="gradient-border-card">\n  <div class="content">\n    <h3>Gradient Border</h3>\n    <p>With animated gradient</p>\n  </div>\n</div>\n\n<style>\n.gradient-border-card {\n  --border-width: 3px;\n  position: relative;\n  width: 300px;\n  height: 200px;\n  border-radius: 10px;\n}\n.gradient-border-card::after {\n  content: "";\n  position: absolute;\n  top: calc(-1 * var(--border-width));\n  left: calc(-1 * var(--border-width));\n  width: calc(100% + var(--border-width) * 2);\n  height: calc(100% + var(--border-width) * 2);\n  background: linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8);\n  background-size: 400% 400%;\n  z-index: -1;\n  border-radius: inherit;\n  animation: gradientBorder 3s ease infinite;\n}\n.content {\n  background: white;\n  width: 100%;\n  height: 100%;\n  border-radius: inherit;\n  padding: 20px;\n}\n@keyframes gradientBorder {\n  0% { background-position: 0% 50%; }\n  50% { background-position: 100% 50%; }\n  100% { background-position: 0% 50%; }\n}\n</style>`
            },
            {
                question: "Perspective 3D card",
                answer: `<div class="card-3d-container">\n  <div class="card-3d">\n    <div class="front">FRONT</div>\n    <div class="back">BACK</div>\n  </div>\n</div>\n\n<style>\n.card-3d-container {\n  perspective: 1000px;\n  width: 200px;\n  height: 300px;\n}\n.card-3d {\n  position: relative;\n  width: 100%;\n  height: 100%;\n  transform-style: preserve-3d;\n  transition: transform 1s;\n}\n.card-3d-container:hover .card-3d {\n  transform: rotateY(180deg);\n}\n.front, .back {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  backface-visibility: hidden;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 2em;\n  border-radius: 10px;\n}\n.front {\n  background: #4CAF50;\n  color: white;\n}\n.back {\n  background: #2196F3;\n  color: white;\n  transform: rotateY(180deg);\n}\n</style>`
            },
            {
                question: "Neon flicker animation",
                answer: `<div class="neon-flicker">NEON</div>\n\n<style>\n.neon-flicker {\n  color: #fff;\n  text-shadow:\n    0 0 5px #fff,\n    0 0 10px #fff,\n    0 0 20px #fff,\n    0 0 40px #0ff,\n    0 0 80px #0ff,\n    0 0 90px #0ff,\n    0 0 100px #0ff,\n    0 0 150px #0ff;\n  animation: flicker 3s infinite alternate;\n  font-size: 4em;\n}\n@keyframes flicker {\n  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {\n    text-shadow:\n      0 0 5px #fff,\n      0 0 10px #fff,\n      0 0 20px #fff,\n      0 0 40px #0ff,\n      0 0 80px #0ff,\n      0 0 90px #0ff,\n      0 0 100px #0ff,\n      0 0 150px #0ff;\n  }\n  20%, 24%, 55% {\n    text-shadow: none;\n  }\n}\n</style>`
            },
            {
                question: "Liquid bubble effect",
                answer: `<div class="liquid-bubble"></div>\n\n<style>\n.liquid-bubble {\n  width: 100px;\n  height: 100px;\n  background: #4CAF50;\n  border-radius: 50%;\n  position: relative;\n  animation: bubble 4s ease-in-out infinite;\n  box-shadow: inset 0 0 20px rgba(0,0,0,0.2);\n}\n@keyframes bubble {\n  0%, 100% {\n    border-radius: 50% 50% 60% 40% / 60% 70% 30% 40%;\n    transform: scale(1);\n  }\n  50% {\n    border-radius: 40% 60% 70% 30% / 50% 60% 40% 50%;\n    transform: scale(1.1);\n  }\n}\n</style>`
            },
            {
                question: "Animated text reveal",
                answer: `<h1 class="text-reveal">Animated Text</h1>\n\n<style>\n.text-reveal {\n  font-size: 3em;\n  background: linear-gradient(90deg, #000, #fff, #000);\n  background-size: 200% auto;\n  color: #000;\n  -webkit-background-clip: text;\n  background-clip: text;\n  -webkit-text-fill-color: transparent;\n  animation: textReveal 3s linear infinite;\n}\n@keyframes textReveal {\n  to { background-position: 200% center; }\n}\n</style>`
            },
            {
                question: "Hover tilt effect",
                answer: `<div class="tilt-card">\n  <h3>Tilt Effect</h3>\n  <p>Hover to see 3D tilt</p>\n</div>\n\n<style>\n.tilt-card {\n  width: 200px;\n  height: 200px;\n  background: #4CAF50;\n  color: white;\n  padding: 20px;\n  border-radius: 10px;\n  transition: transform 0.3s;\n  transform-style: preserve-3d;\n}\n.tilt-card:hover {\n  transform: rotateX(10deg) rotateY(10deg);\n}\n</style>`
            },
            {
                question: "CSS-only animated toggle switch",
                answer: `<label class="toggle-switch">\n  <input type="checkbox">\n  <span class="slider"></span>\n</label>\n\n<style>\n.toggle-switch {\n  position: relative;\n  display: inline-block;\n  width: 60px;\n  height: 34px;\n}\n.toggle-switch input {\n  opacity: 0;\n  width: 0;\n  height: 0;\n}\n.slider {\n  position: absolute;\n  cursor: pointer;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: #ccc;\n  transition: .4s;\n  border-radius: 34px;\n}\n.slider:before {\n  content: "";\n  position: absolute;\n  height: 26px;\n  width: 26px;\n  left: 4px;\n  bottom: 4px;\n  background: white;\n  transition: .4s;\n  border-radius: 50%;\n}\ninput:checked + .slider {\n  background: #4CAF50;\n}\ninput:checked + .slider:before {\n  transform: translateX(26px);\n}\n</style>`
            },
            {
                question: "Animated background particles",
                answer: `<div class="particle-container"></div>\n\n<style>\n.particle-container {\n  position: relative;\n  width: 300px;\n  height: 200px;\n  background: #121212;\n  overflow: hidden;\n}\n.particle-container::before {\n  content: "";\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background-image: \n    radial-gradient(circle at 20% 30%, rgba(255,255,255,0.8) 0%, transparent 2%),\n    radial-gradient(circle at 80% 20%, rgba(255,255,255,0.6) 0%, transparent 3%),\n    radial-gradient(circle at 10% 70%, rgba(255,255,255,0.7) 0%, transparent 2.5%);\n  background-size: 200% 200%;\n  animation: particles 15s linear infinite;\n}\n@keyframes particles {\n  0% { background-position: 0% 0%; }\n  100% { background-position: 100% 100%; }\n}\n</style>`
            },
            {
                question: "Metaball effect",
                answer: `<div class="metaball-container">\n  <div class="metaball"></div>\n  <div class="metaball"></div>\n</div>\n\n<style>\n.metaball-container {\n  position: relative;\n  width: 200px;\n  height: 200px;\n  filter: url('#goo');\n}\n.metaball {\n  position: absolute;\n  width: 100px;\n  height: 100px;\n  background: #4CAF50;\n  border-radius: 50%;\n  animation: move 4s ease-in-out infinite;\n}\n.metaball:nth-child(2) {\n  background: #2196F3;\n  animation-delay: -2s;\n}\n@keyframes move {\n  0%, 100% { transform: translate(0, 0); }\n  50% { transform: translate(80px, 80px); }\n}\n</style>\n<svg style="visibility: hidden; position: absolute;">\n  <filter id="goo">\n    <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />\n    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" result="goo" />\n    <feComposite in="SourceGraphic" in2="goo" operator="atop"/>\n  </filter>\n</svg>`
            },
            // Advanced CSS Layouts
            {
                question: "CSS masonry with columns",
                answer: `<div class="masonry-columns">\n  <div class="item">1</div>\n  <div class="item">2</div>\n  <div class="item">3</div>\n  <div class="item">4</div>\n  <div class="item">5</div>\n  <div class="item">6</div>\n</div>\n\n<style>\n.masonry-columns {\n  column-count: 3;\n  column-gap: 15px;\n}\n.item {\n  break-inside: avoid;\n  margin-bottom: 15px;\n  background: #4CAF50;\n  color: white;\n  padding: 20px;\n  border-radius: 5px;\n}\n.item:nth-child(1) { height: 100px; }\n.item:nth-child(2) { height: 150px; }\n.item:nth-child(3) { height: 80px; }\n.item:nth-child(4) { height: 120px; }\n.item:nth-child(5) { height: 200px; }\n.item:nth-child(6) { height: 90px; }\n</style>`
            },
            {
                question: "Full-page scroll snap",
                answer: `<div class="scroll-snap-container">\n  <section class="scroll-section">Section 1</section>\n  <section class="scroll-section">Section 2</section>\n  <section class="scroll-section">Section 3</section>\n</div>\n\n<style>\n.scroll-snap-container {\n  height: 100vh;\n  overflow-y: scroll;\n  scroll-snap-type: y mandatory;\n}\n.scroll-section {\n  height: 100vh;\n  scroll-snap-align: start;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 2em;\n}\n.scroll-section:nth-child(1) { background: #f44336; }\n.scroll-section:nth-child(2) { background: #4CAF50; }\n.scroll-section:nth-child(3) { background: #2196F3; }\n</style>`
            },
            {
                question: "Dynamic grid with minmax",
                answer: `<div class="dynamic-grid">\n  <div class="grid-item">1</div>\n  <div class="grid-item">2</div>\n  <div class="grid-item">3</div>\n  <div class="grid-item">4</div>\n  <div class="grid-item">5</div>\n  <div class="grid-item">6</div>\n</div>\n\n<style>\n.dynamic-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));\n  gap: 15px;\n}\n.grid-item {\n  background: #4CAF50;\n  color: white;\n  padding: 20px;\n  border-radius: 5px;\n  text-align: center;\n}\n</style>`
            },
            {
                question: "Sticky footer layout",
                answer: `<div class="page-container">\n  <header>Header</header>\n  <main>Content</main>\n  <footer>Footer</footer>\n</div>\n\n<style>\n.page-container {\n  display: flex;\n  flex-direction: column;\n  min-height: 100vh;\n}\nheader {\n  background: #333;\n  color: white;\n  padding: 20px;\n}\nmain {\n  flex: 1;\n  padding: 20px;\n}\nfooter {\n  background: #333;\n  color: white;\n  padding: 20px;\n}\n</style>`
            },
            {
                question: "Holy grail layout (CSS Grid)",
                answer: `<div class="holy-grail">\n  <header>Header</header>\n  <nav>Navigation</nav>\n  <main>Main Content</main>\n  <aside>Sidebar</aside>\n  <footer>Footer</footer>\n</div>\n\n<style>\n.holy-grail {\n  display: grid;\n  grid-template:\n    "header header header" auto\n    "nav main aside" 1fr\n    "footer footer footer" auto\n    / 200px 1fr 200px;\n  min-height: 100vh;\n}\nheader { grid-area: header; background: #f44336; padding: 20px; }\nnav { grid-area: nav; background: #4CAF50; padding: 20px; }\nmain { grid-area: main; background: #2196F3; padding: 20px; }\naside { grid-area: aside; background: #ff9800; padding: 20px; }\nfooter { grid-area: footer; background: #9c27b0; padding: 20px; }\n@media (max-width: 768px) {\n  .holy-grail {\n    grid-template:\n      "header" auto\n      "nav" auto\n      "main" 1fr\n      "aside" auto\n      "footer" auto\n      / 1fr;\n  }\n}\n</style>`
            },
            {
                question: "Aspect ratio boxes",
                answer: `<div class="ratio-box-container">\n  <div class="ratio-box" style="--aspect-ratio: 16/9;">16:9</div>\n  <div class="ratio-box" style="--aspect-ratio: 1/1;">1:1</div>\n  <div class="ratio-box" style="--aspect-ratio: 4/3;">4:3</div>\n</div>\n\n<style>\n.ratio-box-container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 20px;\n}\n.ratio-box {\n  background: #4CAF50;\n  color: white;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  position: relative;\n}\n.ratio-box::before {\n  content: "";\n  display: block;\n  padding-bottom: calc(100% / (var(--aspect-ratio)));\n}\n.ratio-box > * {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n</style>`
            },
            {
                question: "CSS subgrid example",
                answer: `<div class="subgrid-container">\n  <div class="subgrid-item">\n    <div class="subgrid-header">Header</div>\n    <div class="subgrid-content">Content</div>\n    <div class="subgrid-footer">Footer</div>\n  </div>\n  <div class="subgrid-item">\n    <div class="subgrid-header">Header</div>\n    <div class="subgrid-content">Content</div>\n    <div class="subgrid-footer">Footer</div>\n  </div>\n</div>\n\n<style>\n.subgrid-container {\n  display: grid;\n  grid-template-columns: repeat(2, 1fr);\n  gap: 20px;\n}\n.subgrid-item {\n  display: grid;\n  grid-template-rows: subgrid;\n  grid-row: span 3;\n  border: 1px solid #ddd;\n}\n.subgrid-header {\n  background: #f44336;\n  color: white;\n  padding: 10px;\n}\n.subgrid-content {\n  background: #e3f2fd;\n  padding: 10px;\n}\n.subgrid-footer {\n  background: #4CAF50;\n  color: white;\n  padding: 10px;\n}\n</style>`
            },
            {
                question: "Container query card",
                answer: `<div class="card-container">\n  <div class="card">\n    <img src="https://via.placeholder.com/300" alt="Sample">\n    <div class="content">\n      <h3>Card Title</h3>\n      <p>Card content that responds to container size</p>\n    </div>\n  </div>\n</div>\n\n<style>\n.card {\n  container-type: inline-size;\n  border: 1px solid #ddd;\n  border-radius: 8px;\n  overflow: hidden;\n}\n.content {\n  padding: 1rem;\n}\n@container (min-width: 300px) {\n  .card {\n    display: flex;\n  }\n  .card img {\n    width: 150px;\n    height: auto;\n    object-fit: cover;\n  }\n  .content h3 {\n    font-size: 1.5rem;\n  }\n}\n.card-container {\n  width: 100%;\n  max-width: 600px;\n  margin: 0 auto;\n}\n</style>`
            },
            {
                question: "Sticky table headers",
                answer: `<div class="table-container">\n  <table>\n    <thead>\n      <tr><th>Header 1</th><th>Header 2</th></tr>\n    </thead>\n    <tbody>\n      <tr><td>Row 1</td><td>Data</td></tr>\n      <tr><td>Row 2</td><td>Data</td></tr>\n      <!-- More rows -->\n    </tbody>\n  </table>\n</div>\n\n<style>\n.table-container {\n  height: 200px;\n  overflow-y: auto;\n}\ntable {\n  width: 100%;\n  border-collapse: collapse;\n}\nth {\n  position: sticky;\n  top: 0;\n  background: #4CAF50;\n  color: white;\n  padding: 10px;\n}\ntd {\n  padding: 10px;\n  border-bottom: 1px solid #ddd;\n}\n</style>`
            },
            {
                question: "Multi-column text layout",
                answer: `<div class="multi-column">\n  <p>Long text content here...</p>\n</div>\n\n<style>\n.multi-column {\n  column-count: 3;\n  column-gap: 20px;\n  column-rule: 1px solid #ddd;\n}\n@media (max-width: 768px) {\n  .multi-column {\n    column-count: 2;\n  }\n}\n@media (max-width: 480px) {\n  .multi-column {\n    column-count: 1;\n  }\n}\n</style>`
            }
        ];
    }

    createChatBot() {
        this.terminalContainer = document.createElement('div');
        this.terminalContainer.id = 'chat-bot';
        this.terminalContainer.className = 'chat-bot-container';
        this.terminalContainer.style.display = 'none'; // Start hidden
        this.terminalContainer.innerHTML = `
            <div class="chat-bot-header">
                <div class="chat-bot-title">Jack</div>
                <div class="chat-bot-controls">
                    <div class="chat-bot-control chat-bot-minimize"></div>
                    <div class="chat-bot-control chat-bot-maximize"></div>
                    <div class="chat-bot-control chat-bot-close">X</div>
                </div>
            </div>
            <div class="chat-bot-content">
                <div class="terminal-message info">Welcome to Jack! Type 'help' for available commands.</div>
                <div class="chat-bot-input-line">
                    <span class="chat-bot-prompt">$</span>
                    <input type="text" class="chat-bot-input" autofocus>
                </div>
            </div>
            <div class="chat-bot-movement-controls">
                <button class="move-btn" data-direction="up"><i class="mdi mdi-chevron-up"></i></button>
                <button class="move-btn" data-direction="down"><i class="mdi mdi-chevron-down"></i></button>
                <button class="move-btn" data-direction="left"><i class="mdi mdi-chevron-left"></i></button>
                <button class="move-btn" data-direction="right"><i class="mdi mdi-chevron-right"></i></button>
            </div>
        `;
        
        document.body.appendChild(this.terminalContainer);
        this.terminal = this.terminalContainer.querySelector('.chat-bot-content');
        this.input = this.terminalContainer.querySelector('.chat-bot-input');
        
        // Set initial position
        this.updatePosition();
    }

    setupMovementControls() {
        const moveButtons = this.terminalContainer.querySelectorAll('.move-btn');
        moveButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const direction = btn.dataset.direction;
                this.moveChatBot(direction);
            });
        });

        // Add keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                switch(e.key) {
                    case 'ArrowUp':
                        this.moveChatBot('up');
                        break;
                    case 'ArrowDown':
                        this.moveChatBot('down');
                        break;
                    case 'ArrowLeft':
                        this.moveChatBot('left');
                        break;
                    case 'ArrowRight':
                        this.moveChatBot('right');
                        break;
                }
            }
        });
    }

    moveChatBot(direction) {
        const step = 10; // pixels to move
        switch(direction) {
            case 'up':
                this.position.y = Math.max(0, this.position.y - step);
                break;
            case 'down':
                this.position.y = Math.min(window.innerHeight - this.terminalContainer.offsetHeight, this.position.y + step);
                break;
            case 'left':
                this.position.x = Math.max(0, this.position.x - step);
                break;
            case 'right':
                this.position.x = Math.min(window.innerWidth - this.terminalContainer.offsetWidth, this.position.x + step);
                break;
        }
        this.updatePosition();
    }

    updatePosition() {
        this.terminalContainer.style.left = `${this.position.x}px`;
        this.terminalContainer.style.top = `${this.position.y}px`;
    }

    setupEventListeners() {
        // Input handling
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.handleCommand(this.input.value);
                this.input.value = '';
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateHistory('up');
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateHistory('down');
            }
        });

        // Chat Bot controls
        this.terminalContainer.querySelector('.chat-bot-close').addEventListener('click', () => {
            this.terminalContainer.style.display = 'none'; // Just hide it!
        });

        this.terminalContainer.querySelector('.chat-bot-minimize').addEventListener('click', () => {
            this.toggleMinimize();
        });

        // Make Chat Bot draggable
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        const header = this.terminalContainer.querySelector('.chat-bot-header');
        
        header.addEventListener('mousedown', (e) => {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            
            if (e.target === header || e.target.parentNode === header) {
                isDragging = true;
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                
                xOffset = currentX;
                yOffset = currentY;
                
                this.position.x = currentX;
                this.position.y = currentY;
                this.updatePosition();
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            // Ensure Chat Bot stays within window bounds
            this.position.x = Math.min(this.position.x, window.innerWidth - this.terminalContainer.offsetWidth);
            this.position.y = Math.min(this.position.y, window.innerHeight - this.terminalContainer.offsetHeight);
            this.updatePosition();
        });
    }

    // Add move command to handle Chat Bot movement
    move(args) {
        if (args.length === 0) {
            this.addMessage('Usage: move [up|down|left|right]', 'error');
            return;
        }

        const direction = args[0].toLowerCase();
        if (['up', 'down', 'left', 'right'].includes(direction)) {
            this.moveChatBot(direction);
            this.addMessage(`Jack moved ${direction}`, 'success');
        } else {
            this.addMessage('Invalid direction. Use: up, down, left, or right', 'error');
        }
    }

    handleCommand(input) {
        if (!input.trim()) {
            this.addMessage(' '); // Add an empty line for better spacing
            return;
        }

        this.history.push(input);
        this.historyIndex = this.history.length;
        this.addMessage(`> ${input}`, 'input');

        const parts = input.split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        if (this.commands[command]) {
            this.commands[command](args);
        } else {
            // If no specific command, treat as a general question for AI
            this.askQuestion([input]);
        }

        this.input.value = '';
        this.scrollToBottom();
    }

    addMessage(message, type = '') {
        const messageElement = document.createElement('div');
        messageElement.className = `terminal-message ${type}`;
        
        if (type === 'code') {
            messageElement.innerHTML = `<pre><code>${message}</code></pre>`;
        } else {
            messageElement.textContent = message;
        }
        
        this.terminal.insertBefore(messageElement, this.input.parentNode);
        this.scrollToBottom();
    }

    addSuggestion(suggestion) {
        const suggestionElement = document.createElement('div');
        suggestionElement.className = 'terminal-suggestion';
        suggestionElement.textContent = suggestion;
        
        this.terminal.insertBefore(suggestionElement, this.input.parentNode);
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.terminal.scrollTop = this.terminal.scrollHeight;
    }

    addToHistory(command) {
        this.history.push(command);
        this.historyIndex = this.history.length;
    }

    navigateHistory(direction) {
        if (direction === 'up' && this.historyIndex > 0) {
            this.historyIndex--;
            this.input.value = this.history[this.historyIndex];
        } else if (direction === 'down' && this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.input.value = this.history[this.historyIndex];
        }
    }

    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        this.terminalContainer.classList.toggle('chat-bot-minimized', this.isMinimized);
    }

    // Command handlers
    showHelp() {
        const userNamePart = this.userName ? `, ${this.userName}` : '';
        const helpText = `\nWelcome! I'm Jack${userNamePart}. You can ask me programming questions directly.\n\nExamples:\n  How do I use async/await in JavaScript?\n  Generate a simple login form in HTML and CSS.\n  Explain this code: function greet(name) { return 'Hello, ' + name; }\n  Fix this Python code: print("hello")\n  Search for React component examples.\n\nAvailable commands:\n  help              - Show this help message\n  clear             - Clear the chat\n  move <direction>  - Move Jack (e.g., move up, move right)\n        `;
        this.addMessage(helpText, 'info');
    }

    clear() {
        const messages = this.terminal.querySelectorAll('.terminal-message, .terminal-suggestion');
        messages.forEach(msg => msg.remove());
        this.addMessage('Chat cleared.', 'success');
    }

    async askQuestion(args) {
        const question = args.join(' ');
        if (!question) {
            this.addMessage('Please provide a question.', 'error');
            return;
        }

        this.addMessage('Thinking...', 'info');

        try {
            const response = await this.getAIResponse(question);
            // Expecting response to be an object: { message: string, type: string }
            if (typeof response === 'object' && response !== null && response.message) {
                this.addMessage(response.message, response.type);
            } else {
                // Fallback for unexpected response format
                this.addMessage(response, 'success'); 
            }
        } catch (error) {
            this.addMessage('Sorry, I encountered an error. Please try again.', 'error');
        }
    }

    async generateCode(args) {
        const task = args.join(' ');
        if (!task) {
            this.addMessage('Please describe what code you want to generate.', 'error');
            return;
        }

        this.addMessage(`Generating code for: ${task}`, 'info');
        this.addMessage('Working on it...', 'info');

        try {
            const response = await this.getAIResponse(`Generate code for: ${task}`);
            this.addMessage('Here\'s the code:', 'success');
            this.addMessage(response, 'code');
        } catch (error) {
            this.addMessage('Sorry, I couldn\'t generate the code. Please try again.', 'error');
        }
    }

    async explainCode(args) {
        const code = args.join(' ');
        if (!code) {
            this.addMessage('Please provide code to explain.', 'error');
            return;
        }

        this.addMessage('Analyzing code...', 'info');

        try {
            const response = await this.getAIResponse(`Explain this code: ${code}`);
            this.addMessage('Explanation:', 'success');
            this.addMessage(response, 'info');
        } catch (error) {
            this.addMessage('Sorry, I couldn\'t explain the code. Please try again.', 'error');
        }
    }

    async fixCode(args) {
        const code = args.join(' ');
        if (!code) {
            this.addMessage('Please provide code to fix.', 'error');
            return;
        }

        this.addMessage('Analyzing code for issues...', 'info');

        try {
            const response = await this.getAIResponse(`Fix this code: ${code}`);
            this.addMessage('Here\'s the fixed code:', 'success');
            this.addMessage(response, 'code');
        } catch (error) {
            this.addMessage('Sorry, I couldn\'t fix the code. Please try again.', 'error');
        }
    }

    async searchCode(args) {
        const query = args.join(' ');
        if (!query) {
            this.addMessage('Please provide a search query.', 'error');
            return;
        }

        this.addMessage(`Searching for: ${query}`, 'info');

        try {
            const response = await this.getAIResponse(`Find code examples for: ${query}`);
            this.addMessage('Search results:', 'success');
            this.addMessage(response, 'code');
        } catch (error) {
            this.addMessage('Sorry, I couldn\'t find any examples. Please try again.', 'error');
        }
    }

    // JavaScript equivalent of Python's difflib.SequenceMatcher.ratio()
    similar(a, b) {
        const s1 = a.toLowerCase();
        const s2 = b.toLowerCase();
        let matches = 0;
        let k = 0;
        for (let i = 0; i < s1.length; i++) {
            for (let j = k; j < s2.length; j++) {
                if (s1[i] === s2[j]) {
                    matches++;
                    k = j + 1;
                    break;
                }
            }
        }
        return (2 * matches) / (s1.length + s2.length);
    }

    // JavaScript equivalent of Python's find_best_match
    findBestMatch(prompt, knowledgeBase) {
        let bestMatch = null;
        let highestRatio = 0;

        for (const item of knowledgeBase) {
            const ratio = this.similar(prompt, item.question);
            if (ratio > highestRatio) {
                highestRatio = ratio;
                bestMatch = item;
            }
        }

        // Only return a match if it's reasonably similar (threshold: 0.6)
        if (highestRatio > 0.6) {
            return bestMatch;
        }
        return null;
    }

    async getAIResponse(prompt) {
        // Name recognition logic
        const lowerPrompt = prompt.toLowerCase();
        const namePattern = /(my name is|i am|you can call me) ([a-z]+)/i;
        const match = lowerPrompt.match(namePattern);

        if (match && match[2]) {
            this.userName = match[2].charAt(0).toUpperCase() + match[2].slice(1); // Capitalize first letter
            return { message: `Nice to meet you, ${this.userName}! I'm Jack, your programming buddy. What would you like to know about web development?`, type: 'info' };
        }

        // First check for general conversation
        const convMatch = this.findBestMatch(prompt, this.CONVERSATION_BASE);
        if (convMatch) {
            return { message: convMatch.answer, type: 'info' };
        }

        // Then check for general programming knowledge
        const progMatch = this.findBestMatch(prompt, this.PROGRAMMING_BASE);
        if (progMatch) {
            return { message: progMatch.answer, type: progMatch.answer.includes('`') ? 'code' : 'info' };
        }

        // New: Check for specific HTML/CSS programs
        const htmlCssProgramMatch = this.findBestMatch(prompt, this.HTML_CSS_PROGRAMS);
        if (htmlCssProgramMatch) {
            return { message: htmlCssProgramMatch.answer, type: 'code' };
        }

        // Finally, check for general HTML/CSS knowledge
        const htmlCssMatch = this.findBestMatch(prompt, this.HTML_CSS_BASE);
        if (htmlCssMatch) {
            return { message: htmlCssMatch.answer, type: htmlCssMatch.answer.includes('`') ? 'code' : 'info' };
        }

        // Default response for unknown questions
        return {
            message: "Hey! I'm Jack, your programming buddy! I can help you with HTML tags, CSS properties, and general programming stuff. What would you like to know?",
            type: 'info'
        };
    }

    setupToggleButton() {
        const openTerminalBtn = document.getElementById('openTerminalBtn');
        if (openTerminalBtn) {
            openTerminalBtn.addEventListener('click', () => {
                this.toggleVisibility();
            });
        }
    }

    toggleVisibility() {
        if (this.terminalContainer.style.display === 'none') {
            this.terminalContainer.style.display = 'flex'; // Show terminal
            this.scrollToBottom(); // Scroll to bottom when shown
            this.input.focus(); // Focus on input
        } else {
            this.terminalContainer.style.display = 'none'; // Hide terminal
        }
    }
}

// Add CSS for movement controls
const style = document.createElement('style');
style.textContent = `
    .chat-bot-container {
        position: fixed;
        width: 400px;
        height: 300px;
        background-color: #1e1e1e;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        z-index: 1000;
        font-family: 'Consolas', 'Courier New', monospace;
        transition: transform 0.1s ease;
    }

    .terminal-movement-controls {
        position: absolute;
        right: -30px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .move-btn {
        width: 24px;
        height: 24px;
        border: none;
        background: #2d2d2d;
        color: #fff;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
    }

    .move-btn:hover {
        background: #3d3d3d;
    }

    .move-btn i {
        font-size: 16px;
    }

    .terminal-message.code pre {
        background: #2d2d2d;
        padding: 1rem;
        border-radius: 4px;
        overflow-x: auto;
        margin: 0.5rem 0;
    }

    .terminal-message.code code {
        font-family: 'Consolas', 'Courier New', monospace;
        color: #e6e6e6;
    }

    .terminal-message.success {
        color: #28a745;
    }

    .terminal-message.error {
        color: #dc3545;
    }

    .terminal-message.info {
        color: #17a2b8;
    }

    .terminal-message.code {
        color: #e6e6e6;
    }

    /* ... rest of the existing styles ... */
`;
document.head.appendChild(style);

// Initialize terminal when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.chatBot = new Terminal();
}); 