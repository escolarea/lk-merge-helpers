# merge-multi-branch


```yaml
name: Update stable branches

on:
  push:
    branches:
      - develop

jobs:
  auto_merge:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: escolarea/lk-merge-helpers@master
        with:
          github_token: ${{ secrets.TOKEN }}
          source_ref: ${{ github.ref }}
          branches_to_merge_automatically: "/*-wip,develop,master"
          commit_message_template: '[Automated] Merged {source_ref} into target {target_branch}'
          slack_webhook: ${{ secrets.SLACK_WEBHOOK }}
          slack_webhook_tag_user_id: "<@U3P5KJ6SH><@U0MD57CMC><@UAQ9TESKU>"
```


## Inputs

### `github_token`
**Required** - The GitHub Personal Access Token used to perform the merge action. 
This can be the [Token provided by GitHub Workflows](https://docs.github.com/en/actions/configuring-and-managing-workflows/authenticating-with-the-github_token), 
or a custom token set at a [workflow secret](https://docs.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets).

A custom token may be useful if performing actions that require Administrative privileges, such as overriding 
branch protection rules.

Some permissions you must have are:

-repo
-workflow

and make sure the token has write permissions to perform the action

### `source_ref`
**Required** - The source ref or branch name that you wish to merge into the `stables branches`.

### `branches_to_merge_automatically`
**Required** -String with the name of the branches to merge separated by `,`
for example: "develop,main,master"

### `slack_webhook`
**Required** 
 ## Setup

* [Create a Slack App][apps] for your workspace (alternatively use an existing app you have already created and installed).
* Add the [`incoming-webhook`](https://api.slack.com/scopes/incoming-webhook).
* Install the app to your workspace (you will select a channel to notify).
* Activate and create a new webhook under **Incoming Webhooks**.
* Copy the Webhook URL from the Webhook you just generated [add it as a secret in your repo settings][repo-secret] named `slack_webhook`.

### `commit_message_template`
**Optional** - Customize the commit message that gets added to the merge commit.

### `slack_webhook_tag_user_id`
**Optional** - Id of one or more slack users you want to tag in the message, for example: "<@U3P5KJ6SH><@U0MD57CMC><@UAQ9TESKU>"