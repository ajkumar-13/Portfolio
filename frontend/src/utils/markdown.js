import { marked } from 'marked';
import hljs from 'highlight.js';

// Configure marked with highlight.js
marked.setOptions({
    highlight: function (code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
    },
    langPrefix: 'hljs language-',
});

// Custom renderer to handle images properly
const renderer = new marked.Renderer();

renderer.image = function (href, title, text) {
    // Check if it's a relative API path and prepend host if needed
    let src = href;
    if (href && href.startsWith('/api/uploads')) {
        src = `http://localhost:8000${href}`;
    }

    return `
    <figure class="blog-image-container">
      <img src="${src}" alt="${text}" title="${title || text}" class="blog-image" />
      ${title ? `<figcaption>${title}</figcaption>` : ''}
    </figure>
  `;
};

export const parseMarkdown = (content) => {
    return marked(content, { renderer });
};
