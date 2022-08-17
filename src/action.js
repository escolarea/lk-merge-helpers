const axios = require("axios").default;
const github = require("@actions/github");
const core = require("@actions/core");

async function run() {
  let branchActive = "";
  try {
    const token = core.getInput("github_token");
    const source_ref = core.getInput("source_ref");
    const commit_message_template = core.getInput("commit_message_template");
    const octokit = github.getOctokit(token);

    const repo = github.context.repo;

    const { data } = await octokit.rest.repos.listBranches({
      owner: repo.owner,
      repo: repo.repo,
    });

    for (const currentBranch of data) {
      let splitBranch = currentBranch.name.split("-");
      if (splitBranch.pop() === "stable") {
        branchActive = currentBranch.name;
        let commitMessage = commit_message_template
          .replace("{source_ref}", source_ref)
          .replace("{target_branch}", currentBranch.name);

        await octokit.rest.repos.merge({
          owner: repo.owner,
          repo: repo.repo,
          base: currentBranch.name,
          head: source_ref,
          commit_message: commitMessage,
        });
      }
    }
  } catch (e) {
    core.setFailed(e.message);
    sendNotificationSlack(core.getInput("SLACK_WEBHOOK"), branchActive);
  }
}

async function sendNotificationSlack(slackWedHook, branchActive) {
  try {
    const payload = {
      username: "webhookbot",
      text: `<@${core.getInput(
        "slack_webhook_tag_user_id"
      )}> Failed to auto-merge your ${branchActive} branch from ${core.getInput(
        "source_ref"
      )}.`,
      icon_emoji: ":ghost:",
    };
    axios.post(slackWedHook, payload);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
