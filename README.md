# ghsync

Sync local git repository and remote GitHub repository automatically.

## Requirement

This tool requires local git version [1.7.9.6](https://git-scm.com/docs/git-pull/1.7.9.6) or later for using `--no-edit` option for `git pull`. 

## Getting started

## Usage

### Email notification

You will get a notification email like below.

```
Subject: [ghsync] Error occurred in auto git-pull

[path]
/path/to/local/repo

[stderr]
error: Pull is not possible because you have unmerged files.
hint: Fix them up in the work tree, and then use 'git add/rm <file>'
hint: as appropriate to mark resolution and make a commit.
fatal: Exiting because of an unresolved conflict.
```
