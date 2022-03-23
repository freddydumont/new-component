#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const program = require('commander');

const {
  getConfig,
  buildPrettifier,
  logIntro,
  logItemCompletion,
  logConclusion,
  logError,
  logDescription,
} = require('./helpers');
const {
  mkDirPromise,
  readFilePromiseRelative,
  writeFilePromise,
} = require('./utils');

// Load our package.json, so that we can pass the version onto `commander`.
const { version } = require('../package.json');

// Get the default config for this component (looks for local/global overrides,
// falls back to sensible defaults).
const config = getConfig();

// Convenience wrapper around Prettier, so that config doesn't have to be
// passed every time.
const prettify = buildPrettifier(config.prettierConfig);

program
  .storeOptionsAsProperties()
  .version(version)
  .arguments('<componentName>')
  .description(logDescription())
  .option(
    '-d, --dir <pathToDirectory>',
    'Path to the "components" directory',
    config.dir
  )
  .parse(process.argv);

const [componentName] = program.args;

const EXTENSION = 'tsx'

const templatePath = `./templates/component.tsx`;
const storyTemplatePath = `./templates/storybook.tsx`;

// Get all of our file paths worked out, for the user's project.
const componentDir = `${program.dir}/${componentName}`;
const filePath = `${componentDir}/${componentName}.${EXTENSION}`;
const storyPath = `${componentDir}/${componentName}.stories.${EXTENSION}`;
const indexPath = `${componentDir}/index.ts`;

// Our index template is super straightforward, so we'll just inline it for now.
const indexTemplate = prettify(`\
export * from './${componentName}';
export { default } from './${componentName}';
`);

logIntro({ name: componentName, dir: componentDir });

// Check if componentName is provided
if (!componentName) {
  logError(
    `Sorry, you need to specify a name for your component like this: new-component <name>`
  );
  process.exit(0);
}

// Check to see if a directory at the given path exists
const fullPathToParentDir = path.resolve(program.dir);
if (!fs.existsSync(fullPathToParentDir)) {
  logError(
    `Sorry, you need to create a parent "components" directory.\n(new-component is looking for a directory at ${program.dir}).`
  );
  process.exit(0);
}

// Check to see if this component has already been created
const fullPathToComponentDir = path.resolve(componentDir);
if (fs.existsSync(fullPathToComponentDir)) {
  logError(
    `Looks like this component already exists! There's already a component at ${componentDir}.\nPlease delete this directory and try again.`
  );
  process.exit(0);
}

// Start by creating the directory that our component lives in.
mkDirPromise(componentDir)
  .then(() => readFilePromiseRelative(templatePath))
  .then((template) => {
    logItemCompletion('Directory created.');
    return template;
  })
  .then((template) =>
    // Replace our placeholders with real data (so far, just the component name)
    template.replace(/COMPONENT_NAME/g, componentName)
  )
  .then((template) =>
    // Format it using prettier, to ensure style consistency, and write to file.
    writeFilePromise(filePath, prettify(template))
  )
  .then((template) => {
    logItemCompletion('Component built and saved to disk.');
    return template;
  })
  // storybook
  .then(() => readFilePromiseRelative(storyTemplatePath))
  .then((template) =>
    // Replace our placeholders with real data (so far, just the component name)
    template.replace(/COMPONENT_NAME/g, componentName)
  )
  .then((template) =>
    // Format it using prettier, to ensure style consistency, and write to file.
    writeFilePromise(storyPath, prettify(template))
  )
  .then((template) => {
    logItemCompletion('Storybook file built and saved to disk.');
    return template;
  })
  // index
  .then((template) =>
    writeFilePromise(indexPath, prettify(indexTemplate))
  )
  .then((template) => {
    logItemCompletion('Index file built and saved to disk.');
    return template;
  })
  .then((template) => {
    logConclusion();
  })
  .catch((err) => {
    console.error(err);
  });
