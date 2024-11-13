const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
  auth: process.env.GH_TOKEN,
});

async function createRepoFromTemplate() {
  try {
    await octokit.repos.createUsingTemplate({
      template_owner: 'template-owner',
      template_repo: 'template-repo',
      name: 'new-repo',
      description: 'Created from a template',
      private: true,
    });
    console.log('Repository created successfully');
  } catch (err) {
    console.error('Error creating repository', err);
  }
}

createRepoFromTemplate();