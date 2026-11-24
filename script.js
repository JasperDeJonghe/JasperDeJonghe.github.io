// Renders the projects from data/projects.json (edited through /admin).
// Everything is inserted with textContent / attributes, never innerHTML,
// so text typed in the admin can never run as code on the site.

function safeUrl(value) {
    try {
        const url = new URL(value, document.baseURI);
        return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
    } catch {
        return null;
    }
}

// The CMS saves image paths as "/images/x.jpg". The site lives under
// /Portfolio/ on GitHub Pages, so make the path relative to the page.
function imagePath(value) {
    if (!value) return null;
    if (/^https?:\/\//i.test(value)) return safeUrl(value);
    return safeUrl(value.replace(/^\/+/, ""));
}

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
}

function renderProject(project) {
    const article = el("article", "project");

    const src = imagePath(project.image);
    if (src) {
        const img = el("img", "shot");
        img.src = src;
        img.alt = project.alt || "";
        img.loading = "lazy";
        article.append(img);
    }

    const body = el("div");
    body.append(el("h3", null, project.title));
    if (project.meta) body.append(el("p", "meta", project.meta));
    if (project.description) body.append(el("p", null, project.description));

    const href = project.link && safeUrl(project.link);
    if (href) {
        const a = el("a", null, project.link_label || "View project");
        a.href = href;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        body.append(a);
    }

    article.append(body);
    return article;
}

async function loadProjects() {
    const lists = document.querySelectorAll("[data-projects]");
    try {
        const response = await fetch("data/projects.json", { cache: "no-cache" });
        if (!response.ok) throw new Error(response.status);
        const data = await response.json();

        lists.forEach(function (list) {
            const items = data[list.dataset.projects] || [];
            list.replaceChildren(...items.map(renderProject));
            list.closest("section").hidden = items.length === 0;
        });
    } catch (error) {
        console.error("Could not load projects:", error);
        lists.forEach(function (list) {
            list.replaceChildren(el("p", "small", "Projects could not be loaded."));
        });
    }
}

document.addEventListener("DOMContentLoaded", loadProjects);
