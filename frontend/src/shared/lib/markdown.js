import { marked } from 'marked';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import cpp from 'highlight.js/lib/languages/cpp';
import css from 'highlight.js/lib/languages/css';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import python from 'highlight.js/lib/languages/python';
import rust from 'highlight.js/lib/languages/rust';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';

import { BACKEND_ORIGIN, MEDIA_ORIGIN, toAbsoluteUrl } from '../config/env';

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('css', css);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('python', python);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('yaml', yaml);
hljs.registerAliases(['html', 'svg'], { languageName: 'xml' });
hljs.registerAliases(['js', 'jsx'], { languageName: 'javascript' });
hljs.registerAliases(['sh', 'shell'], { languageName: 'bash' });
hljs.registerAliases(['ts', 'tsx'], { languageName: 'typescript' });
hljs.registerAliases(['yml'], { languageName: 'yaml' });

const escapeHtml = (text) => text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

const renderer = {
    code({ text, lang }) {
        const language = typeof lang === 'string' ? lang.trim().toLowerCase() : '';

        if (!hljs.getLanguage(language)) {
            return `<pre><code class="hljs language-plaintext">${escapeHtml(text)}</code></pre>`;
        }

        const highlighted = hljs.highlight(text, { language }).value;

        return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
    },

    image({ href, title, text }) {
        let src = href;

        if (href && href.startsWith('/media/')) {
            src = toAbsoluteUrl(href, MEDIA_ORIGIN);
        } else if (href && href.startsWith('/api/uploads')) {
            src = toAbsoluteUrl(href, BACKEND_ORIGIN);
        }

        return `
            <figure class="blog-image-container">
                <img src="${src}" alt="${text}" class="blog-image" />
                ${title ? `<figcaption>${title}</figcaption>` : ''}
            </figure>
        `;
    },
};

marked.use({ renderer });

export const parseMarkdown = (content) => {
    if (!content) return '';
    return marked.parse(content);
};