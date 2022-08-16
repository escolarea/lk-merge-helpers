# merge-multi-branch
```
name: Test

on:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: sosa-22/merge-multi-branch@main
        with:
          github_token: ${{ github.token }}
          source_ref: ${{ github.ref }}
          commit_message_template: '[Automated] Merged {source_ref} into target {target_branch}'
```