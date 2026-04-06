# React Guide — Learning Through This Project

This guide explains React by walking through the actual code in this project.
Every concept is tied to a specific file you can open and read alongside this guide.

---

## Table of Contents

1. [What is React?](#1-what-is-react)
2. [Components — The Building Block](#2-components--the-building-block)
3. [JSX — HTML in JavaScript](#3-jsx--html-in-javascript)
4. [Props — Passing Data Down](#4-props--passing-data-down)
5. [useState — Component Memory](#5-usestate--component-memory)
6. [useEffect — Side Effects](#6-useeffect--side-effects)
7. [useRef — DOM References and Mutable Values](#7-useref--dom-references-and-mutable-values)
8. [React Router — Navigation Without Page Reloads](#8-react-router--navigation-without-page-reloads)
9. [Context API — Global State](#9-context-api--global-state)
10. [Fetching Data from the Backend](#10-fetching-data-from-the-backend)
11. [Conditional Rendering](#11-conditional-rendering)
12. [Lists and Keys](#12-lists-and-keys)
13. [Event Handlers](#13-event-handlers)
14. [CSS Modules and Styling](#14-css-modules-and-styling)
15. [The API Service Layer](#15-the-api-service-layer)
16. [Component Composition — ChatPanel + BlogPostPage](#16-component-composition--chatpanel--blogpostpage)
17. [The Canvas Game Loop Pattern](#17-the-canvas-game-loop-pattern)
18. [The Module Registry Pattern](#18-the-module-registry-pattern)
19. [How Everything Fits Together](#19-how-everything-fits-together)

---

## 1. What is React?

React is a JavaScript library for building user interfaces. Instead of manually
manipulating the DOM (like `document.getElementById('title').innerText = 'Hello'`),
you describe what the UI should look like for a given state, and React handles
updating the actual browser DOM efficiently.

**The core idea**: UI = f(state)
Your interface is a function of your data. Change the data, React updates the screen.

**Vite** is the build tool that:
- Serves your React app in development (with hot reload)
- Bundles everything into optimized files for production

**React is NOT a full framework**. It only handles the view layer. That's why we
also use React Router (navigation), CSS Modules (styling), and our own `api.js` (data fetching).

---

## 2. Components — The Building Block

**Files: all `.jsx` files in `frontend/src/`**

A React component is a function that returns JSX (the HTML-like syntax).

```jsx
// A simple component
const Greeting = () => {
    return <h1>Hello, Ajay!</h1>;
};

// Usage (looks like an HTML element)
<Greeting />
```

**Rules:**
- Component names must start with a capital letter (`Greeting`, not `greeting`)
- A component must return a single root element (or `<>...</>` Fragment)
- Components are reusable — you can render `<Greeting />` 100 times

In this project, components fall into two categories:
- **Feature pages** (`src/features/*/pages/`) — full page components tied to a URL route
- **Feature or shell components** (`src/features/*/components/`, `src/components/`) — reusable pieces used inside routes or the global layout

```
main.jsx
  └── app/App.jsx
      └── app/AppRouter.jsx
          └── components/Layout/Layout.jsx
              ├── Header.jsx      ← nav bar on every page
              ├── [feature page]  ← changes based on URL
              └── Footer.jsx
```

---

## 3. JSX — HTML in JavaScript

**File: `frontend/src/features/home/pages/HomePage.jsx`**

JSX looks like HTML but it's JavaScript. Babel (included in Vite) compiles it
to regular `React.createElement()` calls before running in the browser.

```jsx
// JSX
const element = <h1 className="title">Hello</h1>;

// What Babel compiles it to (you never write this)
const element = React.createElement('h1', { className: 'title' }, 'Hello');
```

**Key differences from HTML:**

| HTML | JSX |
|---|---|
| `class="title"` | `className="title"` (`class` is a reserved word in JS) |
| `for="input"` | `htmlFor="input"` |
| `style="color: red"` | `style={{ color: 'red' }}` (double braces: object inside expression) |
| `<br>` | `<br />` (all tags must close) |
| Comments `<!-- -->` | `{/* comment */}` |

**JavaScript expressions in JSX** — wrap in `{}`:
```jsx
const name = 'Ajay';
const element = <h1>Hello, {name}!</h1>;          // variables
const double = <p>{2 * 21}</p>;                    // expressions
const tag = <span>{isAdmin ? 'Admin' : 'User'}</span>; // ternary
```

---

## 4. Props — Passing Data Down

**File: `frontend/src/features/blog/components/ChatPanel.jsx`**

Props are how a parent component passes data to a child component.
They're like function arguments — read-only inside the child.

```jsx
// Parent passes props
<ChatPanel blogSlug={slug} onClose={() => setChatOpen(false)} />

// Child receives them
const ChatPanel = ({ blogSlug, onClose }) => {
    // blogSlug = "attention-mechanisms"
    // onClose = a function to call when user clicks close
    return <button onClick={onClose}>✕</button>;
};
```

The `{ blogSlug, onClose }` syntax is **destructuring** — it's shorthand for:
```js
const blogSlug = props.blogSlug;
const onClose = props.onClose;
```

**Props can be any JavaScript value**: strings, numbers, booleans, arrays, objects, functions.

---

## 5. useState — Component Memory

**Files: `frontend/src/features/blog/pages/BlogPostPage.jsx`, `frontend/src/features/blog/components/ChatPanel.jsx`**

`useState` lets a component remember a value between renders.
When the value changes (via the setter function), React re-renders the component.

```jsx
const [value, setValue] = useState(initialValue);
//     ↑ current   ↑ setter      ↑ starting value
```

**In BlogPostPage.jsx:**
```jsx
const [blog, setBlog] = useState(null);        // blog data from API
const [loading, setLoading] = useState(true);  // is data loading?
const [chatOpen, setChatOpen] = useState(false); // is chat panel open?
```

**Updating state:**
```jsx
// Simple update
setChatOpen(true);

// Functional update — use when new value depends on old value
setChatOpen(prev => !prev);  // toggle: if true→false, if false→true
setMessages(prev => [...prev, newMessage]);  // append to array
```

**Why functional updates?** React batches state updates. Using `prev =>` ensures
you always work with the latest state value, avoiding stale state bugs.

**Important:** You cannot mutate state directly:
```jsx
// WRONG — React won't detect this change and won't re-render
messages.push(newMessage);

// RIGHT — create a new array (React detects the new reference)
setMessages([...messages, newMessage]);
```

---

## 6. useEffect — Side Effects

**Files: `frontend/src/features/blog/pages/BlogPostPage.jsx`, `frontend/src/features/home/pages/HomePage.jsx`**

`useEffect` runs code after the component renders. Use it for:
- Fetching data from an API
- Setting up intervals/timers
- DOM manipulations (rare in React)

```jsx
useEffect(() => {
    // This code runs AFTER the component renders
    fetchData();

    // Optional cleanup — runs when component unmounts or before the next effect
    return () => {
        cleanup();
    };
}, [dependency1, dependency2]);  // dependency array
```

**The dependency array controls WHEN the effect re-runs:**

```jsx
useEffect(() => { ... });             // runs after EVERY render (usually wrong)
useEffect(() => { ... }, []);         // runs ONCE on mount
useEffect(() => { ... }, [slug]);     // runs when slug changes
useEffect(() => { ... }, [a, b]);     // runs when a OR b changes
```

**In BlogPostPage.jsx** — fetch blog data when the slug in the URL changes:
```jsx
useEffect(() => {
    const fetchBlog = async () => {
        const data = await api.getBlogBySlug(slug);
        setBlog(data);
        setLoading(false);
    };
    fetchBlog();
}, [slug]);  // re-fetch if user navigates to a different blog post
```

**In HomePage.jsx** — rotate the active signal unless the user prefers reduced motion:
```jsx
useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return undefined;
    }

    const timer = setInterval(() => {
        setSignalIndex((currentIndex) => (currentIndex + 1) % SIGNALS.length);
    }, 2600);

    return () => clearInterval(timer);  // ← cleanup: stop timer if user navigates away
}, []);
```

Without the cleanup, the interval would keep running after the user leaves the Home page,
causing a memory leak and repeated state updates on an unmounted component.

---

## 7. useRef — DOM References and Mutable Values

**Files: `frontend/src/features/blog/components/ChatPanel.jsx`, `frontend/src/games/SpaceInvaders.jsx`**

`useRef` creates a container (`{ current: value }`) that:
1. Persists across re-renders (like state)
2. Does **NOT** trigger a re-render when it changes (unlike state)
3. Can hold a reference to a DOM element, or any mutable value

### Use 1 — DOM element reference (ChatPanel)

```jsx
const messagesEndRef = useRef(null);

// Attach to a DOM element with the `ref` prop
<div ref={messagesEndRef} />

// Access the DOM element later
messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
```

We use this in `ChatPanel.jsx` to auto-scroll to the latest message:

```jsx
useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);  // fires every time messages array changes
```

The `?.` is optional chaining — if `messagesEndRef.current` is null (element not yet mounted), it does nothing instead of throwing.

### Use 2 — Mutable game state (SpaceInvaders)

This is the more subtle and important use. In the Space Invaders game, ALL game state
lives in a `useRef`, not in `useState`:

```jsx
const stateRef  = useRef(null);   // player, invaders, bullets, score…
const rafRef    = useRef(null);   // requestAnimationFrame id
```

**Why not `useState` for game state?**

`useState` re-renders the component every time it changes. The game loop runs
~60 times per second. If we called `setPlayerX(...)` 60 times/second, React would
try to re-render the component 60 times/second — causing massive overhead and
flickering, because React's rendering is not designed for that frequency.

With `useRef`, we mutate `stateRef.current` directly (e.g. `stateRef.current.player.x += 5`)
and the canvas handles all drawing — React's rendering system is never involved
in the game loop at all.

```jsx
// WRONG for a game loop — causes 60 re-renders/second
const [playerX, setPlayerX] = useState(0);
setPlayerX(prev => prev + 5);  // triggers re-render

// RIGHT — mutate in place, no re-render, canvas draws it
stateRef.current.player.x += 5;  // no re-render
draw(ctx, stateRef.current);      // canvas draws the new position
```

**Rule of thumb:** if a value changes every frame in a game loop, use `useRef`.
If a value needs to update the visible React JSX tree, use `useState`.

---

## 8. React Router — Navigation Without Page Reloads

**Files: `frontend/src/app/App.jsx`, `frontend/src/app/AppRouter.jsx`**

React Router enables navigation between pages without full browser reloads.
When you click a `<Link>`, only the component changes — the browser doesn't reload.

### Setup in App.jsx and AppRouter.jsx

```jsx
// App.jsx
<ThemeProvider>
    <BrowserRouter basename={ROUTER_BASENAME}>
        <AppErrorBoundary>
            <AppRouter />
        </AppErrorBoundary>
    </BrowserRouter>
</ThemeProvider>

// AppRouter.jsx
<Layout>
    <Suspense fallback={<RouteFallback />}>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/blogs" element={<BlogsPage />} />
            <Route path="/blogs/series/:id" element={<BlogSeriesPage />} />
            <Route path="/blogs/:slug" element={<BlogPostPage />} />
            <Route path="/lets-train" element={<LetsTrainPage />} />
        </Routes>
    </Suspense>
</Layout>
```

`:slug` is a URL parameter — it matches anything and captures it as a variable.
`/blogs/attention-mechanisms` → `{ slug: 'attention-mechanisms' }`

### Key hooks

**`useParams()`** — read URL parameters:
```jsx
// In BlogPostPage.jsx (route: /blogs/:slug)
const { slug } = useParams();
// If URL is /blogs/my-post, slug = "my-post"
```

**`useLocation()`** — read the current URL:
```jsx
// In Header.jsx
const location = useLocation();
const isActive = location.pathname === '/blogs';
```

### Link vs `<a>`

```jsx
// WRONG for internal navigation — causes a full page reload
<a href="/blogs">Blog</a>

// RIGHT — client-side navigation, no reload
import { Link } from 'react-router-dom';
<Link to="/blogs">Blog</Link>
```

Use `<a>` only for external links (like GitHub).

---

## 9. Context API — Global State

**File: `frontend/src/app/providers/ThemeProvider.jsx`**

Context solves "prop drilling" — passing data through many component levels just to
reach a deeply nested component that needs it.

Without context, to pass `theme` from the app root to `SettingsDock` through layout components:
```
App (theme) → Layout (theme) → Header (theme) → SettingsDock (theme)
```

With context, any component can access `theme` directly:

```jsx
// 1. Create the context
const ThemeContext = createContext();

// 2. Provide it near the app root (in App.jsx)
<ThemeProvider>
    <BrowserRouter>...</BrowserRouter>
</ThemeProvider>

// 3. Consume it anywhere in the tree
const { theme, toggleTheme } = useTheme();  // custom hook wrapping useContext()
```

**When to use Context vs Props:**
- Props for data that a few, nearby components need
- Context for truly global state: theme, user session, language

---

## 10. Fetching Data from the Backend

**File: `frontend/src/shared/api/api.js`**

We use the browser's `fetch()` API to call our Django backend:

```jsx
// Basic fetch pattern
const response = await fetch(`${API_BASE_URL}/series/`);
const data = await response.json();
```

`fetch()` returns a Promise — a value that will resolve later (network requests take time).
`await` pauses execution until the Promise resolves.

**Always check response.ok:**
```jsx
const response = await fetch(url);
if (!response.ok) throw new Error('Request failed');  // HTTP 4xx or 5xx
const data = await response.json();
```

**POST request with JSON body:**
```jsx
const response = await fetch('/api/chat/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blog_slug: slug, message: text }),
});
```

**The typical data-fetching pattern in a component:**
```jsx
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
    const load = async () => {
        try {
            const result = await api.getSeries();
            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);  // always runs, success or failure
        }
    };
    load();
}, []);

if (loading) return <BlogStateView icon="⏳" message="Loading..." />;
if (error) return <BlogStateView icon="❌" message={error} />;
return <div>{/* render data */}</div>;
```

---

## 11. Conditional Rendering

**File: `frontend/src/features/blog/pages/BlogPostPage.jsx`**

React lets you render different JSX based on conditions:

```jsx
// Ternary — show one thing or another
{loading ? <Spinner /> : <Content />}

// Short-circuit — show something or nothing
{error && <ErrorMessage />}

// Early return — return different JSX from the component entirely
if (loading) return <p>Loading...</p>;
if (error) return <p>Error!</p>;
return <main>...</main>;
```

In BlogPostPage.jsx, we use all three patterns:
```jsx
// Early returns for loading/error states
if (loading) return <BlogStateView icon="⏳" message="Loading article..." mono />;
if (error) return <BlogStateView icon="❌" message={error} />;

// Short-circuit to show chat panel only when open
{chatOpen && <ChatPanel blogSlug={slug} onClose={() => setChatOpen(false)} />}

// Ternary for button icon
{chatOpen ? '✕' : '💬'}
```

**Mounting vs. showing:** `{chatOpen && <ChatPanel />}` completely **mounts/unmounts**
ChatPanel. When `chatOpen` becomes false, the ChatPanel component is destroyed — its
state (message history) resets. This is intentional here: fresh chat each visit.

If you want to keep the state and just hide the element, use CSS instead:
```jsx
<div style={{ display: chatOpen ? 'block' : 'none' }}>
    <ChatPanel />
</div>
```

### CSS transitions for smooth state changes

`display: none` and mounting/unmounting are instant — no animation possible.
When you want motion, the current codebase generally toggles CSS classes instead of
building large inline style objects.

```jsx
// BlogPostPage.jsx — move the floating chat toggle when the sidebar opens
<button
    className={`${blogStyles.chatToggle} ${chatOpen ? blogStyles.chatToggleOpen : ''}`}
>
    {chatOpen ? '✕' : '💬'}
</button>
```

```css
/* blog.module.css */
.chatToggle {
    right: 1.5rem;
    transition: right 0.3s ease, background 0.2s ease;
}

.chatToggleOpen {
    right: clamp(19.75rem, calc(35% + 1rem), 31rem);
}
```

When `chatOpen` changes, the browser animates the button position without forcing the
component to own presentation details in JavaScript.

**Tradeoff**: the element is still in the DOM when hidden — it costs memory and can
still run effects. Only use this approach when the component is cheap and you need the
animation. For expensive components, mount/unmount and accept the instant transition.

---

## 12. Lists and Keys

**File: `frontend/src/features/projects/pages/ProjectsPage.jsx`**

Rendering a list of items uses JavaScript's `.map()`:

```jsx
const PROJECTS = [
    { id: 'vector-db', title: 'Vector DB from Scratch', ... },
    { id: 'cuda', title: 'Learning CUDA', ... },
];

// .map() transforms each item into a JSX element
{PROJECTS.map(project => (
    <ProjectCard key={project.id} {...project} />
))}
```

**`key` is required for lists.** React uses it to identify which items changed,
were added, or were removed — enabling efficient DOM updates.

```jsx
// BAD — using array index as key (causes bugs when list order changes)
{items.map((item, index) => <Item key={index} {...item} />)}

// GOOD — use a stable, unique identifier
{items.map(item => <Item key={item.id} {...item} />)}
```

**Spread props `{...project}`**: passes all properties of the object as individual props:
```jsx
<ProjectCard {...project} />
// is equivalent to:
<ProjectCard id={project.id} title={project.title} tech={project.tech} />
```

---

## 13. Event Handlers

**File: `frontend/src/features/blog/components/ChatPanel.jsx`**

Event handlers are functions called when the user interacts with the UI:

```jsx
// onClick — button click
<button onClick={sendMessage}>Send</button>

// onClick with inline arrow function (when you need to pass arguments)
<button onClick={() => setChatOpen(false)}>Close</button>

// onChange — input value changes
<textarea onChange={e => setInput(e.target.value)} />

// onKeyDown — key press
<textarea onKeyDown={handleKeyDown} />
```

**Event object (`e`)**: React event handlers receive a SyntheticEvent object:
```jsx
const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();  // stop the default newline behavior
        sendMessage();
    }
};
```

**Async event handlers:**
```jsx
// async functions work fine as event handlers
const sendMessage = async () => {
    setLoading(true);
    try {
        const data = await api.chatWithBlog(blogSlug, input, history);
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};
```

---

## 14. CSS Modules and Styling

**Files: `frontend/src/styles/components.module.css`, `frontend/src/index.css`**

We use two styling approaches:

### CSS Modules (scoped classes)

```jsx
import styles from '../styles/components.module.css';

<header className={styles.header}>
    <span className={styles.sectionLabel}>BLOG</span>
</header>
```

CSS Modules automatically scope class names to the component — `.header` in
`components.module.css` won't conflict with any other `.header` class in the app.
The actual class name in the DOM becomes something like `header_header__x3Kd2`.

### CSS Variables (global theme)

Defined in `index.css`, usable anywhere:

```css
/* index.css */
:root {
    --text-primary: #1a1a1a;
    --accent-primary: #6366f1;
    --bg-glass: rgba(255,255,255,0.8);
}
```

```jsx
// In any component
<p style={{ color: 'var(--text-primary)' }}>Hello</p>
```

When the user toggles dark mode, `ThemeProvider.jsx` updates the `data-theme` attribute
on `document.body`, and every element using those CSS variables updates automatically.

### Inline styles

The repo still uses inline styles occasionally for tiny one-off cases or documentation
examples, but the current frontend direction prefers feature-owned CSS modules for
reusable presentation.

```jsx
<div style={{
    fontSize: '1rem',           // numbers are px in CSS, but in JSX use strings with units
    marginBottom: '1.5rem',     // camelCase property names (not margin-bottom)
    color: 'var(--text-primary)',
}} />
```

---

## 15. The API Service Layer

**File: `frontend/src/shared/api/api.js`**

Instead of calling `fetch()` directly in components, we centralize all API calls in `api.js`.

**Why?**
- One place to change the base URL when deploying
- Consistent error handling
- Components stay focused on UI, not network logic

```js
// api.js
import { API_BASE_URL } from '../config/env';

export const api = {
    getSeries: async () => {
        const response = await fetch(`${API_BASE_URL}/series/`);
        if (!response.ok) throw new Error('Failed to fetch series');
        return response.json();
    },
    // ...
};
```

**Usage in a component:**
```jsx
import { api } from '../../../shared/api/api';

// Inside useEffect:
const data = await api.getSeries();
```

Notice the trailing slash on `series/` — Django REST Framework requires it by default.
Without it, Django returns a 301 redirect which causes issues with POST requests.

---

## 16. Component Composition — ChatPanel + BlogPostPage

**Files: `frontend/src/features/blog/pages/BlogPostPage.jsx`, `frontend/src/features/blog/components/ChatPanel.jsx`**

This is the most complex UI in the project. Here's how the pieces fit:

**BlogPostPage.jsx** (parent) controls:
- Whether the chat panel is open (`chatOpen` state)
- The split-pane flex layout
- Passing `blogSlug` and `onClose` to ChatPanel

**ChatPanel.jsx** (child) controls:
- Message history (`messages` state)
- The input text (`input` state)
- Loading / error state for API calls
- Auto-scrolling via `useRef`

**Data flow:**
```
BlogPostPage
  │
  ├─ chatOpen state → controls whether ChatPanel renders
  │
  └─ <ChatPanel
         blogSlug={slug}          ← prop: which blog to chat about
         onClose={() => setChatOpen(false)} ← prop: callback to close panel
     />

ChatPanel
  │
  ├─ Calls api.chatWithBlog(blogSlug, message, history)
  │
  └─ Manages messages, input, loading state internally
```

**Key pattern**: ChatPanel never modifies `chatOpen` directly — it calls the `onClose`
callback that BlogPostPage provided. This keeps state ownership clear:
"the parent that creates state should be the one that can change it."

---

## 17. The Canvas Game Loop Pattern

**File: `frontend/src/games/SpaceInvaders.jsx`**

The Space Invaders game uses the browser's **HTML5 Canvas API** — a 2D drawing surface
that you control entirely with JavaScript. There is no React rendering involved in the
game loop itself.

### Canvas basics

```jsx
// 1. Create a canvas element and get a reference
const canvasRef = useRef(null);
return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;

// 2. Get the drawing context (the object with all drawing methods)
const canvas = canvasRef.current;
const ctx = canvas.getContext('2d');

// 3. Draw shapes
ctx.fillStyle = '#8b7355';          // set colour
ctx.fillRect(x, y, width, height); // filled rectangle
ctx.beginPath();
ctx.arc(x, y, radius, 0, Math.PI * 2);
ctx.fill();                         // filled circle
```

Canvas coordinates: `(0, 0)` = top-left corner. X increases right, Y increases **down**.

### requestAnimationFrame — the game loop

`requestAnimationFrame(callback)` asks the browser to call `callback` before
the next screen repaint. Browsers typically repaint at 60fps, so your callback
runs ~60 times per second, synchronized with the display refresh rate.

```jsx
useEffect(() => {
    const loop = () => {
        update(stateRef.current);          // advance game state
        draw(ctx, stateRef.current);       // render to canvas
        rafRef.current = requestAnimationFrame(loop);  // schedule next frame
    };
    rafRef.current = requestAnimationFrame(loop);

    // Cleanup: MUST cancel when component unmounts
    // Without this, the loop keeps running in the background after the user
    // switches to dark mode and this component is removed from the DOM.
    return () => cancelAnimationFrame(rafRef.current);
}, []);
```

### ResizeObserver — keeping canvas sharp

A common canvas bug: the canvas element's CSS size (from `width: 100%`) and its
actual pixel dimensions (`canvas.width`) are different. If you don't sync them,
the canvas is blurry or the wrong size.

```jsx
const fit = () => {
    canvas.width  = canvas.offsetWidth;   // px dimensions = element's layout size
    canvas.height = canvas.offsetHeight;
    stateRef.current = initState(canvas.width, canvas.height);  // re-init game
};
fit();  // run once on mount

// ResizeObserver calls fit() whenever the element's size changes
const ro = new ResizeObserver(fit);
ro.observe(canvas);
return () => ro.disconnect();  // cleanup
```

### The update/draw separation

Keeping `update()` and `draw()` as separate functions is a standard game architecture pattern:

```
update(state) — advance physics, move things, check collisions, update score
draw(ctx, state) — read state and render it to the canvas
```

`update` never touches the canvas. `draw` never modifies state. This separation
makes both functions easier to reason about, test, and change independently.

### Drawing pixel art with fillRect

Instead of loading external sprite image files, the invaders are drawn as pixel art
using a bitmap (array of numbers) and `fillRect`:

```jsx
// 8-row sprite — each row is an 8-bit number (bit 7 = leftmost pixel)
const SQUID = [
    0b00100100,  // row 0
    0b00011000,  // row 1
    ...
];

function drawSprite(ctx, bitmap, scale, cx, cy, color) {
    ctx.fillStyle = color;
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (bitmap[row] & (1 << (7 - col))) {  // is this bit set?
                ctx.fillRect(
                    cx + col * scale,   // pixel x position
                    cy + row * scale,   // pixel y position
                    scale, scale        // each "pixel" = scale×scale canvas pixels
                );
            }
        }
    }
}
```

`scale = 3` means each sprite "pixel" becomes a 3×3 block on the canvas, so an
8×8 sprite is rendered as a 24×24 canvas region — large enough to see clearly.

### Animation frames

Invaders alternate between two sprite variants to look like they're walking.
A single integer (`animFrame: 0 or 1`) tracks which frame is current.
It flips every time the invaders take a step:

```js
s.animFrame ^= 1;  // XOR with 1: 0 → 1 → 0 → 1 ...
```

---

## 18. The Module Registry Pattern

**File: `frontend/src/games/index.js`**

The game registry is an example of the **module registry pattern** — a central lookup
table that maps string keys to values (components, functions, classes), making it easy
to swap implementations without touching the code that uses them.

```js
// games/index.js
import SpaceInvadersGame from './SpaceInvaders';
// import SnakeGame from './Snake';

export const GAMES = {
    'space-invaders': SpaceInvadersGame,
    // 'snake': SnakeGame,
};

export const ACTIVE_LIGHT_GAME = 'space-invaders';  // ← change this one line
```

```jsx
// Example consumer — pick the active game without importing a specific implementation
import { GAMES, ACTIVE_LIGHT_GAME } from '../games';
const LightGame = GAMES[ACTIVE_LIGHT_GAME];  // looks up the component at module load time

// Later in JSX:
<LightGame />
```

This pattern is still useful in the repo as a reference, even though the current home page has moved to a lighter retro control-room design and no longer consumes the registry directly.

**Why this is useful:**
- An experiment surface can avoid importing a specific game directly — it just reads from the registry
- Adding a new game = create the file + add 2 lines to `index.js`
- Switching games = change 1 line (`ACTIVE_LIGHT_GAME`) in `index.js`
- If a game has a bug, you can swap to another instantly without touching the page

**The pattern generalises.** The same approach works for:
- Multiple themes (registry of theme objects)
- Multiple chart libraries (registry of chart components)
- Multiple AI provider UI components (registry of provider-specific chat UIs)
- Feature flags (registry of enabled/disabled features)

The key idea: **the consumer depends on the registry, not on specific implementations**. Adding new implementations never requires changing the consumer.

---

## 19. How Everything Fits Together

Here's the full flow when a user opens a blog post and asks a question:

```
1. User visits /blogs/attention-mechanisms
   → React Router matches /blogs/:slug
    → BlogPostPage component mounts with slug = "attention-mechanisms"

2. BlogPostPage's useEffect fires
   → calls api.getBlogBySlug("attention-mechanisms")
   → fetch GET http://localhost:8000/api/blogs/attention-mechanisms/
   → Django: BlogPostViewSet.retrieve() → serializes BlogPost → returns JSON
   → React: setBlog(data), setLoading(false)
   → component re-renders with blog content

3. User clicks 💬 button
   → setChatOpen(true)
   → React re-renders, mounts <ChatPanel />
   → Flex layout shifts: blog takes 65%, chat takes 35%

4. User types "What is self-attention?" and presses Enter
   → ChatPanel.sendMessage() runs
   → setLoading(true), adds user message to messages array
   → calls api.chatWithBlog("attention-mechanisms", "What is self-attention?", history)
   → fetch POST http://localhost:8000/api/chat/
     body: { blog_slug, message, history }

5. Django receives the POST
   → chat/views.py: ChatView.post()
   → fetches BlogPost from DB (for content)
   → calls get_available_provider() → picks Claude (or Gemini/OpenAI/Ollama)
   → calls provider.chat(system_prompt, messages)
   → returns JsonResponse({ reply: "...", provider: "Claude (...)" })

6. React receives the response
   → setMessages([...prev, { role: 'assistant', content: reply }])
   → setActiveProvider("Claude (claude-sonnet-4-6)")
   → useEffect fires (messages changed) → scrolls to bottom
   → UI updates: new message appears, provider name shown in header
```

---

## Quick Reference

### React Hooks Cheat Sheet

| Hook | Purpose | When to use |
|---|---|---|
| `useState(init)` | Store and update a value that causes re-renders | Any UI value that changes over time |
| `useEffect(fn, deps)` | Run code after render | Data fetching, timers, subscriptions, game loops |
| `useRef(init)` | Reference a DOM element or persist a mutable value without re-rendering | scroll control, canvas element, game state, animation frame id |
| `useContext(ctx)` | Read from a React Context | Theme, auth, global settings |
| `useParams()` | Read URL parameters | Inside route components |
| `useLocation()` | Read current URL | Active link highlighting, redirects |

### Common Patterns

```jsx
// Controlled input (React manages the value)
const [text, setText] = useState('');
<input value={text} onChange={e => setText(e.target.value)} />

// Loading/error pattern
if (loading) return <Spinner />;
if (error) return <Error message={error} />;
return <Content data={data} />;

// Toggle
const [open, setOpen] = useState(false);
<button onClick={() => setOpen(prev => !prev)}>Toggle</button>

// Append to array in state
setMessages(prev => [...prev, newMessage]);

// List rendering
{items.map(item => <Item key={item.id} item={item} />)}
```
