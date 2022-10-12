const axios = require("axios").default;
const github = require("@actions/github");
const core = require("@actions/core");

async function run() {
  let branchesError = "";
  let branchesSuccess = "";
  try {
    const token = core.getInput("github_token");
    const source_ref = core.getInput("source_ref");
    const commit_message_template = core.getInput("commit_message_template");
    const octokit = github.getOctokit(token);
    const branchesAutomatically = core.getInput(
      "branches_to_merge_automatically"
    );
    console.log("Lista de branch:", branchesAutomatically);
    const repo = github.context.repo;

    const { data } = await octokit.rest.repos.listBranches({
      owner: repo.owner,
      repo: repo.repo,
    });

    for (const currentBranch of data) {
      for (const element of branchesAutomatically) {
        if (new RegExp(element).test(currentBranch)) {
          let commitMessage = commit_message_template
            .replace("{source_ref}", source_ref)
            .replace("{target_branch}", currentBranch.name);
          const config = {
            owner: repo.owner,
            repo: repo.repo,
            base: currentBranch.name,
            head: source_ref,
            commit_message: commitMessage,
          };
          const response = await createMerge(config, octokit);
          if (response.success) {
            branchesSuccess += `    - ${currentBranch.name}\n`;
          } else {
            branchesError += `    - ${currentBranch.name} from ${source_ref} \n     Error: ${response.message}\n`;
          }
        }
      }
    }
    sendNotificationSlack(branchesSuccess, branchesError);
  } catch (e) {
    core.setFailed(`Error Merge: ${e.message}`);
  }
}

async function sendNotificationSlack(branchesSuccess, branchesError) {
  try {
    const attachments = [];
    if (branchesSuccess) {
      attachments.push({
        color: "#01a801",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `✅  *Auto Merge Success:*\n  ${branchesSuccess}`,
            },
          },
        ],
      });
    }
    if (branchesError) {
      attachments.push({
        color: "#bd0f26",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `⛔️ 🛑  Auto Merge Fail:\n  ${branchesError}`,
            },
          },
        ],
      });
    }

    const payload = {
      username: "webhookbot",
      text: `Hi ${core.getInput(
        "slack_webhook_tag_user_id"
      )} This is the status of your auto-merge.`,
      icon_emoji: ":ghost:",
      attachments,
    };
    await axios.post(core.getInput("SLACK_WEBHOOK"), payload);
  } catch (error) {
    core.setFailed(`Error Slack: ${error.message}`);
  }
}

async function createMerge(config, octokit) {
  const response = { success: true, message: "" };
  try {
    await octokit.rest.repos.merge(config);
    return response;
  } catch (error) {
    response.success = false;
    response.message = error.message;
    return response;
  }
}

run();
