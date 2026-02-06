# React & Portfolio Code Guide

This guide explains how your new portfolio website works, designed to help you learn React.

## Project Structure

### 1. The Entry Point (`main.jsx`)
This is where React takes over your HTML.
```jsx
ReactDOM.createRoot(document.getElementById('root')).render(<App />)
```
- It finds the `div` with id "root" in your `index.html`.
- It renders your main `App` component inside it.

### 2. Routing (`App.jsx`)
We use `react-router-dom` to handle pages without refreshing the browser.
```jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/blogs" element={<Blogs />} />
</Routes>
```
- **Routes**: Container for all your pages.
- **Route**: Maps a URL path (like `/blogs`) to a Component (like `<Blogs />`).

### 3. Components
React is built on "Components" - reusable pieces of UI.

#### The `useEffect` Hook
You'll see this in `Blogs.jsx`. It tells React to do something *after* rendering.
```jsx
useEffect(() => {
  // fetching data from backend
}, []);
```
- The empty array `[]` means "run this only once when the component appears".

#### State (`useState`)
How components "remember" things.
```jsx
const [series, setSeries] = useState([]);
```
- `series`: The current data.
- `setSeries`: Function to update that data.
- When state changes, React automatically updates the screen!

### 4. Customizing Markdown (`utils/markdown.js`)
We use `marked` to convert markdown text to HTML.
- We added a custom `renderer` to handle your images efficiently.
- We added `highlight.js` to automatically colorize your code blocks in blog posts.

## Backend Integration (`services/api.js`)
Instead of scattering API calls everywhere, we keep them in one place.
- `api.getSeries()` calls your FastAPI backend.
- `api.getImageUrl()` helps fix image paths so they load correctly.

## Styling
We use CSS Modules (`components.module.css`).
- Classes are scoped locally so they don't clash.
- Global variables (colors, fonts) are in `index.css`.

## Next Steps for You
1. **Try changing the colors**: Go to `index.css` and change `--color-primary`.
2. **Add a Project**: Go to `pages/Work.jsx` and add an item to the `projects` array.
3. **Write a Blog**: Use the API (or future admin panel) to create a series and posts!
