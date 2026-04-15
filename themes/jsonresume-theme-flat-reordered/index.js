const fs = require('node:fs');
const path = require('node:path');
const Handlebars = require('handlebars');

const defaultSectionOrder = [
  'contact',
  'about',
  'profiles',
  'work',
  'volunteer',
  'education',
  'awards',
  'publications',
  'skills',
  'languages',
  'interests',
  'references'
];

const outerTemplate = Handlebars.compile(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, minimal-ui">
    <title>{{resume.basics.name}}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.2.0/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/octicons/2.0.2/octicons.min.css">
    <style type="text/css">
{{{css}}}
    </style>
  </head>
  <body>
    <header id="header">
      <div class="container">
        <div class="row">
          <div class="col-sm-9 col-sm-push-3">
            {{#if resume.basics.name}}
            <h1>{{resume.basics.name}}</h1>
            {{/if}}
            {{#if resume.basics.label}}
            <h2>{{resume.basics.label}}</h2>
            {{/if}}
          </div>
        </div>
      </div>
    </header>
    <div id="content" class="container">
{{{sectionsHtml}}}
    </div>
  </body>
</html>
`);

const sectionTemplates = {
  contact: Handlebars.compile(`
  <section id="contact" class="row">
    <aside class="col-sm-3">
      <h3>{{title}}</h3>
    </aside>
    <div class="col-sm-9">
      <div class="row">
        {{#if email}}
        <div class="col-sm-6">
          <strong>Email</strong>
          <div class="email">{{email}}</div>
        </div>
        {{/if}}
        {{#if phone}}
        <div class="col-sm-6">
          <strong>Phone</strong>
          <div class="phone">{{phone}}</div>
        </div>
        {{/if}}
        {{#if website}}
        <div class="col-sm-6">
          <strong>Website</strong>
          <div class="website">
            <a href="{{website}}">{{website}}</a>
          </div>
        </div>
        {{/if}}
      </div>
    </div>
  </section>
`),
  about: Handlebars.compile(`
  <section id="about" class="row">
    <aside class="col-sm-3">
      <h3>{{title}}</h3>
    </aside>
    <div class="col-sm-9">
      <p>{{summary}}</p>
    </div>
  </section>
`),
  profiles: Handlebars.compile(`
  <section id="profiles" class="row">
    <aside class="col-sm-3">
      <h3>{{title}}</h3>
    </aside>
    <div class="col-sm-9">
      <div class="row">
        {{#each profiles}}
        <div class="col-sm-6">
          {{#if network}}
          <strong class="network">{{network}}</strong>
          {{/if}}
          {{#if username}}
          <div class="username">
            {{#if url}}
            <div class="url">
              <a href="{{url}}">{{username}}</a>
            </div>
            {{else}}
            {{username}}
            {{/if}}
          </div>
          {{else}}
          {{#if url}}
          <div class="url">
            <a href="{{url}}">{{url}}</a>
          </div>
          {{/if}}
          {{/if}}
        </div>
        {{/each}}
      </div>
    </div>
  </section>
`),
  work: Handlebars.compile(sectionListTemplate('work', 'Work', `
      <h4 class="strike-through">
        <span>{{company}}</span>
        <span class="date">{{startDate}} -- {{endDate}}</span>
      </h4>
      {{#if website}}
      <div class="website pull-right">
        <a href="{{website}}">{{website}}</a>
      </div>
      {{/if}}
      {{#if position}}
      <div class="position">{{position}}</div>
      {{/if}}
      {{#if summary}}
      <div class="summary">
        <p>{{summary}}</p>
      </div>
      {{/if}}
      {{#if highlights.length}}
      <h4>Highlights</h4>
      <ul class="highlights">
        {{#each highlights}}
        <li class="bullet">{{this}}</li>
        {{/each}}
      </ul>
      {{/if}}
  `)),
  volunteer: Handlebars.compile(sectionListTemplate('volunteer', 'Volunteer', `
      <h4 class="strike-through">
        <span>{{organization}}</span>
        <span class="date">{{startDate}} -- {{endDate}}</span>
      </h4>
      {{#if website}}
      <div class="website pull-right">
        <a href="{{website}}">{{website}}</a>
      </div>
      {{/if}}
      {{#if position}}
      <div class="position">{{position}}</div>
      {{/if}}
      {{#if summary}}
      <div class="summary">
        <p>{{summary}}</p>
      </div>
      {{/if}}
      {{#if highlights.length}}
      <h4>Highlights</h4>
      <ul class="highlights">
        {{#each highlights}}
        <li class="bullet">{{this}}</li>
        {{/each}}
      </ul>
      {{/if}}
  `)),
  education: Handlebars.compile(sectionListTemplate('education', 'Education', `
      <h4 class="strike-through">
        <span>{{institution}}</span>
        <span class="date">{{startDate}} -- {{endDate}}</span>
      </h4>
      {{#if area}}
      <div class="area">{{area}}</div>
      {{/if}}
      {{#if studyType}}
      <div class="studyType">{{studyType}}</div>
      {{/if}}
      {{#if courses.length}}
      <h4>Courses</h4>
      <ul class="courses">
        {{#each courses}}
        <li>{{this}}</li>
        {{/each}}
      </ul>
      {{/if}}
  `)),
  awards: Handlebars.compile(sectionListTemplate('awards', 'Awards', `
      <h4 class="strike-through">
        <span>{{title}}</span>
      </h4>
      {{#if date}}
      <div class="date pull-right">
        <em>Awarded</em>
        {{date}}
      </div>
      {{/if}}
      {{#if awarder}}
      <div class="awarder">
        <em>by</em>
        <strong>{{awarder}}</strong>
      </div>
      {{/if}}
      {{#if summary}}
      <div class="summary">{{summary}}</div>
      {{/if}}
  `)),
  publications: Handlebars.compile(sectionListTemplate('publications', 'Publications', `
      <h4 class="strike-through">
        <span>{{name}}</span>
        <span class="date">{{releaseDate}}</span>
      </h4>
      {{#if website}}
      <div class="website pull-right">
        <a href="{{website}}"></a>
      </div>
      {{/if}}
      {{#if publisher}}
      <div class="publisher">
        <em>Published by</em>
        <strong>{{publisher}}</strong>
      </div>
      {{/if}}
      {{#if summary}}
      <div class="summary">
        <p>{{summary}}</p>
      </div>
      {{/if}}
  `)),
  skills: Handlebars.compile(`
  <section id="skills" class="row">
    <aside class="col-sm-3">
      <h3>{{title}}</h3>
    </aside>
    <div class="col-sm-9">
      <div class="row">
        {{#each skills}}
        <div class="col-sm-6">
          {{#if name}}
          <div class="name">
            <h4>{{name}}</h4>
          </div>
          {{/if}}
          {{#if keywords.length}}
          <ul class="keywords">
            {{#each keywords}}
            <li>{{this}}</li>
            {{/each}}
          </ul>
          {{/if}}
        </div>
        {{/each}}
      </div>
    </div>
  </section>
`),
  languages: Handlebars.compile(`
  <section id="languages" class="row">
    <aside class="col-sm-3">
      <h3>{{title}}</h3>
    </aside>
    <div class="col-sm-9">
      <div class="row">
        {{#each languages}}
        <div class="col-sm-6">
          {{#if language}}
          <div class="language">
            <strong>{{language}}</strong>
          </div>
          {{/if}}
          {{#if fluency}}
          <div class="fluency">{{fluency}}</div>
          {{/if}}
        </div>
        {{/each}}
      </div>
    </div>
  </section>
`),
  interests: Handlebars.compile(`
  <section id="interests" class="row">
    <aside class="col-sm-3">
      <h3>{{title}}</h3>
    </aside>
    <div class="col-sm-9">
      <div class="row">
        {{#each interests}}
        <div class="col-sm-6">
          {{#if name}}
          <div class="name">
            <h4>{{name}}</h4>
          </div>
          {{/if}}
          {{#if keywords.length}}
          <ul class="keywords">
            {{#each keywords}}
            <li>{{this}}</li>
            {{/each}}
          </ul>
          {{/if}}
        </div>
        {{/each}}
      </div>
    </div>
  </section>
`),
  references: Handlebars.compile(`
  <section id="references" class="row">
    <aside class="col-sm-3">
      <h3>{{title}}</h3>
    </aside>
    <div class="col-sm-9">
      <div class="row">
        {{#each references}}
        <div class="col-sm-12">
          {{#if reference}}
          <blockquote class="reference">
            <p>{{reference}}</p>
            {{#if name}}
            <p class="name">
              <strong>- {{name}}</strong>
            </p>
            {{/if}}
          </blockquote>
          {{/if}}
        </div>
        {{/each}}
      </div>
    </div>
  </section>
`)
};

module.exports = {
  render
};

function render(resume) {
  const css = fs.readFileSync(path.join(__dirname, 'style.css'), 'utf8');
  const sectionsHtml = buildSections(resume).join('\n');

  return outerTemplate({
    css,
    resume,
    sectionsHtml
  });
}

function buildSections(resume) {
  const availableSections = new Map();
  const basics = resume.basics || {};
  const themeOptions = (resume.meta && resume.meta.themeOptions) || {};
  const requestedOrder = Array.isArray(themeOptions.sectionOrder)
    ? themeOptions.sectionOrder
    : [];
  const sectionTitles = themeOptions.sectionTitles || {};

  if (basics.email || basics.phone || basics.website) {
    availableSections.set(
      'contact',
      sectionTemplates.contact({
        ...basics,
        title: titleFor(sectionTitles, 'contact', 'Contact')
      })
    );
  }

  if (basics.summary) {
    availableSections.set(
      'about',
      sectionTemplates.about({
        ...basics,
        title: titleFor(sectionTitles, 'about', 'About')
      })
    );
  }

  if (hasItems(basics.profiles)) {
    availableSections.set(
      'profiles',
      sectionTemplates.profiles({
        profiles: basics.profiles,
        title: titleFor(sectionTitles, 'profiles', 'Profiles')
      })
    );
  }

  addArraySection(availableSections, 'work', resume.work, sectionTitles);
  addArraySection(availableSections, 'volunteer', resume.volunteer, sectionTitles);
  addArraySection(availableSections, 'education', resume.education, sectionTitles);
  addArraySection(availableSections, 'awards', resume.awards, sectionTitles);
  addArraySection(availableSections, 'publications', resume.publications, sectionTitles);
  addArraySection(availableSections, 'skills', resume.skills, sectionTitles);
  addArraySection(availableSections, 'languages', resume.languages, sectionTitles);
  addArraySection(availableSections, 'interests', resume.interests, sectionTitles);
  addArraySection(availableSections, 'references', resume.references, sectionTitles);

  const orderedKeys = [];

  for (const section of requestedOrder) {
    if (availableSections.has(section) && !orderedKeys.includes(section)) {
      orderedKeys.push(section);
    }
  }

  for (const section of defaultSectionOrder) {
    if (availableSections.has(section) && !orderedKeys.includes(section)) {
      orderedKeys.push(section);
    }
  }

  return orderedKeys.map((section) => availableSections.get(section));
}

function addArraySection(sections, key, items, sectionTitles) {
  if (!hasItems(items)) {
    return;
  }

  sections.set(
    key,
    sectionTemplates[key]({
      [key]: items,
      title: titleFor(sectionTitles, key, defaultTitleFor(key))
    })
  );
}

function hasItems(items) {
  return Array.isArray(items) && items.length > 0;
}

function titleFor(sectionTitles, key, fallback) {
  return typeof sectionTitles[key] === 'string' && sectionTitles[key].trim()
    ? sectionTitles[key]
    : fallback;
}

function defaultTitleFor(key) {
  return {
    work: 'Work',
    volunteer: 'Volunteer',
    education: 'Education',
    awards: 'Awards',
    publications: 'Publications',
    skills: 'Skills',
    languages: 'Languages',
    interests: 'Interests',
    references: 'References'
  }[key];
}

function sectionListTemplate(id, title, body) {
  return `
  <section id="${id}" class="row">
    <aside class="col-sm-3">
      <h3>{{title}}</h3>
    </aside>
    <div class="col-sm-9">
      <div class="row">
        {{#each ${id}}}
        <div class="col-sm-12">
${body}
        </div>
        {{/each}}
      </div>
    </div>
  </section>
`;
}
