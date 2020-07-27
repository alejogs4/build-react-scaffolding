#! /usr/bin/env node
const fs = require('fs');
const { mkdir, divide, createFile } = require('./src/utils');
const { readFile, writeFile } = require('./src/files');

const template = fs.readFileSync(`${__dirname}/folder-template.json`, { encoding: 'utf8' });

function getFileContent(fileContent = '') {
  return fileContent.replace('.', __dirname);
}
const divideByType = divide(([, { type }]) => type === 'file');

async function populate(folder, currentFolder) {
  const content = Object.entries(folder).filter(([name]) => name !== 'package.json');
  const [files, folders] = divideByType(content);

  for await ([filename, fileSetup] of files) {
    await createFile(`touch ${currentFolder}/${filename}`);

    if (fileSetup.content) {
      const fileContent = await readFile(getFileContent(fileSetup.content), { encoding: 'utf8' });
      await writeFile(`${currentFolder}/${filename}`, fileContent);
    }
  }

  for await ([foldername, folderSetup] of folders) {
    const newFolderPath = `${currentFolder}/${foldername}`;
    await mkdir(newFolderPath);
    await populate(folderSetup.content, newFolderPath);
  }
}

(async function init() {
  try {
    const [,, projectName] = process.argv;
  
    if (!projectName) {
      throw new Error('Project name flag must be included');
    }  
    
    const currentWorkingFolder = process.cwd();
    const projectFolder = `${currentWorkingFolder}/${projectName}`;
    await mkdir(projectFolder);
  
    const templateAsObject = JSON.parse(template);
    
    await createFile(`touch ${projectFolder}/package.json`);
    const packageJSONContent =  await readFile(getFileContent(templateAsObject['package.json'].content), { encoding: 'utf8' });
    
    await writeFile(`${projectFolder}/package.json`, packageJSONContent);
    await createFile(`cd ${projectFolder} && npm i`);
  
    await populate(templateAsObject, projectFolder);
  } catch (error) {
    console.error(error.message);
  }
})();